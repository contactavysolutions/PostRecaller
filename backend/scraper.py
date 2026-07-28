"""Content scraper: 6-stage fallback chain (Phase 1 implements stages 1-4).

Returns a dict of signals collected from the URL:
{platform, title, description, text, image, author, oembed}
Never raises — always returns a dict (possibly mostly empty).
"""
import asyncio
import base64
import time
from urllib.parse import quote, urlparse

import requests
from bs4 import BeautifulSoup

from config import REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)

# Platforms that block datacenter scraping -> skip straight to Jina Reader.
JINA_FIRST = ("instagram.com", "facebook.com", "threads.net", "linkedin.com")

OEMBED_ENDPOINTS = {
    "tiktok.com": "https://www.tiktok.com/oembed?url=",
    "vimeo.com": "https://vimeo.com/api/oembed.json?url=",
    "soundcloud.com": "https://soundcloud.com/oembed?format=json&url=",
    "twitter.com": "https://publish.twitter.com/oembed?url=",
    "x.com": "https://publish.twitter.com/oembed?url=",
}


def detect_platform(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().replace("www.", "")
    mapping = {
        "youtube.com": "youtube",
        "youtu.be": "youtube",
        "instagram.com": "instagram",
        "tiktok.com": "tiktok",
        "twitter.com": "x",
        "x.com": "x",
        "reddit.com": "reddit",
        "linkedin.com": "linkedin",
        "pinterest.com": "pinterest",
        "pin.it": "pinterest",
        "vimeo.com": "vimeo",
        "soundcloud.com": "soundcloud",
        "threads.net": "threads",
        "facebook.com": "facebook",
    }
    for domain, name in mapping.items():
        if host == domain or host.endswith("." + domain):
            return name
    return "web"


def _host(url: str) -> str:
    return (urlparse(url).hostname or "").lower().replace("www.", "")


# ---------- Stage 1: OpenGraph / meta ----------
def _fetch_html(url: str) -> dict:
    out = {}
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=8, allow_redirects=True)
        if r.status_code != 200 or "text/html" not in r.headers.get("content-type", ""):
            return out
        soup = BeautifulSoup(r.text, "lxml")

        def meta(*names):
            for n in names:
                el = soup.find("meta", property=n) or soup.find("meta", attrs={"name": n})
                if el and el.get("content"):
                    return el["content"].strip()
            return None

        out["title"] = meta("og:title", "twitter:title") or (
            soup.title.string.strip() if soup.title and soup.title.string else None
        )
        out["description"] = meta("og:description", "twitter:description", "description")
        out["image"] = meta("og:image", "twitter:image", "twitter:image:src")
        out["author"] = meta("author", "article:author", "og:site_name")
        # plain body text snippet
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = " ".join(soup.get_text(" ").split())
        out["text"] = text[:4000]
    except Exception:
        pass
    return {k: v for k, v in out.items() if v}


# ---------- Stage 2: Reddit OAuth (client_credentials) ----------
def _fetch_reddit(url: str) -> dict:
    if not (REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET):
        return {}
    try:
        auth = base64.b64encode(
            f"{REDDIT_CLIENT_ID}:{REDDIT_CLIENT_SECRET}".encode()
        ).decode()
        tok = requests.post(
            "https://www.reddit.com/api/v1/access_token",
            data={"grant_type": "client_credentials"},
            headers={"Authorization": f"Basic {auth}", "User-Agent": "postrecaller/1.0"},
            timeout=8,
        )
        token = tok.json().get("access_token")
        if not token:
            return {}
        api_url = url.split("?")[0].rstrip("/") + ".json"
        api_url = api_url.replace("www.reddit.com", "oauth.reddit.com").replace(
            "reddit.com", "oauth.reddit.com"
        )
        r = requests.get(
            api_url,
            headers={"Authorization": f"Bearer {token}", "User-Agent": "postrecaller/1.0"},
            timeout=8,
        )
        data = r.json()
        post = data[0]["data"]["children"][0]["data"]
        return {
            "title": post.get("title"),
            "description": post.get("selftext", "")[:2000],
            "text": post.get("selftext", "")[:4000],
            "author": post.get("author"),
            "image": (post.get("thumbnail") if str(post.get("thumbnail", "")).startswith("http") else None),
        }
    except Exception:
        return {}


# ---------- Stage 3: oEmbed ----------
def _fetch_oembed(url: str) -> dict:
    host = _host(url)
    endpoint = None
    for domain, ep in OEMBED_ENDPOINTS.items():
        if host == domain or host.endswith("." + domain):
            endpoint = ep
            break
    if not endpoint:
        return {}
    try:
        r = requests.get(endpoint + quote(url, safe=""), headers={"User-Agent": UA}, timeout=8)
        if r.status_code != 200:
            return {}
        j = r.json()
        return {
            "title": j.get("title"),
            "author": j.get("author_name"),
            "image": j.get("thumbnail_url"),
            "text": BeautifulSoup(j.get("html", ""), "lxml").get_text(" ").strip()[:2000],
        }
    except Exception:
        return {}


# ---------- Stage 4: Jina Reader ----------
def _fetch_jina(url: str) -> dict:
    try:
        r = requests.get(
            "https://r.jina.ai/" + url,
            headers={"User-Agent": UA, "Accept": "text/plain"},
            timeout=15,
        )
        if r.status_code != 200:
            return {}
        text = r.text.strip()
        title = None
        for line in text.splitlines():
            if line.startswith("Title:"):
                title = line.replace("Title:", "").strip()
                break
        return {"title": title, "text": text[:4000]}
    except Exception:
        return {}


def _merge(base: dict, extra: dict) -> dict:
    for k, v in extra.items():
        if v and not base.get(k):
            base[k] = v
    return base


def _scrape_sync(url: str) -> dict:
    platform = detect_platform(url)
    host = _host(url)
    signals = {"platform": platform}

    if any(host == d or host.endswith("." + d) for d in JINA_FIRST):
        _merge(signals, _fetch_jina(url))
        return signals

    if platform == "reddit":
        _merge(signals, _fetch_reddit(url))
        if signals.get("title"):
            return signals

    # oEmbed for supported platforms
    _merge(signals, _fetch_oembed(url))
    # OpenGraph/meta
    _merge(signals, _fetch_html(url))
    # Jina fallback if still thin
    if not signals.get("title") or not (signals.get("description") or signals.get("text")):
        _merge(signals, _fetch_jina(url))
    return signals


async def scrape(url: str) -> dict:
    """Run the (blocking) scrape chain off the event loop."""
    start = time.time()
    signals = await asyncio.to_thread(_scrape_sync, url)
    signals["timing_ms"] = int((time.time() - start) * 1000)
    return signals
