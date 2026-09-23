/**
 * Targeted PRODUCTION-safe cleanup: pk / en-PK header navigation.
 *
 * Root cause of duplicate About/Contact:
 *   Additive merge keys include sort_order. Expanding old 4-item header
 *   (About@3, Contact@4) to the 7-item menu inserted About@5 + Contact@7
 *   without removing the old rows → duplicated labels in the API/header.
 *
 * This script:
 * - Backs up navigation.json first
 * - Affects ONLY market_code=pk, locale_code=en-PK, location=header
 * - Does NOT touch en-AF / fa-AF / ps-AF, footer, mega, or other locations
 * - Upserts the intended 7 menu items (labels/urls/order from local working CMS)
 * - Disables (draft + is_enabled=false) any other pk/en-PK header rows
 * - Idempotent
 * - Does NOT touch users, inquiries, passwords, uploads
 *
 * Env:
 *   CMS_DATA_DIR / CMS_BACKUP_ROOT / DRY_RUN=true
 *
 * Run:
 *   node scripts/cleanup-pk-header-nav.mjs
 */
import {
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  existsSync,
  copyFileSync,
} from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const dataDir = process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data')
const backupRoot =
  process.env.CMS_BACKUP_ROOT || path.join(path.dirname(dataDir), 'backups')
const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true'

const MARKET = 'pk'
const LOCALE = 'en-PK'
const LOCATION = 'header'

/** Intended current PK English header (local working CMS / storage-seed). */
const CANONICAL = [
  { label: 'Features', url: '/features', sort_order: 1 },
  { label: 'Pricing', url: '/pricing', sort_order: 2 },
  { label: 'FAQ', url: '/faq', sort_order: 3 },
  { label: 'Mobile App', url: '/#mobile', sort_order: 4 },
  { label: 'About', url: '/about', sort_order: 5 },
  { label: 'Blog', url: '/blog', sort_order: 6 },
  { label: 'Contact', url: '/contact', sort_order: 7 },
]

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

function atomicWrite(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, filePath)
}

function normLabel(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
}

function normUrl(v) {
  return String(v || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase() || '/'
}

function isTarget(row) {
  const loc = row.location || row.menu_key || row.placement || 'header'
  return row.market_code === MARKET && row.locale_code === LOCALE && loc === LOCATION
}

function rowLabel(row) {
  return String(row.label || row.title || '').trim()
}

function rowUrl(row) {
  return String(row.url || row.href || row.path || '/').trim()
}

function maxId(rows) {
  let m = 0
  for (const r of rows) {
    const n = Number(r?.id)
    if (Number.isFinite(n) && n > m) m = n
  }
  return m
}

function isPublic(row) {
  return row.status === 'published' && row.is_enabled !== false
}

const navPath = path.join(dataDir, 'navigation.json')
if (!existsSync(navPath)) {
  console.error('navigation.json not found at', navPath)
  process.exit(1)
}

const rows = JSON.parse(readFileSync(navPath, 'utf8'))
const beforeTarget = rows.filter(isTarget)
const beforePublic = beforeTarget
  .filter(isPublic)
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

console.log('Before: pk/en-PK/header total=', beforeTarget.length, 'public=', beforePublic.length)
console.log(
  'Before public:',
  beforePublic.map((r) => `#${r.id} ${rowLabel(r)} → ${rowUrl(r)} sort=${r.sort_order}`).join(' ;; '),
)

const list = [...beforeTarget]
const keepIds = new Set()
const now = new Date().toISOString()
let next = maxId(rows)
const mutations = { updated: 0, inserted: 0, disabled: 0 }

for (const want of CANONICAL) {
  // Prefer exact label+url match; then label-only; then unused row
  let row =
    list.find(
      (r) =>
        !keepIds.has(r.id) &&
        normLabel(rowLabel(r)) === normLabel(want.label) &&
        normUrl(rowUrl(r)) === normUrl(want.url),
    ) ||
    list.find((r) => !keepIds.has(r.id) && normLabel(rowLabel(r)) === normLabel(want.label)) ||
    null

  if (row) {
    row.label = want.label
    row.url = want.url
    row.sort_order = want.sort_order
    row.location = LOCATION
    row.market_code = MARKET
    row.locale_code = LOCALE
    row.status = 'published'
    row.is_enabled = true
    row.updated_at = now
    keepIds.add(row.id)
    mutations.updated++
  } else {
    const created = {
      id: ++next,
      market_code: MARKET,
      locale_code: LOCALE,
      location: LOCATION,
      label: want.label,
      url: want.url,
      sort_order: want.sort_order,
      status: 'published',
      is_enabled: true,
      updated_at: now,
    }
    rows.push(created)
    list.push(created)
    keepIds.add(created.id)
    mutations.inserted++
  }
}

for (const row of list) {
  if (keepIds.has(row.id)) continue
  if (row.status === 'draft' && row.is_enabled === false) continue
  row.status = 'draft'
  row.is_enabled = false
  row.updated_at = now
  mutations.disabled++
}

const afterPublic = rows
  .filter(isTarget)
  .filter(isPublic)
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

console.log('Mutations:', mutations)
console.log('After public=', afterPublic.length)
console.log(
  'After public:',
  afterPublic.map((r) => `#${r.id} ${rowLabel(r)} → ${rowUrl(r)} sort=${r.sort_order}`).join(' ;; '),
)

const expected = CANONICAL.map((c) => `${c.label}|${c.url}`).join(';;')
const got = afterPublic.map((r) => `${rowLabel(r)}|${rowUrl(r)}`).join(';;')
if (got !== expected || afterPublic.length !== CANONICAL.length) {
  console.error('VALIDATION FAILED — aborting write')
  console.error('expected', expected)
  console.error('got     ', got)
  process.exit(1)
}

// Detect remaining duplicate labels among public items
const labels = afterPublic.map((r) => normLabel(rowLabel(r)))
const dup = labels.filter((l, i) => labels.indexOf(l) !== i)
if (dup.length) {
  console.error('VALIDATION FAILED — duplicate labels remain:', dup)
  process.exit(1)
}

if (dryRun) {
  console.log('DRY_RUN=true — no backup/write performed')
  process.exit(0)
}

const backupDir = path.join(backupRoot, `data-before-pk-header-nav-${stamp()}`)
mkdirSync(backupDir, { recursive: true })
copyFileSync(navPath, path.join(backupDir, 'navigation.json'))
writeFileSync(
  path.join(backupDir, 'cleanup-pk-header-nav-report.json'),
  JSON.stringify(
    {
      at: now,
      scope: { market: MARKET, locale: LOCALE, location: LOCATION },
      before_public: beforePublic.map((r) => ({
        id: r.id,
        label: rowLabel(r),
        url: rowUrl(r),
        sort_order: r.sort_order,
      })),
      keep_ids: [...keepIds],
      after_public: afterPublic.map((r) => ({
        id: r.id,
        label: rowLabel(r),
        url: rowUrl(r),
        sort_order: r.sort_order,
      })),
      mutations,
      root_cause:
        'Additive merge key includes sort_order; expanding old About@3/Contact@4 left duplicates alongside About@5/Contact@7',
    },
    null,
    2,
  ) + '\n',
)
console.log('Backup written to', backupDir)

atomicWrite(navPath, rows)
console.log('Wrote', navPath)
console.log('cleanup-pk-header-nav complete')
