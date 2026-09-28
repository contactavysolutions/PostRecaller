"""Integration test for POST /api/items/import-bookmarks endpoint using AsyncClient."""
import unittest
from bson import ObjectId
import httpx
from server import app
from auth import get_current_user
from config import db
from models import utcnow

# Mock user for testing
MOCK_USER_ID = str(ObjectId())
MOCK_USER = {
    "_id": ObjectId(MOCK_USER_ID),
    "email": "test_importer@example.com",
    "daily_usage": {"date": utcnow().strftime("%Y-%m-%d"), "ai_enrichments": 0, "searches": 0},
}


class TestBookmarkImportAPI(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        app.dependency_overrides[get_current_user] = lambda: MOCK_USER
        self.transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=self.transport, base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        app.dependency_overrides.clear()

    async def test_import_bookmarks_success(self):
        sample_html = """<!DOCTYPE NETSCAPE-Bookmark-file-1>
        <TITLE>Bookmarks</TITLE>
        <H1>Bookmarks</H1>
        <DL><p>
            <DT><H3>Web Development</H3>
            <DL><p>
                <DT><A HREF="https://developer.mozilla.org/en-US/">MDN Web Docs</A>
                <DT><A HREF="https://css-tricks.com">CSS Tricks</A>
            </DL><p>
            <DT><H3>Reading</H3>
            <DL><p>
                <DT><A HREF="https://paulgraham.com/articles.html">Paul Graham Essays</A>
            </DL><p>
        </DL><p>"""

        headers = {"Content-Type": "text/html; charset=utf-8"}
        response = await self.client.post("/api/items/import-bookmarks", content=sample_html.encode("utf-8"), headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()

        self.assertEqual(data["total_found"], 3)
        self.assertEqual(data["unique_valid"], 3)
        self.assertEqual(data["imported"], 3)
        self.assertEqual(data["duplicates_skipped"], 0)

        # Second import of same file should report all duplicates skipped
        response_dup = await self.client.post("/api/items/import-bookmarks", content=sample_html.encode("utf-8"), headers=headers)
        self.assertEqual(response_dup.status_code, 200)
        data_dup = response_dup.json()
        self.assertEqual(data_dup["imported"], 0)
        self.assertEqual(data_dup["duplicates_skipped"], 3)

    async def test_import_oversized_file_rejected(self):
        # 6MB dummy content
        oversized = b"A" * (6 * 1024 * 1024)
        headers = {"Content-Type": "text/html; charset=utf-8"}

        response = await self.client.post("/api/items/import-bookmarks", content=oversized, headers=headers)
        self.assertEqual(response.status_code, 413)
        self.assertIn("exceeds maximum allowed size", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
