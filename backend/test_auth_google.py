"""Test Google OAuth verification and /api/auth/google endpoint."""
import unittest
from unittest.mock import AsyncMock, patch
from bson import ObjectId
import httpx
from server import app
from models import utcnow


class TestGoogleAuth(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=self.transport, base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()

    @patch("auth.httpx.AsyncClient")
    async def test_google_auth_success(self, mock_client_cls):
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "iss": "https://accounts.google.com",
            "aud": "",
            "sub": "1234567890",
            "email": "testgoogleuser@example.com",
            "name": "Google Test User",
            "picture": "https://example.com/avatar.jpg",
            "exp": str(int(utcnow().timestamp()) + 3600),
        }

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = False
        mock_client_cls.return_value = mock_client

        response = await self.client.post(
            "/api/auth/google",
            json={"id_token": "valid_mock_token"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "testgoogleuser@example.com")
        self.assertEqual(data["user"]["name"], "Google Test User")

    @patch("auth.httpx.AsyncClient")
    async def test_google_auth_invalid_token(self, mock_client_cls):
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json.return_value = {"error": "invalid_token"}

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_resp
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = False
        mock_client_cls.return_value = mock_client

        response = await self.client.post(
            "/api/auth/google",
            json={"id_token": "bad_token"},
        )
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
