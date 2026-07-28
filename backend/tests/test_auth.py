"""Auth flow tests: register, login, /me, delete /me."""
import uuid
import requests


def test_register_and_login(api_client, api_base):
    creds = {
        "email": f"test_auth_{uuid.uuid4().hex[:8]}@example.com",
        "password": "secret123",
    }
    r = api_client.post(f"{api_base}/auth/register", json=creds)
    assert r.status_code == 201, r.text
    user = r.json()
    assert user["email"] == creds["email"].lower()
    assert user.get("ai_limit") == 5
    assert user.get("ai_used_today") == 0

    # duplicate registration -> 400
    dup = api_client.post(f"{api_base}/auth/register", json=creds)
    assert dup.status_code == 400

    # login OK
    li = api_client.post(f"{api_base}/auth/login", json=creds)
    assert li.status_code == 200, li.text
    data = li.json()
    assert "access_token" in data and data["token_type"] == "bearer"
    assert data["user"]["email"] == creds["email"]

    # wrong password -> 401
    bad = api_client.post(
        f"{api_base}/auth/login", json={"email": creds["email"], "password": "wrong"}
    )
    assert bad.status_code == 401

    # /me without token -> 401 (or 403; both are "unauthorized")
    unauth = api_client.get(f"{api_base}/auth/me")
    assert unauth.status_code in (401, 403)

    # /me with token
    me = api_client.get(
        f"{api_base}/auth/me",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert me.status_code == 200
    j = me.json()
    assert j["email"] == creds["email"]
    assert "ai_used_today" in j and "ai_limit" in j

    # DELETE /me -> 204
    d = api_client.delete(
        f"{api_base}/auth/me",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert d.status_code == 204

    # After delete: token should no longer identify user
    me2 = api_client.get(
        f"{api_base}/auth/me",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert me2.status_code == 401
