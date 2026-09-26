# Production Home CMS media + FAQ migration

Self-contained on `origin/main`. **Does not use** local `storage/data`.

## Script

`scripts/migrate-production-home-media.mjs`

## Version-controlled SOURCE

| Need | Path |
|---|---|
| 86 FAQs | `scripts/fixtures/production-home-media/faq-pk-en-PK.json` |
| Hero / Stats logo / Mobile / 9 Features bindings | `scripts/fixtures/production-home-media/section-image-bindings.json` |
| Media Library metadata | `scripts/fixtures/production-home-media/media-manifest.json` |
| Blog thumbs (4 homepage + 6 resources) | `storage-seed/blog-posts.json` |
| Feature SVG files | `public/media/features/*.svg` |
| Mobile PNG | `public/images/petroleu-mobile-real-mockup.png` |
| Blog JPGs | `public/images/blog/petroleu-*.jpg` |

## Commands

### Fresh-checkout empty simulation (no storage/ required)

```bash
node scripts/migrate-production-home-media.mjs --simulate-empty-target --dry-run
```

Expected gate:

- FAQ source count = 86
- Features = 0/9 would-migrate (9 expected)
- Hero = 0/1
- Mobile = 0/1
- Latest Resources = 0/4
- Blog resources = 0/6

### Dry-run against production data

```bash
node scripts/migrate-production-home-media.mjs --target /path/to/prod/storage/data --dry-run
```

### Apply (backup + additive writes)

```bash
node scripts/migrate-production-home-media.mjs \
  --target /path/to/prod/storage/data \
  --public-target /path/to/prod/public \
  --apply
```

## Safety

- Never overwrites a production image URL that is already set
- Never touches `users.json`, `inquiries.json`, sessions, secrets
- FAQ restore only when production has ≤4 FAQ rows vs fixture 86
- Backs up `sections.json`, `media.json`, `blog-posts.json` before write
