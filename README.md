# PostRecaller

> **Everything you save, finally findable.**  
> Drop every link — Instagram, TikTok, YouTube, X, Reddit, articles, and browser bookmarks — into one AI-organized vault you can search and act on in seconds.

[![Production Status](https://img.shields.io/badge/status-live%20production-success?style=flat-square)](https://postrecaller.com)
[![Custom Domain](https://img.shields.io/badge/domain-postrecaller.com-blue?style=flat-square)](https://postrecaller.com)
[![Backend](https://img.shields.io/badge/backend-FastAPI%20%7C%20Python%203.12-009688?style=flat-square)](https://postrecaller.com/api)
[![Frontend](https://img.shields.io/badge/web-React%2019%20%7C%20TailwindCSS-61DAFB?style=flat-square)](https://postrecaller.com)
[![Mobile](https://img.shields.io/badge/mobile-Expo%20SDK%2054%20%7C%20React%20Native-black?style=flat-square)](https://expo.dev)
[![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-47A248?style=flat-square)](https://cloud.mongodb.com)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-4285F4?style=flat-square)](https://ai.google.dev)
[![Deployment](https://img.shields.io/badge/hosting-Vercel%20Services-black?style=flat-square)](https://vercel.com)

---

## Live Deployments

| Component | Production URL | Description |
|---|---|---|
| **Web Application** | [https://postrecaller.com](https://postrecaller.com) | Responsive React SPA with Vault, Waitlist, Admin Portal |
| **API Backend** | [https://postrecaller.com/api](https://postrecaller.com/api) | High-performance Python FastAPI service with auto docs |
| **Mobile App (Android)** | `PostRecaller.apk` (V1.0.0) | Native Android build with system Share Intent (`ACTION_SEND`) |
| **WWW Redirect** | [https://www.postrecaller.com](https://www.postrecaller.com) | HSTS 308 redirect to apex domain |

---

## Monorepo Architecture

```
PostRecaller/
├── backend/                  # Python FastAPI API Service
│   ├── admin.py              # Analytics, user management, and campaign routes
│   ├── ai.py                 # Gemini Flash enrichment & token cost tracker
│   ├── archive_parser.py     # Universal parser for Instagram, TikTok, Reddit, X, etc.
│   ├── auth.py               # JWT authentication, invite tokens, seed admin
│   ├── bookmark_parser.py    # Netscape HTML bookmark extractor
│   ├── config.py             # Central environment & MongoDB Atlas connection
│   ├── items.py              # Saved items, tags, collections, and search
│   ├── mailer.py             # Transactional emails via Resend API
│   ├── models.py             # Pydantic schemas and models
│   ├── requirements.txt      # Production Python dependencies
│   ├── scraper.py            # Headless link scraping with Jina Reader fallback
│   └── server.py             # FastAPI entrypoint, middleware, and startup indexes
│
├── web/                      # React 19 Single Page Application
│   ├── public/               # HTML template, favicons, open graph assets
│   ├── src/
│   │   ├── components/       # Radix UI + Tailwind design system components
│   │   ├── pages/            # Landing/Waitlist, Login, Register, Vault, Admin
│   │   └── lib/api.js        # Centralized Axios client & API endpoints
│   ├── craco.config.js       # CRA build customization
│   └── package.json          # Web dependencies and scripts
│
├── frontend/                 # Expo React Native Mobile Application
│   ├── app/                  # Expo Router file-based pages (Vault, Share modal, etc.)
│   ├── plugins/              # Native Config Plugins (Android ACTION_SEND Share Intent)
│   ├── assets/               # Approved "Gold Luxe Vault" app icons & splash screens
│   ├── eas.json              # EAS Build profiles pointing to production API
│   └── package.json          # React Native dependencies
│
├── scripts/                  # Developer & Automation Utilities
│   └── vercel_mcp.py         # Dedicated stdio Vercel Model Context Protocol server
│
├── sample_exports/           # Test archives (Instagram, TikTok, HTML bookmarks)
├── .agents/                  # Workspace AI customizations and MCP server configs
├── vercel.json               # Vercel Services multi-service configuration
└── .npmrc                    # Monorepo build and dependency resolutions
```

---

## Key Features

### 1. Smart AI Content Librarian
- Powered by **Google Gemini Flash**.
- Generates clean human titles (under 90 chars), concise 2–3 sentence summaries, and automated 3–6 topic tags.
- Categorizes links automatically into intuitive action buckets:
  - `Read Later`
  - `Try Recipe`
  - `Watch`
  - `Shop`
  - `Learn`

### 2. Universal Social Archive & Bookmark Importer
- **Browser Bookmarks**: Netscape HTML export format (Chrome, Safari, Firefox, Edge, Brave).
- **Instagram Saved Posts**: Native `saved_posts.json` export parser.
- **TikTok Saved/Favorites**: JSON export parser with video metadata extraction.
- **Reddit Saved**: Multi-format saved post exports.
- **YouTube Playlists/Watch Later**: Playlist JSON parser.
- **X / Twitter Bookmarks**: Archive JSON importer.

### 3. Native Android Share Intent
- Share directly from Instagram, TikTok, YouTube, X, Chrome, or Reddit apps via Android's native system **Share Sheet** (`ACTION_SEND`).
- Auto-extracts URLs from shared text snippets, creates vault items in background, and triggers AI enrichment without interrupting browsing.

### 4. Admin Analytics & Waitlist Portal
- Real-time user growth, save volume, and AI token spend tracking.
- Freemium quotas and abuse prevention (5 free AI enrichments/day, 200 saves/day).
- Invitation token management, waitlist email campaigns, and instant user activation.

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MongoDB instance (or free MongoDB Atlas connection string)

### 1. Running the FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
Backend will be live at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Running the React Web App
```bash
cd web
npm install --legacy-peer-deps
npm start
```
Web app will be running at `http://localhost:3000`.

### 3. Running the Expo Mobile App
```bash
cd frontend
npm install
npx expo start -c
```
Press `a` to run on an attached Android device/emulator, or scan the QR code using Expo Go.

---

## Environment Variables

Configure the following variables in your `.env` or Vercel Dashboard:

| Variable | Description | Required | Example |
|---|---|---|---|
| `MONGO_URL` | MongoDB connection URI | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | MongoDB database name | **Yes** | `postrecaller` |
| `JWT_SECRET` | Secret key for JWT auth tokens | **Yes** | `your-secure-random-64-char-hex-secret` |
| `GEMINI_API_KEY` | Google Gemini API key | **Yes** | `AQ.Ab8RN6...` |
| `RESEND_API_KEY` | Resend transactional email API key | **Yes** | `re_bW6pv6...` |
| `RESEND_FROM_EMAIL` | From address for system emails | No | `PostRecaller <onboarding@resend.dev>` |
| `JINA_API_KEY` | Jina Reader API key (lifts RPM limit) | No | `jina_a192df...` |
| `REDDIT_CLIENT_ID` | Optional Reddit OAuth client ID | No | `...` |
| `REDDIT_CLIENT_SECRET` | Optional Reddit OAuth secret | No | `...` |
| `CI` | Disable CI strict lint fail on build | Recommended | `false` |

---

## Automated Deployment (Vercel Services)

The project uses modern **Vercel Services** to deploy both the React frontend and the Python backend in a single synchronized project on the same domain:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "web": {
      "root": "web"
    },
    "backend": {
      "root": "backend",
      "entrypoint": "server:app"
    }
  },
  "rewrites": [
    { "source": "/api", "destination": { "service": "backend" } },
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "web" } }
  ]
}
```

Every `git push origin main` triggers an atomic zero-downtime deployment to `https://postrecaller.com`.

---

## Automated Test Suite

Run the full end-to-end backend test suite (testing auth, vault, bookmark parser, waitlist, admin metrics, and rate limiting):

```bash
# Against live production:
python backend_test.py

# Against local development:
BACKEND_URL="http://localhost:8000/api" python backend_test.py
```

---

## License

Proprietary © 2026 PostRecaller. All rights reserved. Built with pride by the PostRecaller Engineering Team.
