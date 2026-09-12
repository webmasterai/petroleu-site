# Petroleu Marketing Site + CMS

Public-facing Petroleu marketing website (React + Vite) with a dedicated Laravel CMS backend.

## Architecture

| Layer | Path |
|-------|------|
| Frontend | this directory (`src/`) |
| CMS API | `backend/` (Laravel 12 + Sanctum + SQLite/MySQL) |

## Production (Coolify / Docker)

Separate containers for the Vite/React frontend and **this repo’s** Laravel CMS API.  
Domains are configured only via Coolify env (`VITE_CMS_API_BASE_URL`, `APP_URL`, `FRONTEND_URL`).  
This project does **not** deploy or call the original Petroleu product stack.  
See **[docs/COOLIFY.md](docs/COOLIFY.md)**.

## Frontend setup

```bash
npm install
cp .env.example .env
npm run dev
```

Dev proxy: `/api` → `http://127.0.0.1:8001`

## CMS backend setup

```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Create first admin (password from env or prompt — never commit credentials)
# PowerShell:
$env:CMS_ADMIN_EMAIL="you@example.com"
$env:CMS_ADMIN_PASSWORD="your-long-password"
php artisan cms:create-admin

php artisan serve --host=127.0.0.1 --port=8001
```

Admin UI: http://localhost:5173/admin/login  
API health: http://127.0.0.1:8001/api/health

## Markets

- Pakistan: `market=pk`, `locale=en-PK` (published seed content)
- Afghanistan foundation: `/af`, `/af/ps`, `/af/en` — CMS-ready, content unpublished / noindex

## Scripts

- `npm run dev` — Vite
- `npm run build` — production frontend
- `npm run lint` — ESLint
- `cd backend && php artisan test` — CMS API tests
