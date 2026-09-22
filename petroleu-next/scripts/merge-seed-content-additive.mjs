/**
 * Safe additive CMS content merge: storage-seed → storage/data
 *
 * - Backs up target data dir first (required)
 * - Inserts missing pages / sections / navigation / seo / blog / markets / locales / media
 * - Never touches: users.json, inquiries.json, uploads, sessions
 * - Does NOT overwrite existing logical records
 * - Idempotent
 *
 * Env:
 *   CMS_DATA_DIR     target (default: ./storage/data or /app/storage/data)
 *   CMS_SEED_DIR     source (default: ./storage-seed)
 *   CMS_BACKUP_ROOT  backup root (default: <parent of data>/backups)
 *   DRY_RUN=true     report only
 *
 * Run:
 *   node scripts/merge-seed-content-additive.mjs
 *   DRY_RUN=true node scripts/merge-seed-content-additive.mjs
 */
import {
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  existsSync,
  readdirSync,
  copyFileSync,
} from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const dataDir = process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data')
const seedDir = process.env.CMS_SEED_DIR || path.join(root, 'storage-seed')
const backupRoot =
  process.env.CMS_BACKUP_ROOT || path.join(path.dirname(dataDir), 'backups')
const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true'

const SKIP_FILES = new Set(['users.json', 'inquiries.json'])

const MERGE_FILES = [
  'pages.json',
  'sections.json',
  'navigation.json',
  'seo.json',
  'blog-posts.json',
  'blog-categories.json',
  'markets.json',
  'locales.json',
  'media.json',
  'settings.json',
]

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

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    '-' +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
}

function maxId(rows) {
  let m = 0
  for (const r of rows) {
    const n = Number(r?.id)
    if (Number.isFinite(n) && n > m) m = n
  }
  return m
}

function pageKey(r) {
  return [r.market_code, r.locale_code, r.slug].join('|')
}

function sectionKey(r) {
  return [
    r.market_code,
    r.locale_code,
    r.page_slug,
    r.section_key,
    String(r.sort_order ?? 0),
    String(r.title || '').trim(),
  ].join('|')
}

function navKey(r) {
  return [
    r.market_code,
    r.locale_code,
    r.menu_key || r.location || r.placement || 'header',
    String(r.sort_order ?? 0),
    String(r.label || r.title || ''),
    String(r.href || r.url || r.path || ''),
  ].join('|')
}

function seoKey(r) {
  return [r.market_code, r.locale_code, r.path || r.page_slug || r.slug || ''].join('|')
}

function blogPostKey(r) {
  return [r.market_code || 'pk', r.locale_code || 'en-PK', r.slug].join('|')
}

function blogCatKey(r) {
  return [r.market_code || 'pk', r.locale_code || 'en-PK', r.slug || r.name || r.id].join('|')
}

function marketKey(r) {
  return String(r.code || r.market_code || r.id)
}

function localeKey(r) {
  return String(r.code || r.locale_code || r.id)
}

function mediaKey(r) {
  return String(r.id || r.url || r.path || r.filename || '')
}

function settingsKey(r) {
  // settings may be array of {market_code,locale_code,...} or flat object
  if (r && typeof r === 'object' && !Array.isArray(r) && (r.market_code || r.locale_code || r.key)) {
    return [r.market_code || '', r.locale_code || '', r.key || r.id || ''].join('|')
  }
  return null
}

function keyFnFor(file) {
  switch (file) {
    case 'pages.json':
      return pageKey
    case 'sections.json':
      return sectionKey
    case 'navigation.json':
      return navKey
    case 'seo.json':
      return seoKey
    case 'blog-posts.json':
      return blogPostKey
    case 'blog-categories.json':
      return blogCatKey
    case 'markets.json':
      return marketKey
    case 'locales.json':
      return localeKey
    case 'media.json':
      return mediaKey
    case 'settings.json':
      return settingsKey
    default:
      return null
  }
}

function backupDataDir() {
  if (!existsSync(dataDir)) {
    throw new Error(`CMS data dir missing: ${dataDir}`)
  }
  const name = `data-before-content-sync-${stamp()}`
  const dest = path.join(backupRoot, name)
  mkdirSync(backupRoot, { recursive: true })
  if (dryRun) {
    console.log('[dry-run] would backup', dataDir, '→', dest)
    return dest
  }
  mkdirSync(dest, { recursive: true })
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith('.json') && !file.startsWith('.')) continue
    copyFileSync(path.join(dataDir, file), path.join(dest, file))
  }
  // verify at least one json copied or empty is ok
  const copied = readdirSync(dest).filter((f) => f.endsWith('.json'))
  if (copied.length === 0 && readdirSync(dataDir).filter((f) => f.endsWith('.json')).length > 0) {
    throw new Error('Backup failed: no JSON files copied')
  }
  console.log('Backup OK:', dest, `(${copied.length} json files)`)
  return dest
}

function mergeArrayFile(file, keyFn) {
  const seedPath = path.join(seedDir, file)
  const dataPath = path.join(dataDir, file)
  if (!existsSync(seedPath)) {
    return { file, skipped: true, reason: 'no seed file', added: 0, preserved: 0 }
  }

  const seedRows = loadJson(seedPath, [])
  const dataRows = loadJson(dataPath, [])

  if (!Array.isArray(seedRows) || !Array.isArray(dataRows)) {
    // settings sometimes object — handle below
    if (file === 'settings.json' && !Array.isArray(seedRows) && !Array.isArray(dataRows)) {
      return mergeSettingsObject(seedRows, dataRows, dataPath)
    }
    return { file, skipped: true, reason: 'non-array', added: 0, preserved: Array.isArray(dataRows) ? dataRows.length : 0 }
  }

  if (!keyFn) {
    return { file, skipped: true, reason: 'no key fn', added: 0, preserved: dataRows.length }
  }

  const existing = new Set()
  for (const row of dataRows) {
    const k = keyFn(row)
    if (k) existing.add(k)
  }

  let next = maxId(dataRows)
  const added = []
  for (const src of seedRows) {
    const k = keyFn(src)
    if (!k || existing.has(k)) continue
    const { id: _drop, ...rest } = src
    const row = { ...rest, id: ++next }
    added.push(row)
    existing.add(k)
  }

  const preserved = dataRows.length
  if (!dryRun && added.length) {
    atomicWrite(dataPath, [...dataRows, ...added])
  }

  return {
    file,
    added: added.length,
    preserved,
    after: preserved + added.length,
    sample: added.slice(0, 8).map((r) => keyFn(r)),
  }
}

function mergeSettingsObject(seedObj, dataObj, dataPath) {
  const seed = seedObj && typeof seedObj === 'object' ? seedObj : {}
  const data = dataObj && typeof dataObj === 'object' ? dataObj : {}
  const out = { ...data }
  let added = 0
  for (const [k, v] of Object.entries(seed)) {
    if (!(k in out)) {
      out[k] = v
      added++
    } else if (
      out[k] &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k]) &&
      v &&
      typeof v === 'object' &&
      !Array.isArray(v)
    ) {
      for (const [sk, sv] of Object.entries(v)) {
        if (!(sk in out[k])) {
          out[k][sk] = sv
          added++
        }
      }
    }
  }
  if (!dryRun && added) atomicWrite(dataPath, out)
  return { file: 'settings.json', added, preserved: Object.keys(data).length, after: Object.keys(out).length }
}

function summarizePages(label, rows) {
  const by = {}
  for (const p of rows) {
    const k = `${p.market_code}|${p.locale_code}`
    by[k] = by[k] || []
    by[k].push(p.slug)
  }
  console.log(label)
  for (const [k, slugs] of Object.entries(by).sort()) {
    console.log(`  ${k}: ${slugs.length} → ${slugs.sort().join(', ')}`)
  }
}

function main() {
  console.log('=== CMS additive seed merge ===')
  console.log('seed:', seedDir)
  console.log('data:', dataDir)
  console.log('dryRun:', dryRun)

  if (!existsSync(seedDir)) throw new Error(`Seed dir missing: ${seedDir}`)
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

  const beforePages = loadJson(path.join(dataDir, 'pages.json'), [])
  const beforeSections = loadJson(path.join(dataDir, 'sections.json'), [])
  summarizePages('BEFORE pages', Array.isArray(beforePages) ? beforePages : [])
  console.log('BEFORE sections:', Array.isArray(beforeSections) ? beforeSections.length : 0)

  const backupPath = backupDataDir()

  const results = []
  for (const file of MERGE_FILES) {
    if (SKIP_FILES.has(file)) continue
    const res = mergeArrayFile(file, keyFnFor(file))
    results.push(res)
    console.log(JSON.stringify(res))
  }

  // Confirm skip files untouched by never writing them
  for (const skip of SKIP_FILES) {
    console.log(`PRESERVED (untouched): ${skip}`)
  }

  const afterPages = loadJson(path.join(dataDir, 'pages.json'), [])
  const afterSections = loadJson(path.join(dataDir, 'sections.json'), [])
  summarizePages(dryRun ? 'AFTER pages (dry-run unchanged)' : 'AFTER pages', Array.isArray(afterPages) ? afterPages : [])
  console.log('AFTER sections:', Array.isArray(afterSections) ? afterSections.length : 0)

  const report = {
    backupPath,
    dryRun,
    results,
    before: {
      pages: Array.isArray(beforePages) ? beforePages.length : 0,
      sections: Array.isArray(beforeSections) ? beforeSections.length : 0,
    },
    after: {
      pages: Array.isArray(afterPages) ? afterPages.length : 0,
      sections: Array.isArray(afterSections) ? afterSections.length : 0,
    },
    addedTotal: results.reduce((n, r) => n + (r.added || 0), 0),
  }

  const reportPath = path.join(backupRoot, `merge-report-${stamp()}.json`)
  if (!dryRun) {
    mkdirSync(backupRoot, { recursive: true })
    writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
    console.log('Report:', reportPath)
  }

  console.log('DONE addedTotal=', report.addedTotal)
  return report
}

main()
