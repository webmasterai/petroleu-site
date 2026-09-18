/**
 * Fill Pakistan English (pk / en-PK) CMS sections so Pages → Edit page
 * has the same editable blocks as Afghanistan English (af / en-AF).
 *
 * - Does NOT overwrite existing pk/en-PK rows
 * - Does NOT touch users.json or other markets
 * - Idempotent: safe to re-run
 *
 * Run: node scripts/seed-pakistan-en-from-af-en.mjs
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data')
const seedDir = path.join(root, 'storage-seed')

function load(name) {
  const p = path.join(dataDir, name)
  if (!existsSync(p)) return []
  return JSON.parse(readFileSync(p, 'utf8'))
}

function atomicWrite(name, data) {
  mkdirSync(dataDir, { recursive: true })
  const target = path.join(dataDir, name)
  const tmp = `${target}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, target)
}

function naturalKey(row) {
  return [
    row.market_code,
    row.locale_code,
    row.page_slug,
    row.section_key,
    String(row.sort_order ?? 0),
    String(row.title || ''),
  ].join('|')
}

function pakistanize(value) {
  if (value == null) return value
  if (typeof value === 'string') {
    return value
      .replaceAll('/af/en', '')
      .replaceAll('/af/ps', '')
      .replaceAll('/af/fa', '')
      .replaceAll('/af', '')
      .replaceAll('Afghanistan', 'Pakistan')
      .replaceAll('afghanistan', 'pakistan')
      .replaceAll('AFGHANISTAN', 'PAKISTAN')
  }
  if (Array.isArray(value)) return value.map(pakistanize)
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = pakistanize(v)
    return out
  }
  return value
}

function cloneToPk(src, nextId) {
  const { id: _id, ...rest } = src
  return pakistanize({
    ...rest,
    id: nextId,
    market_code: 'pk',
    locale_code: 'en-PK',
    is_shared: false,
    status: rest.status || 'published',
    is_enabled: rest.is_enabled !== false,
    translation_status: rest.translation_status || 'ready',
    published_at: rest.published_at || new Date().toISOString(),
  })
}

const sections = load('sections.json')
const existingSoft = new Set(
  sections
    .filter((r) => r.market_code === 'pk' && r.locale_code === 'en-PK')
    .map((r) => [r.page_slug, r.section_key, String(r.sort_order ?? 0)].join('|')),
)

const source = sections.filter((r) => r.market_code === 'af' && r.locale_code === 'en-AF')
let nextId = sections.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
const added = []

for (const src of source) {
  const soft = [src.page_slug, src.section_key, String(src.sort_order ?? 0)].join('|')
  if (existingSoft.has(soft)) continue

  const candidate = cloneToPk(src, nextId)
  sections.push(candidate)
  existingSoft.add(soft)
  added.push(`${candidate.page_slug}/${candidate.section_key}#${candidate.sort_order}`)
  nextId += 1
}

atomicWrite('sections.json', sections)

// Keep storage-seed in sync for sections (full copy of runtime data for this file)
mkdirSync(seedDir, { recursive: true })
writeFileSync(path.join(seedDir, 'sections.json'), JSON.stringify(sections, null, 2) + '\n', 'utf8')

const pk = sections.filter((r) => r.market_code === 'pk' && r.locale_code === 'en-PK')
const byPage = {}
for (const r of pk) byPage[r.page_slug] = (byPage[r.page_slug] || 0) + 1

console.log(
  JSON.stringify(
    {
      added: added.length,
      sample_added: added.slice(0, 15),
      pk_en_PK_total: pk.length,
      pk_by_page: byPage,
    },
    null,
    2,
  ),
)
