import asyncio
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from config import db
from items import _background_enrich

async def run_enrich_pending():
    user = await db.users.find_one({"email": "samrilla24@gmail.com"})
    if not user:
        print("User not found!")
        return
    user_id = str(user["_id"])
    
    # Find pending or manual items
    items = await db.items.find({
        "user_id": user_id,
        "enrichment_status": {"$in": ["pending", "manual"]},
        "is_deleted": {"$ne": True}
    }).to_list(10)
    
    print(f"Found {len(items)} items to enrich for samrilla24@gmail.com...")
    for it in items:
        item_id = str(it["_id"])
        url = it["original_url"]
        print(f"Enriching: {it.get('title')[:30]} ({url})...")
        await _background_enrich(item_id, user_id, url)
        fresh = await db.items.find_one({"_id": it["_id"]})
        print(f"  -> Done! Status: {fresh.get('enrichment_status')}")
        print(f"     Title: {fresh.get('title')[:40]}")
        print(f"     Summary: {fresh.get('summary')[:80]}...")
        print(f"     Tags: {fresh.get('tags')}")

if __name__ == "__main__":
    asyncio.run(run_enrich_pending())
