# Coolify deployment — domain-agnostic

This repository is a **standalone marketing website + its own Laravel CMS**.
It is **not** the original Petroleu product deployment and must not call that product’s APIs.

Configure all public hostnames in Coolify. Do not hardcode production domains in Docker/CORS.

## Architecture

```text
Browser
   │
   ├─ https://<NEW-WEBSITE-DOMAIN>     → Frontend resource (React/Vite → nginx :80)
   │                                         VITE_CMS_API_BASE_URL baked at build
   │
   └─ https://<NEW-CMS-DOMAIN>         → CMS backend resource (Laravel :8000)
                                              APP_URL / FRONTEND_URL / CORS_*
                                              │
                                              ▼
                                         MySQL (Coolify)
                                              │
                                         Volume: /var/www/html/storage/app/public
```

CMS login (production):

`POST https://<NEW-CMS-DOMAIN>/api/cms/admin/login`

Never post login to the **website** domain (`https://<NEW-WEBSITE-DOMAIN>/api/...`) — that caused HTTP 405 on static hosting.

---

## Coolify resource A — Frontend (marketing site)

| Setting | Value |
|---------|--------|
| Role | Public marketing + CMS admin UI |
| Base Directory | `/` (repository root) |
| Build Pack | Dockerfile |
| Dockerfile | `Dockerfile` |
| Port | `80` |
| Domain | `https://<NEW-WEBSITE-DOMAIN>` |

**Build-time variable (required — only CMS URL the frontend needs):**

```text
VITE_CMS_API_BASE_URL=https://<CMS-BACKEND-DOMAIN>/api/cms
```

Must be an absolute `http://` or `https://` URL. No hardcoded domain in the repo. Changing it requires a **frontend rebuild**.

Do not reverse-proxy `/api` on this resource. Local Vite still proxies `/api` → `127.0.0.1:8001` for development only.

---

## Coolify resource B — CMS backend (Laravel)

| Setting | Value |
|---------|--------|
| Role | CMS API + media for **this** website only |
| Base Directory | `/backend` |
| Build Pack | Dockerfile |
| Dockerfile | `Dockerfile` |
| Port | `8000` |
| Domain | `https://<NEW-CMS-DOMAIN>` |
| Healthcheck | `GET /api/health` or `GET /up` |

### Runtime environment variables

```text
APP_NAME=Website CMS
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:PASTE_STABLE_KEY_HERE
APP_URL=https://<NEW-CMS-DOMAIN>

FRONTEND_URL=https://<NEW-WEBSITE-DOMAIN>
CORS_ALLOWED_ORIGINS=
# Optional extras, comma-separated, e.g. https://www.<NEW-WEBSITE-DOMAIN>

DB_CONNECTION=mysql
DB_HOST=<Coolify MySQL internal hostname>
DB_PORT=3306
DB_DATABASE=<database name>
DB_USERNAME=<username>
DB_PASSWORD=<password>

FILESYSTEM_DISK=public
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_CHANNEL=stack
LOG_LEVEL=error

SANCTUM_STATEFUL_DOMAINS=<NEW-WEBSITE-DOMAIN>,www.<NEW-WEBSITE-DOMAIN>
```

Generate `APP_KEY` once and keep it stable. Do not regenerate on every deploy.

CORS allows only `FRONTEND_URL` plus any entries in `CORS_ALLOWED_ORIGINS`.

### Persistent storage (CMS media)

| Coolify volume | Container path |
|----------------|----------------|
| CMS uploads | `/var/www/html/storage/app/public` |

Media URLs use `{APP_URL}/storage/...`.

---

## MySQL / DB_HOST

Use the Coolify database resource **internal hostname** (service/container name), not `127.0.0.1` and not your public website/CMS domains.

---

## One-time manual commands (first deploy only)

```bash
php artisan migrate --force
# optional: php artisan db:seed --force
php artisan cms:create-admin
```

Entrypoint does **not** run seed / create-admin / key:generate.

---

## Local development

- Frontend: `npm run dev` — Vite proxies `/api` → `http://127.0.0.1:8001`
- Backend: `cd backend && php artisan serve --port=8001`
- Local `.env`: `VITE_CMS_API_BASE_URL=/api/cms`
