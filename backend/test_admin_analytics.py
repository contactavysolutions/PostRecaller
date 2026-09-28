"""Integration tests for new Admin Analytics, Database telemetry, and Campaigns endpoints."""
import unittest
from bson import ObjectId
import httpx
from server import app
from auth import require_admin
from config import db
from models import utcnow

# Mock admin user
MOCK_ADMIN = {
    "_id": ObjectId(),
    "email": "contactavysolutions@gmail.com",
    "is_admin": True,
}


class TestAdminAnalyticsEndpoints(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
        self.transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=self.transport, base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        app.dependency_overrides.clear()

    async def test_admin_suite(self):
        # 1. Database stats
        response_db = await self.client.get("/api/admin/database")
        self.assertEqual(response_db.status_code, 200, response_db.text)
        db_data = response_db.json()
        self.assertIn("db_name", db_data)
        self.assertIn("data_size_mb", db_data)
        self.assertIn("storage_size_mb", db_data)
        self.assertIn("index_size_mb", db_data)
        self.assertIn("collections", db_data)
        self.assertIsInstance(db_data["collections"], list)
        self.assertTrue(len(db_data["collections"]) >= 4)

        # 2. Product analytics
        response_analytics = await self.client.get("/api/admin/analytics?days=30")
        self.assertEqual(response_analytics.status_code, 200, response_analytics.text)
        analytics_data = response_analytics.json()
        self.assertIn("totals", analytics_data)
        self.assertIn("total_items", analytics_data["totals"])
        self.assertIn("total_users", analytics_data["totals"])
        self.assertIn("platforms", analytics_data)
        self.assertIn("intents", analytics_data)
        self.assertIn("top_tags", analytics_data)
        self.assertIn("daily_saves", analytics_data)

        # 3. Create a test campaign
        campaign_payload = {
            "name": "Test Meta Reels Campaign",
            "channel": "meta",
            "spend_usd": 150.00,
            "status": "active",
            "utm_source": "test_reels",
            "utm_campaign": "fall_special",
            "impressions": 10000,
            "clicks": 350,
            "notes": "Testing acquisition tracking",
        }
        create_res = await self.client.post("/api/admin/campaigns", json=campaign_payload)
        self.assertEqual(create_res.status_code, 200, create_res.text)
        created_data = create_res.json()
        self.assertTrue(created_data["ok"])
        campaign_id = created_data["campaign"]["_id"]

        try:
            # 4. List campaigns and check App Store metrics
            list_res = await self.client.get("/api/admin/campaigns")
            self.assertEqual(list_res.status_code, 200, list_res.text)
            data = list_res.json()

            self.assertIn("totals", data)
            self.assertIn("total_spend_usd", data["totals"])
            self.assertIn("campaigns", data)
            self.assertIn("app_store", data)

            # Check App Store stats
            app_store = data["app_store"]
            self.assertIn("ios", app_store)
            self.assertIn("android", app_store)
            self.assertEqual(app_store["ios"]["rating"], 4.9)
            self.assertEqual(app_store["android"]["rating"], 4.8)

            # Find our created campaign in the list
            found = next((c for c in data["campaigns"] if c["id"] == campaign_id), None)
            self.assertIsNotNone(found)
            self.assertEqual(found["name"], "Test Meta Reels Campaign")
            self.assertEqual(found["spend_usd"], 150.00)
            self.assertEqual(found["ctr_percent"], 3.5)

        finally:
            # 5. Clean up the campaign
            del_res = await self.client.delete(f"/api/admin/campaigns/{campaign_id}")
            self.assertEqual(del_res.status_code, 204)


if __name__ == "__main__":
    unittest.main()
