# PostRecaller — Living Session & Memory Log

This document preserves context, decisions, and development progress across all Antigravity agent sessions. It works in conjunction with [`memory/PRD.md`](./PRD.md) and [`AGENTS.md`](../AGENTS.md).

---

## 1. Project Overview & Current State

- **App Name**: PostRecaller (renamed from "Glean")
- **Tagline**: "Everything you save, finally findable."
- **Stack**:
  - Backend: FastAPI, Motor (Async MongoDB), JWT+bcrypt, Resend (email), Google Gemini Flash (enrichment).
  - Mobile: React Native / Expo, `@shopify/flash-list`, `@gorhom/bottom-sheet`, Zustand.
  - Web: React + Tailwind CSS (CRACO) ready for `postrecaller.com`.
- **Infrastructure Status**:
  - Decoupled from Emergent AI proprietary SDK (`emergentintegrations`).
  - Standard Google Gemini API (`GEMINI_API_KEY`) integrated with fallback to `EMERGENT_LLM_KEY`.

---

## 2. Completed Milestones

### Phase 1: Core Loop ✅ (2026-07-28)
- Auth: Register, login, JWT issuance, `GET /api/auth/me`, `DELETE /api/auth/me` with cascade item deletion.
- Scraper chain: OpenGraph/meta, Reddit OAuth, oEmbed, Jina Reader with raw-save fallback.
- AI Enrichment: Gemini Flash generating `{title, summary, intent, tags, author}` with cost logging.
- Vault UI: Pinterest-style masonry grid, sticky header, tag rail filtering, search.
- Item detail: Hero preview, AI summary, editable tags/intent/notes, open external link, delete.
- Collections: 5 intent buckets (`Read Later`, `Try Recipe`, `Watch`, `Shop`, `Learn`).
- Verification: 8/8 backend test pass.

### Iteration: Branding & Password Reset ✅ (2026-07-28)
- Renamed app from Glean to PostRecaller.
- Forgot/Reset Password flow with 6-digit email verification code via Resend (`mailer.py`).
- Verification: 14/14 backend test pass.

### Antigravity Onboarding & Emergent Decoupling ✅ (2026-09-21)
- Cloned repository into local Antigravity workspace.
- Replaced proprietary `emergentintegrations` dependency with native Google Gemini REST API via `httpx`.
- Created cross-session memory system: [`AGENTS.md`](../AGENTS.md) + [`memory/SESSION_LOG.md`](./SESSION_LOG.md).
- Added [`.env.example`](../backend/.env.example) for vendor-independent local execution and deployment.

### Phase 1: Universal Social Media & Bookmark Importer ✅ (2026-09-27)
- Built `backend/archive_parser.py`: Auto-detects platform schema (Instagram JSON, TikTok JSON, YouTube Takeout, Reddit CSV, X bookmarks.js, Pinterest CSV, Netscape HTML, and in-memory ZIPs with zip-bomb safeguards).
- Strips all marketing/tracking parameters (`?igsh=`, `?si=`, `?utm_*`, `?s=`, etc.) for canonical deduplication.
- Added `POST /api/items/import-archive` and `POST /api/items/import-bookmarks`.
- Implemented quota-aware AI enrichment pacing: all items saved immediately with status `"imported"` (instantly searchable), with a safe batch enqueued for Gemini AI enrichment.
- Updated `AddSheet.tsx` (Mobile) and `AddLinkModal.jsx` (Web) with 1-click platform export step guides, drag-and-drop / file picker, and real-time metrics cards.
- Verified with 9/9 unit tests in `backend/test_archive_parser.py` and live API tests in `backend/test_api_import_archive.py`.

### Phase 2: Native Mobile Share Sheet & Quick-Save Option A ✅ (2026-09-27)
- Configured Android `intentFilters` for `ACTION_SEND` (`mimeType: text/plain`) in `frontend/app.json`.
- Built `frontend/src/utils/urlCleaner.ts` for URL extraction and tracking parameter cleaning.
- Built `frontend/src/components/FloatingSaveToast.tsx`: Brand-styled floating toast with haptic feedback (`expo-haptics`) and reanimated animations.
- Built `frontend/src/hooks/useQuickShareHandler.ts`: Handles deep links and clipboard change detection upon app resume, offering 1-tap quick saving.
- Integrated into root layout `frontend/app/_layout.tsx`. Typecheck verified with 0 errors (`npx tsc --noEmit`).

---

## 3. Prioritized Backlog

### P2 — Search & Text Notes
- [ ] Embeddings at save-time (generate vector embeddings for title/summary/tags).
- [ ] Cosine similarity / vector search for natural-language queries.
- [ ] Personal text notes endpoint (`POST /api/notes`) with AI auto-tagging.
- [ ] URL canonicalization (stripping UTM tracking parameters, trailing slashes).

### P3 — Monetization & Limits
- [ ] Server-side quota enforcement (5 free AI enrichments/day, then fallback to raw saves).
- [ ] Paywall modal + Stripe Checkout integration.

### P4 — Native Sharing & Mobile Polish
- [ ] Native Share Sheet extension (`expo-share-intent` for iOS & Android).
- [ ] Multimodal vision enrichment for Instagram photo posts / infographics.

### P5 — Admin & Public Share Cards
- [ ] Admin dashboard (aggregate active users, saves, AI token costs).
- [ ] Public shareable item cards (OpenGraph dynamic previews).

### P6 — Web Launch
- [ ] Deploy web frontend to Vercel with custom domain `postrecaller.com`.
- [ ] Connect production MongoDB Atlas instance.

---

## 4. Session History

### Session: 2026-09-21
- **Goal**: Repository analysis, cross-session memory setup, Emergent AI decoupling.
- **Actions**:
  - Cloned `https://github.com/contactavysolutions/PostRecaller`.
  - Analyzed 3-tier codebase (FastAPI backend, Expo mobile frontend, React web app).
  - Created [`AGENTS.md`](../AGENTS.md) with memory retrieval protocols and architectural standards.
  - Initialized [`memory/SESSION_LOG.md`](./SESSION_LOG.md) to track state across sessions.
  - Refactored [`backend/ai.py`](../backend/ai.py) to use standard Google Gemini REST API via `httpx`.
  - Updated [`backend/config.py`](../backend/config.py) to support `GEMINI_API_KEY`.
  - Created [`backend/.env.example`](../backend/.env.example).
- **Next Steps**:
  - Test `/api/items` enrichment with local or cloud MongoDB instance.
- **Verification**:
  - Live end-to-end API test executed with user's `GEMINI_API_KEY`:
    - URL enrichment: **PASSED** (returned valid title, summary, intent `Learn`, tags, and author).
    - Note enrichment: **PASSED** (returned title `Dinner Grocery Reminder`, intent `Shop`, and tags).
    - Transient 503 retry mechanism verified and working.
  - Multi-platform scraping and `gemini-flash-lite-latest` benchmark:
    - **YouTube**: PASSED (OpenGraph metadata).
    - **TikTok**: PASSED (oEmbed endpoint).
    - **Reddit**: PASSED (Slug + Jina fallback).
    - **X / Twitter**: PASSED (Upgraded scraper with FxTwitter API).
    - **Web / Wikipedia / GitHub**: PASSED (HTML body + OpenGraph).
    - **Pinterest**: PASSED (OpenGraph).
    - **Instagram / Threads**: Documented login-wall behavior & raw-save fallback / native share extension architecture.
    - **Jina Reader**: **PASSED & AUTHENTICATED** (verified via response headers: rate limit successfully elevated to 500 RPM, remaining 499, usage tracking active).
    - **Crawl4AI Adapter**: Integrated as an optional, non-blocking Stage 5 fallback in `backend/scraper.py` (lazy-loaded to avoid bloated dependencies or memory degradation).
    - **Trafilatura Integration**: **PASSED** (Installed `trafilatura>=2.2.0`, added to `backend/requirements.txt`, integrated into `_fetch_html` in `backend/scraper.py` for pristine text extraction without layout junk).
    - **Reddit Scraper Resiliency**: **PASSED** (Enhanced `_fetch_reddit` with open oEmbed API + URL slug parser fallback so Reddit links scrape reliably with author, title, and discussion context even without approved developer API credentials).
    - **Local Web & Backend Launch**: **PASSED** (Installed `web/node_modules`, launched Web App on `http://localhost:3000` and FastAPI backend on `http://localhost:8000`. Verified full UI, dark mode toggle, and auth routes via browser agent).
    - **Waitlist Mode Disabled & Vault Verification**: **PASSED** (Set `IS_WAITLIST_MODE = false` in `web/src/constants/config.js`, enabled open registration in `web/src/pages/Register.jsx` and `web/src/pages/Login.jsx`. Verified end-to-end account registration, auto-login, Vault dashboard rendering, and AddLinkModal operation).
    - **Facebook Share/Reel Scraper Fix**: **PASSED** (Identified 2 root causes: Facebook was previously routed straight to Jina Reader which hit a CAPTCHA wall, and Facebook returned 400 Bad Request to modern desktop browser headers. Added dedicated `_fetch_facebook` stage utilizing `facebookexternalhit/1.1` crawler User-Agent to extract clean OpenGraph metadata, title, author, description, and thumbnail image, followed by Gemini Flash enrichment).

### Session: 2026-09-25
- **Goal**: Implement secure, high-performance Browser Bookmark Import (.html) without server overload or AI quota exhaustion.
- **Actions**:
  - Created [`backend/bookmark_parser.py`](../backend/bookmark_parser.py) with SSRF defenses (blocking loopback, private subnets, cloud metadata IPs, and non-http schemes), HTML sanitization (stripping `<script>`, `<style>`, and raw tags), generic folder filtering, and Netscape DL/DT/A format parser with a 1,000 item safety cap.
  - Updated [`backend/config.py`](../backend/config.py) with `MAX_BOOKMARK_IMPORT_LIMIT = 1000` and `BOOKMARK_ENRICH_CONCURRENCY = 3`.
  - Added `POST /api/items/import-bookmarks` to [`backend/items.py`](../backend/items.py):
    - Streaming 5MB size limit to prevent memory exhaustion (HTTP 413).
    - Zero external dependency body reader supporting raw text/html, JSON, and standard multipart.
    - Single batch MongoDB duplicate check (`$in`) and single batch insert (`insert_many(ordered=False)`).
    - Status set to `"imported"` with folder names as initial tags and native browser titles.
    - Safe background AI enrichment queue capped strictly at remaining daily free AI quota with gentle pacing (no Gemini 429 spike or server choke).
  - Updated [`web/src/lib/api.js`](../web/src/lib/api.js) with `api.importBookmarks(file)`.
  - Enhanced [`web/src/pages/Vault/AddLinkModal.jsx`](../web/src/pages/Vault/AddLinkModal.jsx) with a tabbed workflow ("Single Link" vs "Import Bookmarks (.html)"), drag-and-drop zone, file picker, export instructions (Chrome/Safari/Firefox), animated loading spinner, and celebratory post-import stats card.
- **Verification**:
  - `python backend/test_bookmark_parser.py`: **4/4 PASSED** (SSRF defense, sanitization, Netscape format, and cap enforcement).
  - `python backend/test_api_import.py`: **2/2 PASSED** (End-to-end API ingestion, duplicate batch skipping, and 413 payload rejection).
  - `npm run build` in `/web`: **PASSED** (React production bundle compiled with 0 errors).

### Session: 2026-09-25 (Executive Admin & Analytics Center)
- **Goal**: Expand PostRecaller Admin Panel (`/admin`) into a comprehensive Analytics, Telemetry, and Campaign Center.
- **Actions**:
  - Added `CreateCampaignIn` schema to [`backend/models.py`](../backend/models.py).
  - Implemented 3 new telemetry and analytics endpoints in [`backend/admin.py`](../backend/admin.py):
    - `GET /api/admin/database`: Live MongoDB metrics (`dbstats` storage size in MB, data size, index size, ping latency, total documents, and per-collection counts).
    - `GET /api/admin/analytics`: Product usage metrics (save velocity over 7/30/90 days, saves by platform, intent distribution, top 20 tags, and active savers count).
    - `GET` & `POST` & `DELETE` `/api/admin/campaigns`: Campaign ad spend ledger, automated CAC calculation from UTM sources, CTR %, and mobile App Store / Google Play telemetry.
  - Updated [`web/src/lib/api.js`](../web/src/lib/api.js) with `adminDatabase`, `adminAnalytics`, and `adminCampaigns` methods.
  - Upgraded [`web/src/pages/Admin/HealthTab.jsx`](../web/src/pages/Admin/HealthTab.jsx) with live MongoDB disk storage, data size, index size, and per-collection breakdown table.
  - Created [`web/src/pages/Admin/AnalyticsTab.jsx`](../web/src/pages/Admin/AnalyticsTab.jsx) with save velocity AreaChart, saves by platform BarChart, intent collections BarChart, and top 20 topic tags.
  - Created [`web/src/pages/Admin/CampaignsTab.jsx`](../web/src/pages/Admin/CampaignsTab.jsx) with ad spend KPIs, acquisition table, CAC calculation, "Add Campaign / Spend" modal, and iOS/Android App Store release telemetry.
  - Updated [`web/src/pages/Admin/index.jsx`](../web/src/pages/Admin/index.jsx) navigation sidebar.
- **Verification**:
  - `python backend/test_admin_analytics.py`: **PASSED** (End-to-end testing of database stats, product analytics, campaign creation, CAC calculation, and deletion).
  - `npm run build` in `/web`: **PASSED** (React production bundle compiled successfully with 0 errors).
