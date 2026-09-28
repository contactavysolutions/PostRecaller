"""PostRecaller — Browser Bookmark Parser & Sanitizer.

Parses standard Netscape bookmark export files (.html) from Chrome, Firefox,
Safari, Edge, and Brave with strict security guardrails (SSRF protection,
HTML sanitization, and size caps).
"""
import ipaddress
import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# Known internal, cloud metadata, or loopback hostnames to strictly reject
BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "169.254.169.254",  # AWS/GCP/Azure instance metadata
    "metadata.google.internal",
    "::1",
}

# Generic browser root folder names that should NOT become user tags
GENERIC_FOLDERS = {
    "bookmarks",
    "bookmarks bar",
    "bookmarks menu",
    "favorites",
    "imported",
    "imported bookmarks",
    "mobile bookmarks",
    "other bookmarks",
    "quick search",
    "unfiled bookmarks",
    "all bookmarks",
}


def is_safe_url(url: str) -> bool:
    """Validate that a URL uses http/https and does not point to internal or cloud metadata endpoints."""
    if not url or not isinstance(url, str):
        return False

    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    # 1. Scheme must be http or https
    if parsed.scheme.lower() not in ("http", "https"):
        return False

    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        return False

    # 2. Block known loopback and metadata names
    if hostname in BLOCKED_HOSTNAMES:
        return False

    if hostname.endswith(".local") or hostname.endswith(".internal") or hostname.endswith(".localhost"):
        return False

    # 3. IP address check for private/loopback/link-local ranges (SSRF defense)
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    except ValueError:
        # Not an IP literal (e.g. 'github.com'); allowed
        pass

    return True


def sanitize_text(text: str, max_length: int = 200) -> str:
    """Strip script/style tags, HTML tags, and normalize whitespace."""
    if not text:
        return ""
    # Strip <script>...</script> and <style>...</style> including content
    cleaned = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # Strip remaining HTML tags
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    # Collapse multiple whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:max_length]


def clean_folder_name(name: Optional[str]) -> Optional[str]:
    """Clean and filter generic browser folder names."""
    if not name:
        return None
    cleaned = sanitize_text(name, max_length=50)
    if not cleaned or cleaned.lower() in GENERIC_FOLDERS:
        return None
    return cleaned


def parse_bookmarks_html(
    html_content: str,
    max_limit: int = 1000,
) -> Dict[str, Any]:
    """Parse Netscape bookmark HTML and return a sanitized list of extracted bookmarks.

    Returns:
        {
            "total_found": int,
            "unique_valid": int,
            "extracted": List[{"url": str, "title": str, "folder": Optional[str]}],
            "limit_applied": bool,
            "limit_max": int,
        }
    """
    soup = BeautifulSoup(html_content, "html.parser")
    bookmarks: List[Dict[str, Any]] = []
    seen_urls = set()
    total_found = 0

    for a in soup.find_all("a"):
        href = (a.get("href") or "").strip()
        if not href:
            continue

        # SSRF and protocol validation
        if not is_safe_url(href):
            continue

        total_found += 1

        # Deduplicate within the file itself
        if href in seen_urls:
            continue
        seen_urls.add(href)

        # Enforce max limit cap guardrail (e.g. 1000)
        if len(bookmarks) >= max_limit:
            continue

        # Extract title
        raw_title = (a.text or "").strip()
        title = sanitize_text(raw_title, max_length=200) or href

        # Extract folder context from parent DL/DT structure
        folder: Optional[str] = None
        parent_dl = a.find_parent("dl")
        if parent_dl:
            prev_h3 = parent_dl.find_previous_sibling("h3")
            if not prev_h3:
                # In standard Netscape files, <DT><H3>Folder</H3> directly precedes <DL>
                prev_dt = parent_dl.find_previous_sibling("dt")
                if prev_dt:
                    prev_h3 = prev_dt.find("h3")

            # Fallback check within same DT
            if not prev_h3:
                parent_dt = a.find_parent("dt")
                if parent_dt:
                    sibling_h3 = parent_dt.find_previous_sibling("h3")
                    if sibling_h3:
                        prev_h3 = sibling_h3

            if prev_h3 and prev_h3.text:
                folder = clean_folder_name(prev_h3.text)

        bookmarks.append({
            "url": href,
            "title": title,
            "folder": folder,
        })

    return {
        "total_found": total_found,
        "unique_valid": len(seen_urls),
        "extracted": bookmarks,
        "limit_applied": total_found > max_limit,
        "limit_max": max_limit,
    }
