/**
 * Production Home CMS media + FAQ migration (additive / safe).
 *
 * SOURCE is version-controlled only — NEVER requires local storage/data:
 *   - scripts/fixtures/production-home-media/*
 *   - storage-seed/blog-posts.json
 *   - public/media/features/*, public/images/*
 *
 * Usage:
 *   node scripts/migrate-production-home-media.mjs --target /path/to/prod/storage/data --dry-run
 *   node scripts/migrate-production-home-media.mjs --target /path/to/prod/storage/data --public-target /path/to/prod/public --apply
 *   node scripts/migrate-production-home-media.mjs --simulate-empty-target --dry-run
 *
 * Never touches: users.json, inquiries.json, sessions, OAuth secrets.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const fixtureDir = path.join(root, 'scripts', 'fixtures', 'production-home-media')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const willWrite = apply && !args.includes('--dry-run')
const simulateEmpty = args.includes('--simulate-empty-target')
const targetIdx = args.indexOf('--target')
const targetDir = targetIdx >= 0 ? path.resolve(args[targetIdx + 1]) : null
const publicDir = path.join(root, 'public')
const seedDir = path.join(root, 'storage-seed')

if (!targetDir && !simulateEmpty) {
  console.error('Provide --target <prod-storage-data-dir> or --simulate-empty-target')
  process.exit(1)
}
if (willWrite && !targetDir) {
  console.error('--apply requires --target')
  process.exit(1)
}

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

function fileExistsForUrl(url, basePublic = publicDir) {
  if (!url) return { exists: false }
  if (String(url).startsWith('http')) return { exists: true, where: 'remote' }
  const abs = path.join(basePublic, String(url).replace(/^\//, ''))
  if (fs.existsSync(abs)) return { exists: true, where: 'public', abs }
  return { exists: false }
}

function mediaHasUrl(mediaRows, url) {
  if (!url) return false
  return mediaRows.some((m) => m.url === url || m.source_key === `public:${url}`)
}

function primaryImageUrl(row) {
  if (!row) return null
  if (row.image_url) return String(row.image_url)
  const d = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}
  return d.image_url || d.dashboard_image_url || d.imageUrl || d.dashboardImageUrl || null
}

function setRowImage(row, url, extra = {}) {
  row.image_url = url
  if (extra.image_alt) row.image_alt = extra.image_alt
  if (row.data && typeof row.data === 'object' && !Array.isArray(row.data)) {
    row.data = { ...row.data, image_url: url, ...extra }
    if (row.section_key === 'hero') {
      row.data.dashboard_image_url = extra.dashboard_image_url || url
    }
  } else if (extra.dashboard_image_url || row.section_key === 'hero') {
    row.data = {
      ...(typeof row.data === 'object' && row.data && !Array.isArray(row.data) ? row.data : {}),
      image_url: url,
      dashboard_image_url: extra.dashboard_image_url || url,
      ...extra,
    }
  }
  row.updated_at = new Date().toISOString()
}

function backupTarget(dir) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(dir, '..', 'backups', `home-media-migrate-${stamp}`)
  fs.mkdirSync(backupDir, { recursive: true })
  for (const f of ['sections.json', 'media.json', 'blog-posts.json']) {
    const src = path.join(dir, f)
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(backupDir, f))
  }
  return backupDir
}

function ensureMedia(mediaRows, manifestRow, nextId) {
  if (mediaHasUrl(mediaRows, manifestRow.url)) {
    return { added: false }
  }
  mediaRows.push({
    id: nextId.n++,
    ...manifestRow,
    created_at: new Date().toISOString(),
    usage: [],
    usage_count: 0,
    poster_url: null,
    caption: null,
  })
  return { added: true }
}

// ——— Load version-controlled SOURCE ———
const bindings = readJson(path.join(fixtureDir, 'section-image-bindings.json'))
const faqFixture = readJson(path.join(fixtureDir, 'faq-pk-en-PK.json'), [])
const mediaManifest = readJson(path.join(fixtureDir, 'media-manifest.json'), [])
const seedBlogs = readJson(path.join(seedDir, 'blog-posts.json'), [])

if (!bindings || !faqFixture.length) {
  console.error('Missing fixtures under scripts/fixtures/production-home-media/')
  process.exit(1)
}

const pkBlogs = seedBlogs.filter(
  (b) => b.market_code === 'pk' && b.locale_code === 'en-PK' && b.status === 'published',
)
const homepageBlogs = pkBlogs.filter((b) => b.show_on_homepage)
const resourceBlogs = pkBlogs.filter((b) => b.show_on_resources !== false)

// ——— Load TARGET ———
let targetSections = []
let targetMedia = []
let targetBlogs = []
if (!simulateEmpty) {
  targetSections = readJson(path.join(targetDir, 'sections.json'), [])
  targetMedia = readJson(path.join(targetDir, 'media.json'), [])
  targetBlogs = readJson(path.join(targetDir, 'blog-posts.json'), [])
}

const report = {
  mode: willWrite ? 'APPLY' : 'DRY-RUN',
  source: {
    faqs: path.relative(root, path.join(fixtureDir, 'faq-pk-en-PK.json')),
    bindings: path.relative(root, path.join(fixtureDir, 'section-image-bindings.json')),
    mediaManifest: path.relative(root, path.join(fixtureDir, 'media-manifest.json')),
    blogs: path.relative(root, path.join(seedDir, 'blog-posts.json')),
    featureSvgs: 'public/media/features/*.svg',
    mobilePng: 'public/images/petroleu-mobile-real-mockup.png',
    blogJpgs: 'public/images/blog/petroleu-*.jpg',
  },
  dependsOnStorageData: false,
  sections: {},
  totals: {
    expected: 0,
    alreadyCorrect: 0,
    missingBindings: 0,
    missingMediaRecords: 0,
    missingPhysicalAssets: 0,
    toUpdate: 0,
    skippedValid: 0,
  },
  faq: null,
  blogResources: null,
  planned: [],
}

function findTargetRow(pageSlug, sectionKey, extra = {}) {
  return targetSections.find(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === pageSlug &&
      s.section_key === sectionKey &&
      (extra.title == null || String(s.title || '') === String(extra.title)) &&
      (extra.sort_order == null || Number(s.sort_order) === Number(extra.sort_order)),
  )
}

function scoreSlot(label, expectedUrl, targetUrl, meta = {}) {
  report.totals.expected += 1
  const file = fileExistsForUrl(expectedUrl)
  if (!file.exists && expectedUrl && !String(expectedUrl).startsWith('http')) {
    report.totals.missingPhysicalAssets += 1
  }
  const tgtOk = Boolean(targetUrl && String(targetUrl).trim())
  if (tgtOk) {
    report.totals.alreadyCorrect += 1
    report.totals.skippedValid += 1
    return { label, status: 'keep-production', url: targetUrl, ...meta }
  }
  report.totals.missingBindings += 1
  report.totals.toUpdate += 1
  if (expectedUrl && !String(expectedUrl).startsWith('http') && !mediaHasUrl(targetMedia, expectedUrl)) {
    report.totals.missingMediaRecords += 1
  }
  report.planned.push({ label, expectedUrl, ...meta })
  return {
    label,
    status: willWrite ? 'migrate' : 'would-migrate',
    from: targetUrl || '(empty)',
    to: expectedUrl,
    file: file.exists || String(expectedUrl || '').startsWith('http'),
    ...meta,
  }
}

// ——— Section matrix ———
const sectionResults = []

// Hero
{
  const expected = bindings.hero.image_url
  const row = findTargetRow('home', 'hero')
  const detail = scoreSlot('Hero dashboard', expected, primaryImageUrl(row), { kind: 'hero' })
  sectionResults.push({
    label: 'Hero',
    result: `${detail.status === 'keep-production' ? 1 : 0}/1`,
    present: detail.status === 'keep-production' ? 1 : 0,
    expected: 1,
    details: [detail],
  })
  if (willWrite && detail.status === 'migrate' && row) {
    const idx = targetSections.findIndex((s) => s.id === row.id)
    setRowImage(targetSections[idx], expected, {
      dashboard_image_url: bindings.hero.dashboard_image_url || expected,
    })
  }
}

// Business Stats / logo
{
  const expected = bindings.logo.image_url
  const row = findTargetRow('home', 'logo')
  const detail = scoreSlot('Trusted logos', expected, primaryImageUrl(row), { kind: 'logo' })
  sectionResults.push({
    label: 'Business Stats',
    result: `${detail.status === 'keep-production' ? 1 : 0}/1`,
    present: detail.status === 'keep-production' ? 1 : 0,
    expected: 1,
    details: [detail],
  })
  if (willWrite && detail.status === 'migrate' && row) {
    const idx = targetSections.findIndex((s) => s.id === row.id)
    setRowImage(targetSections[idx], expected)
  }
}

// Features 9/9
{
  const details = []
  let present = 0
  for (const f of bindings.features) {
    const row =
      findTargetRow('home', 'feature:card', { title: f.match_title }) ||
      findTargetRow('home', 'feature:card', { sort_order: f.sort_order })
    const detail = scoreSlot(f.match_title, f.image_url, primaryImageUrl(row), {
      kind: 'feature',
      title: f.match_title,
    })
    if (detail.status === 'keep-production') present += 1
    details.push(detail)
    if (willWrite && detail.status === 'migrate' && row) {
      const idx = targetSections.findIndex((s) => s.id === row.id)
      setRowImage(targetSections[idx], f.image_url)
    }
  }
  sectionResults.push({
    label: 'Features',
    result: `${present}/${bindings.features.length}`,
    present,
    expected: bindings.features.length,
    details,
  })
}

// Non-media sections (report N/A)
for (const label of [
  'Getting Started',
  'Sales / Invoices',
  'Reports',
  'Industries',
  'Analytics',
  'Why Petroleu',
  'Testimonials',
  'CTA (mid)',
  'Pricing',
  'FAQ (Home)',
  'CTA',
]) {
  sectionResults.push({
    label,
    result: '0/0',
    present: 0,
    expected: 0,
    note: 'No CMS media image required (component/text/icons)',
    details: [],
  })
}

// Mobile
{
  const expected = bindings.mobile.image_url
  const row = findTargetRow('home', 'heading:mobile')
  const detail = scoreSlot('Mobile mockup', expected, primaryImageUrl(row), { kind: 'mobile' })
  sectionResults.push({
    label: 'Mobile Dashboard',
    result: `${detail.status === 'keep-production' ? 1 : 0}/1`,
    present: detail.status === 'keep-production' ? 1 : 0,
    expected: 1,
    details: [detail],
  })
  if (willWrite && detail.status === 'migrate' && row) {
    const idx = targetSections.findIndex((s) => s.id === row.id)
    setRowImage(targetSections[idx], expected, { image_alt: bindings.mobile.image_alt })
  }
}

// Latest Resources (homepage blogs)
{
  const details = []
  let present = 0
  for (const b of homepageBlogs) {
    const expected = b.image_url || b.og_image
    const tgt = targetBlogs.find(
      (t) => t.market_code === 'pk' && t.locale_code === 'en-PK' && t.slug === b.slug,
    )
    const tgtUrl = tgt?.image_url || tgt?.og_image || null
    const detail = scoreSlot(b.slug, expected, tgtUrl, { kind: 'blog-home', slug: b.slug })
    if (detail.status === 'keep-production') present += 1
    details.push(detail)
    if (willWrite && detail.status === 'migrate' && tgt) {
      const idx = targetBlogs.findIndex((x) => x.id === tgt.id)
      targetBlogs[idx] = { ...targetBlogs[idx], image_url: expected }
    }
  }
  sectionResults.push({
    label: 'Latest Resources',
    result: `${present}/${homepageBlogs.length}`,
    present,
    expected: homepageBlogs.length,
    details,
  })
}

// Blog resources thumbs (6)
{
  let ok = 0
  let missing = 0
  for (const b of resourceBlogs) {
    const expected = b.image_url || b.og_image
    const tgt = targetBlogs.find(
      (t) => t.market_code === 'pk' && t.locale_code === 'en-PK' && t.slug === b.slug,
    )
    const tgtUrl = tgt?.image_url || tgt?.og_image || null
    if (tgtUrl) ok += 1
    else {
      missing += 1
      report.planned.push({ label: `resource:${b.slug}`, expectedUrl: expected, kind: 'blog-resource' })
      if (willWrite && tgt && expected) {
        const idx = targetBlogs.findIndex((x) => x.id === tgt.id)
        targetBlogs[idx] = { ...targetBlogs[idx], image_url: expected }
      }
    }
  }
  report.blogResources = { result: `${ok}/${resourceBlogs.length}`, missing }
}

// FAQ
{
  const tgtFaqs = targetSections.filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'faq' &&
      s.section_key === 'faq',
  )
  report.faq = {
    sourceCount: faqFixture.length,
    sourceFile: report.source.faqs,
    targetCount: tgtFaqs.length,
    action: 'none',
    wouldAdd: 0,
  }
  if (faqFixture.length && tgtFaqs.length >= faqFixture.length) {
    report.faq.action = 'skip-target-has-enough'
  } else if (faqFixture.length > 4 && tgtFaqs.length <= 4) {
    report.faq.action = willWrite
      ? 'replace-small-set-with-source'
      : 'would-replace-small-set-with-source'
    report.faq.wouldAdd = faqFixture.length - tgtFaqs.length
    if (willWrite) {
      const keep = targetSections.filter(
        (s) =>
          !(
            s.market_code === 'pk' &&
            s.locale_code === 'en-PK' &&
            s.page_slug === 'faq' &&
            s.section_key === 'faq'
          ),
      )
      let maxId = targetSections.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0)
      const cloned = faqFixture.map((f, i) => {
        maxId += 1
        return {
          id: maxId,
          market_code: 'pk',
          locale_code: 'en-PK',
          page_slug: 'faq',
          section_key: 'faq',
          sort_order: f.sort_order ?? i,
          title: f.title,
          description: f.description,
          content: null,
          data: {
            category: f.category,
            category_id: f.category,
            category_label: f.category_label,
            question: f.title,
            answer: f.description,
          },
          status: 'published',
          is_enabled: true,
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
      targetSections = [...keep, ...cloned]
    }
  } else {
    report.faq.action = 'manual-review-needed'
  }
}

// Ensure media manifest on apply
let nextMediaId = { n: targetMedia.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1 }
if (willWrite) {
  for (const row of mediaManifest) ensureMedia(targetMedia, row, nextMediaId)
}

let backupPath = null
if (willWrite) {
  backupPath = backupTarget(targetDir)
  writeJson(path.join(targetDir, 'sections.json'), targetSections)
  writeJson(path.join(targetDir, 'media.json'), targetMedia)
  writeJson(path.join(targetDir, 'blog-posts.json'), targetBlogs)

  const pubIdx = args.indexOf('--public-target')
  if (pubIdx >= 0) {
    const pubTarget = path.resolve(args[pubIdx + 1])
    for (const row of mediaManifest) {
      const src = fileExistsForUrl(row.url)
      if (!src.exists || !src.abs) continue
      const dest = path.join(pubTarget, row.url.replace(/^\//, ''))
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      if (!fs.existsSync(dest)) fs.copyFileSync(src.abs, dest)
    }
  }
}

// ——— Print ———
console.log('\n========== HOME MEDIA MIGRATION REPORT ==========')
console.log(`Mode: ${report.mode}`)
console.log('dependsOnStorageData:', report.dependsOnStorageData)
console.log('SOURCE files:')
for (const [k, v] of Object.entries(report.source)) console.log(`  ${k}: ${v}`)
console.log(`Target: ${simulateEmpty ? '(empty simulation)' : targetDir}`)
console.log(`Total expected image/media refs: ${report.totals.expected}`)
console.log(`Already correct: ${report.totals.alreadyCorrect}`)
console.log(`Missing bindings: ${report.totals.missingBindings}`)
console.log(`Missing media records: ${report.totals.missingMediaRecords}`)
console.log(`Missing physical assets: ${report.totals.missingPhysicalAssets}`)
console.log(`To update: ${report.totals.toUpdate}`)
console.log(`Skipped valid: ${report.totals.skippedValid}`)
console.log('\n--- Section matrix ---')
for (const s of sectionResults) {
  console.log(`${s.label}: ${s.result}${s.note ? ' — ' + s.note : ''}`)
}
console.log('\n--- Blog/resources ---')
console.log(JSON.stringify(report.blogResources, null, 2))
console.log('\n--- FAQ ---')
console.log(JSON.stringify(report.faq, null, 2))
if (backupPath) console.log('\nBackup:', backupPath)

console.log('\nDry-run:')
console.log('  node scripts/migrate-production-home-media.mjs --target <PROD_STORAGE_DATA> --dry-run')
console.log('Apply:')
console.log(
  '  node scripts/migrate-production-home-media.mjs --target <PROD_STORAGE_DATA> --public-target <PROD_PUBLIC> --apply',
)
console.log('Fresh-checkout empty simulation:')
console.log('  node scripts/migrate-production-home-media.mjs --simulate-empty-target --dry-run')

// Exit non-zero if expected simulation counts fail
if (simulateEmpty) {
  const feat = sectionResults.find((s) => s.label === 'Features')
  const hero = sectionResults.find((s) => s.label === 'Hero')
  const mobile = sectionResults.find((s) => s.label === 'Mobile Dashboard')
  const latest = sectionResults.find((s) => s.label === 'Latest Resources')
  const ok =
    faqFixture.length === 86 &&
    feat?.expected === 9 &&
    feat?.present === 0 &&
    hero?.expected === 1 &&
    mobile?.expected === 1 &&
    latest?.expected === 4 &&
    report.blogResources?.result === '0/6'
  console.log('\nFresh-checkout gate:', ok ? 'PASS' : 'FAIL')
  console.log({
    faqSource: faqFixture.length,
    features: feat?.result,
    hero: hero?.result,
    mobile: mobile?.result,
    latest: latest?.result,
    blogResources: report.blogResources?.result,
  })
  if (!ok) process.exit(2)
}
