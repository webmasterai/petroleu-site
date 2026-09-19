# Petroleu Next.js (JSON CMS)

Unified marketing site + `/admin` CMS. Data lives in `storage/data/*.json` (no MySQL/Laravel/Express).

## Local

```bash
npm install
npm run cms:seed          # writes storage-seed/ (and copy to storage/data once)
npm run cms:create-admin  # optional reset admin
npm run dev
```

Default admin (auto-created when `users.json` is empty):
`admin@petroleu.local` / `PetroleuAdmin123!`

Override in production with:
`CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, `CMS_ADMIN_NAME`

## Production (Coolify)

- Dockerfile: `Dockerfile`
- Port: `3000`
- Persistent volume: `/app/storage`
- Env: `NODE_ENV=production`, `PORT=3000`, `NEXT_PUBLIC_SITE_URL=https://your-domain`, `CMS_AUTH_SECRET=<long-random>`
- Optional: `CMS_ADMIN_EMAIL` / `CMS_ADMIN_PASSWORD` (used only when no users exist yet)
- Set `CMS_COOKIE_SECURE=true` on HTTPS
- Set `NODE_ENV=production` as **runtime only** (uncheck “Available at Buildtime”). Coolify injecting it during `npm ci` used to skip `typescript` and break `@/` imports; the Dockerfile now uses `npm ci --include=dev` as a safeguard.
