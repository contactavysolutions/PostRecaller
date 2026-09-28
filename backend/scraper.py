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

from config import JINA_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)

# Platforms that block datacenter scraping -> skip straight to Jina Reader.
JINA_FIRST = ("instagram.com", "threads.net", "linkedin.com")

OEMBED_ENDPOINTS = {
    "tiktok.com": "https://www.tiktok.com/oembed?url=",
    "vimeo.com": "https://vimeo.com/api/oembed.json?url=",
    "soundcloud.com": "https://soundcloud.com/oembed?format=json&url=",
    "twitter.com": "https://publish.twitter.com/oembed?url=",
    "x.com": "https://publish.twitter.com/oembed?url=",
}


def detect_platform(url: str) -> str:
    raw = (url or "").strip()
    if not raw.startswith("http://") and not raw.startswith("https://"):
        raw = "https://" + raw
    host = (urlparse(raw).hostname or "").lower().replace("www.", "")
    if host in ("fb.watch", "fb.me") or "facebook." in host or host.endswith(".facebook.com"):
        return "facebook"
    if host == "pin.it" or "pinterest." in host or host.endswith(".pinterest.com"):
        return "pinterest"
    mapping = {
        "youtube.com": "youtube",
        "youtu.be": "youtube",
        "instagram.com": "instagram",
        "tiktok.com": "tiktok",
        "twitter.com": "x",
        "x.com": "x",
        "reddit.com": "reddit",
        "linkedin.com": "linkedin",
        "lnkd.in": "linkedin",
        "vimeo.com": "vimeo",
        "soundcloud.com": "soundcloud",
        "threads.net": "threads",
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

        # Enhance with trafilatura for pristine article text if available
        try:
            import trafilatura
            traf_text = trafilatura.extract(r.text, include_comments=False, include_tables=False)
            if traf_text and len(traf_text.strip()) > 50:
                out["text"] = traf_text[:4000]
            traf_meta = trafilatura.extract_metadata(r.text)
            if traf_meta:
                if not out.get("title") and traf_meta.title:
                    out["title"] = traf_meta.title
                if not out.get("author") and traf_meta.author:
                    out["author"] = traf_meta.author
                if not out.get("description") and traf_meta.description:
                    out["description"] = traf_meta.description
        except Exception:
            pass
    except Exception:
        pass
    return {k: v for k, v in out.items() if v}


# ---------- Stage 2: Reddit OAuth with open oEmbed & Slug Fallback ----------
def _fetch_reddit(url: str) -> dict:
    # 1. Try authenticated OAuth if credentials are configured
    if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET:
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
            if token:
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
            pass

    # 2. Zero-key Fallback: Reddit's public oEmbed API + URL Slug parsing (never blocked)
    out = {}
    try:
        clean_url = url.split("?")[0].rstrip("/")
        parsed = urlparse(clean_url)
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        subreddit = None
        if len(parts) >= 2 and parts[0].lower() == "r":
            subreddit = parts[1]
            out["author"] = f"r/{subreddit}"
        if len(parts) >= 5 and parts[2].lower() == "comments":
            slug = parts[4].replace("_", " ").replace("-", " ")
            if slug:
                out["title"] = slug[:1].upper() + slug[1:]
                out["description"] = f"Reddit discussion in r/{subreddit}: {out['title']}"
                out["text"] = f"Reddit discussion in r/{subreddit}: {out['title']}"

        r = requests.get(f"https://www.reddit.com/oembed?url={clean_url}", timeout=8)
        if r.status_code == 200:
            j = r.json()
            if j.get("title"):
                out["title"] = j.get("title")
            if j.get("author_name"):
                author_str = f"u/{j.get('author_name')}"
                if subreddit:
                    author_str += f" in r/{subreddit}"
                out["author"] = author_str
            if j.get("html"):
                soup = BeautifulSoup(j.get("html"), "lxml")
                embed_text = " ".join(soup.get_text(" ").split())
                if embed_text:
                    out["text"] = embed_text[:2000]
                    if not out.get("description"):
                        out["description"] = embed_text[:500]
    except Exception:
        pass
    return {k: v for k, v in out.items() if v}


# ---------- Stage 2b: X / Twitter via FxTwitter ----------
def _fetch_twitter(url: str) -> dict:
    try:
        parsed = urlparse(url)
        path = parsed.path.strip("/")
        if "status" not in path:
            return {}
        api_url = f"https://api.fxtwitter.com/{path}"
        r = requests.get(api_url, headers={"User-Agent": "postrecaller/1.0"}, timeout=8)
        if r.status_code != 200:
            return {}
        tweet = r.json().get("tweet", {})
        text = tweet.get("text", "")
        author = tweet.get("author", {}).get("name") or tweet.get("author", {}).get("screen_name")
        media = tweet.get("media", {})
        photos = media.get("photos", []) if isinstance(media, dict) else []
        image = photos[0].get("url") if photos else None
        return {
            "title": f"Post by {author}: {text[:80]}" if author else text[:90],
            "description": text[:500],
            "text": text[:3000],
            "author": author,
            "image": image,
        }
    except Exception:
        return {}


# ---------- Stage 2c: Facebook OpenGraph Crawler ----------
def _fetch_facebook(url: str) -> dict:
    """Fetch Facebook metadata using Facebook/Twitter crawler User-Agents to bypass 400 Bad Request and CAPTCHA walls on share/reel links."""
    out = {}
    uas = [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Twitterbot/1.0",
        UA,
    ]
    for ua in uas:
        try:
            r = requests.get(
                url,
                headers={"User-Agent": ua, "Accept-Language": "en-US,en;q=0.9"},
                timeout=8,
                allow_redirects=True,
            )
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.text, "lxml")

            def meta(*names):
                for n in names:
                    el = soup.find("meta", property=n) or soup.find("meta", attrs={"name": n})
                    if el and el.get("content"):
                        return el["content"].strip()
                return None

            raw_title = meta("og:title", "twitter:title")
            if not raw_title and soup.title and soup.title.string:
                candidate = soup.title.string.strip()
                if candidate.lower() not in ("facebook", "log in to facebook", "log into facebook"):
                    raw_title = candidate

            desc = meta("og:description", "twitter:description", "description")
            image = meta("og:image", "twitter:image")

            author = None
            title = raw_title
            if raw_title and " | " in raw_title:
                parts = [p.strip() for p in raw_title.split(" | ")]
                if len(parts) >= 2:
                    author = parts[-1]
                    content_parts = [p for p in parts[:-1] if "views" not in p.lower() and "reactions" not in p.lower()]
                    if content_parts:
                        title = " | ".join(content_parts)
                    else:
                        title = parts[0]

            if title:
                out["title"] = title
            if desc:
                out["description"] = desc
                out["text"] = desc[:4000]
            if image:
                out["image"] = image
            if author:
                out["author"] = author

            if out.get("title") and (out.get("description") or out.get("image")):
                break
        except Exception:
            continue

    return {k: v for k, v in out.items() if v}



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
        headers = {"User-Agent": UA, "Accept": "text/plain"}
        if JINA_API_KEY:
            headers["Authorization"] = f"Bearer {JINA_API_KEY}"
        r = requests.get(
            "https://r.jina.ai/" + url,
            headers=headers,
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


# ---------- Stage 5: Crawl4AI (Optional local headless fallback) ----------
def _fetch_crawl4ai_sync(url: str) -> dict:
    """Optional local Playwright-based crawler. Only activates if crawl4ai is installed."""
    try:
        from crawl4ai import WebCrawler
        crawler = WebCrawler()
        crawler.warmup()
        result = crawler.run(url=url)
        if result and result.markdown:
            title = None
            if hasattr(result, "metadata") and isinstance(result.metadata, dict):
                title = result.metadata.get("title")
            return {
                "title": title,
                "text": result.markdown[:4000],
            }
    except Exception:
        pass
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
        if not signals.get("title") or not (signals.get("description") or signals.get("text")):
            _merge(signals, _fetch_crawl4ai_sync(url))
        return signals

    if platform == "reddit":
        _merge(signals, _fetch_reddit(url))
        if signals.get("title"):
            return signals

    if platform == "x":
        _merge(signals, _fetch_twitter(url))
        if signals.get("title"):
            return signals

    if platform == "facebook":
        _merge(signals, _fetch_facebook(url))
        if signals.get("title"):
            return signals

    # oEmbed for supported platforms
    _merge(signals, _fetch_oembed(url))
    # OpenGraph/meta
    _merge(signals, _fetch_html(url))
    # Jina fallback if still thin
    if not signals.get("title") or not (signals.get("description") or signals.get("text")):
        _merge(signals, _fetch_jina(url))
    # Optional Crawl4AI fallback if still thin
    if not signals.get("title") or not (signals.get("description") or signals.get("text")):
        _merge(signals, _fetch_crawl4ai_sync(url))
    return signals


async def scrape(url: str) -> dict:
    """Run the (blocking) scrape chain off the event loop."""
    start = time.time()
    signals = await asyncio.to_thread(_scrape_sync, url)
    signals["timing_ms"] = int((time.time() - start) * 1000)
    return signals
