# Petroleu Next.js (JSON CMS)

Unified marketing site + `/admin` CMS. Data lives in `storage/data/*.json` (no MySQL/Laravel/Express).

## Local

```bash
npm install
npm run cms:seed          # writes storage-seed/ (and copy to storage/data once)
npm run cms:create-admin  # optional reset admin
npm run dev
```

Default admin (from seed): `admin@petroleu.local` / `PetroleuAdmin123!`

## Production (Coolify)

- Dockerfile: `Dockerfile`
- Port: `3000`
- Persistent volume: `/app/storage`
- Env: `NODE_ENV=production`, `PORT=3000`, `NEXT_PUBLIC_SITE_URL=https://your-domain`, `CMS_AUTH_SECRET=<long-random>`
- Set `NODE_ENV=production` as **runtime only** (uncheck “Available at Buildtime”). Coolify injecting it during `npm ci` used to skip `typescript` and break `@/` imports; the Dockerfile now uses `npm ci --include=dev` as a safeguard.
