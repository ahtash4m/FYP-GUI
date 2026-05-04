# Acne Classification — FYP GUI

React + TypeScript + Vite + Tailwind + shadcn-style UI for the COMSATS acne classification project. Data layer uses **mock implementations** by default; flip one env flag to point at your Flask `/api` routes when they exist.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

## Setup

```bash
cd D:\FYP-GUI
npm install
```

Copy environment defaults:

```bash
copy .env.example .env
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (default `http://localhost:5173`) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Mock vs real API

- `VITE_USE_MOCK_API=true` (default): all feature modules return in-memory / fixture data. Auth accepts any password; use **Admin demo** or an email containing `admin` for the admin console.
- `VITE_USE_MOCK_API=false`: the app calls same-origin **`/api/...`** paths. In dev, Vite proxies `/api` to `VITE_API_PROXY_TARGET` (see `vite.config.ts`).

Add matching Flask routes later (examples are in `src/features/**` and `src/lib/api/client.ts`).

## shadcn/ui

UI primitives live under `src/components/ui`. To regenerate or add official components with the CLI (after `npm install`):

```bash
npx shadcn@latest add sidebar
```

`components.json` is already configured for this project.

## Project layout

- `src/features/*` — domain API wrappers (mock + real).
- `src/lib/api` — HTTP client and env flags.
- `src/mocks/fixtures.ts` — demo tables / chart data.
- `src/pages` — route screens aligned with your mockups.
- `src/types/api.ts` — DTOs shared with future backend contracts.
