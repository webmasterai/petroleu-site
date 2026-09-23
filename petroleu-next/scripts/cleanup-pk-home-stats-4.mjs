/**
 * Targeted PRODUCTION-safe cleanup: pk / en-PK / home / stat → exactly 4 stats.
 *
 * - Backs up sections.json first
 * - Affects ONLY market_code=pk, locale_code=en-PK, page_slug=home, section_key=stat
 * - Leaves exactly:
 *     0 = 500+ Stations Active
 *     1 = 99.9% Uptime
 *     2 = 10M+ Transactions Logged
 *     3 = 24/7 Support
 * - Removes obsolete/duplicate stat rows in that scope only
 * - Idempotent (safe to re-run)
 * - Does NOT touch users, inquiries, passwords, uploads, AF locales, or other sections
 *
 * Env:
 *   CMS_DATA_DIR     (default: ./storage/data or /app/storage/data)
 *   CMS_BACKUP_ROOT  (default: <parent of data>/backups)
 *   DRY_RUN=true     report only
 *
 * Run:
 *   node scripts/cleanup-pk-home-stats-4.mjs
 *   DRY_RUN=true node scripts/cleanup-pk-home-stats-4.mjs
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
const PAGE = 'home'
const SECTION = 'stat'

const CANONICAL = [
  { title: '500+', description: 'Stations Active' },
  { title: '99.9%', description: 'Uptime' },
  { title: '10M+', description: 'Transactions Logged' },
  { title: '24/7', description: 'Support' },
]

const OBSOLETE_VALUES = new Set(['1350+', '20+', '4.8'])

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

function rowValue(row) {
  return String(row?.data?.value || row?.title || '').trim()
}

function isTarget(row) {
  return (
    row.market_code === MARKET &&
    row.locale_code === LOCALE &&
    row.page_slug === PAGE &&
    row.section_key === SECTION
  )
}

function applyStat(row, stat, sortOrder, now) {
  row.title = stat.title
  row.description = stat.description
  row.sort_order = sortOrder
  row.status = 'published'
  row.is_enabled = true
  row.page_slug = PAGE
  row.section_key = SECTION
  row.market_code = MARKET
  row.locale_code = LOCALE
  row.data = {
    ...(row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}),
    value: stat.title,
    label: stat.description,
  }
  row.updated_at = now
}

function maxId(rows) {
  let m = 0
  for (const r of rows) {
    const n = Number(r?.id)
    if (Number.isFinite(n) && n > m) m = n
  }
  return m
}

const sectionsPath = path.join(dataDir, 'sections.json')
if (!existsSync(sectionsPath)) {
  console.error('sections.json not found at', sectionsPath)
  process.exit(1)
}

const rows = JSON.parse(readFileSync(sectionsPath, 'utf8'))
const beforeTarget = rows.filter(isTarget)
const beforePublic = beforeTarget
  .filter((r) => r.status === 'published' && r.is_enabled !== false)
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

console.log('Before: pk/en-PK/home/stat total=', beforeTarget.length)
console.log(
  'Before public:',
  beforePublic.map((r) => `#${r.id} ${rowValue(r)}|${r.description} sort=${r.sort_order}`).join(' ;; '),
)

const list = [...beforeTarget]
const keepIds = new Set()
const now = new Date().toISOString()
let next = maxId(rows)
const mutations = { updated: 0, inserted: 0, removed: 0 }

for (let i = 0; i < CANONICAL.length; i++) {
  const want = CANONICAL[i]
  let row = list.find((r) => rowValue(r) === want.title && !keepIds.has(r.id))
  if (!row) {
    row = list.find((r) => !keepIds.has(r.id) && !OBSOLETE_VALUES.has(rowValue(r)))
  }
  if (!row) {
    row = list.find((r) => !keepIds.has(r.id))
  }

  if (row) {
    applyStat(row, want, i, now)
    keepIds.add(row.id)
    mutations.updated++
  } else {
    const created = {
      id: ++next,
      market_code: MARKET,
      locale_code: LOCALE,
      page_slug: PAGE,
      section_key: SECTION,
      title: want.title,
      description: want.description,
      content: null,
      data: { value: want.title, label: want.description },
      image_url: null,
      image_alt: null,
      link_label: null,
      link_url: null,
      sort_order: i,
      status: 'published',
      is_enabled: true,
      is_shared: false,
      translation_status: 'ready',
      published_at: now,
      updated_at: now,
    }
    rows.push(created)
    list.push(created)
    keepIds.add(created.id)
    mutations.inserted++
  }
}

const removeIds = new Set(
  list.filter((r) => !keepIds.has(r.id)).map((r) => r.id),
)
mutations.removed = removeIds.size

const afterRows = rows.filter((r) => !(isTarget(r) && removeIds.has(r.id)))

const afterTarget = afterRows.filter(isTarget)
const afterPublic = afterTarget
  .filter((r) => r.status === 'published' && r.is_enabled !== false)
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

console.log('Mutations:', mutations)
console.log('After: pk/en-PK/home/stat total=', afterTarget.length)
console.log(
  'After public:',
  afterPublic.map((r) => `#${r.id} ${rowValue(r)}|${r.description} sort=${r.sort_order}`).join(' ;; '),
)

const expected = CANONICAL.map((s) => `${s.title}|${s.description}`).join(';;')
const got = afterPublic.map((r) => `${rowValue(r)}|${r.description}`).join(';;')
if (got !== expected || afterPublic.length !== 4) {
  console.error('VALIDATION FAILED — aborting write')
  console.error('expected', expected)
  console.error('got     ', got)
  process.exit(1)
}

if (dryRun) {
  console.log('DRY_RUN=true — no backup/write performed')
  process.exit(0)
}

const backupDir = path.join(backupRoot, `data-before-pk-stats-4-${stamp()}`)
mkdirSync(backupDir, { recursive: true })
copyFileSync(sectionsPath, path.join(backupDir, 'sections.json'))
writeFileSync(
  path.join(backupDir, 'cleanup-pk-home-stats-4-report.json'),
  JSON.stringify(
    {
      at: now,
      scope: { market: MARKET, locale: LOCALE, page: PAGE, section: SECTION },
      before_ids: beforeTarget.map((r) => r.id),
      before_public: beforePublic.map((r) => ({
        id: r.id,
        value: rowValue(r),
        label: r.description,
        sort_order: r.sort_order,
      })),
      keep_ids: [...keepIds],
      removed_ids: [...removeIds],
      after_public: afterPublic.map((r) => ({
        id: r.id,
        value: rowValue(r),
        label: r.description,
        sort_order: r.sort_order,
      })),
      mutations,
    },
    null,
    2,
  ) + '\n',
)
console.log('Backup written to', backupDir)

atomicWrite(sectionsPath, afterRows)
console.log('Wrote', sectionsPath)
console.log('cleanup-pk-home-stats-4 complete')
