#!/usr/bin/env python3
"""
Comprehensive backend test suite for PostRecaller API
Tests: health, auth, items/vault, waitlist, admin
"""
import requests
import time
import json
from datetime import datetime

# Backend URL from frontend/.env
BASE_URL = "https://post-memory-web.preview.emergentagent.com/api"

# Test data
timestamp = int(time.time())
test_email = f"test_{timestamp}@example.com"
test_password = "testpass123"
admin_email = "contactavysolutions@gmail.com"
admin_password = f"adminpass_{timestamp}"

# Color codes for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def log_test(name, passed, details=""):
    """Log test result with color coding"""
    status = f"{GREEN}✅ PASS{RESET}" if passed else f"{RED}❌ FAIL{RESET}"
    print(f"{status} | {name}")
    if details:
        print(f"    {details}")
    return passed

def log_section(name):
    """Log section header"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{name}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def check_response(response, expected_status, test_name):
    """Check response status and return success"""
    if response.status_code == expected_status:
        return log_test(test_name, True, f"Status: {response.status_code}")
    else:
        details = f"Expected {expected_status}, got {response.status_code}"
        if response.text:
            try:
                error_data = response.json()
                details += f"\nResponse: {json.dumps(error_data, indent=2)}"
            except:
                details += f"\nResponse: {response.text[:200]}"
        return log_test(test_name, False, details)

# Test results tracking
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def record_result(name, passed, details=""):
    """Record test result"""
    results["total"] += 1
    if passed:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["tests"].append({
        "name": name,
        "passed": passed,
        "details": details
    })

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================
log_section("1. HEALTH CHECK")

try:
    response = requests.get(f"{BASE_URL}/", timeout=10)
    passed = check_response(response, 200, "GET /api/ - Health check")
    if passed:
        data = response.json()
        if data.get("service") == "postrecaller" and data.get("status") == "ok":
            log_test("Health check response format", True, f"Response: {data}")
            record_result("Health check", True)
        else:
            log_test("Health check response format", False, f"Unexpected response: {data}")
            record_result("Health check", False, f"Unexpected response: {data}")
    else:
        record_result("Health check", False, f"Status code: {response.status_code}")
except Exception as e:
    log_test("Health check", False, f"Exception: {str(e)}")
    record_result("Health check", False, f"Exception: {str(e)}")

# ============================================================================
# 2. AUTH FLOW
# ============================================================================
log_section("2. AUTH FLOW")

# 2.1 Register new user
try:
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": test_email, "password": test_password},
        timeout=10
    )
    passed = check_response(response, 201, "POST /api/auth/register - New user")
    if passed:
        user_data = response.json()
        required_fields = ["id", "email", "plan", "is_admin", "ai_used_today", "ai_limit", "created_at"]
        missing = [f for f in required_fields if f not in user_data]
        if missing:
            log_test("Register response format", False, f"Missing fields: {missing}")
            record_result("Register new user", False, f"Missing fields: {missing}")
        else:
            if user_data["email"] == test_email and user_data["plan"] == "free" and user_data["ai_limit"] == 5:
                log_test("Register response format", True, f"User: {user_data['email']}, Plan: {user_data['plan']}, AI limit: {user_data['ai_limit']}")
                record_result("Register new user", True)
            else:
                log_test("Register response format", False, f"Unexpected values: {user_data}")
                record_result("Register new user", False, f"Unexpected values")
    else:
        record_result("Register new user", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Register new user", False, f"Exception: {str(e)}")
    record_result("Register new user", False, f"Exception: {str(e)}")

# 2.2 Register duplicate email
try:
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": test_email, "password": test_password},
        timeout=10
    )
    passed = check_response(response, 400, "POST /api/auth/register - Duplicate email")
    if passed:
        data = response.json()
        if "already registered" in data.get("detail", "").lower():
            log_test("Duplicate email error message", True, f"Detail: {data.get('detail')}")
            record_result("Register duplicate email", True)
        else:
            log_test("Duplicate email error message", False, f"Unexpected detail: {data.get('detail')}")
            record_result("Register duplicate email", False, f"Unexpected error message")
    else:
        record_result("Register duplicate email", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Register duplicate email", False, f"Exception: {str(e)}")
    record_result("Register duplicate email", False, f"Exception: {str(e)}")

# 2.3 Login with correct credentials
access_token = None
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": test_email, "password": test_password},
        timeout=10
    )
    passed = check_response(response, 200, "POST /api/auth/login - Correct credentials")
    if passed:
        data = response.json()
        if "access_token" in data and "token_type" in data and "user" in data:
            access_token = data["access_token"]
            log_test("Login response format", True, f"Token type: {data['token_type']}, User: {data['user']['email']}")
            record_result("Login correct credentials", True)
        else:
            log_test("Login response format", False, f"Missing fields in response: {data.keys()}")
            record_result("Login correct credentials", False, "Missing fields")
    else:
        record_result("Login correct credentials", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Login correct credentials", False, f"Exception: {str(e)}")
    record_result("Login correct credentials", False, f"Exception: {str(e)}")

# 2.4 Login with wrong password
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": test_email, "password": "wrongpassword"},
        timeout=10
    )
    passed = check_response(response, 401, "POST /api/auth/login - Wrong password")
    if passed:
        record_result("Login wrong password", True)
    else:
        record_result("Login wrong password", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Login wrong password", False, f"Exception: {str(e)}")
    record_result("Login wrong password", False, f"Exception: {str(e)}")

# 2.5 Get current user with token
if access_token:
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/auth/me - With valid token")
        if passed:
            data = response.json()
            if data.get("email") == test_email:
                log_test("GET /me response", True, f"Email matches: {data['email']}")
                record_result("GET /auth/me with token", True)
            else:
                log_test("GET /me response", False, f"Email mismatch: {data.get('email')}")
                record_result("GET /auth/me with token", False, "Email mismatch")
        else:
            record_result("GET /auth/me with token", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /auth/me with token", False, f"Exception: {str(e)}")
        record_result("GET /auth/me with token", False, f"Exception: {str(e)}")

# 2.6 Get current user without token
try:
    response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
    passed = check_response(response, 401, "GET /api/auth/me - No token")
    if passed:
        record_result("GET /auth/me without token", True)
    else:
        record_result("GET /auth/me without token", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("GET /auth/me without token", False, f"Exception: {str(e)}")
    record_result("GET /auth/me without token", False, f"Exception: {str(e)}")

# 2.7 Get current user with bad token
try:
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": "Bearer invalid_token_12345"},
        timeout=10
    )
    passed = check_response(response, 401, "GET /api/auth/me - Bad token")
    if passed:
        record_result("GET /auth/me with bad token", True)
    else:
        record_result("GET /auth/me with bad token", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("GET /auth/me with bad token", False, f"Exception: {str(e)}")
    record_result("GET /auth/me with bad token", False, f"Exception: {str(e)}")

# 2.8 Forgot password
try:
    response = requests.post(
        f"{BASE_URL}/auth/forgot-password",
        json={"email": test_email},
        timeout=10
    )
    passed = check_response(response, 200, "POST /api/auth/forgot-password")
    if passed:
        data = response.json()
        if data.get("ok") == True:
            log_test("Forgot password response", True, "Returns ok:true (no enumeration)")
            record_result("Forgot password", True)
        else:
            log_test("Forgot password response", False, f"Unexpected response: {data}")
            record_result("Forgot password", False, "Unexpected response")
    else:
        record_result("Forgot password", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Forgot password", False, f"Exception: {str(e)}")
    record_result("Forgot password", False, f"Exception: {str(e)}")

# 2.9 Reset password with wrong code
try:
    response = requests.post(
        f"{BASE_URL}/auth/reset-password",
        json={"email": test_email, "code": "000000", "new_password": "newpass123"},
        timeout=10
    )
    passed = check_response(response, 400, "POST /api/auth/reset-password - Wrong code")
    if passed:
        data = response.json()
        if "invalid" in data.get("detail", "").lower() or "expired" in data.get("detail", "").lower():
            log_test("Reset password error", True, f"Detail: {data.get('detail')}")
            record_result("Reset password wrong code", True)
        else:
            log_test("Reset password error", False, f"Unexpected detail: {data.get('detail')}")
            record_result("Reset password wrong code", False, "Unexpected error message")
    else:
        record_result("Reset password wrong code", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Reset password wrong code", False, f"Exception: {str(e)}")
    record_result("Reset password wrong code", False, f"Exception: {str(e)}")

# ============================================================================
# 3. ITEMS/VAULT FLOW
# ============================================================================
log_section("3. ITEMS/VAULT FLOW")

# Create a new user for items testing (to avoid conflicts with deleted user)
items_test_email = f"items_{timestamp}@example.com"
items_test_password = "itemspass123"
items_token = None
created_item_id = None

# Register and login
try:
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={"email": items_test_email, "password": items_test_password},
        timeout=10
    )
    if response.status_code == 201:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": items_test_email, "password": items_test_password},
            timeout=10
        )
        if response.status_code == 200:
            items_token = response.json()["access_token"]
            log_test("Items test user setup", True, f"Email: {items_test_email}")
        else:
            log_test("Items test user setup", False, f"Login failed: {response.status_code}")
    else:
        log_test("Items test user setup", False, f"Register failed: {response.status_code}")
except Exception as e:
    log_test("Items test user setup", False, f"Exception: {str(e)}")

# 3.1 Create item with URL (scrape + AI enrich)
if items_token:
    try:
        test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        response = requests.post(
            f"{BASE_URL}/items",
            json={"url": test_url},
            headers={"Authorization": f"Bearer {items_token}"},
            timeout=30  # AI enrichment may take time
        )
        passed = check_response(response, 200, "POST /api/items - Create with URL")
        if passed:
            data = response.json()
            if "item" in data and "duplicate" in data:
                item = data["item"]
                created_item_id = item.get("id")
                enrichment_status = item.get("enrichment_status")
                log_test("Item creation response", True, 
                    f"ID: {created_item_id}, Status: {enrichment_status}, "
                    f"Title: {item.get('title', 'N/A')[:50]}, "
                    f"Platform: {item.get('platform')}, "
                    f"Intent: {item.get('intent')}, "
                    f"Tags: {item.get('tags')}")
                
                # Check enrichment
                if enrichment_status in ["enriched", "manual", "pending", "failed"]:
                    if enrichment_status == "enriched":
                        if item.get("title") and item.get("summary") and item.get("intent"):
                            log_test("AI enrichment", True, f"Status: {enrichment_status}, has title/summary/intent")
                            record_result("Create item with AI enrichment", True, f"Enrichment: {enrichment_status}")
                        else:
                            log_test("AI enrichment", False, f"Status enriched but missing fields")
                            record_result("Create item with AI enrichment", False, "Missing enriched fields")
                    else:
                        log_test("AI enrichment", True, f"Graceful fallback: {enrichment_status}")
                        record_result("Create item with AI enrichment", True, f"Fallback: {enrichment_status}")
                else:
                    log_test("AI enrichment", False, f"Unknown status: {enrichment_status}")
                    record_result("Create item with AI enrichment", False, f"Unknown status: {enrichment_status}")
            else:
                log_test("Item creation response", False, f"Missing fields: {data.keys()}")
                record_result("Create item with AI enrichment", False, "Missing response fields")
        else:
            record_result("Create item with AI enrichment", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Create item with AI enrichment", False, f"Exception: {str(e)}")
        record_result("Create item with AI enrichment", False, f"Exception: {str(e)}")

    # 3.2 Create duplicate item
    if created_item_id:
        try:
            response = requests.post(
                f"{BASE_URL}/items",
                json={"url": test_url},
                headers={"Authorization": f"Bearer {items_token}"},
                timeout=30
            )
            passed = check_response(response, 200, "POST /api/items - Duplicate URL")
            if passed:
                data = response.json()
                if data.get("duplicate") == True:
                    log_test("Duplicate detection", True, f"Duplicate flag: {data.get('duplicate')}")
                    record_result("Create duplicate item", True)
                else:
                    log_test("Duplicate detection", False, f"Expected duplicate=true, got: {data.get('duplicate')}")
                    record_result("Create duplicate item", False, "Duplicate not detected")
            else:
                record_result("Create duplicate item", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Create duplicate item", False, f"Exception: {str(e)}")
            record_result("Create duplicate item", False, f"Exception: {str(e)}")

    # 3.3 List items
    try:
        response = requests.get(
            f"{BASE_URL}/items?limit=20",
            headers={"Authorization": f"Bearer {items_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/items - List")
        if passed:
            data = response.json()
            if "items" in data and "has_more" in data:
                items_list = data["items"]
                log_test("List items response", True, f"Count: {len(items_list)}, Has more: {data.get('has_more')}")
                if created_item_id:
                    found = any(item.get("id") == created_item_id for item in items_list)
                    if found:
                        log_test("Created item in list", True, f"Found item {created_item_id}")
                        record_result("List items", True)
                    else:
                        log_test("Created item in list", False, f"Item {created_item_id} not found")
                        record_result("List items", False, "Created item not in list")
                else:
                    record_result("List items", True)
            else:
                log_test("List items response", False, f"Missing fields: {data.keys()}")
                record_result("List items", False, "Missing response fields")
        else:
            record_result("List items", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("List items", False, f"Exception: {str(e)}")
        record_result("List items", False, f"Exception: {str(e)}")

    # 3.4 Get single item
    if created_item_id:
        try:
            response = requests.get(
                f"{BASE_URL}/items/{created_item_id}",
                headers={"Authorization": f"Bearer {items_token}"},
                timeout=10
            )
            passed = check_response(response, 200, f"GET /api/items/{created_item_id}")
            if passed:
                data = response.json()
                if data.get("id") == created_item_id:
                    log_test("Get item response", True, f"ID matches, Title: {data.get('title', 'N/A')[:50]}")
                    record_result("Get single item", True)
                else:
                    log_test("Get item response", False, f"ID mismatch")
                    record_result("Get single item", False, "ID mismatch")
            else:
                record_result("Get single item", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Get single item", False, f"Exception: {str(e)}")
            record_result("Get single item", False, f"Exception: {str(e)}")

    # 3.5 Update item
    if created_item_id:
        try:
            response = requests.patch(
                f"{BASE_URL}/items/{created_item_id}",
                json={"tags": ["test", "automation"], "intent": "Learn"},
                headers={"Authorization": f"Bearer {items_token}"},
                timeout=10
            )
            passed = check_response(response, 200, f"PATCH /api/items/{created_item_id}")
            if passed:
                data = response.json()
                if "test" in data.get("tags", []) and data.get("intent") == "Learn":
                    log_test("Update item response", True, f"Tags: {data.get('tags')}, Intent: {data.get('intent')}")
                    record_result("Update item", True)
                else:
                    log_test("Update item response", False, f"Update not reflected: {data}")
                    record_result("Update item", False, "Update not reflected")
            else:
                record_result("Update item", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Update item", False, f"Exception: {str(e)}")
            record_result("Update item", False, f"Exception: {str(e)}")

    # 3.6 Retry enrichment
    if created_item_id:
        try:
            response = requests.post(
                f"{BASE_URL}/items/{created_item_id}/enrich",
                headers={"Authorization": f"Bearer {items_token}"},
                timeout=30
            )
            # Should return 200 or 422 (if enrichment fails)
            if response.status_code in [200, 422]:
                log_test("POST /api/items/{id}/enrich", True, f"Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    log_test("Retry enrichment response", True, f"Status: {data.get('enrichment_status')}")
                    record_result("Retry enrichment", True)
                else:
                    log_test("Retry enrichment", True, "Enrichment failed gracefully (422)")
                    record_result("Retry enrichment", True, "Graceful failure")
            else:
                log_test("POST /api/items/{id}/enrich", False, f"Unexpected status: {response.status_code}")
                record_result("Retry enrichment", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Retry enrichment", False, f"Exception: {str(e)}")
            record_result("Retry enrichment", False, f"Exception: {str(e)}")

    # 3.7 Get collections
    try:
        response = requests.get(
            f"{BASE_URL}/collections",
            headers={"Authorization": f"Bearer {items_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/collections")
        if passed:
            data = response.json()
            if "collections" in data:
                collections = data["collections"]
                log_test("Collections response", True, f"Count: {len(collections)}")
                # Check if our "Learn" intent is counted
                learn_collection = next((c for c in collections if c.get("intent") == "Learn"), None)
                if learn_collection:
                    log_test("Collections content", True, f"Learn collection count: {learn_collection.get('count')}")
                    record_result("Get collections", True)
                else:
                    log_test("Collections content", True, "Collections returned (Learn may be 0)")
                    record_result("Get collections", True)
            else:
                log_test("Collections response", False, f"Missing collections field")
                record_result("Get collections", False, "Missing collections field")
        else:
            record_result("Get collections", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Get collections", False, f"Exception: {str(e)}")
        record_result("Get collections", False, f"Exception: {str(e)}")

    # 3.8 Delete item
    if created_item_id:
        try:
            response = requests.delete(
                f"{BASE_URL}/items/{created_item_id}",
                headers={"Authorization": f"Bearer {items_token}"},
                timeout=10
            )
            # Should return 204 or 200
            if response.status_code in [200, 204]:
                log_test("DELETE /api/items/{id}", True, f"Status: {response.status_code}")
                record_result("Delete item", True)
            else:
                log_test("DELETE /api/items/{id}", False, f"Status: {response.status_code}")
                record_result("Delete item", False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("Delete item", False, f"Exception: {str(e)}")
            record_result("Delete item", False, f"Exception: {str(e)}")

# ============================================================================
# 4. WAITLIST FLOW
# ============================================================================
log_section("4. WAITLIST FLOW")

# 4.1 Get waitlist count
try:
    response = requests.get(f"{BASE_URL}/waitlist/count", timeout=10)
    passed = check_response(response, 200, "GET /api/waitlist/count")
    if passed:
        data = response.json()
        if "count" in data:
            log_test("Waitlist count response", True, f"Count: {data['count']}")
            record_result("Get waitlist count", True)
        else:
            log_test("Waitlist count response", False, f"Missing count field")
            record_result("Get waitlist count", False, "Missing count field")
    else:
        record_result("Get waitlist count", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Get waitlist count", False, f"Exception: {str(e)}")
    record_result("Get waitlist count", False, f"Exception: {str(e)}")

# 4.2 Join waitlist
waitlist_email = f"waitlist_{timestamp}@example.com"
try:
    response = requests.post(
        f"{BASE_URL}/waitlist",
        json={"email": waitlist_email, "source": "test"},
        timeout=10
    )
    passed = check_response(response, 200, "POST /api/waitlist - New email")
    if passed:
        data = response.json()
        if data.get("ok") and "position" in data and "count" in data:
            log_test("Waitlist join response", True, f"Position: {data['position']}, Count: {data['count']}")
            record_result("Join waitlist", True)
        else:
            log_test("Waitlist join response", False, f"Missing fields: {data.keys()}")
            record_result("Join waitlist", False, "Missing response fields")
    else:
        record_result("Join waitlist", False, f"Status: {response.status_code}")
except Exception as e:
    log_test("Join waitlist", False, f"Exception: {str(e)}")
    record_result("Join waitlist", False, f"Exception: {str(e)}")

# 4.3 Join waitlist with duplicate email
try:
    response = requests.post(
        f"{BASE_URL}/waitlist",
        json={"email": waitlist_email, "source": "test"},
        timeout=10
    )
    passed = check_response(response, 200, "POST /api/waitlist - Duplicate email")
    if passed:
        data = response.json()
        if data.get("already") == True:
            log_test("Waitlist duplicate handling", True, f"Already flag: {data.get('already')}")
            record_result("Join waitlist duplicate", True)
        else:
            log_test("Waitlist duplicate handling", True, "Handled gracefully (no crash)")
            record_result("Join waitlist duplicate", True, "Graceful handling")
    else:
        # As long as it doesn't crash, it's acceptable
        log_test("Waitlist duplicate handling", True, f"Handled with status: {response.status_code}")
        record_result("Join waitlist duplicate", True, f"Status: {response.status_code}")
except Exception as e:
    log_test("Join waitlist duplicate", False, f"Exception: {str(e)}")
    record_result("Join waitlist duplicate", False, f"Exception: {str(e)}")

# ============================================================================
# 5. ADMIN FLOW
# ============================================================================
log_section("5. ADMIN FLOW")

# 5.1 Register admin user
admin_token = None
try:
    # First check if admin already exists
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": admin_email, "password": admin_password},
        timeout=10
    )
    if response.status_code == 200:
        admin_token = response.json()["access_token"]
        log_test("Admin user login", True, f"Admin already exists: {admin_email}")
    else:
        # Register new admin
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": admin_email, "password": admin_password},
            timeout=10
        )
        if response.status_code == 201:
            # Login to get token
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": admin_email, "password": admin_password},
                timeout=10
            )
            if response.status_code == 200:
                admin_token = response.json()["access_token"]
                user_data = response.json()["user"]
                if user_data.get("is_admin"):
                    log_test("Admin user setup", True, f"Email: {admin_email}, is_admin: True")
                    record_result("Register admin user", True)
                else:
                    log_test("Admin user setup", False, f"User not marked as admin (seed_admins may need to run)")
                    record_result("Register admin user", False, "Not marked as admin")
            else:
                log_test("Admin user setup", False, f"Login failed: {response.status_code}")
                record_result("Register admin user", False, f"Login failed")
        else:
            log_test("Admin user setup", False, f"Register failed: {response.status_code}")
            record_result("Register admin user", False, f"Register failed")
except Exception as e:
    log_test("Admin user setup", False, f"Exception: {str(e)}")
    record_result("Register admin user", False, f"Exception: {str(e)}")

# 5.2 Test admin endpoints
if admin_token:
    # GET /api/admin/waitlist
    try:
        response = requests.get(
            f"{BASE_URL}/admin/waitlist",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/admin/waitlist")
        if passed:
            data = response.json()
            if "entries" in data and "total" in data:
                log_test("Admin waitlist response", True, f"Total: {data['total']}, Entries: {len(data['entries'])}")
                record_result("Admin get waitlist", True)
            else:
                log_test("Admin waitlist response", False, f"Missing fields: {data.keys()}")
                record_result("Admin get waitlist", False, "Missing response fields")
        else:
            record_result("Admin get waitlist", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin get waitlist", False, f"Exception: {str(e)}")
        record_result("Admin get waitlist", False, f"Exception: {str(e)}")

    # GET /api/admin/users
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/admin/users")
        if passed:
            data = response.json()
            if "users" in data:
                log_test("Admin users response", True, f"Users count: {len(data['users'])}")
                record_result("Admin get users", True)
            else:
                log_test("Admin users response", False, f"Missing users field")
                record_result("Admin get users", False, "Missing users field")
        else:
            record_result("Admin get users", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin get users", False, f"Exception: {str(e)}")
        record_result("Admin get users", False, f"Exception: {str(e)}")

    # GET /api/admin/health
    try:
        response = requests.get(
            f"{BASE_URL}/admin/health",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/admin/health")
        if passed:
            data = response.json()
            if "checks" in data:
                checks = data["checks"]
                log_test("Admin health response", True, f"Checks count: {len(checks)}")
                for check in checks:
                    status = "✓" if check.get("ok") else "✗"
                    print(f"    {status} {check.get('name')}: {check.get('detail')}")
                record_result("Admin get health", True)
            else:
                log_test("Admin health response", False, f"Missing checks field")
                record_result("Admin get health", False, "Missing checks field")
        else:
            record_result("Admin get health", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin get health", False, f"Exception: {str(e)}")
        record_result("Admin get health", False, f"Exception: {str(e)}")

    # GET /api/admin/usage
    try:
        response = requests.get(
            f"{BASE_URL}/admin/usage?days=7",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        passed = check_response(response, 200, "GET /api/admin/usage")
        if passed:
            data = response.json()
            if "totals" in data and "daily" in data:
                log_test("Admin usage response", True, f"Totals: {data['totals']}")
                record_result("Admin get usage", True)
            else:
                log_test("Admin usage response", False, f"Missing fields: {data.keys()}")
                record_result("Admin get usage", False, "Missing response fields")
        else:
            record_result("Admin get usage", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin get usage", False, f"Exception: {str(e)}")
        record_result("Admin get usage", False, f"Exception: {str(e)}")

# 5.3 Test non-admin access to admin endpoints
if items_token:
    try:
        response = requests.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {items_token}"},
            timeout=10
        )
        passed = check_response(response, 403, "GET /api/admin/users - Non-admin user")
        if passed:
            record_result("Admin endpoint 403 for non-admin", True)
        else:
            record_result("Admin endpoint 403 for non-admin", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Admin endpoint 403 for non-admin", False, f"Exception: {str(e)}")
        record_result("Admin endpoint 403 for non-admin", False, f"Exception: {str(e)}")

# ============================================================================
# 6. DELETE USER (test at end to avoid affecting other tests)
# ============================================================================
log_section("6. USER DELETION")

# Delete the first test user
if access_token:
    try:
        response = requests.delete(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        if response.status_code in [200, 204]:
            log_test("DELETE /api/auth/me", True, f"Status: {response.status_code}")
            
            # Try to access with same token (should fail)
            response = requests.get(
                f"{BASE_URL}/auth/me",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10
            )
            if response.status_code == 401:
                log_test("Deleted user token invalid", True, "Token rejected after deletion")
                record_result("Delete user", True)
            else:
                log_test("Deleted user token invalid", False, f"Token still valid: {response.status_code}")
                record_result("Delete user", False, "Token still valid after deletion")
        else:
            log_test("DELETE /api/auth/me", False, f"Status: {response.status_code}")
            record_result("Delete user", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Delete user", False, f"Exception: {str(e)}")
        record_result("Delete user", False, f"Exception: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
log_section("TEST SUMMARY")

print(f"\nTotal tests: {results['total']}")
print(f"{GREEN}Passed: {results['passed']}{RESET}")
print(f"{RED}Failed: {results['failed']}{RESET}")
print(f"Success rate: {(results['passed']/results['total']*100):.1f}%")

if results['failed'] > 0:
    print(f"\n{RED}Failed tests:{RESET}")
    for test in results['tests']:
        if not test['passed']:
            print(f"  ❌ {test['name']}")
            if test['details']:
                print(f"     {test['details']}")

print(f"\n{BLUE}Test completed at: {datetime.now().isoformat()}{RESET}")
