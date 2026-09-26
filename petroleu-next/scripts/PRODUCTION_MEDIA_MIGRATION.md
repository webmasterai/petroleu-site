# Production media migration (do not run yet)

Safe procedure to apply local image-architecture fixes to production later.

## Goals

- Add missing Media Library records and feature mockup SVG files
- Bind missing `image_url` values on feature cards (additive only)
- Copy `/resources/*` blog assets so existing blog URLs resolve
- Preserve all existing user-edited media and section content

## Do not

- Reseed CMS
- Delete production Media
- Overwrite unrelated section/blog fields
- Change URLs that already point to working assets

## Steps

1. **Backup** production `storage/data/media.json`, `sections.json`, and `blog-posts.json`.
2. **Copy static files** into the production public volume:
   - `public/media/features/*.svg`
   - `public/resources/*`
3. On a **restored snapshot** of production data (not live), run:
   ```bash
   node scripts/create-feature-mockup-media.mjs
   node scripts/import-website-images-to-media.mjs
   ```
   Both scripts only fill **missing** `image_url` / missing media rows.
4. **Diff** JSON against the backup; confirm only additive image bindings.
5. Apply the verified data + public files to production.
6. Smoke-test CMS previews and public pages; confirm broken images = 0.

This migration has **not** been executed against production.
