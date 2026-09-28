"""Integration test for /api/items/import-archive endpoint."""

import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api"

def run_test():
    # 1. Login
    login_data = json.dumps({"email": "testuser_2026@postrecaller.dev", "password": "Password123!"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            login_res = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        # If user doesn't exist, register
        reg_data = json.dumps({"email": "testuser_2026@postrecaller.dev", "password": "Password123!", "name": "Test User"}).encode("utf-8")
        req_reg = urllib.request.Request(f"{BASE_URL}/auth/register", data=reg_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req_reg) as resp:
            login_res = json.loads(resp.read().decode())

    token = login_res["access_token"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # 2. Test Instagram archive import
    ig_payload = json.dumps({
        "filename": "saved_posts.json",
        "content": json.dumps({
            "saved_saved_media": [
                {
                    "title": "Pasta Carbonara Recipe",
                    "string_map_data": {
                        "Saved on": {
                            "href": "https://www.instagram.com/reel/TEST_CARBONARA_123/?igsh=tracker",
                            "timestamp": 1720000000
                        }
                    }
                }
            ]
        })
    }).encode("utf-8")

    req_import = urllib.request.Request(f"{BASE_URL}/items/import-archive", data=ig_payload, headers=headers)
    with urllib.request.urlopen(req_import) as resp:
        res = json.loads(resp.read().decode())
        print("Import Archive Instagram Result:", res)
        assert res["status"] == "success"
        assert res["platform"] == "instagram"
        assert res["total_found"] == 1
        assert res["imported"] in (0, 1)

    # 3. Test Deduplication
    req_dupe = urllib.request.Request(f"{BASE_URL}/items/import-archive", data=ig_payload, headers=headers)
    with urllib.request.urlopen(req_dupe) as resp:
        res_dupe = json.loads(resp.read().decode())
        print("Import Archive Duplication Result:", res_dupe)
        assert res_dupe["imported"] == 0
        assert res_dupe["skipped_duplicate"] == 1

    print("ALL API IMPORT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
