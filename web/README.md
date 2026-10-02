# PostRecaller — Web Application

The responsive web client for PostRecaller, accessible at [https://postrecaller.com](https://postrecaller.com). Built with **React 19**, **TailwindCSS**, **Radix UI**, and **Craco**.

---

## Features

- **Public Landing & Waitlist (`/`)**: High-converting hero presentation, feature showcase, live waitlist counter, and instant invite redemption.
- **Authentication**: JWT token management stored in `localStorage`, 6-digit email password reset flow, and invite verification.
- **The Vault (`/vault`)**:
  - Filterable by collection buckets: *Read Later*, *Try Recipe*, *Watch*, *Shop*, *Learn*.
  - Full-text instant search across titles, summaries, and tags.
  - Multi-platform badge identification (Instagram, TikTok, YouTube, Reddit, X, Web).
  - Manual link adder with real-time AI enrichment status.
  - Drag-and-drop Universal Archive & Netscape Bookmark Importer modal.
- **Admin Analytics Dashboard (`/admin`)**:
  - Live charts powered by Recharts (DAU, Saves/day, AI Token Spend, Storage).
  - User management table with quick suspend/restore/delete actions.
  - Waitlist manager with 1-click invite email trigger via Resend.
  - Email campaign composer with delivery tracking.

---

## Design System & Typography

- **Fonts**: Satoshi (via Fontshare) primary body with Plus Jakarta Sans fallback.
- **Palette**: Harmonious deep obsidian and sage green tokens (`#0f1110`, `#1a201c`, `#4A5D4E`, `#D4AF37`).
- **Components**: Built on unstyled accessible Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.) and styled with TailwindCSS utility classes.

---

## Development & Build

```bash
# Install dependencies with peer resolution flag
npm install --legacy-peer-deps

# Start development server on port 3000
npm start

# Build production bundle to build/
npm run build
```

---

## API Configuration

The web application communicates with the backend via [`src/lib/api.js`](file:///c:/Users/sandy/Antigravity%20Projects/PostRecaller/web/src/lib/api.js):
- In production on Vercel, requests use relative `/api` paths directly to the same host (zero CORS overhead).
- In local development, set `REACT_APP_BACKEND_URL=http://localhost:8000` to point to a local FastAPI server.
