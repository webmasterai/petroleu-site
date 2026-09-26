/**
 * Import remaining website images into Media Library and fix broken blog /resources paths.
 * Additive only — never overwrites existing image_url when already set (except remapping
 * broken /resources/* URLs to working /resources/* copies of existing assets).
 *
 *   node scripts/import-website-images-to-media.mjs [--dry-run]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

const mediaPath = path.join(root, 'storage', 'data', 'media.json')
const sectionsPath = path.join(root, 'storage', 'data', 'sections.json')
const blogPath = path.join(root, 'storage', 'data', 'blog-posts.json')
const publicDir = path.join(root, 'public')

const FEATURE_TYPES = [
  'stock-dip',
  'reporting-dashboard',
  'cash-credit',
  'sales-billing',
  'remote-visibility',
  'fuel-inventory',
  'staff-shift',
  'lube-inventory',
  'cloud-access',
]

/** Map CMS /resources/*.jpg → existing on-disk asset (reuse exact files / closest existing). */
const RESOURCES_MAP = {
  'cloud-petrol-software.jpg': 'blog/cloud-petrol-software.jpg',
  'credit-customer-billing.jpg': 'blog/customer-credit.jpg',
  'daily-closing.jpg': 'blog/daily-reports.jpg',
  'tank-dipping-gain-loss.jpg': 'blog/tank-dipping.jpg',
  'dispenser-integration.jpg': 'fuel-inventory-tablet.png',
  'atg-tank-monitoring.jpg': 'blog/tank-dipping.jpg',
  'ai-reporting.jpg': 'fuel-profit-analysis.png',
  'whatsapp-invoices.jpg': 'collaborative-workspace.png',
  'multi-station-management.jpg': 'diverse-group.png',
}

/** Additional public marketing assets to register if missing from Media. */
const REGISTER_PATHS = [
  'petroleu-logo.png',
  'og-image.png',
  'images/petroleu-mobile-real-mockup.png',
  'images/blog/petroleu-cash-receivables.jpg',
  'images/blog/petroleu-daily-performance.jpg',
  'images/blog/petroleu-dashboard-overview.jpg',
  'images/blog/petroleu-sales-summary.jpg',
  'images/blog/petroleu-stock-summary.jpg',
  'images/blog/petroleu-tank-stock-levels.jpg',
  'blog/cloud-petrol-software.jpg',
  'blog/customer-credit.jpg',
  'blog/daily-reports.jpg',
  'blog/fuel-theft.jpg',
  'blog/mobile-app-fuel-station.jpg',
  'blog/tank-dipping.jpg',
  'logos/bp.png',
  'logos/chevron.png',
  'logos/exxonmobil.png',
  'logos/shell.png',
  'logos/total.png',
  'collaborative-workspace.png',
  'confident-professional.png',
  'diverse-group.png',
  'fuel-inventory-tablet.png',
  'fuel-profit-analysis.png',
  'fuel-station-analytics.png',
]

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'))
const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'))
const blogPosts = JSON.parse(fs.readFileSync(blogPath, 'utf8'))
let nextId = media.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1

const stats = {
  mediaAdded: 0,
  resourcesCopied: 0,
  blogUrlsFixed: 0,
  featuresPageLinked: 0,
  cityFeaturesLinked: 0,
}

function findMediaByUrl(url) {
  // Match authoritative URL only — source_public_path may differ from served url (/uploads vs /images).
  return media.find((m) => m.url === url || m.source_key === `public:${url}`)
}

function ensureMediaFromPublic(relPath, opts = {}) {
  const abs = path.join(publicDir, relPath)
  if (!fs.existsSync(abs)) return null
  const url = `/${relPath.replace(/\\/g, '/')}`
  let row = findMediaByUrl(url)
  if (row) return row
  const filename = path.basename(relPath)
  const stat = fs.statSync(abs)
  row = {
    id: nextId++,
    url,
    path: filename,
    filename,
    mime_type: mimeFor(filename),
    size: stat.size,
    width: opts.width || null,
    height: opts.height || null,
    alt_text: opts.alt || filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    caption: opts.caption || 'Imported from public website assets',
    title: opts.title || filename,
    poster_url: null,
    market_code: 'pk',
    source_key: opts.source_key || `public:${url}`,
    source_public_path: url,
    created_at: new Date().toISOString(),
  }
  if (!dryRun) media.push(row)
  else media.push(row)
  stats.mediaAdded += 1
  return row
}

// 1) Copy /resources assets from existing files
const resourcesDir = path.join(publicDir, 'resources')
if (!dryRun) fs.mkdirSync(resourcesDir, { recursive: true })

for (const [destName, srcRel] of Object.entries(RESOURCES_MAP)) {
  const srcAbs = path.join(publicDir, srcRel)
  const destAbs = path.join(resourcesDir, destName)
  const destUrl = `/resources/${destName}`
  if (!fs.existsSync(srcAbs)) {
    console.warn('Missing source for resource:', srcRel)
    continue
  }
  if (!dryRun && !fs.existsSync(destAbs)) {
    fs.copyFileSync(srcAbs, destAbs)
    stats.resourcesCopied += 1
  } else if (!fs.existsSync(destAbs)) {
    stats.resourcesCopied += 1
  }
  ensureMediaFromPublic(`resources/${destName}`, {
    title: `Blog resource · ${destName}`,
    source_key: `resource:${destName}`,
  })
}

// 2) Register remaining public marketing images
for (const rel of REGISTER_PATHS) {
  ensureMediaFromPublic(rel)
}

// 3) Bind feature:card on features page + city pages (same index → type URL as home)
const typeToUrl = {}
for (const type of FEATURE_TYPES) {
  const url = `/media/features/feature-mockup-${type}.svg`
  typeToUrl[type] = url
  ensureMediaFromPublic(`media/features/feature-mockup-${type}.svg`, {
    title: `Feature · ${type}`,
    source_key: `feature-mockup:${type}`,
    width: 230,
    height: 150,
  })
}

function linkFeatureCards(pageFilter, counterKey) {
  const byLocale = new Map()
  for (const row of sections) {
    if (row.section_key !== 'feature:card') continue
    if (!pageFilter(row.page_slug)) continue
    const key = `${row.page_slug}|${row.market_code}|${row.locale_code}`
    if (!byLocale.has(key)) byLocale.set(key, [])
    byLocale.get(key).push(row)
  }
  for (const [, list] of byLocale) {
    list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    list.forEach((row, index) => {
      if (index >= FEATURE_TYPES.length) return
      if (row.image_url) return
      const type = FEATURE_TYPES[index]
      row.image_url = typeToUrl[type]
      row.image_alt = row.image_alt || `${row.title || type} illustration`
      const data = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? { ...row.data } : {}
      data.image_media_key = `feature-mockup:${type}`
      row.data = data
      stats[counterKey] += 1
    })
  }
}

linkFeatureCards((slug) => slug === 'features', 'featuresPageLinked')
linkFeatureCards((slug) => String(slug || '').startsWith('petrol-pump-software-'), 'cityFeaturesLinked')

// 4) Ensure blog posts with /resources/ keep working URLs (already copied); count fixes if was broken path only
for (const post of blogPosts) {
  const url = post.image_url || post.og_image
  if (!url || !String(url).startsWith('/resources/')) continue
  const name = path.basename(url)
  if (RESOURCES_MAP[name]) {
    // URL stays /resources/name — file now exists
    stats.blogUrlsFixed += 1
  }
}

// Usage hints on media records
function addUsage(url, label) {
  const row = findMediaByUrl(url)
  if (!row) return
  const usage = Array.isArray(row.usage) ? row.usage : []
  if (!usage.includes(label)) usage.push(label)
  row.usage = usage
  row.usage_count = usage.length
}

for (const row of sections) {
  if (!row.image_url) continue
  const where = `${row.page_slug || '?'} → ${row.section_key || '?'}${row.title ? ` → ${row.title}` : ''}`
  addUsage(row.image_url, where)
}
for (const post of blogPosts) {
  const url = post.image_url || post.og_image
  if (!url) continue
  addUsage(url, `Blog → ${post.slug || post.title || post.id}`)
}

console.log(
  JSON.stringify(
    {
      dryRun,
      ...stats,
      mediaTotal: media.length,
    },
    null,
    2,
  ),
)

if (dryRun) process.exit(0)

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(root, 'storage', 'backups', `website-images-import-${stamp}`)
fs.mkdirSync(backupDir, { recursive: true })
fs.copyFileSync(mediaPath, path.join(backupDir, 'media.json'))
fs.copyFileSync(sectionsPath, path.join(backupDir, 'sections.json'))
fs.copyFileSync(blogPath, path.join(backupDir, 'blog-posts.json'))
fs.writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n')
fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + '\n')
fs.writeFileSync(blogPath, JSON.stringify(blogPosts, null, 2) + '\n')
console.log('Backup:', backupDir)
