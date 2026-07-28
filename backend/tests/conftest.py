"""Shared fixtures for Glean backend tests."""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env for EXPO_PUBLIC_BACKEND_URL
load_dotenv(Path(__file__).parent.parent.parent / "frontend" / ".env")

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def api_base():
    return API


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_user_creds():
    # Unique per session so we don't collide with an existing account
    return {
        "email": f"TEST_glean_{uuid.uuid4().hex[:10]}@example.com",
        "password": "secret123",
    }


@pytest.fixture(scope="session")
def registered_user(test_user_creds):
    """Register a fresh test user once and yield {token, user, creds}. Cleanup at end."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/register", json=test_user_creds)
    assert r.status_code == 201, f"register failed: {r.status_code} {r.text}"
    login = s.post(f"{API}/auth/login", json=test_user_creds)
    assert login.status_code == 200, f"login failed: {login.text}"
    data = login.json()
    token = data["access_token"]
    user = data["user"]
    yield {"token": token, "user": user, "creds": test_user_creds}
    # cleanup: delete the account (also drops items)
    try:
        s.delete(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
    except Exception:
        pass


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}
