# Production home media migration fixtures

Version-controlled SOURCE data for `scripts/migrate-production-home-media.mjs`.

**Does not require** local `storage/data`.

| Need | Path |
|---|---|
| 86 FAQs (pk/en-PK) | `faq-pk-en-PK.json` |
| Hero / Logo / Mobile / Features bindings | `section-image-bindings.json` |
| Media Library metadata for local public assets | `media-manifest.json` |
| Blog homepage (4) + resources (6) thumbs | `storage-seed/blog-posts.json` |
| Feature SVG files | `public/media/features/*.svg` |
| Mobile mockup | `public/images/petroleu-mobile-real-mockup.png` |
| Blog JPGs | `public/images/blog/petroleu-*.jpg` |

Hero/logo remote URLs are encoded in `section-image-bindings.json`.
