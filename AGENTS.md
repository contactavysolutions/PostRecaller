# PostRecaller — Agent Guidelines & Memory Protocol

This file is automatically loaded by Antigravity at the start of every session in this workspace.

---

## 1. Mandatory Memory Protocol (Cross-Session Continuity)

To maintain context and progress across multiple sessions without losing state:

1. **Session Start (Context Retrieval)**:
   - Always read [`memory/PRD.md`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/memory/PRD.md) and [`memory/SESSION_LOG.md`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/memory/SESSION_LOG.md) before planning or proposing architectural changes.
   - Respect previously established decisions and completed phases (Phase 1 core loop is finished).

2. **Session End (Memory Persistence)**:
   - Before completing a milestone or concluding a work session, **append an entry to [`memory/SESSION_LOG.md`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/memory/SESSION_LOG.md)** detailing:
     - Date and summary of work done.
     - Files modified or created.
     - Verification/testing performed.
     - Updated next backlog items.

---

## 2. Architecture & Monorepo Structure

- **Backend (`/backend`)**:
  - FastAPI modular backend (`server.py`, `auth.py`, `items.py`, `ai.py`, `scraper.py`, `waitlist.py`, `mailer.py`, `models.py`, `config.py`).
  - Database: MongoDB (Async Motor driver). All routes under `/api`.
  - AI Enrichment: Google Gemini Flash (`gemini-2.0-flash` / `gemini-1.5-flash`) via `GEMINI_API_KEY` (or `EMERGENT_LLM_KEY`).
  - Email: Resend (`mailer.py`).
- **Mobile (`/frontend`)**:
  - React Native / Expo with Expo Router.
  - Performance: `@shopify/flash-list` masonry grid, `@gorhom/bottom-sheet`, Zustand state management (`useAuthStore`, `useVaultStore`).
- **Web (`/web`)**:
  - React + Tailwind CSS (Craco) for public landing at `postrecaller.com` and web vault.

---

## 3. Design System & Tokens

Match brand styling across all platforms:
- **Background / Surface**: `#FBFBF9` (Light canvas), Dark mode supported.
- **Text / OnSurface**: `#1C1C1A`
- **Primary Brand**: Moss Green `#4A5D4E`
- **Accent**: Terracotta `#C26E5D`
- **Tag Pills**: `#E4E7E1`
- **Borders**: `#EBEBE6`
- **Typography**: Clean geometric sans. Avoid generic default colors or plain browser blues/purples.

---

## 4. Engineering Standards & Quality Gates

1. **Simplicity & YAGNI**:
   - Platform first. Standard libraries over third-party packages.
   - Never add a new npm or pip dependency without explicit confirmation.
2. **Quality & Verification**:
   - Always run verification (tests, linting, build checks) before concluding work.
   - Handle null/undefined, network timeouts, and raw-save fallbacks gracefully (a user save must never be dropped).
3. **Mobile Performance**:
   - Wrap expensive calculations in `useMemo` and callbacks in `useCallback`.
   - Use stable `keyExtractor` keys and avoid inline functions in `renderItem`.
