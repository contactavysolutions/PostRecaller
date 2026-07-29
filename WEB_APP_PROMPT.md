# WEB_APP_PROMPT.md

Paste the prompt below as the **first message** in a new Emergent **Full Stack App**
(web) project, AFTER you've imported this repository via **Pull from GitHub**.

Prerequisites:
1. In the mobile project, click **Save to GitHub** (push this repo).
2. Create a new **Full Stack App** project → **Pull from GitHub** → select this repo.
3. Paste the prompt below.
4. See `MIGRATION.md` for architecture, the full `/api` contract, and env/secrets.

---

## Prompt to paste

```
Build "PostRecaller" — a WEB app — on top of the existing code I imported from GitHub.
Reuse the code; do NOT rebuild the backend.

REUSE AS-IS (do not rewrite):
- The entire FastAPI backend in `backend/` (server.py, auth.py, items.py, ai.py,
  scraper.py, waitlist.py, mailer.py, models.py, config.py). All routes are under /api.
- Read MIGRATION.md in the repo root — it documents the full /api contract, env vars,
  and which frontend files carry over.

BUILD a modern, responsive WEB frontend (React) that consumes the same /api endpoints:
- Public landing = the /waitlist page (hero with the treasure-chest artwork at
  frontend/assets/images/auth_hero.png, waitlist email capture with live count +
  success state, features, how-it-works, footer). Make this the web root "/".
- Auth: login / register / forgot-password (6-digit code) / reset-password.
  Reuse the treasure-chest hero artwork on the login screen.
- Vault: Pinterest-style masonry grid of saved items with tag-rail filtering,
  add-link flow (paste URL -> AI enrich), pull-to-refresh/pagination.
- Item detail: hero, AI summary, editable tags/intent/notes, open link, delete.
- Collections (intent buckets) and Profile (usage ring, logout, delete account).
- Legal: /privacy and /terms (reuse copy from the repo).

DESIGN — match the existing brand exactly (reuse frontend/src/theme tokens):
- "iOS-native clean", NO purple/indigo. Colors: surface #FBFBF9, onSurface #1C1C1A,
  brand Moss Green #4A5D4E, terracotta #C26E5D, tag pills #E4E7E1, border #EBEBE6.
- Both light and dark mode. Geometric sans (not Inter/Roboto). Add SEO + OG/Twitter
  meta for shareable link previews (title/description/image already defined in
  frontend/app/+html.tsx as a reference).

ENV / SECRETS to set (values from my mobile project's backend/.env):
JWT_SECRET, ACCESS_TOKEN_EXPIRE_DAYS=30, ADMIN_EMAILS=contactavysolutions@gmail.com,
EMERGENT_LLM_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL="PostRecaller <noreply@support.postrecaller.com>",
REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET. (If I want web + mobile to share one database,
set MONGO_URL/DB_NAME to the same DB as the mobile app.)

GOAL: launch the public PostRecaller site + waitlist on my custom domain postrecaller.com,
reusing the backend so signups/users/items are unified with the mobile app.
```

---

## After the web app is built
1. **Publish/Deploy** the web app.
2. In the deployment panel, add custom domain **postrecaller.com** (and `www`) and add
   the DNS records it shows you at **Porkbun**, then verify.
3. Email **support@emergent.sh** with your job ID for exact custom-domain records or to
   unify the MongoDB database across the mobile + web projects.
