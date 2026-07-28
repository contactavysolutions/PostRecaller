"""Waitlist endpoint tests: POST /api/waitlist, GET /api/waitlist/count."""
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

# Ensure env is loaded even when this file runs standalone
load_dotenv(Path(__file__).parent.parent.parent / "frontend" / ".env")
BASE = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE}/api"


def _fresh_email() -> str:
    return f"TEST_waitlist_{uuid.uuid4().hex[:12]}@example.com"


class TestWaitlist:
    def test_count_endpoint_returns_integer(self, api_client):
        r = api_client.get(f"{API}/waitlist/count")
        assert r.status_code == 200, r.text
        body = r.json()
        assert "count" in body
        assert isinstance(body["count"], int)
        assert body["count"] >= 0

    def test_join_new_email_returns_position_and_increments_count(self, api_client):
        # baseline count
        c0 = api_client.get(f"{API}/waitlist/count").json()["count"]

        email = _fresh_email()
        r = api_client.post(f"{API}/waitlist", json={"email": email, "source": "test"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["already"] is False
        assert body["count"] == c0 + 1
        assert body["position"] == body["count"]  # new join -> at the end of the list

        # GET verifies persistence via count
        c1 = api_client.get(f"{API}/waitlist/count").json()["count"]
        assert c1 == c0 + 1

    def test_join_duplicate_email_is_idempotent(self, api_client):
        email = _fresh_email()

        first = api_client.post(f"{API}/waitlist", json={"email": email}).json()
        assert first["already"] is False
        pos = first["position"]
        count_after_first = first["count"]

        # same email again -> already:true, position unchanged, count unchanged
        second = api_client.post(f"{API}/waitlist", json={"email": email}).json()
        assert second["ok"] is True
        assert second["already"] is True
        assert second["position"] == pos
        assert second["count"] == count_after_first

        # And case-insensitive: uppercase variant should also be a duplicate
        third = api_client.post(f"{API}/waitlist", json={"email": email.upper()}).json()
        assert third["already"] is True
        assert third["position"] == pos
        assert third["count"] == count_after_first

    def test_join_invalid_email_returns_422(self, api_client):
        for bad in ["not-an-email", "foo@", "@bar.com", "no-at-sign.com", ""]:
            r = api_client.post(f"{API}/waitlist", json={"email": bad})
            assert r.status_code == 422, f"Expected 422 for {bad!r}, got {r.status_code}: {r.text}"

    def test_join_missing_email_returns_422(self, api_client):
        r = api_client.post(f"{API}/waitlist", json={})
        assert r.status_code == 422

    def test_source_optional_and_stored_without_error(self, api_client):
        email = _fresh_email()
        # No source field at all should work
        r = api_client.post(f"{API}/waitlist", json={"email": email})
        assert r.status_code == 200
        assert r.json()["already"] is False

    def test_no_mongo_object_id_leak(self, api_client):
        r = api_client.post(f"{API}/waitlist", json={"email": _fresh_email()}).json()
        assert "_id" not in r


class TestRegression:
    """Quick regression: root + auth register still work (existing flows)."""

    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"
