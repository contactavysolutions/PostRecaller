"""Admin endpoints — guarded by require_admin. Full dashboard surface:
- waitlist review & approve
- users list / suspend / restore / soft-delete
- ai usage (per-user totals, daily series, top spenders, per-model breakdown)
- items moderation (recent, delete, re-enrich)
- system health (mongo, resend, reddit, llm key)
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
import time

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query
import httpx

from ai import enrich
from auth import (
    generate_invite_token,
    hash_invite_token,
    require_admin,
)
from config import db
from mailer import send_invite_email
from models import utcnow

router = APIRouter(prefix="/api/admin", tags=["admin"])

INVITE_TTL_DAYS = 7


def _oid(v: str) -> ObjectId:
    try:
        return ObjectId(v)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="Not found")


def _web_base_url() -> str:
    return os.environ.get("WEB_BASE_URL", "https://postrecaller.com").rstrip("/")


def _serialize_waitlist(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc.get("email"),
        "source": doc.get("source"),
        "status": doc.get("status", "pending"),
        "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
        "invited_at": doc.get("invited_at").isoformat() if doc.get("invited_at") else None,
        "registered_at": doc.get("registered_at").isoformat() if doc.get("registered_at") else None,
    }


def _serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc.get("email"),
        "plan": doc.get("plan", "free"),
        "is_admin": doc.get("is_admin", False),
        "is_suspended": doc.get("is_suspended", False),
        "is_deleted": doc.get("is_deleted", False),
        "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
    }


async def _create_invite_and_email(waitlist_doc: dict) -> str:
    """Create a signed one-time invite for this waitlist entry, email the link, return token."""
    token = generate_invite_token()
    now = utcnow()
    await db.invites.insert_one({
        "email": waitlist_doc["email"],
        "token_hash": hash_invite_token(token),
        "waitlist_id": waitlist_doc["_id"],
        "created_at": now,
        "expires_at": now + timedelta(days=INVITE_TTL_DAYS),
        "used_at": None,
    })
    invite_url = f"{_web_base_url()}/register?invite={token}"
    await send_invite_email(waitlist_doc["email"], invite_url)
    await db.waitlist.update_one(
        {"_id": waitlist_doc["_id"]},
        {"$set": {"status": "invited", "invited_at": now}},
    )
    return token


# ---------------- waitlist ----------------
@router.get("/waitlist")
async def list_waitlist(
    _=Depends(require_admin),
    q: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(pending|invited|registered)$"),
    limit: int = Query(200, ge=1, le=1000),
):
    query: dict = {}
    if q:
        query["email"] = {"$regex": q.lower(), "$options": "i"}
    if status:
        query["status"] = status
    docs = await db.waitlist.find(query).sort("created_at", 1).limit(limit).to_list(limit)
    entries = []
    for idx, doc in enumerate(docs, start=1):
        row = _serialize_waitlist(doc)
        row["position"] = idx
        entries.append(row)
    total = await db.waitlist.count_documents({})
    return {"total": total, "entries": entries}


@router.post("/waitlist/{waitlist_id}/approve")
async def approve_waitlist(waitlist_id: str, _=Depends(require_admin)):
    doc = await db.waitlist.find_one({"_id": _oid(waitlist_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if doc.get("status") == "registered":
        raise HTTPException(status_code=400, detail="User has already registered")
    await _create_invite_and_email(doc)
    fresh = await db.waitlist.find_one({"_id": doc["_id"]})
    return {"ok": True, "entry": _serialize_waitlist(fresh)}


@router.post("/waitlist/{waitlist_id}/resend-invite")
async def resend_invite(waitlist_id: str, _=Depends(require_admin)):
    doc = await db.waitlist.find_one({"_id": _oid(waitlist_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if doc.get("status") == "registered":
        raise HTTPException(status_code=400, detail="User has already registered")
    # Invalidate previous unused invites for this waitlist entry.
    await db.invites.delete_many({"waitlist_id": doc["_id"], "used_at": None})
    await _create_invite_and_email(doc)
    fresh = await db.waitlist.find_one({"_id": doc["_id"]})
    return {"ok": True, "entry": _serialize_waitlist(fresh)}


@router.delete("/waitlist/{waitlist_id}", status_code=204)
async def delete_waitlist(waitlist_id: str, _=Depends(require_admin)):
    await db.invites.delete_many({"waitlist_id": _oid(waitlist_id), "used_at": None})
    await db.waitlist.delete_one({"_id": _oid(waitlist_id)})
    return None


# ---------------- users ----------------
@router.get("/users")
async def list_users(
    _=Depends(require_admin),
    q: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
):
    query: dict = {}
    if q:
        query["email"] = {"$regex": q.lower(), "$options": "i"}
    docs = await db.users.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    # Enrich with item counts in a single aggregate pass.
    user_ids = [str(d["_id"]) for d in docs]
    counts: dict[str, int] = {uid: 0 for uid in user_ids}
    if user_ids:
        pipeline = [
            {"$match": {"user_id": {"$in": user_ids}, "is_deleted": {"$ne": True}}},
            {"$group": {"_id": "$user_id", "n": {"$sum": 1}}},
        ]
        async for row in db.items.aggregate(pipeline):
            counts[row["_id"]] = row["n"]
    return {
        "users": [{**_serialize_user(d), "item_count": counts.get(str(d["_id"]), 0)} for d in docs]
    }


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str, _=Depends(require_admin)):
    res = await db.users.update_one({"_id": _oid(user_id)}, {"$set": {"is_suspended": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@router.post("/users/{user_id}/restore")
async def restore_user(user_id: str, _=Depends(require_admin)):
    res = await db.users.update_one(
        {"_id": _oid(user_id)},
        {"$set": {"is_suspended": False, "is_deleted": False}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@router.delete("/users/{user_id}", status_code=204)
async def soft_delete_user(user_id: str, _=Depends(require_admin)):
    now = utcnow()
    res = await db.users.update_one(
        {"_id": _oid(user_id)},
        {"$set": {"is_deleted": True, "deleted_at": now}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await db.items.update_many(
        {"user_id": user_id, "is_deleted": {"$ne": True}},
        {"$set": {"is_deleted": True, "deleted_at": now}},
    )
    return None


# ---------------- ai usage ----------------
@router.get("/usage")
async def usage_stats(
    _=Depends(require_admin),
    days: int = Query(30, ge=1, le=180),
):
    """Aggregate AI usage across all users. Returns:
    - totals (calls, in/out tokens, cost)
    - daily series
    - top spenders (users by cost)
    - per-model breakdown
    """
    since = utcnow() - timedelta(days=days)
    match_stage = {"$match": {"created_at": {"$gte": since}}}

    async def _agg(pipeline):
        return await db.ai_usage.aggregate(pipeline).to_list(length=None)

    totals_docs = await _agg(
        [
            match_stage,
            {
                "$group": {
                    "_id": None,
                    "calls": {"$sum": 1},
                    "input_tokens": {"$sum": "$input_tokens"},
                    "output_tokens": {"$sum": "$output_tokens"},
                    "cost_usd": {"$sum": "$est_cost_usd"},
                }
            },
        ]
    )
    totals = totals_docs[0] if totals_docs else {"calls": 0, "input_tokens": 0, "output_tokens": 0, "cost_usd": 0}
    totals.pop("_id", None)

    daily_docs = await _agg(
        [
            match_stage,
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "calls": {"$sum": 1},
                    "cost_usd": {"$sum": "$est_cost_usd"},
                    "tokens": {"$sum": {"$add": ["$input_tokens", "$output_tokens"]}},
                }
            },
            {"$sort": {"_id": 1}},
        ]
    )
    daily = [{"date": d["_id"], "calls": d["calls"], "cost_usd": round(d["cost_usd"], 6), "tokens": d["tokens"]} for d in daily_docs]

    top_docs = await _agg(
        [
            match_stage,
            {
                "$group": {
                    "_id": "$user_id",
                    "calls": {"$sum": 1},
                    "cost_usd": {"$sum": "$est_cost_usd"},
                    "tokens": {"$sum": {"$add": ["$input_tokens", "$output_tokens"]}},
                }
            },
            {"$sort": {"cost_usd": -1}},
            {"$limit": 10},
        ]
    )
    top_users = []
    for row in top_docs:
        try:
            u = await db.users.find_one({"_id": ObjectId(row["_id"])}, {"email": 1})
        except Exception:
            u = None
        top_users.append(
            {
                "user_id": row["_id"],
                "email": (u or {}).get("email", "unknown"),
                "calls": row["calls"],
                "tokens": row["tokens"],
                "cost_usd": round(row["cost_usd"], 6),
            }
        )

    model_docs = await _agg(
        [
            match_stage,
            {
                "$group": {
                    "_id": "$model",
                    "calls": {"$sum": 1},
                    "cost_usd": {"$sum": "$est_cost_usd"},
                }
            },
            {"$sort": {"cost_usd": -1}},
        ]
    )
    per_model = [{"model": (d["_id"] or "unknown"), "calls": d["calls"], "cost_usd": round(d["cost_usd"], 6)} for d in model_docs]

    return {
        "range_days": days,
        "totals": {
            "calls": totals.get("calls", 0),
            "input_tokens": totals.get("input_tokens", 0),
            "output_tokens": totals.get("output_tokens", 0),
            "cost_usd": round(totals.get("cost_usd", 0), 4),
        },
        "daily": daily,
        "top_users": top_users,
        "per_model": per_model,
    }


# ---------------- items moderation ----------------
def _serialize_item(doc: dict, email: Optional[str] = None) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "user_email": email,
        "url": doc.get("url"),
        "title": doc.get("title"),
        "summary": doc.get("summary"),
        "platform": doc.get("platform"),
        "tags": doc.get("tags", []),
        "intent": doc.get("intent"),
        "is_deleted": doc.get("is_deleted", False),
        "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
        "thumbnail_url": doc.get("thumbnail_url"),
    }


@router.get("/items")
async def list_items(
    _=Depends(require_admin),
    q: Optional[str] = Query(None),
    include_deleted: bool = Query(False),
    limit: int = Query(50, ge=1, le=500),
):
    query: dict = {}
    if not include_deleted:
        query["is_deleted"] = {"$ne": True}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"url": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.items.find(query).sort("created_at", -1).limit(limit).to_list(limit)
    user_ids = list({d.get("user_id") for d in docs if d.get("user_id")})
    email_by_id: dict[str, str] = {}
    if user_ids:
        oids = []
        for uid in user_ids:
            try:
                oids.append(ObjectId(uid))
            except Exception:
                pass
        async for u in db.users.find({"_id": {"$in": oids}}, {"email": 1}):
            email_by_id[str(u["_id"])] = u.get("email", "")
    return {"items": [_serialize_item(d, email_by_id.get(d.get("user_id", ""))) for d in docs]}


@router.delete("/items/{item_id}", status_code=204)
async def admin_delete_item(item_id: str, _=Depends(require_admin)):
    res = await db.items.update_one(
        {"_id": _oid(item_id), "is_deleted": {"$ne": True}},
        {"$set": {"is_deleted": True, "deleted_at": utcnow()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@router.post("/items/{item_id}/re-enrich")
async def admin_reenrich_item(item_id: str, _=Depends(require_admin)):
    doc = await db.items.find_one({"_id": _oid(item_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    signals = {
        "title": doc.get("title") or "",
        "description": doc.get("summary") or "",
        "text": doc.get("summary") or "",
        "platform": doc.get("platform") or "web",
        "author": doc.get("author"),
    }
    try:
        enriched = await enrich(
            user_id=doc.get("user_id", "admin"),
            url=doc.get("url", ""),
            signals=signals,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Enrichment failed: {e}")
    if not enriched:
        raise HTTPException(status_code=502, detail="Enrichment returned no data")
    update = {k: v for k, v in enriched.items() if v is not None}
    update["updated_at"] = utcnow()
    await db.items.update_one({"_id": doc["_id"]}, {"$set": update})
    fresh = await db.items.find_one({"_id": doc["_id"]})
    return {"ok": True, "item": _serialize_item(fresh)}


# ---------------- system health ----------------
@router.get("/health")
async def system_health(_=Depends(require_admin)):
    checks: list[dict] = []

    # Mongo latency
    t0 = time.perf_counter()
    try:
        await db.command("ping")
        checks.append({"name": "MongoDB", "ok": True, "detail": f"{(time.perf_counter() - t0) * 1000:.0f} ms ping"})
    except Exception as e:
        checks.append({"name": "MongoDB", "ok": False, "detail": str(e)[:160]})

    # LLM key present
    checks.append(
        {
            "name": "Emergent LLM key",
            "ok": bool(os.getenv("EMERGENT_LLM_KEY")),
            "detail": "configured" if os.getenv("EMERGENT_LLM_KEY") else "missing (AI enrichment will fail)",
        }
    )

    # Reddit creds (optional)
    has_reddit = bool(os.getenv("REDDIT_CLIENT_ID") and os.getenv("REDDIT_CLIENT_SECRET"))
    checks.append(
        {
            "name": "Reddit API",
            "ok": has_reddit,
            "optional": True,
            "detail": "credentials present" if has_reddit else "not configured — Reddit URLs fall back to Jina Reader",
        }
    )

    # Resend reachable
    resend_key = os.getenv("RESEND_API_KEY")
    if not resend_key:
        checks.append({"name": "Resend (email)", "ok": False, "detail": "RESEND_API_KEY missing"})
    else:
        try:
            async with httpx.AsyncClient(timeout=4.0) as c:
                r = await c.get("https://api.resend.com/domains", headers={"Authorization": f"Bearer {resend_key}"})
            checks.append(
                {
                    "name": "Resend (email)",
                    "ok": r.status_code in (200, 401, 403),  # 401/403 = key present but scope may differ
                    "detail": f"HTTP {r.status_code}",
                }
            )
        except Exception as e:
            checks.append({"name": "Resend (email)", "ok": False, "detail": str(e)[:160]})

    return {"checked_at": utcnow().isoformat(), "checks": checks}

