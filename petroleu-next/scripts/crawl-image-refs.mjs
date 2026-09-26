/**
 * Local broken-image crawl for CMS section + blog image_url refs.
 *   node scripts/crawl-image-refs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const media = JSON.parse(fs.readFileSync(path.join(root, 'storage/data/media.json'), 'utf8'))
const sections = JSON.parse(fs.readFileSync(path.join(root, 'storage/data/sections.json'), 'utf8'))
const blog = JSON.parse(fs.readFileSync(path.join(root, 'storage/data/blog-posts.json'), 'utf8'))
const mediaUrls = new Set(media.map((m) => m.url))

function resolveLocal(url) {
  if (!url || String(url).startsWith('http')) return { ok: true, remote: true }
  const rel = String(url).replace(/^\//, '').replace(/\//g, path.sep)
  const candidates = [
    path.join(root, 'public', rel),
    path.join(root, 'storage', 'uploads', path.basename(url)),
  ]
  if (String(url).startsWith('/uploads/')) {
    candidates.push(path.join(root, 'storage', 'uploads', String(url).replace(/^\/uploads\//, '')))
  }
  return { ok: candidates.some((p) => fs.existsSync(p)), remote: false }
}

const broken = []
const missingMedia = []
let checked = 0

function check(url, label) {
  if (!url) return
  checked += 1
  const r = resolveLocal(url)
  if (!r.ok) broken.push({ url, label })
  if (!r.remote && !mediaUrls.has(url)) missingMedia.push({ url, label })
}

for (const row of sections) {
  if (row.image_url) check(row.image_url, `${row.page_slug} → ${row.section_key}${row.title ? ` → ${row.title}` : ''}`)
}
for (const post of blog) {
  const url = post.image_url || post.og_image
  if (url) check(url, `Blog → ${post.slug || post.id}`)
}

const homePk = sections.filter(
  (r) =>
    r.page_slug === 'home' &&
    r.section_key === 'feature:card' &&
    r.market_code === 'pk' &&
    r.locale_code === 'en-PK',
)

console.log(
  JSON.stringify(
    {
      checkedRefs: checked,
      uniqueUrls: new Set([...sections.map((r) => r.image_url), ...blog.map((p) => p.image_url || p.og_image)].filter(Boolean)).size,
      broken: broken.length,
      brokenSamples: broken.slice(0, 10),
      missingFromMediaLibrary: missingMedia.length,
      missingMediaSamples: missingMedia.slice(0, 10),
      homeFeaturesLinked: `${homePk.filter((r) => r.image_url).length}/${homePk.length}`,
      mediaTotal: media.length,
    },
    null,
    2,
  ),
)
