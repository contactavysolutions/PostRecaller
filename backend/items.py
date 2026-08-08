"""Item routes: save URL, list (masonry), detail, edit, delete, retry enrich."""
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query

import ai
import scraper
from auth import get_current_user
from config import DAILY_SAVE_CAP, INTENTS, db
from models import CreateItemIn, ItemUpdateIn, utcnow

router = APIRouter(prefix="/api", tags=["items"])


def _serialize(doc: dict) -> dict:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    out.pop("embedding", None)  # never ship the vector to clients
    for k, v in list(out.items()):
        if isinstance(v, datetime):
            out[k] = v.isoformat()
    return out


def _today() -> str:
    return utcnow().strftime("%Y-%m-%d")


async def _bump_ai_usage(user_id: str):
    today = _today()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    usage = user.get("daily_usage") or {}
    if usage.get("date") != today:
        usage = {"date": today, "ai_enrichments": 0, "searches": 0}
    usage["ai_enrichments"] = usage.get("ai_enrichments", 0) + 1
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"daily_usage": usage}})


def _oid(item_id: str) -> ObjectId:
    try:
        return ObjectId(item_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="Item not found")


@router.post("/items")
async def create_item(body: CreateItemIn, current=Depends(get_current_user)):
    user_id = str(current["_id"])
    url = body.url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    # abuse cap: saves per day
    since = _today()
    saves_today = await db.items.count_documents(
        {"user_id": user_id, "created_at": {"$gte": datetime.fromisoformat(since)}}
    )
    if saves_today >= DAILY_SAVE_CAP:
        raise HTTPException(status_code=429, detail="Daily save limit reached")

    # duplicate detection
    dup = await db.items.find_one({"user_id": user_id, "original_url": url})
    if dup:
        return {"duplicate": True, "item": _serialize(dup)}

    platform = scraper.detect_platform(url)
    signals = await scraper.scrape(url)
    enriched = await ai.enrich(user_id, url, signals)

    if enriched:
        await _bump_ai_usage(user_id)
        item = {
            "user_id": user_id,
            "is_note": False,
            "original_url": url,
            "title": enriched["title"],
            "summary": enriched["summary"],
            "content": (signals.get("text") or "")[:2000],
            "platform": platform,
            "intent": enriched["intent"],
            "tags": enriched["tags"],
            "author": enriched.get("author"),
            "thumbnail_url": signals.get("image"),
            "embedding": [],
            "enrichment_status": "enriched",
            "is_public": False,
            "created_at": utcnow(),
        }
    else:
        # Never lose a save — store raw for manual completion.
        item = {
            "user_id": user_id,
            "is_note": False,
            "original_url": url,
            "title": signals.get("title") or url,
            "summary": signals.get("description") or "",
            "content": (signals.get("text") or "")[:2000],
            "platform": platform,
            "intent": None,
            "tags": [],
            "author": signals.get("author"),
            "thumbnail_url": signals.get("image"),
            "embedding": [],
            "enrichment_status": "manual" if signals.get("title") else "failed",
            "is_public": False,
            "created_at": utcnow(),
        }

    res = await db.items.insert_one(item)
    item["_id"] = res.inserted_id
    return {"duplicate": False, "item": _serialize(item)}


@router.get("/items")
async def list_items(
    current=Depends(get_current_user),
    cursor: str | None = Query(None),
    limit: int = Query(20, ge=1, le=50),
    tag: str | None = Query(None),
    intent: str | None = Query(None),
):
    user_id = str(current["_id"])
    query: dict = {"user_id": user_id, "is_deleted": {"$ne": True}}
    if tag:
        query["tags"] = tag.lower()
    if intent:
        query["intent"] = intent
    if cursor:
        query["_id"] = {"$lt": _oid(cursor)}

    docs = await db.items.find(query).sort("_id", -1).limit(limit + 1).to_list(limit + 1)
    has_more = len(docs) > limit
    docs = docs[:limit]
    next_cursor = str(docs[-1]["_id"]) if docs and has_more else None
    return {
        "items": [_serialize(d) for d in docs],
        "next_cursor": next_cursor,
        "has_more": has_more,
    }


@router.get("/items/{item_id}")
async def get_item(item_id: str, current=Depends(get_current_user)):
    doc = await db.items.find_one(
        {"_id": _oid(item_id), "user_id": str(current["_id"]), "is_deleted": {"$ne": True}}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    return _serialize(doc)


@router.patch("/items/{item_id}")
async def update_item(item_id: str, body: ItemUpdateIn, current=Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if "tags" in updates:
        updates["tags"] = [str(t).strip().lower() for t in updates["tags"] if str(t).strip()]
    if "intent" in updates and updates["intent"] not in INTENTS:
        raise HTTPException(status_code=400, detail="Invalid intent")
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    res = await db.items.update_one(
        {"_id": _oid(item_id), "user_id": str(current["_id"])}, {"$set": updates}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    doc = await db.items.find_one({"_id": _oid(item_id)})
    return _serialize(doc)


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: str, current=Depends(get_current_user)):
    """Soft-delete: keep data but hide from all product queries."""
    res = await db.items.update_one(
        {"_id": _oid(item_id), "user_id": str(current["_id"]), "is_deleted": {"$ne": True}},
        {"$set": {"is_deleted": True, "deleted_at": utcnow()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@router.post("/items/{item_id}/enrich")
async def retry_enrich(item_id: str, current=Depends(get_current_user)):
    user_id = str(current["_id"])
    doc = await db.items.find_one({"_id": _oid(item_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    url = doc.get("original_url")
    if not url:
        raise HTTPException(status_code=400, detail="No URL to enrich")

    signals = await scraper.scrape(url)
    enriched = await ai.enrich(user_id, url, signals)
    if not enriched:
        raise HTTPException(status_code=422, detail="Enrichment failed, try a manual note")

    await _bump_ai_usage(user_id)
    updates = {
        "title": enriched["title"],
        "summary": enriched["summary"],
        "intent": enriched["intent"],
        "tags": enriched["tags"],
        "author": enriched.get("author"),
        "thumbnail_url": signals.get("image") or doc.get("thumbnail_url"),
        "enrichment_status": "enriched",
    }
    await db.items.update_one({"_id": _oid(item_id)}, {"$set": updates})
    doc.update(updates)
    return _serialize(doc)


@router.get("/collections")
async def collections(current=Depends(get_current_user)):
    user_id = str(current["_id"])
    pipeline = [
        {"$match": {"user_id": user_id, "intent": {"$ne": None}, "is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$intent", "count": {"$sum": 1}}},
    ]
    rows = await db.items.aggregate(pipeline).to_list(50)
    counts = {r["_id"]: r["count"] for r in rows}
    return {"collections": [{"intent": i, "count": counts.get(i, 0)} for i in INTENTS]}


@router.get("/tags")
async def tags(current=Depends(get_current_user), limit: int = Query(30, ge=1, le=100)):
    user_id = str(current["_id"])
    pipeline = [
        {"$match": {"user_id": user_id, "is_deleted": {"$ne": True}, "tags": {"$exists": True, "$ne": []}}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1, "_id": 1}},
        {"$limit": limit},
    ]
    rows = await db.items.aggregate(pipeline).to_list(limit)
    return {"tags": [{"tag": r["_id"], "count": r["count"]} for r in rows]}
