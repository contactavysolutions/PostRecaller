# PostRecaller — PRD & Build Log

> Note: the app was renamed from "Glean" to **PostRecaller** (Glean was taken by other companies).
> The original design doc below still references "Glean"; treat all such mentions as PostRecaller.

## Original Problem Statement
Build "Glean" — an AI-powered universal content vault. Users save posts from Instagram, TikTok,
YouTube, X, Reddit, LinkedIn, Pinterest, articles — anything with a URL — into one beautiful,
searchable place. AI auto-enriches every save with a summary, tags, and intent. When AI can't read
the content, Glean asks for a one-line note instead of failing. Everything is retrievable via
natural-language search. Tagline: "Everything you save, finally findable."
Platforms: Web (PWA), Android, iOS. One Expo codebase; FastAPI + MongoDB backend.
Admin email: contactavysolutions@gmail.com.

## Architecture
- **Backend (modular):** `server.py` (thin router + startup indexes/admin seed), `config.py` (env,
  Mongo client, constants), `models.py` (PyObjectId/BaseDocument + User/Item), `auth.py`
  (bcrypt + JWT + HTTPBearer), `scraper.py` (6-stage chain), `ai.py` (Gemini enrichment + ai_usage
  cost logging), `items.py` (item CRUD + collections). All routes under `/api`.
- **Frontend:** Expo Router file-based routing; zustand stores (`auth`, `vault`); theme system with
  light/dark tokens; `@shopify/flash-list` masonry; `@gorhom/bottom-sheet` (native) + RN Modal (web);
  `react-native-keyboard-controller`; Phosphor icons; expo-image; expo-blur glass.
- **DB models:** users, items (indexes: items(user_id,created_at), items(slug) unique-sparse,
  users(email) unique, users(created_at), ai_usage(created_at), debug_logs TTL 7d).
- **Integrations:** JWT+bcrypt auth (per playbook). Gemini 3 Flash enrichment via emergentintegrations
  + Emergent LLM key.

## User Personas
- **The Saver** — collects links across platforms, wants them findable later.
- **The Researcher** — saves articles/videos to learn, organizes by intent.
- **Admin** — monitors signups, usage, AI cost, revenue, health.

## Core Requirements (static)
Save any URL → 6-stage enrichment (never lose a save) → masonry vault → intent collections →
semantic search → freemium (5 AI/day free, Pro unlimited) → shareable public cards → admin dashboard.

## Implemented (grows over time)
### Phase 1 — Core loop  ✅ (2026-07-28)
- Auth: register / login (JSON JWT+bcrypt) / GET me / DELETE me (account deletion cascades items).
- Legal pages: Privacy Policy + Terms of Service.
- Save URL → scraper stages 1–4 (OpenGraph/meta, Reddit OAuth, oEmbed, Jina Reader) → Gemini 3 Flash
  enrichment → {title, summary, intent, tags[3–6], author, thumbnail}. Raw-save fallback so a save is
  never lost. Duplicate URL detection. 200 saves/day abuse cap.
- Vault Home: glass sticky header (search + avatar), horizontal tag rail filter, Pinterest masonry
  (skeletons, pull-to-refresh, cursor pagination, platform badges, tag pills).
- Add half-sheet: clipboard detect, "AI is reading…" state, enriched result / duplicate / error.
- Item Detail: hero + gradient scrim, AI summary, editable title/summary/tags/intent/notes,
  retry-enrich, Open Link, Share, delete.
- Collections: 5 intent buckets w/ counts (single aggregation) → filtered grid.
- Profile: daily AI usage ring, plan badge, logout, delete-account confirm, legal links.
- Simple client-side search (semantic upgrade deferred to P2).
- ai_usage cost logging on every LLM call.
- **Exit criteria met:** YouTube + Instagram + article links produce real enriched summaries in tiles.
- **Verified:** backend 8/8 pytest pass; frontend flows verified on web preview.

### Rename + Email/Auth iteration ✅ (2026-07-28)
- Renamed app "Glean" → **PostRecaller** (name/slug/UI/backend/legal/docs; bundle IDs unchanged).
- Welcome email on signup (fire-and-forget, never blocks registration).
- Forgot Password: 6-digit code emailed → `/api/auth/forgot-password` (no user enumeration) +
  `/api/auth/reset-password` (15-min expiry, single-use, 5-attempt cap). New `mailer.py` (Resend).
- Frontend: "Forgot password?" link on login + two-step `/forgot-password` screen; new on-brand hero image.
- Email via Resend using `RESEND_API_KEY` (Emergent-managed; empty in preview → mailer logs the code,
  real delivery activates once the key is populated). Sender defaults to onboarding@resend.dev until a
  domain is verified.
- **Verified:** backend 14/14 pytest pass; forgot/reset UI flow verified on web preview.

## Prioritized Backlog
### P2 — Search & tags
- Embeddings at save-time (store vector), cosine similarity + LLM re-rank top-20 semantic search.
- Personal text notes (POST /api/notes) with AI tagging.
- URL canonicalization for smarter duplicate detection (strip utm_*, trailing slash).

### P3 — Monetization
- Server-side quota enforcement (6th enrichment → raw save + quota_exceeded payload).
- Paywall screen, Stripe Checkout + webhook (emergentintegrations), billing status.

### P4 — Native & share
- expo-share-intent (Android + iOS Share Extension), caption stage 5, Gemini Vision stage 6, haptics polish.

### P5 — Admin & cards
- Admin dashboard (signups/usage/AI cost/revenue/health via single aggregation pipelines).
- Public share cards (slug + OG card), landing page + live gallery, debug console.

### P6 — Web/PWA & polish
- manifest.json PWA, Get-the-App banner, onboarding tour, richer empty states.

## Next Tasks
1. P2: embeddings + semantic search + notes.
2. (Optional) Reddit OAuth creds in .env to enable Reddit enrichment.

## Known Notes
- Reddit enrichment requires REDDIT_CLIENT_ID/SECRET (currently blank → falls back gracefully).
- Push notifications / native-only features require a build (not testable in Expo Go / web).
