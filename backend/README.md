# PostRecaller — Backend API Engine

The core business logic, database layer, AI pipeline, and API router for PostRecaller. Built with **FastAPI**, **MongoDB Atlas (Motor AsyncIO)**, and **Google Gemini Flash**.

---

## Architecture Overview

All application logic is modularized into dedicated controllers:

| Module | Purpose |
|---|---|
| [`server.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/server.py) | Application entrypoint, CORS, RateLimiter state, index generation, root `/api` routing |
| [`auth.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/auth.py) | Registration, JWT login, password resets, invite token validation, admin bootstrap |
| [`items.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/items.py) | Vault items CRUD, tag filtering, collections, manual re-enrichment, archive import |
| [`ai.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/ai.py) | Gemini Flash enrichment engine, token usage logging, USD cost estimation |
| [`scraper.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/scraper.py) | Headless link scraper, OpenGraph metadata extraction, Jina Reader API fallback |
| [`archive_parser.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/archive_parser.py) | Multi-format JSON parser for Instagram, TikTok, Reddit, YouTube, and X archives |
| [`bookmark_parser.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/bookmark_parser.py) | Netscape HTML browser bookmark parser with folder hierarchy extraction |
| [`admin.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/admin.py) | Admin analytics dashboard, user moderation, database health, marketing campaigns |
| [`waitlist.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/waitlist.py) | Public waitlist submission and live position counts |
| [`mailer.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/mailer.py) | Transactional email delivery via Resend API (invites, password resets, notifications) |
| [`config.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/config.py) | Centralized environment variable loading and AsyncIOMotorClient database handle |
| [`models.py`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/backend/models.py) | Pydantic data schemas, response models, and datetime helpers |

---

## MongoDB Atlas Collections & Indexes

On application startup, indexes are automatically and idempotently created:

- `users`: `email` (unique), `created_at` (descending)
- `items`: `user_id` + `created_at` (compound), `slug` (unique sparse)
- `ai_usage`: `created_at` (descending for cost analytics)
- `waitlist`: `email` (unique), `created_at` (ascending)
- `invites`: `token_hash` (unique), `email`, `expires_at`
- `debug_logs`: `created_at` with 7-day TTL (`expireAfterSeconds=604800`)

---

## Link Scraping & AI Enrichment Flow

```
User submits URL / Archive
          │
          ▼
   [scraper.py] ──── Attempts direct HTTP fetch & HTML parse
          │
          ├─► Fallback to Jina Reader API if blocked or paywalled
          ▼
   Extracted Signals: (Title, Description, Clean Text, Author)
          │
          ▼
     [ai.py] ──────── Calls Google Gemini Flash via httpx
          │
          ▼
   Strict JSON Response:
     • title (max 90 chars human-readable)
     • summary (2-3 sentences plain language)
     • intent ("Read Later" | "Try Recipe" | "Watch" | "Shop" | "Learn")
     • tags (3-6 lowercase topic tags)
          │
          ▼
   Saved into MongoDB Atlas + AI token usage logged
```

---

## Running Locally

```bash
# 1. Activate virtual environment
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# 2. Install production dependencies
pip install -r requirements.txt

# 3. Start local development server
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

## Running Backend Tests

```bash
# Unit & integration tests via pytest
pytest backend/tests/ -v

# End-to-end API test suite
python backend_test.py
```
