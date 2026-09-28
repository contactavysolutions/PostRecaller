"""PostRecaller — Universal Social Media & Bookmark Archive Parser.

Auto-detects and extracts saved content from official data exports across:
- Instagram (saved_posts.json, saved_collections.json)
- TikTok (user_data.json -> FavoriteVideoList)
- YouTube (watch-history.json, playlists/*.csv, playlists/*.json)
- Reddit (saved_posts.csv, saved_comments.csv)
- Twitter / X (bookmarks.js, like.js)
- Pinterest (pins.csv, boards/*.csv)
- Browser Bookmarks (Chrome, Firefox, Safari, Edge Netscape HTML)
- Universal fallback: Generic CSV, JSON, TXT files, and in-memory ZIP archives.

Security & Integrity:
- Zip-bomb safeguards: max uncompressed size cap (50MB), max file count cap (200).
- Path traversal protection (rejection of '..' and absolute paths).
- SSRF filtering on all extracted URLs (blocks loopback, private ranges, metadata).
- URL sanitization & tracking parameter cleaner (?igsh=, ?si=, ?utm_*, ?s=, etc.).
- String sanitization & HTML stripping on titles, captions, and tag names.
"""

import csv
import io
import json
import logging
import re
import zipfile
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from bookmark_parser import clean_folder_name, is_safe_url, parse_bookmarks_html, sanitize_text

logger = logging.getLogger(__name__)

# Security & processing caps
MAX_ARCHIVE_SIZE_BYTES = 25 * 1024 * 1024       # 25 MB max compressed upload
MAX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024       # 50 MB max uncompressed zip safety cap
MAX_ARCHIVE_FILES = 200                         # Max files inspected inside zip
MAX_EXTRACTED_ITEMS = 2000                      # Cap on items per single import batch

# Query params to strip for clean deduplication
TRACKING_PARAMS = {
    "igsh", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "si", "feature", "fbclid", "gclid", "msclkid", "ref", "ref_src", "s", "t",
    "is_from_webapp", "sender_device", "share_app_id", "source", "share_id",
}


def clean_url(url: str) -> str:
    """Strip marketing/tracking query parameters from URL while preserving functional queries."""
    if not url or not isinstance(url, str):
        return ""
    url = url.strip()
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return url

        # Parse query params and remove tracking noise
        query_dict = parse_qs(parsed.query, keep_blank_values=True)
        cleaned_query = {
            k: v for k, v in query_dict.items()
            if k.lower() not in TRACKING_PARAMS and not k.lower().startswith("utm_")
        }
        
        # Flatten query back into string
        query_str = urlencode(cleaned_query, doseq=True)
        cleaned = urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            parsed.path,
            parsed.params,
            query_str,
            ""  # Strip fragment tracking hashes
        ))
        # Ensure trailing slash normalization for root or canonical paths where appropriate
        return cleaned.rstrip("/") if parsed.path not in ("", "/") else cleaned
    except Exception:
        return url


def detect_platform_from_url(url: str) -> str:
    """Identify the platform from the domain name."""
    u = url.lower()
    if "instagram.com" in u or "instagr.am" in u:
        return "instagram"
    if "tiktok.com" in u:
        return "tiktok"
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    if "reddit.com" in u or "redd.it" in u:
        return "reddit"
    if "twitter.com" in u or "x.com" in u:
        return "x"
    if "pinterest.com" in u or "pin.it" in u:
        return "pinterest"
    if "linkedin.com" in u:
        return "linkedin"
    if "github.com" in u:
        return "github"
    return "web"


class UniversalArchiveParser:
    """Universal parser for social media archives, data dumps, and bookmark exports."""

    @classmethod
    def parse_archive(
        cls,
        file_bytes: bytes,
        filename: str = "",
        max_limit: int = MAX_EXTRACTED_ITEMS,
    ) -> Dict[str, Any]:
        """Auto-detect format (ZIP, JSON, CSV, HTML, TXT) and return sanitized extracted items.
        
        Returns:
            {
                "platform": "instagram" | "tiktok" | "youtube" | "reddit" | "x" | "pinterest" | "browser" | "universal",
                "platform_display": "Instagram" | ...
                "total_found": int,
                "unique_valid": int,
                "extracted": List[{"url": str, "title": str, "tags": List[str], "platform": str, "saved_at": Optional[str]}],
                "limit_applied": bool,
                "limit_max": int,
                "source_files": List[str],
            }
        """
        filename_lower = filename.lower()

        # 1. Check if input is a ZIP archive (by magic bytes or extension)
        if file_bytes.startswith(b"PK\x03\x04") or filename_lower.endswith(".zip"):
            return cls._parse_zip(file_bytes, max_limit)

        # 2. Check if Netscape HTML bookmarks
        content_sample = file_bytes[:1024].decode("utf-8", errors="replace").lower()
        if (
            filename_lower.endswith((".html", ".htm"))
            or "<!doctype netscape-bookmark-file-1>" in content_sample
            or "<dl><p>" in content_sample
            or "<dt><a href=" in content_sample
        ):
            return cls._parse_html(file_bytes, max_limit)

        # 3. Check if JSON or Twitter JS
        if filename_lower.endswith(".js") or content_sample.strip().startswith("window.ytd."):
            return cls._parse_twitter_js(file_bytes, max_limit)

        if filename_lower.endswith(".json") or content_sample.strip().startswith(("{", "[")):
            return cls._parse_json(file_bytes, filename, max_limit)

        # 4. Check if CSV
        if filename_lower.endswith(".csv") or ("," in content_sample and "\n" in content_sample):
            return cls._parse_csv(file_bytes, filename, max_limit)

        # 5. Fallback to raw text extraction (URL line by line)
        return cls._parse_text(file_bytes, max_limit)

    @classmethod
    def _parse_zip(cls, file_bytes: bytes, max_limit: int) -> Dict[str, Any]:
        """Extract and parse supported export files inside a zip archive safely."""
        all_items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        detected_platforms: Set[str] = set()
        source_files: List[str] = []
        total_found = 0
        total_uncompressed = 0

        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
                infolist = zf.infolist()
                if len(infolist) > MAX_ARCHIVE_FILES:
                    logger.warning("Zip file contains %d files (exceeds cap %d)", len(infolist), MAX_ARCHIVE_FILES)
                    infolist = infolist[:MAX_ARCHIVE_FILES]

                for info in infolist:
                    # Zip-slip defense: reject absolute or directory-traversing paths
                    if info.filename.startswith(("/", "\\")) or ".." in info.filename:
                        continue
                    if info.is_dir():
                        continue

                    total_uncompressed += info.file_size
                    if total_uncompressed > MAX_UNCOMPRESSED_BYTES:
                        logger.warning("Zip archive uncompressed size exceeded %d bytes safe limit", MAX_UNCOMPRESSED_BYTES)
                        break

                    fname = info.filename.lower()
                    
                    # Target known social archive files
                    is_target = (
                        "saved_posts.json" in fname
                        or "saved_collections.json" in fname
                        or "user_data.json" in fname
                        or "watch-history.json" in fname
                        or "saved_posts.csv" in fname
                        or "saved_comments.csv" in fname
                        or "bookmarks.js" in fname
                        or "pins.csv" in fname
                        or fname.endswith(".html")
                        or (fname.endswith(".csv") and ("playlist" in fname or "pin" in fname or "save" in fname))
                    )

                    # If no known target yet, also allow general .json or .csv in zip if under 5MB
                    if not is_target and (fname.endswith(".json") or fname.endswith(".csv")) and info.file_size < 5 * 1024 * 1024:
                        is_target = True

                    if not is_target:
                        continue

                    try:
                        inner_bytes = zf.read(info)
                        sub_res = cls.parse_archive(inner_bytes, filename=info.filename, max_limit=max_limit)
                        if sub_res and sub_res["extracted"]:
                            source_files.append(info.filename)
                            detected_platforms.add(sub_res["platform"])
                            total_found += sub_res["total_found"]

                            for it in sub_res["extracted"]:
                                u = it["url"]
                                if u not in seen_urls and len(all_items) < max_limit:
                                    seen_urls.add(u)
                                    all_items.append(it)
                    except Exception as e:
                        logger.warning("Error reading file '%s' in zip: %s", info.filename, e)

        except zipfile.BadZipFile as e:
            logger.error("Failed to read zip archive: %s", e)
            return cls._empty_result("invalid_zip")

        # Determine primary platform
        primary_platform = "universal"
        if len(detected_platforms) == 1:
            primary_platform = list(detected_platforms)[0]
        elif len(detected_platforms) > 1:
            # Prefer known social platform over generic
            for p in ["instagram", "tiktok", "youtube", "reddit", "x", "pinterest"]:
                if p in detected_platforms:
                    primary_platform = p
                    break

        return {
            "platform": primary_platform,
            "platform_display": primary_platform.capitalize() if primary_platform != "x" else "Twitter / X",
            "total_found": total_found,
            "unique_valid": len(all_items),
            "extracted": all_items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": source_files,
        }

    @classmethod
    def _parse_html(cls, file_bytes: bytes, max_limit: int) -> Dict[str, Any]:
        """Parse standard Netscape HTML bookmarks."""
        try:
            html_text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            html_text = file_bytes.decode("iso-8859-1", errors="replace")

        res = parse_bookmarks_html(html_text, max_limit=max_limit)
        items = []
        for b in res["extracted"]:
            u = clean_url(b["url"])
            if not is_safe_url(u):
                continue
            tags = []
            if b.get("folder"):
                tags.append(b["folder"])
            p = detect_platform_from_url(u)
            if p != "web" and p not in [t.lower() for t in tags]:
                tags.append(p)
            items.append({
                "url": u,
                "title": b["title"],
                "tags": tags,
                "platform": p,
                "saved_at": None,
            })

        return {
            "platform": "browser",
            "platform_display": "Browser Bookmarks",
            "total_found": res["total_found"],
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": res["limit_applied"],
            "limit_max": max_limit,
            "source_files": ["bookmarks.html"],
        }

    @classmethod
    def _parse_json(cls, file_bytes: bytes, filename: str, max_limit: int) -> Dict[str, Any]:
        """Auto-detect Instagram, TikTok, YouTube, or generic JSON schema."""
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("iso-8859-1", errors="replace")

        try:
            data = json.loads(text)
        except Exception as e:
            logger.warning("JSON decode failed: %s", e)
            return cls._empty_result("invalid_json")

        # 1. Instagram: saved_posts.json or saved_collections.json
        if isinstance(data, dict) and ("saved_saved_media" in data or "saved_collections" in data):
            return cls._extract_instagram_json(data, max_limit)
        
        # Instagram alternative list root
        if isinstance(data, list) and data and isinstance(data[0], dict) and ("string_map_data" in data[0] or "saved_saved_media" in data[0]):
            return cls._extract_instagram_json({"saved_saved_media": data}, max_limit)

        # 2. TikTok: user_data.json
        if isinstance(data, dict) and ("Activity" in data or "Favorite Videos" in data or "FavoriteVideoList" in data):
            return cls._extract_tiktok_json(data, max_limit)

        # 3. YouTube: watch-history.json
        if isinstance(data, list) and data and isinstance(data[0], dict) and ("header" in data[0] or "titleUrl" in data[0]):
            return cls._extract_youtube_json(data, max_limit)

        # 4. Generic / Universal JSON fallback
        return cls._extract_generic_json(data, max_limit)

    @classmethod
    def _extract_instagram_json(cls, data: dict, max_limit: int) -> Dict[str, Any]:
        """Extract saves from Instagram JSON download."""
        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        # Case A: saved_saved_media list
        raw_list = data.get("saved_saved_media") or []
        for entry in raw_list:
            if not isinstance(entry, dict):
                continue
            total_found += 1
            title = sanitize_text(entry.get("title", ""), max_length=150)
            
            # String map data contains the href and timestamp
            smd = entry.get("string_map_data") or {}
            saved_on = smd.get("Saved on") or {}
            href = saved_on.get("href") or entry.get("href")
            
            # If href not found in Saved on, check any key in string_map_data
            if not href and isinstance(smd, dict):
                for val in smd.values():
                    if isinstance(val, dict) and val.get("href"):
                        href = val.get("href")
                        break

            if not href or not is_safe_url(href):
                continue

            cleaned_u = clean_url(href)
            if cleaned_u in seen_urls:
                continue
            seen_urls.add(cleaned_u)

            if len(items) < max_limit:
                items.append({
                    "url": cleaned_u,
                    "title": title or "Instagram Post",
                    "tags": ["instagram", "saved"],
                    "platform": "instagram",
                    "saved_at": saved_on.get("timestamp"),
                })

        # Case B: saved_collections list
        collections = data.get("saved_collections") or []
        for coll in collections:
            coll_title = sanitize_text(coll.get("title", ""), max_length=50) or "Collection"
            coll_media = coll.get("saved_media") or []
            for entry in coll_media:
                if not isinstance(entry, dict):
                    continue
                total_found += 1
                smd = entry.get("string_map_data") or {}
                href = None
                for val in smd.values():
                    if isinstance(val, dict) and val.get("href"):
                        href = val.get("href")
                        break
                if not href:
                    href = entry.get("href")

                if not href or not is_safe_url(href):
                    continue

                cleaned_u = clean_url(href)
                if cleaned_u in seen_urls:
                    continue
                seen_urls.add(cleaned_u)

                if len(items) < max_limit:
                    items.append({
                        "url": cleaned_u,
                        "title": sanitize_text(entry.get("title", ""), max_length=150) or f"Instagram ({coll_title})",
                        "tags": ["instagram", coll_title.lower()],
                        "platform": "instagram",
                        "saved_at": None,
                    })

        return {
            "platform": "instagram",
            "platform_display": "Instagram",
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": ["saved_posts.json"],
        }

    @classmethod
    def _extract_tiktok_json(cls, data: dict, max_limit: int) -> Dict[str, Any]:
        """Extract saved/favorite videos from TikTok user_data.json."""
        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        # TikTok structure: Activity -> Favorite Videos -> FavoriteVideoList
        fav_list = []
        activity = data.get("Activity") or data
        fav_videos = activity.get("Favorite Videos") or {}
        if isinstance(fav_videos, dict):
            fav_list = fav_videos.get("FavoriteVideoList") or []
        elif isinstance(activity.get("FavoriteVideoList"), list):
            fav_list = activity["FavoriteVideoList"]

        for fav in fav_list:
            if not isinstance(fav, dict):
                continue
            total_found += 1
            raw_url = fav.get("Link") or fav.get("link") or fav.get("url")
            if not raw_url or not is_safe_url(raw_url):
                continue

            cleaned_u = clean_url(raw_url)
            if cleaned_u in seen_urls:
                continue
            seen_urls.add(cleaned_u)

            if len(items) < max_limit:
                date_str = fav.get("Date") or fav.get("date")
                items.append({
                    "url": cleaned_u,
                    "title": "TikTok Video",
                    "tags": ["tiktok", "favorite"],
                    "platform": "tiktok",
                    "saved_at": date_str,
                })

        return {
            "platform": "tiktok",
            "platform_display": "TikTok",
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": ["user_data.json"],
        }

    @classmethod
    def _extract_youtube_json(cls, data: list, max_limit: int) -> Dict[str, Any]:
        """Extract videos from Google Takeout watch-history.json or playlist JSON."""
        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        for entry in data:
            if not isinstance(entry, dict):
                continue
            title_url = entry.get("titleUrl") or entry.get("url")
            if not title_url or not is_safe_url(title_url):
                continue

            total_found += 1
            cleaned_u = clean_url(title_url)
            if cleaned_u in seen_urls:
                continue
            seen_urls.add(cleaned_u)

            if len(items) < max_limit:
                raw_title = entry.get("title", "")
                if raw_title.startswith("Watched "):
                    raw_title = raw_title[8:]
                title = sanitize_text(raw_title, max_length=150) or "YouTube Video"

                tags = ["youtube"]
                subtitles = entry.get("subtitles") or []
                if subtitles and isinstance(subtitles, list) and isinstance(subtitles[0], dict):
                    channel = sanitize_text(subtitles[0].get("name", ""), max_length=50)
                    if channel:
                        tags.append(channel.lower())

                items.append({
                    "url": cleaned_u,
                    "title": title,
                    "tags": tags,
                    "platform": "youtube",
                    "saved_at": entry.get("time"),
                })

        return {
            "platform": "youtube",
            "platform_display": "YouTube",
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": ["watch-history.json"],
        }

    @classmethod
    def _parse_twitter_js(cls, file_bytes: bytes, max_limit: int) -> Dict[str, Any]:
        """Parse Twitter archive bookmarks.js or like.js."""
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("iso-8859-1", errors="replace")

        # Twitter archives wrap JSON in: window.YTD.bookmarks.part0 = [ ... ];
        eq_idx = text.find("=")
        if eq_idx != -1:
            json_text = text[eq_idx + 1:].strip()
            if json_text.endswith(";"):
                json_text = json_text[:-1].strip()
        else:
            json_text = text.strip()

        try:
            data = json.loads(json_text)
        except Exception as e:
            logger.warning("Twitter JS parse error: %s", e)
            return cls._empty_result("invalid_twitter_archive")

        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        if isinstance(data, list):
            for entry in data:
                b_info = entry.get("bookmark") or entry.get("like") or entry
                tweet_id = b_info.get("tweetId") or b_info.get("id")
                expanded_url = b_info.get("expandedUrl") or b_info.get("url")

                target_url = expanded_url or (f"https://x.com/i/web/status/{tweet_id}" if tweet_id else None)
                if not target_url or not is_safe_url(target_url):
                    continue

                total_found += 1
                cleaned_u = clean_url(target_url)
                if cleaned_u in seen_urls:
                    continue
                seen_urls.add(cleaned_u)

                if len(items) < max_limit:
                    items.append({
                        "url": cleaned_u,
                        "title": sanitize_text(b_info.get("fullText", ""), max_length=150) or "Post on X",
                        "tags": ["x", "bookmark"],
                        "platform": "x",
                        "saved_at": b_info.get("createdAt"),
                    })

        return {
            "platform": "x",
            "platform_display": "Twitter / X",
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": ["bookmarks.js"],
        }

    @classmethod
    def _parse_csv(cls, file_bytes: bytes, filename: str, max_limit: int) -> Dict[str, Any]:
        """Parse Reddit saved_posts.csv, Pinterest pins.csv, YouTube playlist.csv, or generic CSV."""
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("iso-8859-1", errors="replace")

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            return cls._empty_result("invalid_csv")

        # Map lowercased headers
        field_map = {f.lower().strip(): f for f in reader.fieldnames}
        
        # Check Reddit signature (has permalink & subreddit)
        is_reddit = "permalink" in field_map or "subreddit" in field_map
        # Check Pinterest signature (has board or pin id)
        is_pinterest = "board" in field_map or "board name" in field_map or "pin id" in field_map

        platform = "reddit" if is_reddit else ("pinterest" if is_pinterest else "universal")
        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        # Locate URL column
        url_col = None
        for candidate in ["permalink", "link", "url", "href", "video url", "website", "uri"]:
            if candidate in field_map:
                url_col = field_map[candidate]
                break

        if not url_col:
            return cls._empty_result("no_url_column")

        # Locate Title column
        title_col = None
        for candidate in ["title", "video title", "pin title", "name", "body", "note", "caption", "description"]:
            if candidate in field_map:
                title_col = field_map[candidate]
                break

        # Locate Tag / Folder / Category / Board column
        tag_col = None
        for candidate in ["subreddit", "board", "board name", "playlist title", "folder", "category", "tags"]:
            if candidate in field_map:
                tag_col = field_map[candidate]
                break

        for row in reader:
            raw_url = (row.get(url_col) or "").strip()
            if not raw_url:
                continue

            # Reddit permalinks are often relative: /r/technology/comments/...
            if raw_url.startswith("/r/"):
                raw_url = "https://www.reddit.com" + raw_url

            if not is_safe_url(raw_url):
                continue

            total_found += 1
            cleaned_u = clean_url(raw_url)
            if cleaned_u in seen_urls:
                continue
            seen_urls.add(cleaned_u)

            if len(items) < max_limit:
                raw_title = row.get(title_col, "") if title_col else ""
                title = sanitize_text(raw_title, max_length=150) or cleaned_u
                
                tags = []
                if tag_col and row.get(tag_col):
                    clean_tag = sanitize_text(row[tag_col], max_length=40)
                    if clean_tag:
                        tags.append(clean_tag.lower())

                p = detect_platform_from_url(cleaned_u) if platform == "universal" else platform
                if p != "web" and p not in tags:
                    tags.append(p)

                items.append({
                    "url": cleaned_u,
                    "title": title,
                    "tags": tags,
                    "platform": p,
                    "saved_at": None,
                })

        display_name = {
            "reddit": "Reddit",
            "pinterest": "Pinterest",
            "youtube": "YouTube",
        }.get(platform, "CSV Import")

        return {
            "platform": platform,
            "platform_display": display_name,
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": [filename or "export.csv"],
        }

    @classmethod
    def _extract_generic_json(cls, data: Any, max_limit: int) -> Dict[str, Any]:
        """Scan generic JSON arrays or nested trees for URLs."""
        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()
        total_found = 0

        def _traverse(node: Any):
            nonlocal total_found
            if isinstance(node, dict):
                # Check if dict has a URL-like key
                raw_url = None
                for k in ["url", "link", "href", "titleUrl", "permalink", "uri"]:
                    if k in node and isinstance(node[k], str) and is_safe_url(node[k]):
                        raw_url = node[k]
                        break

                if raw_url:
                    total_found += 1
                    cleaned_u = clean_url(raw_url)
                    if cleaned_u not in seen_urls:
                        seen_urls.add(cleaned_u)
                        if len(items) < max_limit:
                            title = ""
                            for tk in ["title", "name", "caption", "text", "description"]:
                                if tk in node and isinstance(node[tk], str):
                                    title = sanitize_text(node[tk], max_length=150)
                                    break
                            p = detect_platform_from_url(cleaned_u)
                            items.append({
                                "url": cleaned_u,
                                "title": title or cleaned_u,
                                "tags": [p] if p != "web" else ["imported"],
                                "platform": p,
                                "saved_at": None,
                            })
                else:
                    for v in node.values():
                        _traverse(v)
            elif isinstance(node, list):
                for elem in node:
                    if isinstance(elem, str) and is_safe_url(elem):
                        total_found += 1
                        cleaned_u = clean_url(elem)
                        if cleaned_u not in seen_urls:
                            seen_urls.add(cleaned_u)
                            if len(items) < max_limit:
                                p = detect_platform_from_url(cleaned_u)
                                items.append({
                                    "url": cleaned_u,
                                    "title": cleaned_u,
                                    "tags": [p] if p != "web" else ["imported"],
                                    "platform": p,
                                    "saved_at": None,
                                })
                    else:
                        _traverse(elem)

        _traverse(data)

        return {
            "platform": "universal",
            "platform_display": "JSON Import",
            "total_found": total_found,
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": total_found > max_limit,
            "limit_max": max_limit,
            "source_files": ["export.json"],
        }

    @classmethod
    def _parse_text(cls, file_bytes: bytes, max_limit: int) -> Dict[str, Any]:
        """Extract URLs line by line from plain text."""
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = file_bytes.decode("iso-8859-1", errors="replace")

        url_regex = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)
        found_urls = url_regex.findall(text)

        items: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()

        for u in found_urls:
            if not is_safe_url(u):
                continue
            cleaned_u = clean_url(u)
            if cleaned_u in seen_urls:
                continue
            seen_urls.add(cleaned_u)
            if len(items) < max_limit:
                p = detect_platform_from_url(cleaned_u)
                items.append({
                    "url": cleaned_u,
                    "title": cleaned_u,
                    "tags": [p] if p != "web" else ["imported"],
                    "platform": p,
                    "saved_at": None,
                })

        return {
            "platform": "universal",
            "platform_display": "Text Links",
            "total_found": len(found_urls),
            "unique_valid": len(items),
            "extracted": items,
            "limit_applied": len(found_urls) > max_limit,
            "limit_max": max_limit,
            "source_files": ["links.txt"],
        }

    @staticmethod
    def _empty_result(reason: str = "") -> Dict[str, Any]:
        return {
            "platform": "unknown",
            "platform_display": "Unknown",
            "total_found": 0,
            "unique_valid": 0,
            "extracted": [],
            "limit_applied": False,
            "limit_max": MAX_EXTRACTED_ITEMS,
            "source_files": [],
            "reason": reason,
        }
