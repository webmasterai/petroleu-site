# Migration plan: Laravel CMS → Node/Express (React + MySQL)

## Goal

```text
React/Vite (marketing + admin UI)  [unchanged UI]
        ↓  /api/cms/*
Node/Express  (new, parallel to Laravel)
        ↓
Existing MySQL tables (same schema / data)
```

Production (target): **one** Node process serves `dist/` + `/api/*` + `/uploads` (or `/storage` symlink compatibility).

Laravel remains until Node is validated. Do not delete `backend/` yet.

## Phase 1 — Inspect (done)

- Routes: `backend/routes/api.php` → `/api/cms/*`
- Auth: Sanctum Bearer `{id}|{plain}` with SHA-256 in `personal_access_tokens`
- Passwords: bcrypt in `users.password`
- Envelope: `{ success, message, data }`
- Media: `storage/app/public/cms-media/...` URLs historically `/storage/...`
- Soft deletes on pages, sections, media, blog posts, navigation

## Phase 2 — Node server (this work)

Location: `server/`

- Reuse MySQL tables (no wipe, no new incompatible schema)
- Sanctum-compatible tokens so existing React Bearer flow works
- Same path prefixes: `/api/health`, `/api/cms/...`
- Public content + admin CRUD parity (priority order below)
- Uploads → `server/uploads/` with URL `/uploads/...` (also map legacy `/storage` if files copied)

## Phase 3 — Frontend wiring

- Keep `VITE_CMS_API_BASE_URL=/api/cms` for same-origin
- Dev: Vite proxy → Node `:3040` (toggle to Laravel `:8001` if needed)
- Prod: Express serves `dist/` + SPA fallback; no separate nginx API

## Phase 4 — Docker / Coolify

- One Dockerfile: `npm ci` (root) + `npm ci` (server) + `vite build` + `node server`
- Port `3040` (or `PORT`)
- Env: `DB_*`, `AUTH` not needed beyond existing token table, `SERVE_STATIC=true`
- Volume: `server/uploads` (+ optional copy of Laravel `storage/app/public`)

## Phase 5 — Cutover

1. Point Coolify / DNS to Node app
2. Confirm login, CMS edit, public AF/PK content
3. Then retire Laravel container

## Priority API coverage

| Priority | Area |
|----------|------|
| P0 | health, login, logout, me, dashboard |
| P0 | public hero/features/settings/nav/seo/blog/contact |
| P1 | admin pages/sections/settings/media/blog |
| P1 | markets, locales, navigation, seo, inquiries |
| P2 | users CRUD, forgot-password, signed draft preview |

## Coolify — unified Node app (target)

| Setting | Value |
|---------|--------|
| Base Directory | `/` |
| Dockerfile | `Dockerfile.node` |
| Port | `3040` |
| Domain | your website domain (one host for site + `/api` + `/admin`) |

**Runtime env:**

```text
PORT=3040
SERVE_STATIC=true
DB_HOST=<mysql host>
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
APP_URL=https://<website-domain>
UPLOAD_DIR=uploads
# Optional legacy media:
# LEGACY_STORAGE_DIR=/path/to/laravel/storage/app/public
```

**Volume:** `/app/server/uploads`

Login: `POST https://<website-domain>/api/cms/admin/login` (same origin — no CORS/405 split).

Keep Laravel running until this Node app passes validation.
