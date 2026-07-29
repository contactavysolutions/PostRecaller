# PostRecaller — Migration & Reuse Guide (Web + iOS + Android)

Goal: reuse this existing codebase to ship **(1) a public Web App on `postrecaller.com`**
and **(2) native iOS + Android apps**, without rebuilding from scratch.

The heavy lifting — the **FastAPI + MongoDB backend and all business logic** — is 100%
reusable across web and mobile. Only the frontend presentation layer differs.

---

## 1. Recommended architecture

```
                ┌───────────────────────────────────────────┐
                │  SHARED BACKEND  (FastAPI + MongoDB)        │
                │  reuse AS-IS from this repo                 │
                │  auth · items · AI enrich · waitlist · email│
                └───────────────┬─────────────────────────────┘
                                │  same /api/* contract
             ┌──────────────────┴───────────────────┐
   ┌──────────────────────┐              ┌──────────────────────────┐
   │ MOBILE  (this project)│              │ WEB  (new Full Stack App) │
   │ Expo → iOS + Android  │              │ served on postrecaller.com│
   └──────────────────────┘              └──────────────────────────┘
```

Two Emergent projects, one backend contract. Keep this project as the **mobile** home;
create a **new Full Stack App** project for the **web** site and point it at the same
backend logic (copied from this repo).

---

## 2. Reuse path (no rebuild)

1. **Save this project to GitHub** using the workspace's **"Save to GitHub"** button.
   This repo becomes the single source of truth.
2. **Mobile (this project):** Deploy → **Publish**, then generate **Android** (.APK/.AAB)
   and **iOS** (via Apple Developer → TestFlight) builds.
3. **Web (new project):** create a **Full Stack App** project and **Pull from GitHub**
   (the repo from step 1). Reuse `/app/backend` verbatim; adapt the frontend (see §4).
4. **Attach `postrecaller.com`** to the WEB deployment (custom domains apply to web,
   not mobile) and add the DNS records shown in the web deploy panel at Porkbun.
5. Point both apps at the **same backend/database** so users, waitlist, and saved
   items are shared regardless of platform.

---

## 3. Backend — reuse AS-IS (already web + mobile ready)

Location: `/app/backend/` (modular; `server.py` is a thin router).

| File          | Responsibility                                             |
|---------------|------------------------------------------------------------|
| `server.py`   | App factory, CORS (open), router include, startup indexes  |
| `config.py`   | Env loading, Mongo client, constants                       |
| `models.py`   | Pydantic models + `PyObjectId`/`BaseDocument`              |
| `auth.py`     | bcrypt + JWT, `/api/auth/*`, forgot/reset, admin seed      |
| `scraper.py`  | 6-stage enrichment chain (og/meta, Reddit, oEmbed, Jina)   |
| `ai.py`       | Gemini 3 Flash enrichment + `ai_usage` cost logging        |
| `items.py`    | `/api/items` CRUD, collections                             |
| `waitlist.py` | `/api/waitlist` capture + count                            |
| `mailer.py`   | Resend transactional email (welcome / reset / waitlist)    |

Nothing here is mobile-specific. CORS is already `*`, so a web frontend can call it
directly.

### API contract (both clients use these)
```
POST   /api/auth/register            {email,password}
POST   /api/auth/login               {email,password} -> {access_token,user}
GET    /api/auth/me                  (Bearer)
DELETE /api/auth/me                  (Bearer) account deletion
POST   /api/auth/forgot-password     {email} -> emails 6-digit code
POST   /api/auth/reset-password      {email,code,new_password}
POST   /api/items                    {url} -> scrape+enrich, dup detect
GET    /api/items                    ?cursor&tag&intent&limit  (masonry, paginated)
GET|PATCH|DELETE /api/items/{id}
POST   /api/items/{id}/enrich        retry enrichment
GET    /api/collections              intent buckets + counts
POST   /api/waitlist                 {email,source} -> {position,count}
GET    /api/waitlist/count           -> {count}
```

### Env / secrets checklist (set in the WEB project too)
```
MONGO_URL, DB_NAME            # provided per project
JWT_SECRET                    # generate fresh per project
ACCESS_TOKEN_EXPIRE_DAYS=30
ADMIN_EMAILS=contactavysolutions@gmail.com
EMERGENT_LLM_KEY              # Emergent universal key (Gemini enrichment)
RESEND_API_KEY                # your Resend key
RESEND_FROM_EMAIL=PostRecaller <noreply@support.postrecaller.com>
REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET   # optional
```
> If web + mobile should share ONE database, point both projects' `MONGO_URL`/`DB_NAME`
> at the same MongoDB (ask support for the best way to share a managed DB across projects).

---

## 4. Frontend — what carries over vs. what to adapt

This is an Expo (React Native Web) app, so much of the UI already renders on web
(the `/waitlist` landing was verified on desktop + mobile browsers). For a polished
**web** product, the new Full Stack App can either:
- **Option A (fastest):** keep the Expo web build and just deploy it to the web project
  + custom domain. Screens are already responsive.
- **Option B (native web app):** rebuild the UI in a web framework (e.g. React/Vite or
  Next.js) consuming the same `/api` contract. Recommended if you want SEO/SSR for the
  public landing + shareable cards.

### Directly reusable frontend assets
- `src/lib/api.ts` — typed API client (swap storage impl for web `localStorage`).
- `src/theme/*` — full color/spacing/type design system (brand tokens).
- `app/waitlist.tsx` — the landing page (hero, product mock, waitlist form, sections).
- `app/legal/privacy.tsx`, `app/legal/terms.tsx` — legal copy.
- Auth, vault masonry, item detail, collections screens — logic/layout reference.

### Web-specific notes
- Token storage: on web use `localStorage`/cookies instead of secure store.
- SEO/link previews: OG/Twitter meta already added in `app/+html.tsx`.
- The `/waitlist` route is public (no auth gate) — ideal as the web root `/` landing.

---

## 5. Custom domain (`postrecaller.com`) — WEB only

1. Deploy the WEB project (Publish).
2. In the web deployment panel, open the **custom domain / secrets** section and add
   `postrecaller.com` (and/or `www`).
3. Add the DNS records it shows you at **Porkbun** (typically an A/ALIAS/CNAME to the
   deployment target, plus any verification TXT).
4. Wait for propagation, then verify.
> Custom domains do **not** apply to mobile builds — those ship to devices via Expo Go
> QR / App Store / Play Store.

---

## 6. Email (already on your domain ✅)

Resend is verified for `support.postrecaller.com`; the app sends from
`noreply@support.postrecaller.com`. Reuse the same `RESEND_API_KEY` and
`RESEND_FROM_EMAIL` in the web project — no changes needed.

---

## 7. End-to-end sequence for you

1. Save this project to GitHub.
2. Publish this (mobile) project → generate Android + iOS builds.
3. New Full Stack App project → Pull from GitHub → keep `/app/backend`, adapt frontend.
4. Set the env/secrets from §3 (share DB if you want unified data).
5. Deploy web → attach `postrecaller.com` (§5).
6. Point both apps at the same backend → launch waitlist on `postrecaller.com`.

Questions on cross-project DB sharing / credits: support@emergent.sh (include your job ID).
