"""Unit tests for bookmark_parser.py."""
import unittest
from bookmark_parser import is_safe_url, parse_bookmarks_html, sanitize_text, clean_folder_name


class TestBookmarkParser(unittest.TestCase):
    def test_ssrf_and_protocol_safety(self):
        # Valid URLs
        self.assertTrue(is_safe_url("https://github.com/torvalds/linux"))
        self.assertTrue(is_safe_url("http://news.ycombinator.com"))
        self.assertTrue(is_safe_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))

        # Invalid schemes
        self.assertFalse(is_safe_url("javascript:alert(1)"))
        self.assertFalse(is_safe_url("file:///etc/passwd"))
        self.assertFalse(is_safe_url("chrome://bookmarks"))
        self.assertFalse(is_safe_url("data:text/html,<script>alert(1)</script>"))
        self.assertFalse(is_safe_url("ftp://ftp.example.com"))

        # Loopback / Localhost
        self.assertFalse(is_safe_url("http://localhost:8000/api"))
        self.assertFalse(is_safe_url("http://127.0.0.1:27017"))
        self.assertFalse(is_safe_url("http://0.0.0.0:3000"))
        self.assertFalse(is_safe_url("http://app.localhost/"))

        # Cloud Metadata (AWS/GCP/Azure)
        self.assertFalse(is_safe_url("http://169.254.169.254/latest/meta-data/"))
        self.assertFalse(is_safe_url("http://metadata.google.internal/computeMetadata/v1/"))

        # Private RFC1918 subnets
        self.assertFalse(is_safe_url("http://10.0.0.1/admin"))
        self.assertFalse(is_safe_url("http://192.168.1.1/router"))
        self.assertFalse(is_safe_url("http://172.16.0.5/dashboard"))

    def test_sanitization(self):
        self.assertEqual(sanitize_text("<script>alert('xss')</script>Hello World"), "Hello World")
        self.assertEqual(clean_folder_name("Bookmarks bar"), None)
        self.assertEqual(clean_folder_name("Favorites"), None)
        self.assertEqual(clean_folder_name("Recipes & Cooking"), "Recipes & Cooking")

    def test_netscape_html_parsing(self):
        sample = """<!DOCTYPE NETSCAPE-Bookmark-file-1>
        <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
        <TITLE>Bookmarks</TITLE>
        <H1>Bookmarks</H1>
        <DL><p>
            <DT><H3>Bookmarks bar</H3>
            <DL><p>
                <DT><A HREF="https://seriouseats.com/pasta">Serious Eats Pasta</A>
                <DT><A HREF="javascript:void(0)">Invalid JS</A>
                <DT><A HREF="http://127.0.0.1:8000/secret">Localhost Attack</A>
                <DT><A HREF="https://seriouseats.com/pasta">Duplicate Pasta</A>
            </DL><p>
            <DT><H3>Tech & AI</H3>
            <DL><p>
                <DT><A HREF="https://news.ycombinator.com">Hacker <b>News</b></A>
                <DT><A HREF="https://github.com">GitHub</A>
            </DL><p>
        </DL><p>"""

        res = parse_bookmarks_html(sample, max_limit=1000)
        self.assertEqual(res["total_found"], 4)  # 4 safe links in document (including duplicate)
        self.assertEqual(res["unique_valid"], 3)  # 3 unique URLs
        self.assertFalse(res["limit_applied"])

        extracted = res["extracted"]
        self.assertEqual(len(extracted), 3)

        # Serious Eats is under "Bookmarks bar" -> folder should be None (filtered generic)
        self.assertEqual(extracted[0]["url"], "https://seriouseats.com/pasta")
        self.assertEqual(extracted[0]["folder"], None)

        # Hacker News is under "Tech & AI" -> folder should be "Tech & AI", title sanitized
        self.assertEqual(extracted[1]["url"], "https://news.ycombinator.com")
        self.assertEqual(extracted[1]["title"], "Hacker News")
        self.assertEqual(extracted[1]["folder"], "Tech & AI")

        # GitHub
        self.assertEqual(extracted[2]["url"], "https://github.com")

    def test_max_limit_enforcement(self):
        sample = """<DL><p>
            <DT><A HREF="https://one.com">One</A>
            <DT><A HREF="https://two.com">Two</A>
            <DT><A HREF="https://three.com">Three</A>
            <DT><A HREF="https://four.com">Four</A>
        </DL>"""
        res = parse_bookmarks_html(sample, max_limit=2)
        self.assertEqual(len(res["extracted"]), 2)
        self.assertTrue(res["limit_applied"])
        self.assertEqual(res["limit_max"], 2)


if __name__ == "__main__":
    unittest.main()
