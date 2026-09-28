"""Unit tests for UniversalArchiveParser across Instagram, TikTok, YouTube, Reddit, X, Browser, and ZIP archives."""

import io
import json
import unittest
import zipfile
from archive_parser import UniversalArchiveParser, clean_url, detect_platform_from_url


class TestUniversalArchiveParser(unittest.TestCase):

    def test_clean_url(self):
        # Instagram tracking
        ig = "https://www.instagram.com/reel/C-xyz123/?igsh=MW5jdnkyMnFxeHNr&utm_source=ig_web_copy_link"
        self.assertEqual(clean_url(ig), "https://www.instagram.com/reel/C-xyz123")

        # YouTube tracking
        yt = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abcdef123456&feature=share"
        self.assertEqual(clean_url(yt), "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

        # TikTok tracking
        tt = "https://www.tiktok.com/@creator/video/1234567890?is_from_webapp=1&sender_device=pc"
        self.assertEqual(clean_url(tt), "https://www.tiktok.com/@creator/video/1234567890")

    def test_detect_platform(self):
        self.assertEqual(detect_platform_from_url("https://www.instagram.com/p/123"), "instagram")
        self.assertEqual(detect_platform_from_url("https://vm.tiktok.com/ZM8abc/"), "tiktok")
        self.assertEqual(detect_platform_from_url("https://youtu.be/dQw4w9WgXcQ"), "youtube")
        self.assertEqual(detect_platform_from_url("https://www.reddit.com/r/python"), "reddit")
        self.assertEqual(detect_platform_from_url("https://x.com/tech_insider/status/123"), "x")
        self.assertEqual(detect_platform_from_url("https://github.com/emergent/app"), "github")
        self.assertEqual(detect_platform_from_url("https://example.com/blog"), "web")

    def test_parse_instagram_json(self):
        sample = {
            "saved_saved_media": [
                {
                    "title": "Amazing Pasta Recipe",
                    "string_map_data": {
                        "Saved on": {
                            "href": "https://www.instagram.com/p/DA12345/?igsh=test1",
                            "timestamp": 1720000000,
                        }
                    },
                },
                {
                    "title": "Travel Inspiration",
                    "string_map_data": {
                        "Saved on": {
                            "href": "https://www.instagram.com/reel/DA67890/?igsh=test2",
                            "timestamp": 1720001000,
                        }
                    },
                },
            ]
        }
        raw = json.dumps(sample).encode("utf-8")
        res = UniversalArchiveParser.parse_archive(raw, filename="saved_posts.json")

        self.assertEqual(res["platform"], "instagram")
        self.assertEqual(res["total_found"], 2)
        self.assertEqual(res["unique_valid"], 2)
        self.assertEqual(res["extracted"][0]["url"], "https://www.instagram.com/p/DA12345")
        self.assertEqual(res["extracted"][0]["title"], "Amazing Pasta Recipe")
        self.assertIn("instagram", res["extracted"][0]["tags"])
        self.assertEqual(res["extracted"][1]["url"], "https://www.instagram.com/reel/DA67890")

    def test_parse_tiktok_json(self):
        sample = {
            "Activity": {
                "Favorite Videos": {
                    "FavoriteVideoList": [
                        {
                            "Date": "2024-05-10 12:30:00",
                            "Link": "https://www.tiktok.com/@chef/video/9876543210?is_from_webapp=1",
                        },
                        {
                            "Date": "2024-05-11 14:15:00",
                            "Link": "https://www.tiktok.com/@coder/video/1122334455",
                        },
                    ]
                }
            }
        }
        raw = json.dumps(sample).encode("utf-8")
        res = UniversalArchiveParser.parse_archive(raw, filename="user_data.json")

        self.assertEqual(res["platform"], "tiktok")
        self.assertEqual(res["total_found"], 2)
        self.assertEqual(res["unique_valid"], 2)
        self.assertEqual(res["extracted"][0]["url"], "https://www.tiktok.com/@chef/video/9876543210")
        self.assertIn("tiktok", res["extracted"][0]["tags"])

    def test_parse_youtube_json(self):
        sample = [
            {
                "header": "YouTube",
                "title": "Watched System Architecture Explained",
                "titleUrl": "https://www.youtube.com/watch?v=arch123&si=ref99",
                "subtitles": [{"name": "Tech Academy", "url": "https://youtube.com/c/tech"}],
                "time": "2024-06-15T18:22:10.000Z",
            },
            {
                "header": "YouTube",
                "title": "Watched Best Ramen in Tokyo",
                "titleUrl": "https://www.youtube.com/watch?v=food456",
                "subtitles": [{"name": "Food Tour"}],
                "time": "2024-06-16T12:00:00.000Z",
            },
        ]
        raw = json.dumps(sample).encode("utf-8")
        res = UniversalArchiveParser.parse_archive(raw, filename="watch-history.json")

        self.assertEqual(res["platform"], "youtube")
        self.assertEqual(res["total_found"], 2)
        self.assertEqual(res["unique_valid"], 2)
        self.assertEqual(res["extracted"][0]["url"], "https://www.youtube.com/watch?v=arch123")
        self.assertEqual(res["extracted"][0]["title"], "System Architecture Explained")
        self.assertIn("tech academy", res["extracted"][0]["tags"])

    def test_parse_reddit_csv(self):
        csv_text = (
            "id,permalink,title,subreddit\n"
            "abc1,/r/Python/comments/123/great_libraries/,Great Python Libraries,Python\n"
            "abc2,https://www.reddit.com/r/technology/comments/456/new_chip/,New Chip Architecture,technology\n"
        )
        raw = csv_text.encode("utf-8")
        res = UniversalArchiveParser.parse_archive(raw, filename="saved_posts.csv")

        self.assertEqual(res["platform"], "reddit")
        self.assertEqual(res["total_found"], 2)
        self.assertEqual(res["unique_valid"], 2)
        self.assertEqual(res["extracted"][0]["url"], "https://www.reddit.com/r/Python/comments/123/great_libraries")
        self.assertIn("python", res["extracted"][0]["tags"])
        self.assertEqual(res["extracted"][1]["url"], "https://www.reddit.com/r/technology/comments/456/new_chip")

    def test_parse_twitter_js(self):
        js_text = (
            "window.YTD.bookmarks.part0 = [\n"
            "  {\n"
            "    \"bookmark\": {\n"
            "      \"tweetId\": \"1820000000000\",\n"
            "      \"fullText\": \"Announcing the new version of our framework!\",\n"
            "      \"expandedUrl\": \"https://twitter.com/dev/status/1820000000000?s=20\"\n"
            "    }\n"
            "  }\n"
            "];\n"
        )
        raw = js_text.encode("utf-8")
        res = UniversalArchiveParser.parse_archive(raw, filename="bookmarks.js")

        self.assertEqual(res["platform"], "x")
        self.assertEqual(res["total_found"], 1)
        self.assertEqual(res["unique_valid"], 1)
        self.assertEqual(res["extracted"][0]["url"], "https://twitter.com/dev/status/1820000000000")
        self.assertIn("Announcing the new version", res["extracted"][0]["title"])

    def test_parse_zip_archive(self):
        # Build in-memory zip containing Instagram saved_posts.json
        ig_sample = {
            "saved_saved_media": [
                {
                    "title": "Photo 1",
                    "string_map_data": {"Saved on": {"href": "https://www.instagram.com/p/ZIP01/?igsh=xyz"}},
                }
            ]
        }
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("your_instagram_activity/saved/saved_posts.json", json.dumps(ig_sample))

        zip_bytes = buf.getvalue()
        res = UniversalArchiveParser.parse_archive(zip_bytes, filename="instagram_export.zip")

        self.assertEqual(res["platform"], "instagram")
        self.assertEqual(res["unique_valid"], 1)
        self.assertEqual(res["extracted"][0]["url"], "https://www.instagram.com/p/ZIP01")

    def test_parse_browser_html(self):
        html_text = """
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <DL><p>
          <DT><H3>Engineering</H3>
          <DL><p>
            <DT><A HREF="https://news.ycombinator.com">Hacker News</A>
          </DL><p>
        </DL><p>
        """
        res = UniversalArchiveParser.parse_archive(html_text.encode("utf-8"), filename="bookmarks.html")
        self.assertEqual(res["platform"], "browser")
        self.assertEqual(res["unique_valid"], 1)
        self.assertEqual(res["extracted"][0]["url"], "https://news.ycombinator.com")
        self.assertIn("Engineering", res["extracted"][0]["tags"])


if __name__ == "__main__":
    unittest.main()
