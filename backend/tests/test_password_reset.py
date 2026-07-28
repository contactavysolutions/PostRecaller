"""Tests for welcome email + forgot/reset-password flows (6-digit code)."""
import re
import subprocess
import time
import uuid

import requests


LOG_PATH = "/var/log/supervisor/backend.err.log"


def _tail_logs(lines: int = 400) -> str:
    """Read last N lines of backend logs (out + err)."""
    out = ""
    for p in ("/var/log/supervisor/backend.err.log", "/var/log/supervisor/backend.out.log"):
        try:
            r = subprocess.run(
                ["tail", "-n", str(lines), p], capture_output=True, text=True, timeout=5
            )
            out += r.stdout + "\n"
        except Exception:
            pass
    return out


def _extract_code(email: str, logs: str) -> str | None:
    # Format from mailer.py: "Password reset code for <email>: <code>"
    m = re.findall(
        rf"Password reset code for {re.escape(email)}:\s*(\d{{6}})", logs
    )
    return m[-1] if m else None


# ---------- Welcome email (fire-and-forget, must not block/fail registration) ----------
def test_register_triggers_welcome_email_without_blocking(api_client, api_base):
    creds = {
        "email": f"test_welcome_{uuid.uuid4().hex[:8]}@example.com",
        "password": "secret123",
    }
    t0 = time.time()
    r = api_client.post(f"{api_base}/auth/register", json=creds)
    elapsed = time.time() - t0
    assert r.status_code == 201, r.text
    # Fire-and-forget: response should be quick even though email path runs.
    assert elapsed < 5.0, f"Register took too long ({elapsed:.2f}s) — welcome email is blocking"

    # cleanup
    li = api_client.post(f"{api_base}/auth/login", json=creds)
    if li.status_code == 200:
        api_client.delete(
            f"{api_base}/auth/me",
            headers={"Authorization": f"Bearer {li.json()['access_token']}"},
        )


# ---------- Forgot password ----------
def test_forgot_password_registered_email_generates_code(api_client, api_base):
    creds = {
        "email": f"test_forgot_{uuid.uuid4().hex[:8]}@example.com",
        "password": "secret123",
    }
    r = api_client.post(f"{api_base}/auth/register", json=creds)
    assert r.status_code == 201

    fr = api_client.post(
        f"{api_base}/auth/forgot-password", json={"email": creds["email"]}
    )
    assert fr.status_code == 200, fr.text
    assert fr.json() == {"ok": True}

    time.sleep(1.0)  # let the fire-and-forget log flush
    logs = _tail_logs(600)
    code = _extract_code(creds["email"].lower(), logs)
    assert code is not None, "Reset code not found in backend logs"
    assert len(code) == 6 and code.isdigit()

    # cleanup
    li = api_client.post(f"{api_base}/auth/login", json=creds)
    if li.status_code == 200:
        api_client.delete(
            f"{api_base}/auth/me",
            headers={"Authorization": f"Bearer {li.json()['access_token']}"},
        )


def test_forgot_password_unregistered_email_returns_ok_and_no_code(api_client, api_base):
    bogus = f"never_registered_{uuid.uuid4().hex[:10]}@example.com"
    fr = api_client.post(f"{api_base}/auth/forgot-password", json={"email": bogus})
    assert fr.status_code == 200
    assert fr.json() == {"ok": True}
    time.sleep(0.5)
    logs = _tail_logs(400)
    assert _extract_code(bogus, logs) is None, "Unregistered email should not generate a code"


# ---------- Reset password happy path + validation ----------
def test_reset_password_success_then_login_with_new_password(api_client, api_base):
    creds = {
        "email": f"test_reset_ok_{uuid.uuid4().hex[:8]}@example.com",
        "password": "secret123",
    }
    r = api_client.post(f"{api_base}/auth/register", json=creds)
    assert r.status_code == 201

    fr = api_client.post(
        f"{api_base}/auth/forgot-password", json={"email": creds["email"]}
    )
    assert fr.status_code == 200
    time.sleep(1.0)
    code = _extract_code(creds["email"].lower(), _tail_logs(600))
    assert code, "No reset code in logs"

    new_password = "brandnew456"
    rr = api_client.post(
        f"{api_base}/auth/reset-password",
        json={"email": creds["email"], "code": code, "new_password": new_password},
    )
    assert rr.status_code == 200, rr.text
    assert rr.json() == {"ok": True}

    # Login with NEW password works
    li = api_client.post(
        f"{api_base}/auth/login", json={"email": creds["email"], "password": new_password}
    )
    assert li.status_code == 200, li.text

    # Login with OLD password fails
    bad = api_client.post(f"{api_base}/auth/login", json=creds)
    assert bad.status_code == 401

    # cleanup
    api_client.delete(
        f"{api_base}/auth/me",
        headers={"Authorization": f"Bearer {li.json()['access_token']}"},
    )


def test_reset_password_wrong_code_400_then_429_after_5(api_client, api_base):
    creds = {
        "email": f"test_reset_bad_{uuid.uuid4().hex[:8]}@example.com",
        "password": "secret123",
    }
    r = api_client.post(f"{api_base}/auth/register", json=creds)
    assert r.status_code == 201
    fr = api_client.post(
        f"{api_base}/auth/forgot-password", json={"email": creds["email"]}
    )
    assert fr.status_code == 200

    # first 5 wrong attempts -> 400 (Invalid or expired code).
    # Backend logic: gate at attempts >= 5 THEN compare; increment on mismatch.
    # So attempts 1..5 return 400 (attempts becomes 1..5), attempt 6 returns 429.
    bad_body = {"email": creds["email"], "code": "000000", "new_password": "secret999"}
    for i in range(5):
        resp = api_client.post(f"{api_base}/auth/reset-password", json=bad_body)
        assert resp.status_code == 400, f"Attempt {i+1}: expected 400, got {resp.status_code} {resp.text}"
        assert "Invalid" in resp.json().get("detail", "")

    resp6 = api_client.post(f"{api_base}/auth/reset-password", json=bad_body)
    assert resp6.status_code == 429, f"6th attempt should be 429, got {resp6.status_code} {resp6.text}"

    # cleanup — login with original password still works
    li = api_client.post(f"{api_base}/auth/login", json=creds)
    if li.status_code == 200:
        api_client.delete(
            f"{api_base}/auth/me",
            headers={"Authorization": f"Bearer {li.json()['access_token']}"},
        )


def test_reset_password_validation_422(api_client, api_base):
    email = f"test_reset_val_{uuid.uuid4().hex[:8]}@example.com"

    # code too short
    r1 = api_client.post(
        f"{api_base}/auth/reset-password",
        json={"email": email, "code": "123", "new_password": "abcdef"},
    )
    assert r1.status_code == 422

    # code too long
    r2 = api_client.post(
        f"{api_base}/auth/reset-password",
        json={"email": email, "code": "1234567", "new_password": "abcdef"},
    )
    assert r2.status_code == 422

    # password too short
    r3 = api_client.post(
        f"{api_base}/auth/reset-password",
        json={"email": email, "code": "123456", "new_password": "abc"},
    )
    assert r3.status_code == 422
