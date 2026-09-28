import asyncio
from datetime import datetime
import json
import logging

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, Request

import ai
import scraper
from bookmark_parser import parse_bookmarks_html
from archive_parser import (
    UniversalArchiveParser,
    clean_url,
    detect_platform_from_url,
    MAX_ARCHIVE_SIZE_BYTES,
    MAX_EXTRACTED_ITEMS,
)
from auth import get_current_user
from config import (
    BOOKMARK_ENRICH_CONCURRENCY,
    DAILY_SAVE_CAP,
    FREE_DAILY_AI_LIMIT,
    INTENTS,
    MAX_BOOKMARK_IMPORT_LIMIT,
    db,
)
from models import CreateItemIn, ItemUpdateIn, utcnow
from rate_limit import limiter

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


async def _background_enrich(item_id: str, user_id: str, url: str) -> None:
    """Scrape and enrich a saved item in the background, updating MongoDB upon completion."""
    logger = logging.getLogger(__name__)
    try:
        signals = await scraper.scrape(url)
        platform = signals.get("platform") or scraper.detect_platform(url)

        enriched = await ai.enrich(user_id, url, signals)
        if enriched:
            await _bump_ai_usage(user_id)
            tags = enriched.get("tags") or []
            if platform and platform != "web" and platform.lower() not in tags:
                tags.insert(0, platform.lower())

            updates = {
                "title": enriched["title"],
                "summary": enriched["summary"],
                "content": (signals.get("text") or "")[:2000],
                "platform": platform,
                "intent": enriched["intent"],
                "tags": tags,
                "author": enriched.get("author"),
                "thumbnail_url": signals.get("image"),
                "enrichment_status": "enriched",
                "updated_at": utcnow(),
            }
        else:
            tags = [platform.lower()] if platform and platform != "web" else []
            has_signals = bool(signals.get("title") or signals.get("description") or signals.get("text"))
            updates = {
                "title": signals.get("title") or url,
                "summary": signals.get("description") or "",
                "content": (signals.get("text") or "")[:2000],
                "platform": platform,
                "intent": None,
                "tags": tags,
                "author": signals.get("author"),
                "thumbnail_url": signals.get("image"),
                "enrichment_status": "manual" if has_signals else "failed",
                "updated_at": utcnow(),
            }

        await db.items.update_one({"_id": _oid(item_id)}, {"$set": updates})
        logger.info("Background enrichment completed for item %s with status %s", item_id, updates["enrichment_status"])
    except Exception as e:
        logger.exception("Background enrichment error for item %s: %s", item_id, e)
        try:
            await db.items.update_one(
                {"_id": _oid(item_id)},
                {"$set": {"enrichment_status": "failed", "updated_at": utcnow()}}
            )
        except Exception:
            pass


@router.post("/items")
async def create_item(
    body: CreateItemIn,
    sync: bool = False,
    current=Depends(get_current_user),
):
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
    dup = await db.items.find_one({"user_id": user_id, "original_url": url, "is_deleted": {"$ne": True}})
    if dup:
        return {"duplicate": True, "item": _serialize(dup)}

    platform = scraper.detect_platform(url)
    initial_tags = [platform.lower()] if platform and platform != "web" else []

    item = {
        "user_id": user_id,
        "is_note": False,
        "original_url": url,
        "title": url,
        "summary": "",
        "content": "",
        "platform": platform,
        "intent": None,
        "tags": initial_tags,
        "author": None,
        "thumbnail_url": None,
        "embedding": [],
        "enrichment_status": "pending",
        "is_public": False,
        "created_at": utcnow(),
    }

    res = await db.items.insert_one(item)
    item_id = str(res.inserted_id)
    item["_id"] = res.inserted_id

    if sync:
        await _background_enrich(item_id, user_id, url)
        updated = await db.items.find_one({"_id": res.inserted_id})
        return {"duplicate": False, "item": _serialize(updated or item)}

    # Asynchronous background enrichment (default)
    asyncio.create_task(_background_enrich(item_id, user_id, url))
    return {"duplicate": False, "item": _serialize(item)}


async def _throttled_enrich_batch(items_to_enrich: list, user_id: str) -> None:
    """Enrich a small batch of bookmarks in background with concurrency semaphore and pacing."""
    sem = asyncio.Semaphore(BOOKMARK_ENRICH_CONCURRENCY)

    async def _worker(item_id: str, url: str):
        async with sem:
            await _background_enrich(item_id, user_id, url)
            await asyncio.sleep(1.0)  # Gentle pacing between external calls

    tasks = [_worker(it["id"], it["url"]) for it in items_to_enrich]
    await asyncio.gather(*tasks, return_exceptions=True)


async def _process_archive_import(
    request: Request,
    user_id: str,
    override_filename: str | None = None,
) -> dict:
    """Core logic to process incoming archive, file, or JSON/HTML bookmarks.
    
    Guarantees:
    - 25MB maximum stream size limit to prevent memory exhaustion.
    - Zero external multipart dependencies.
    - Auto-detection across Instagram, TikTok, YouTube, Reddit, X, Pinterest, Browser.
    - SSRF protection against internal/loopback/cloud metadata IP addresses.
    - Script/HTML tag stripping and tracking query parameter cleaning (?igsh=, ?si=, etc.).
    - Batch deduplication and single-query batch MongoDB insertion.
    - Zero server/AI overload: saves all bookmarks with status 'imported', and enqueues
      only up to remaining daily free quota for throttled background enrichment.
    """
    max_size = MAX_ARCHIVE_SIZE_BYTES  # 25MB
    content = bytearray()

    async for chunk in request.stream():
        content.extend(chunk)
        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Import file exceeds maximum allowed size of 25MB",
            )

    content_type = request.headers.get("content-type", "").lower()
    raw_bytes = bytes(content)
    filename = override_filename or ""

    # Support JSON { "html": "...", "content": "..." }
    if "application/json" in content_type:
        try:
            data = json.loads(content.decode("utf-8", errors="replace"))
            payload_str = data.get("content") or data.get("html") or data.get("json") or ""
            raw_bytes = payload_str.encode("utf-8")
            if not filename:
                filename = data.get("filename", "import.json")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body")
    # Support multipart/form-data via standard library email parser
    elif "multipart/form-data" in content_type:
        try:
            from email import message_from_bytes
            header_prefix = f"Content-Type: {content_type}\r\n\r\n".encode("latin-1")
            msg = message_from_bytes(header_prefix + content)
            for part in msg.walk():
                part_fn = part.get_filename()
                if part_fn:
                    filename = part_fn
                payload = part.get_payload(decode=True)
                if payload:
                    raw_bytes = payload
                    break
        except Exception as e:
            logging.getLogger(__name__).warning("Failed standard library multipart parsing: %s", e)

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="No archive content received in request")

    # Parse archive using universal multi-platform parser
    res = UniversalArchiveParser.parse_archive(raw_bytes, filename=filename, max_limit=MAX_EXTRACTED_ITEMS)
    extracted = res["extracted"]

    if not extracted:
        raise HTTPException(
            status_code=400,
            detail="No valid saves or URLs found in the uploaded file. Please check file format.",
        )

    # Batch duplicate detection against user's vault
    urls = [b["url"] for b in extracted]
    existing_docs = await db.items.find(
        {"user_id": user_id, "original_url": {"$in": urls}, "is_deleted": {"$ne": True}},
        {"original_url": 1},
    ).to_list(length=len(urls))
    existing_urls = {d["original_url"] for d in existing_docs}

    # Prepare documents for batch insert
    new_items = []
    platform_name = res.get("platform_display", "Universal")
    for b in extracted:
        url = b["url"]
        if url in existing_urls:
            continue
        existing_urls.add(url)  # deduplicate within batch

        platform = b.get("platform") or detect_platform_from_url(url)
        tags = list(b.get("tags") or [])
        if platform and platform != "web" and platform.lower() not in [t.lower() for t in tags]:
            tags.append(platform.lower())

        item_doc = {
            "user_id": user_id,
            "is_note": False,
            "original_url": url,
            "title": b["title"],
            "summary": f"Imported save from {platform_name}",
            "content": "",
            "platform": platform,
            "intent": None,
            "tags": tags,
            "author": None,
            "thumbnail_url": None,
            "embedding": [],
            "enrichment_status": "imported",
            "is_public": False,
            "created_at": utcnow(),
        }
        new_items.append(item_doc)

    inserted_items = []
    if new_items:
        insert_res = await db.items.insert_many(new_items, ordered=False)
        for doc, inserted_id in zip(new_items, insert_res.inserted_ids):
            doc["_id"] = inserted_id
            inserted_items.append({"id": str(inserted_id), "url": doc["original_url"]})

    # Quota-aware background enrichment (safe pacing, no Gemini 429 overload)
    today = _today()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    usage = (user.get("daily_usage") or {}) if user else {}
    ai_count = usage.get("ai_enrichments", 0) if usage.get("date") == today else 0
    remaining_quota = max(0, FREE_DAILY_AI_LIMIT - ai_count)

    items_to_enrich = []
    if remaining_quota > 0 and inserted_items:
        # Enqueue up to remaining free quota (max 5)
        items_to_enrich = inserted_items[: min(remaining_quota, 5)]
        enrich_ids = [ObjectId(it["id"]) for it in items_to_enrich]
        await db.items.update_many(
            {"_id": {"$in": enrich_ids}},
            {"$set": {"enrichment_status": "pending", "updated_at": utcnow()}},
        )
        asyncio.create_task(_throttled_enrich_batch(items_to_enrich, user_id))

    return {
        "status": "success",
        "platform": res["platform"],
        "platform_display": res["platform_display"],
        "total_found": res["total_found"],
        "unique_valid": res["unique_valid"],
        "imported": len(new_items),
        "skipped_duplicate": len(extracted) - len(new_items),
        "limit_applied": res["limit_applied"],
        "limit_max": res["limit_max"],
        "ai_enrichment_queued": len(items_to_enrich),
        "source_files": res.get("source_files", []),
    }


@router.post("/items/import-archive")
@limiter.limit("20/hour")
async def import_archive(
    request: Request,
    filename: str | None = Query(None),
    current=Depends(get_current_user),
):
    """Universal import for social media archives (Instagram, TikTok, YouTube, Reddit, X, Browser)."""
    user_id = str(current["_id"])
    return await _process_archive_import(request, user_id, override_filename=filename)


@router.post("/items/import-bookmarks")
@limiter.limit("20/hour")
async def import_bookmarks(
    request: Request,
    current=Depends(get_current_user),
):
    """Backwards-compatible alias for browser bookmarks and file imports."""
    user_id = str(current["_id"])
    return await _process_archive_import(request, user_id)


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
async def retry_enrich(item_id: str, sync: bool = False, current=Depends(get_current_user)):
    user_id = str(current["_id"])
    doc = await db.items.find_one({"_id": _oid(item_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    url = doc.get("original_url")
    if not url:
        raise HTTPException(status_code=400, detail="No URL to enrich")

    if sync:
        signals = await scraper.scrape(url)
        enriched = await ai.enrich(user_id, url, signals)
        if not enriched:
            raise HTTPException(status_code=422, detail="Enrichment failed, try a manual note")

        await _bump_ai_usage(user_id)
        platform = signals.get("platform") or scraper.detect_platform(url)
        tags = enriched.get("tags") or []
        if platform and platform != "web" and platform.lower() not in tags:
            tags.insert(0, platform.lower())

        updates = {
            "title": enriched["title"],
            "summary": enriched["summary"],
            "intent": enriched["intent"],
            "tags": tags,
            "author": enriched.get("author"),
            "thumbnail_url": signals.get("image") or doc.get("thumbnail_url"),
            "enrichment_status": "enriched",
            "updated_at": utcnow(),
        }
        await db.items.update_one({"_id": _oid(item_id)}, {"$set": updates})
        doc.update(updates)
        return _serialize(doc)

    # Background async enrichment (default)
    await db.items.update_one({"_id": _oid(item_id)}, {"$set": {"enrichment_status": "pending", "updated_at": utcnow()}})
    asyncio.create_task(_background_enrich(item_id, user_id, url))
    doc["enrichment_status"] = "pending"
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
