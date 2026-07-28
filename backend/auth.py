"""Auth: bcrypt hashing, JWT issue/verify, current-user dependency, router."""
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import (
    ACCESS_TOKEN_EXPIRE_DAYS,
    ADMIN_EMAILS,
    JWT_ALGORITHM,
    JWT_SECRET,
    FREE_DAILY_AI_LIMIT,
    db,
)
from models import LoginIn, RegisterIn, User, UserPublic, utcnow

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
    from bson import ObjectId

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def seed_admins() -> None:
    """Idempotent: only elevates already-registered allowlisted emails."""
    for email in ADMIN_EMAILS:
        await db.users.update_one({"email": email}, {"$set": {"is_admin": True}})


# ---------------- routes ----------------
@router.post("/register", response_model=UserPublic, status_code=201)
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=email,
        password_hash=hash_password(body.password),
        is_admin=email in ADMIN_EMAILS,
    )
    doc = user.to_mongo()
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _public(doc)


@router.post("/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(str(user["_id"]), email, user.get("is_admin", False))
    return {"access_token": token, "token_type": "bearer", "user": _public(user).model_dump()}


@router.get("/me", response_model=UserPublic)
async def me(current=Depends(get_current_user)):
    return _public(current)


@router.delete("/me", status_code=204)
async def delete_me(current=Depends(get_current_user)):
    uid = str(current["_id"])
    await db.items.delete_many({"user_id": uid})
    await db.users.delete_one({"_id": current["_id"]})
    return None
