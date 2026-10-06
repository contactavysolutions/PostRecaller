import asyncio
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from config import db
from bson import ObjectId

async def check():
    user = await db.users.find_one({"email": "samrilla24@gmail.com"})
    if not user:
        print("User not found!")
        return
    user_id = str(user["_id"])
    print(f"User ID: {user_id}")
    print(f"Daily usage: {user.get('daily_usage')}")
    
    total_items = await db.items.count_documents({"user_id": user_id, "is_deleted": {"$ne": True}})
    print(f"Total items in vault: {total_items}")
    
    statuses = await db.items.aggregate([
        {"$match": {"user_id": user_id, "is_deleted": {"$ne": True}}},
        {"$group": {"_id": "$enrichment_status", "count": {"$sum": 1}}}
    ]).to_list(100)
    print("Statuses distribution:")
    for s in statuses:
        print(f"  {s['_id']}: {s['count']}")
    
    items = await db.items.find({"user_id": user_id, "enrichment_status": {"$in": ["manual", "pending", "failed", "enriched"]}}).to_list(20)
    print("\nNon-imported items (manual / pending / failed / enriched):")
    for it in items:
        print(f"  [{it.get('enrichment_status')}] Title: {it.get('title')} | Summary: {it.get('summary')} | Intent: {it.get('intent')} | Tags: {it.get('tags')} | URL: {it.get('original_url')}")

if __name__ == "__main__":
    asyncio.run(check())
