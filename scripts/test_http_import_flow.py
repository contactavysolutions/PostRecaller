"""
End-to-End HTTP API test for /api/items/import-archive across all social platforms.
Tests real HTTP request dispatch, JWT authentication, binary streaming,
batch insertion into MongoDB, and verification via GET /api/items.
"""
import asyncio
import os
import sys

# Ensure UTF-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

import httpx
from server import app
from config import db
from auth import create_access_token
import items


async def run_http_tests():
    print("=" * 80)
    print("TESTING HTTP API: /api/items/import-archive WITH HTTPX ASGICLIENT")
    print("=" * 80)

    # Use ASGITransport if supported, or app directly
    try:
        transport = httpx.ASGITransport(app=app)
        client = httpx.AsyncClient(transport=transport, base_url="http://testserver")
    except Exception:
        client = httpx.AsyncClient(app=app, base_url="http://testserver")

    samples_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_exports"))

    # 1. Create a dummy test user in MongoDB
    test_email = "tester_social_exports@example.com"
    await db.users.delete_many({"email": test_email})
    insert_res = await db.users.insert_one({
        "email": test_email,
        "password_hash": "dummy_hash",
        "is_admin": False,
        "created_at": items.utcnow(),
    })
    user_id = str(insert_res.inserted_id)
    await db.items.delete_many({"user_id": user_id})
    token = create_access_token(user_id, test_email, False)

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/octet-stream"}

    export_files = [
        ("instagram_export.zip", "Instagram ZIP Archive"),
        ("tiktok_user_data.json", "TikTok User Data JSON"),
        ("twitter_bookmarks.js", "Twitter/X Bookmarks JS"),
        ("reddit_saved_posts.csv", "Reddit Saved Posts CSV"),
        ("youtube_watch_history.json", "YouTube Watch History JSON"),
        ("browser_bookmarks.html", "Browser Netscape HTML Bookmarks"),
    ]

    try:
        total_imported_all = 0
        for filename, label in export_files:
            filepath = os.path.join(samples_dir, filename)
            with open(filepath, "rb") as f:
                file_bytes = f.read()

            url = f"/api/items/import-archive?filename={filename}"
            response = await client.post(url, headers=headers, content=file_bytes)

            assert response.status_code == 200, f"Failed for {filename}: {response.status_code} {response.text}"
            data = response.json()

            assert data["status"] == "success"
            assert data["imported"] > 0
            assert data["unique_valid"] > 0

            print(f"✅ HTTP 200: {label} ({filename})")
            print(f"   Platform: {data['platform_display']} [{data['platform']}]")
            print(f"   Found: {data['total_found']} | Valid: {data['unique_valid']} | Imported: {data['imported']}")
            print(f"   Enqueued for AI enrichment: {data.get('ai_enrichment_queued', 0)}")
            total_imported_all += data["imported"]

        # 2. Verify vault retrieval via GET /api/items (limit <= 50)
        get_res = await client.get("/api/items?limit=50", headers={"Authorization": f"Bearer {token}"})
        assert get_res.status_code == 200, get_res.text
        vault_data = get_res.json()
        saved_items = vault_data.get("items", [])

        # Also count all items in user vault in DB
        db_total_count = await db.items.count_documents({"user_id": user_id, "is_deleted": {"$ne": True}})
        print("\n--- VAULT VERIFICATION (GET /api/items & MongoDB) ---")
        print(f"✅ PASS: Retrieved {len(saved_items)} items on first page (limit=50)")
        print(f"✅ PASS: Total items saved in user vault in DB: {db_total_count}")
        assert db_total_count == total_imported_all, f"Expected {total_imported_all} in DB, found {db_total_count}"

        # Fetch distinct platforms directly from user vault
        platforms = await db.items.distinct("platform", {"user_id": user_id})
        print(f"   Platforms active in vault: {sorted(list(platforms))}")

        # Ensure all key platforms are present
        for expected_p in ["instagram", "tiktok", "x", "reddit", "youtube", "web"]:
            assert expected_p in platforms, f"Missing platform in vault: {expected_p}"
            count_for_p = await db.items.count_documents({"user_id": user_id, "platform": expected_p})
            print(f"   - {expected_p.upper()}: {count_for_p} posts verified in user vault")

        print("\n" + "=" * 80)
        print(f"ALL ENDPOINTS & ARCHIVE FORMATS VERIFIED SUCCESSFULLY ({total_imported_all} total saves)")
        print("=" * 80)

    finally:
        await client.aclose()
        await db.users.delete_many({"_id": items.ObjectId(user_id)})
        await db.items.delete_many({"user_id": user_id})
        print("🧹 Cleaned up test user and vault items.")


if __name__ == "__main__":
    asyncio.run(run_http_tests())
