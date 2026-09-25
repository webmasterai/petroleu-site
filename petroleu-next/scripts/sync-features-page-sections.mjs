/**
 * Additive sync: copy home feature:card (+ heading:features) onto the Features CMS page
 * so Pages → Features edits the same cards the /features frontend shows.
 *
 * - Never deletes or overwrites existing features-page feature:card rows
 * - Never touches users / inquiries / uploads
 * - Idempotent
 *
 * Usage:
 *   node scripts/sync-features-page-sections.mjs
 *   node scripts/sync-features-page-sections.mjs --seed-only
 *   DRY_RUN=true node scripts/sync-features-page-sections.mjs
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true'
const seedOnly = process.argv.includes('--seed-only')

const TARGETS = seedOnly
  ? [path.join(root, 'storage-seed')]
  : [path.join(root, 'storage-seed'), path.join(root, 'storage', 'data')]

const COPY_KEYS = new Set(['feature:card', 'heading:features'])

function loadJson(filePath, fallback = []) {
  if (!existsSync(filePath)) return fallback
  const raw = readFileSync(filePath, 'utf8')
  if (!raw.trim()) return fallback
  return JSON.parse(raw)
}

function atomicWrite(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, filePath)
}

function maxId(rows) {
  let m = 0
  for (const r of rows) {
    const n = Number(r?.id)
    if (Number.isFinite(n) && n > m) m = n
  }
  return m
}

function sectionIdentity(r) {
  return [
    r.market_code,
    r.locale_code,
    r.page_slug,
    r.section_key,
    String(r.sort_order ?? 0),
    String(r.title || '').trim(),
  ].join('|')
}

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function backupDataDir(dataDir) {
  if (!existsSync(dataDir)) return null
  const backupRoot = path.join(path.dirname(dataDir), 'backups')
  const dest = path.join(backupRoot, `data-before-features-page-sync-${stamp()}`)
  if (dryRun) {
    console.log('[dry-run] would backup', dataDir, '→', dest)
    return dest
  }
  mkdirSync(dest, { recursive: true })
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith('.json')) continue
    copyFileSync(path.join(dataDir, file), path.join(dest, file))
  }
  console.log('Backup OK:', dest)
  return dest
}

function syncDir(dir) {
  const sectionsPath = path.join(dir, 'sections.json')
  const pagesPath = path.join(dir, 'pages.json')
  if (!existsSync(sectionsPath)) {
    console.log('skip missing', sectionsPath)
    return { dir, added: 0 }
  }

  const isData = dir.replace(/\\/g, '/').endsWith('/storage/data') || dir.replace(/\\/g, '/').endsWith('\\storage\\data')
  if (isData) backupDataDir(dir)

  const sections = loadJson(sectionsPath, [])
  const pages = loadJson(pagesPath, [])
  if (!Array.isArray(sections)) throw new Error(`sections not array: ${sectionsPath}`)

  const featurePages = new Set(
    (Array.isArray(pages) ? pages : [])
      .filter((p) => p.slug === 'features')
      .map((p) => `${p.market_code}|${p.locale_code}`),
  )

  // Also sync locales that already have a features hero even if page meta missing
  for (const s of sections) {
    if (s.page_slug === 'features') featurePages.add(`${s.market_code}|${s.locale_code}`)
  }

  const existing = new Set(sections.map(sectionIdentity))
  let next = maxId(sections)
  const added = []

  for (const key of featurePages) {
    const [market, locale] = key.split('|')
    const homeRows = sections.filter(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        COPY_KEYS.has(s.section_key),
    )
    for (const src of homeRows) {
      const clone = {
        ...src,
        id: undefined,
        page_slug: 'features',
        // Keep sort_order; bump heading before cards if needed
        updated_at: new Date().toISOString(),
      }
      delete clone.id
      const identity = sectionIdentity({ ...clone, page_slug: 'features' })
      if (existing.has(identity)) continue
      const row = { ...clone, id: ++next }
      added.push(row)
      existing.add(identity)
    }
  }

  console.log(JSON.stringify({ dir, featureLocales: featurePages.size, added: added.length, sample: added.slice(0, 5).map(sectionIdentity) }))
  if (!dryRun && added.length) {
    atomicWrite(sectionsPath, [...sections, ...added])
  }
  return { dir, added: added.length }
}

console.log('=== Sync features page sections from home ===')
console.log('dryRun:', dryRun)
for (const dir of TARGETS) {
  if (!existsSync(dir)) {
    console.log('skip missing dir', dir)
    continue
  }
  syncDir(dir)
}
console.log('DONE')
