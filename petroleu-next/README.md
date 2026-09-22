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
- Optional one-shot: `CMS_FORCE_RESEED=true` then redeploy, then set back to `false` (refreshes content from storage-seed, keeps users)
- **Preferred content sync (safe):** `CMS_MERGE_SEED_ADDITIVE=true` (runtime only) → redeploy once.
  - Backs up `/app/storage/data` → `/app/storage/backups/data-before-content-sync-…`
  - Inserts **missing** pages/sections/navigation/seo/blog/settings from image `storage-seed`
  - Does **not** overwrite existing rows
  - Never touches `users.json`, `inquiries.json`, or uploads
  - Writes marker `/app/storage/backups/.merge-seed-additive-done` so it does not re-run
  - Then **unset** `CMS_MERGE_SEED_ADDITIVE` (or set false). To re-run later: set `CMS_MERGE_SEED_ADDITIVE_FORCE=true` once (or delete the marker).
- Set `CMS_FORCE_RESEED` as **runtime only** (uncheck Coolify “Available at Buildtime”). If it is on during `next build`, parallel page generation can corrupt JSON.
- Set `CMS_COOKIE_SECURE=true` on HTTPS
- Set `NODE_ENV=production` as **runtime only** (uncheck “Available at Buildtime”). Coolify injecting it during `npm ci` used to skip `typescript` and break `@/` imports; the Dockerfile now uses `npm ci --include=dev` as a safeguard.
