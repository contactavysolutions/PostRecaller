"""Health check test."""
import requests


def test_root_ok(api_base):
    r = requests.get(f"{api_base}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("service") == "postrecaller"
    assert data.get("status") == "ok"
