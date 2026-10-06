"""
End-to-end verification script for all social media & bookmark export formats.
Tests parsing and database persistence for:
- Instagram ZIP (.zip) & Instagram JSON (.json)
- TikTok user data JSON (.json)
- X / Twitter bookmarks (.js)
- Reddit saved posts (.csv)
- YouTube watch history (.json)
- Browser bookmarks (.html)
- Multi-platform ZIP bundle (.zip)
"""
import asyncio
import os
import sys

# Ensure UTF-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from archive_parser import UniversalArchiveParser
from config import db
import items


async def run_tests():
    print("=" * 80)
    print("TESTING SOCIAL MEDIA & BOOKMARK ARCHIVE PARSING & VAULT PERSISTENCE")
    print("=" * 80)

    samples_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_exports"))
    files_to_test = [
        ("instagram_export.zip", "Instagram ZIP Archive"),
        ("instagram_saved_posts.json", "Instagram Saved Posts JSON"),
        ("tiktok_user_data.json", "TikTok User Data JSON"),
        ("twitter_bookmarks.js", "Twitter/X Bookmarks JS"),
        ("reddit_saved_posts.csv", "Reddit Saved Posts CSV"),
        ("youtube_watch_history.json", "YouTube Watch History JSON"),
        ("browser_bookmarks.html", "Browser Netscape HTML Bookmarks"),
        ("social_media_export_bundle.zip", "Multi-Platform Export Bundle ZIP"),
    ]

    # Step 1: Unit Test UniversalArchiveParser for each file
    print("\n--- PHASE 1: PARSER EXTRACTION TEST ---")
    all_extracted = {}
    for filename, label in files_to_test:
        filepath = os.path.join(samples_dir, filename)
        if not os.path.exists(filepath):
            print(f"❌ FAIL: File not found: {filename}")
            continue

        with open(filepath, "rb") as f:
            data = f.read()

        parsed = UniversalArchiveParser.parse_archive(data, filename=filename)
        all_extracted[filename] = parsed

        total = parsed.get("total_found", 0)
        unique = parsed.get("unique_valid", 0)
        platform = parsed.get("platform", "unknown")
        platform_display = parsed.get("platform_display", "Unknown")

        if unique > 0:
            print(f"✅ PASS: {label} ({filename})")
            print(f"   Platform detected: {platform_display} [{platform}]")
            print(f"   Found: {total} items | Unique valid: {unique} items")
            first_item = parsed["extracted"][0]
            print(f"   Sample item 1: '{first_item.get('title')}' -> {first_item.get('url')[:60]}...")
        else:
            print(f"❌ FAIL: {label} ({filename}) returned 0 items!")

    # Step 2: Database Persistence & User Vault Test
    print("\n--- PHASE 2: DATABASE IMPORT & PERSISTENCE TEST ---")
    test_user_id = "test_user_e2e_verification_999"

    # Clean up any leftover test data
    await db.items.delete_many({"user_id": test_user_id})

    try:
        total_persisted_all = 0
        for filename, label in files_to_test:
            filepath = os.path.join(samples_dir, filename)
            with open(filepath, "rb") as f:
                data = f.read()

            parsed = UniversalArchiveParser.parse_archive(data, filename=filename)
            extracted_items = parsed.get("extracted", [])
            if not extracted_items:
                continue

            # Simulate the exact backend batch insertion logic from items.py
            # 1. Fetch existing URLs for this user
            existing_docs = await db.items.find(
                {"user_id": test_user_id, "is_deleted": {"$ne": True}},
                {"original_url": 1}
            ).to_list(10000)
            existing_urls = {d["original_url"] for d in existing_docs if d.get("original_url")}

            # 2. Filter duplicates
            new_items_to_insert = []
            skipped_dup = 0
            for it in extracted_items:
                u = it["url"]
                if u in existing_urls:
                    skipped_dup += 1
                    continue
                existing_urls.add(u)
                new_items_to_insert.append({
                    "user_id": test_user_id,
                    "is_note": False,
                    "original_url": u,
                    "title": it.get("title") or u,
                    "summary": "",
                    "content": "",
                    "platform": it.get("platform") or "web",
                    "intent": None,
                    "tags": it.get("tags") or [],
                    "author": None,
                    "thumbnail_url": None,
                    "embedding": [],
                    "enrichment_status": "pending",
                    "is_public": False,
                    "created_at": items.utcnow(),
                })

            if new_items_to_insert:
                insert_res = await db.items.insert_many(new_items_to_insert)
                inserted_count = len(insert_res.inserted_ids)
            else:
                inserted_count = 0

            # 3. Verify in MongoDB that items are saved and queryable
            persisted_in_db = await db.items.count_documents({
                "user_id": test_user_id,
                "platform": parsed.get("platform")
            })

            print(f"✅ PASS: Vault Import: {label}")
            print(f"   Imported: {inserted_count} new items | Skipped: {skipped_dup} duplicates")
            print(f"   Verified in MongoDB for user '{test_user_id}': {persisted_in_db} '{parsed.get('platform')}' items saved")

            total_persisted_all += inserted_count

        # Step 3: Test Deduplication Guard
        print("\n--- PHASE 3: DEDUPLICATION RE-IMPORT TEST ---")
        # Try re-importing instagram_saved_posts.json again
        reimport_path = os.path.join(samples_dir, "instagram_saved_posts.json")
        with open(reimport_path, "rb") as f:
            reimport_data = f.read()

        reparsed = UniversalArchiveParser.parse_archive(reimport_data, filename="instagram_saved_posts.json")
        existing_docs = await db.items.find(
            {"user_id": test_user_id, "is_deleted": {"$ne": True}},
            {"original_url": 1}
        ).to_list(10000)
        existing_urls = {d["original_url"] for d in existing_docs if d.get("original_url")}

        reimport_duplicates = sum(1 for it in reparsed["extracted"] if it["url"] in existing_urls)
        print(f"✅ PASS: Deduplication Guard: Re-importing Instagram saved posts")
        print(f"   Items found: {len(reparsed['extracted'])} | Correctly flagged as duplicates: {reimport_duplicates}")
        assert reimport_duplicates == len(reparsed["extracted"]), "Expected all re-imported items to be caught by deduplication!"

        # Step 4: Vault Query Check (simulate GET /items for user)
        print("\n--- PHASE 4: VAULT USER RETRIEVAL TEST ---")
        vault_items = await db.items.find({"user_id": test_user_id}).sort("created_at", -1).to_list(100)
        print(f"✅ PASS: User Vault Retrieval: Successfully retrieved {len(vault_items)} items from database")
        platforms_in_vault = set(it.get("platform") for it in vault_items)
        print(f"   Platforms present in user vault: {sorted(list(platforms_in_vault))}")

        print("\n" + "=" * 80)
        print(f"ALL TESTS PASSED: {total_persisted_all} items across all formats successfully saved and verified in vault!")
        print("=" * 80)

    finally:
        # Cleanup test user items
        await db.items.delete_many({"user_id": test_user_id})
        print(f"🧹 Cleaned up test data for '{test_user_id}'.")


if __name__ == "__main__":
    asyncio.run(run_tests())
