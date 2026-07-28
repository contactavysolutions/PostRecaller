"""Item CRUD, enrichment, pagination, collections."""
import time
import requests

INTENTS = ["Read Later", "Try Recipe", "Watch", "Shop", "Learn"]


def _post_item(api_base, headers, url, retries=1):
    """POST /items with retry to smooth over transient LLM/scrape flakiness."""
    for attempt in range(retries + 1):
        r = requests.post(f"{api_base}/items", json={"url": url}, headers=headers, timeout=90)
        if r.status_code == 200:
            return r
        if attempt < retries:
            time.sleep(2)
    return r


def test_create_youtube_item_enriched(api_base, auth_headers):
    r = _post_item(api_base, auth_headers, "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["duplicate"] is False
    item = body["item"]
    assert item["platform"] == "youtube"
    assert item["enrichment_status"] == "enriched", f"status={item['enrichment_status']}"
    assert item["title"] and len(item["title"]) > 0
    assert item["summary"] and len(item["summary"]) > 0
    assert isinstance(item["tags"], list) and len(item["tags"]) >= 1
    assert item["intent"] in INTENTS
    # ensure MongoDB _id not leaked
    assert "_id" not in item
    assert item["id"]


def test_create_article_and_duplicate(api_base, auth_headers):
    url = "https://en.wikipedia.org/wiki/Python_(programming_language)"
    r1 = _post_item(api_base, auth_headers, url)
    assert r1.status_code == 200, r1.text
    j1 = r1.json()
    assert j1["duplicate"] is False
    item1 = j1["item"]
    assert item1["platform"] == "web"
    assert item1["enrichment_status"] in ("enriched", "manual")

    # duplicate
    r2 = _post_item(api_base, auth_headers, url)
    assert r2.status_code == 200
    j2 = r2.json()
    assert j2["duplicate"] is True
    assert j2["item"]["id"] == item1["id"]


def test_list_get_update_delete(api_base, auth_headers):
    # list current items
    lst = requests.get(f"{api_base}/items?limit=10", headers=auth_headers)
    assert lst.status_code == 200
    data = lst.json()
    assert "items" in data and "has_more" in data and "next_cursor" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) >= 1
    item = data["items"][0]
    iid = item["id"]

    # GET by id
    g = requests.get(f"{api_base}/items/{iid}", headers=auth_headers)
    assert g.status_code == 200
    assert g.json()["id"] == iid

    # PATCH tags + intent + title
    patch = requests.patch(
        f"{api_base}/items/{iid}",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"tags": ["TEST_tag", "  Another  "], "intent": "Watch", "title": "TEST title"},
    )
    assert patch.status_code == 200, patch.text
    p = patch.json()
    assert p["title"] == "TEST title"
    assert p["intent"] == "Watch"
    assert "test_tag" in p["tags"] and "another" in p["tags"]

    # invalid intent
    bad = requests.patch(
        f"{api_base}/items/{iid}",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"intent": "NotAThing"},
    )
    assert bad.status_code == 400

    # tag/intent filter
    tag_filter = requests.get(f"{api_base}/items?tag=test_tag", headers=auth_headers)
    assert tag_filter.status_code == 200
    assert any(x["id"] == iid for x in tag_filter.json()["items"])

    intent_filter = requests.get(f"{api_base}/items?intent=Watch", headers=auth_headers)
    assert intent_filter.status_code == 200
    assert any(x["id"] == iid for x in intent_filter.json()["items"])

    # DELETE + verify 404
    d = requests.delete(f"{api_base}/items/{iid}", headers=auth_headers)
    assert d.status_code == 204
    gone = requests.get(f"{api_base}/items/{iid}", headers=auth_headers)
    assert gone.status_code == 404


def test_collections_shape(api_base, auth_headers):
    r = requests.get(f"{api_base}/collections", headers=auth_headers)
    assert r.status_code == 200
    j = r.json()
    assert "collections" in j
    intents_seen = [c["intent"] for c in j["collections"]]
    assert intents_seen == INTENTS, f"expected 5 intents in order, got {intents_seen}"
    for c in j["collections"]:
        assert isinstance(c["count"], int)


def test_retry_enrich(api_base, auth_headers):
    # Create a fresh item first, then retry enrich
    url = "https://example.com/"
    r = _post_item(api_base, auth_headers, url)
    assert r.status_code == 200, r.text
    item = r.json()["item"]
    iid = item["id"]
    retry = requests.post(f"{api_base}/items/{iid}/enrich", headers=auth_headers, timeout=90)
    # 200 on success, 422 if enrichment truly failed (acceptable but must be handled cleanly)
    assert retry.status_code in (200, 422), retry.text
    if retry.status_code == 200:
        j = retry.json()
        assert j["enrichment_status"] == "enriched"


def test_items_require_auth(api_base):
    r = requests.get("{}/items".format(api_base))
    assert r.status_code in (401, 403)
