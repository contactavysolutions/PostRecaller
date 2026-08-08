"""Auth: bcrypt hashing, JWT issue/verify, current-user dependency, router."""
import asyncio
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import (
    ACCESS_TOKEN_EXPIRE_DAYS,
    ADMIN_EMAILS,
    JWT_ALGORITHM,
    JWT_SECRET,
    FREE_DAILY_AI_LIMIT,
    db,
)
from mailer import send_reset_code_email, send_welcome_email
from models import (
    ForgotPasswordIn,
    LoginIn,
    RegisterIn,
    ResetPasswordIn,
    User,
    UserPublic,
    utcnow,
)
from rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


# ---------------- helpers ----------------
def hash_password(password: str) -> str:
    raw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, is_admin: bool) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "email": email, "adm": is_admin, "exp": exp},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def _hash_code(code: str) -> str:
    return hmac.new(JWT_SECRET.encode("utf-8"), code.encode("utf-8"), hashlib.sha256).hexdigest()


def hash_invite_token(token: str) -> str:
    """Deterministic hash used to store & lookup invite tokens."""
    return hmac.new(JWT_SECRET.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def generate_invite_token() -> str:
    """URL-safe random invite token (~43 chars)."""
    return secrets.token_urlsafe(32)


def _today() -> str:
    return utcnow().strftime("%Y-%m-%d")


def _public(user: dict) -> UserPublic:
    usage = user.get("daily_usage") or {}
    used = usage.get("ai_enrichments", 0) if usage.get("date") == _today() else 0
    return UserPublic(
        id=str(user["_id"]),
        email=user["email"],
        plan=user.get("plan", "free"),
        is_admin=user.get("is_admin", False),
        ai_used_today=used,
        ai_limit=FREE_DAILY_AI_LIMIT,
        created_at=user.get("created_at"),
    )


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("is_suspended"):
        raise HTTPException(status_code=403, detail="Account suspended")
    if user.get("is_deleted"):
        raise HTTPException(status_code=401, detail="Account deleted")
    return user


async def require_admin(current=Depends(get_current_user)) -> dict:
    email = (current.get("email") or "").lower()
    if not (current.get("is_admin") or email in ADMIN_EMAILS):
        raise HTTPException(status_code=403, detail="Admin only")
    return current


async def seed_admins() -> None:
    """Idempotent: only elevates already-registered allowlisted emails."""
    for email in ADMIN_EMAILS:
        await db.users.update_one({"email": email}, {"$set": {"is_admin": True}})


# ---------------- routes ----------------
@router.get("/invite/validate")
async def validate_invite(token: str = Query(..., min_length=10, max_length=200)):
    """Preflight for the register page: confirms invite exists, unused, unexpired.
    Returns the email so the register form can prefill it. Never reveals invite ids.
    """
    invite = await db.invites.find_one({"token_hash": hash_invite_token(token)})
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite link")
    if invite.get("used_at"):
        raise HTTPException(status_code=410, detail="This invite has already been used")
    exp = invite.get("expires_at")
    if exp and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if not exp or utcnow() > exp:
        raise HTTPException(status_code=410, detail="This invite has expired")
    return {"ok": True, "email": invite["email"]}


@router.post("/register", response_model=UserPublic, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterIn):
    email = body.email.lower().strip()
    is_admin_email = email in ADMIN_EMAILS

    # Registration is open to everyone. If an invite_token is provided
    # (e.g. from admin-approved waitlist), validate and consume it for
    # tracking. Otherwise, allow registration freely (mobile, direct, etc.).
    invite_doc = None
    if body.invite_token:
        invite_doc = await db.invites.find_one({"token_hash": hash_invite_token(body.invite_token)})
        if not invite_doc:
            raise HTTPException(status_code=400, detail="Invalid invite link")
        if invite_doc.get("used_at"):
            raise HTTPException(status_code=410, detail="This invite has already been used")
        exp = invite_doc.get("expires_at")
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if not exp or utcnow() > exp:
            raise HTTPException(status_code=410, detail="This invite has expired")
        if (invite_doc.get("email") or "").lower() != email:
            raise HTTPException(
                status_code=400,
                detail="This invite was issued to a different email address",
            )

    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(body.password),
        is_admin=is_admin_email,
    )
    doc = user.to_mongo()
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id

    # Consume invite + mark waitlist entry as registered (if any).
    if invite_doc:
        await db.invites.update_one(
            {"_id": invite_doc["_id"]},
            {"$set": {"used_at": utcnow(), "used_by_user_id": str(res.inserted_id)}},
        )
        wl_id = invite_doc.get("waitlist_id")
        if wl_id:
            await db.waitlist.update_one(
                {"_id": wl_id if isinstance(wl_id, ObjectId) else ObjectId(str(wl_id))},
                {"$set": {"status": "registered", "registered_at": utcnow()}},
            )

    # Fire-and-forget welcome email (never blocks or fails registration).
    asyncio.create_task(send_welcome_email(email))
    return _public(doc)


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.get("is_deleted"):
        raise HTTPException(status_code=401, detail="Account deleted")
    if user.get("is_suspended"):
        raise HTTPException(status_code=403, detail="Account suspended")
    token = create_access_token(str(user["_id"]), email, user.get("is_admin", False))
    # Return a token & user shape compatible with older mobile clients.
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public(user).model_dump(),
    }


@router.get("/me", response_model=UserPublic)
async def me(current=Depends(get_current_user)):
    return _public(current)


@router.delete("/me", status_code=204)
async def delete_me(current=Depends(get_current_user)):
    """Soft-delete: preserves data but hides account and items."""
    uid = str(current["_id"])
    now = utcnow()
    await db.users.update_one(
        {"_id": current["_id"]},
        {"$set": {"is_deleted": True, "deleted_at": now}},
    )
    await db.items.update_many(
        {"user_id": uid, "is_deleted": {"$ne": True}},
        {"$set": {"is_deleted": True, "deleted_at": now}},
    )
    return None


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordIn):
    """Email a 6-digit reset code. Always returns ok (no user enumeration)."""
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if user and not user.get("is_deleted"):
        code = f"{secrets.randbelow(1_000_000):06d}"
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_code_hash": _hash_code(code),
                "reset_code_expires_at": utcnow() + timedelta(minutes=15),
                "reset_code_attempts": 0,
            }},
        )
        await send_reset_code_email(email, code)
    return {"ok": True}


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, body: ResetPasswordIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    invalid = HTTPException(status_code=400, detail="Invalid or expired code")
    if not user or not user.get("reset_code_hash"):
        raise invalid

    exp = user.get("reset_code_expires_at")
    if exp and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if not exp or utcnow() > exp:
        raise invalid

    if user.get("reset_code_attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts — request a new code")

    if not hmac.compare_digest(user["reset_code_hash"], _hash_code(body.code)):
        await db.users.update_one({"_id": user["_id"]}, {"$inc": {"reset_code_attempts": 1}})
        raise invalid

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": hash_password(body.new_password)},
            "$unset": {"reset_code_hash": "", "reset_code_expires_at": "", "reset_code_attempts": ""},
        },
    )
    return {"ok": True}
