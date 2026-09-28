"""Central configuration: env loading, Mongo client, shared settings/constants."""
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR.parent / ".env")
load_dotenv(ROOT_DIR.parent / "atlas-credentials.env")

# --- Mongo ---
MONGO_URL = os.environ.get("MONGO_URL") or os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "postrecaller")

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=2000)
db = client[DB_NAME]

# --- Auth ---
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = int(os.environ.get("ACCESS_TOKEN_EXPIRE_DAYS", "30"))

ADMIN_EMAILS = [
    e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()
]

# --- LLM ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY", "")
EMERGENT_LLM_KEY = GEMINI_API_KEY
ENRICH_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-lite-latest")

# --- Email (Resend; Emergent-managed key populated as RESEND_API_KEY) ---
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "PostRecaller <onboarding@resend.dev>")

# --- Reddit (optional; OAuth client_credentials only, never scrape) ---
REDDIT_CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET", "")

# --- Jina Reader (optional; lifts rate limit from 20 RPM to 500 RPM) ---
JINA_API_KEY = os.environ.get("JINA_API_KEY", "")

# --- Freemium / abuse limits ---
FREE_DAILY_AI_LIMIT = 5
DAILY_SAVE_CAP = 200
MAX_BOOKMARK_IMPORT_LIMIT = int(os.environ.get("MAX_BOOKMARK_IMPORT_LIMIT", "1000"))
BOOKMARK_ENRICH_CONCURRENCY = int(os.environ.get("BOOKMARK_ENRICH_CONCURRENCY", "3"))

# Valid intent buckets (collections)
INTENTS = ["Read Later", "Try Recipe", "Watch", "Shop", "Learn"]
