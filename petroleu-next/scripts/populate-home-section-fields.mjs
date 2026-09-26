/**
 * Additive local fill for Home section fields missing in CMS but visible on frontend.
 *
 *   node scripts/populate-home-section-fields.mjs [--dry-run]
 *
 * - Backs up sections.json
 * - Preserves IDs, market, locale, status
 * - Only fills empty/null fields
 * - Does NOT touch city pages
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dataPath = path.join(root, 'storage', 'data', 'sections.json')
const dryRun = process.argv.includes('--dry-run')

const MOBILE_MOCKUP = '/images/petroleu-mobile-real-mockup.png'

function guessAnalyticsIcon(title) {
  const t = String(title || '').toLowerCase()
  if (t.includes('margin') || t.includes('trend')) return 'TrendingUp'
  if (t.includes('stock') || t.includes('fuel') || t.includes('tank')) return 'Droplets'
  if (t.includes('credit') || t.includes('recover')) return 'Users'
  if (t.includes('nozzle') || t.includes('compare')) return 'Gauge'
  if (t.includes('month') || t.includes('calendar')) return 'Calendar'
  return 'Fuel'
}

function ensureObj(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) return { ...data }
  return {}
}

function fill(row) {
  const next = { ...row }
  let changed = false
  const key = String(row.section_key || '')

  if (key === 'heading:mobile') {
    if (!next.image_url) {
      next.image_url = MOBILE_MOCKUP
      next.image_alt = next.image_alt || 'Petroleu mobile app dashboard mockup'
      changed = true
    }
  }

  if (key === 'hero') {
    const data = ensureObj(next.data)
    if (!next.link_label && data.primaryButton) {
      next.link_label = data.primaryButton
      changed = true
    }
    if (!next.image_url && data.dashboard_image_url) {
      next.image_url = data.dashboard_image_url
      changed = true
    }
    if (!next.image_alt && next.image_url) {
      next.image_alt = 'Petroleu dashboard'
      changed = true
    }
    if (JSON.stringify(data) !== JSON.stringify(next.data || {})) {
      next.data = data
    }
  }

  if (key === 'analytics-card') {
    const data = ensureObj(next.data)
    let dChanged = false
    if (!data.icon) {
      data.icon = guessAnalyticsIcon(next.title)
      dChanged = true
    }
    if (!data.value) {
      data.value = String(next.title || '—')
      dChanged = true
    }
    if (!data.subtitle && next.description) {
      data.subtitle = String(next.description).slice(0, 48)
      dChanged = true
    }
    if (!data.color_class) {
      data.color_class = 'bg-primary/10 text-primary'
      dChanged = true
    }
    if (dChanged) {
      next.data = data
      changed = true
    }
  }

  if (key === 'why-choose') {
    const data = ensureObj(next.data)
    if (!data.icon) {
      const t = String(next.title || '').toLowerCase()
      data.icon = t.includes('cloud')
        ? 'Cloud'
        : t.includes('urdu') || t.includes('globe') || t.includes('زبان')
          ? 'Globe'
          : t.includes('stock') || t.includes('dip') || t.includes('variance')
            ? 'Droplets'
            : t.includes('multi') || t.includes('station') || t.includes('shield')
              ? 'Shield'
              : 'Cloud'
      next.data = data
      changed = true
    }
  }

  if (key === 'feature:card') {
    const data = ensureObj(next.data)
    // Preserve badge; ensure data object exists so editor can persist badge
    if (next.data == null) {
      next.data = data
      changed = true
    }
  }

  return { row: next, changed }
}

const rows = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
let changedCount = 0
const out = rows.map((r) => {
  // Home only
  if (!['home', 'home-mid', 'home-bottom'].includes(String(r.page_slug || ''))) {
    return r
  }
  const { row, changed } = fill(r)
  if (changed) changedCount += 1
  return row
})

console.log(
  JSON.stringify(
    {
      dryRun,
      totalRows: rows.length,
      homeRowsFilled: changedCount,
      note: 'Additive only; city pages untouched; IDs preserved',
    },
    null,
    2,
  ),
)

if (dryRun) process.exit(0)

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(root, 'storage', 'backups', `home-section-fields-${stamp}`)
fs.mkdirSync(backupDir, { recursive: true })
fs.copyFileSync(dataPath, path.join(backupDir, 'sections.json'))
fs.writeFileSync(dataPath, JSON.stringify(out, null, 2) + '\n')
console.log('Backup:', path.join(backupDir, 'sections.json'))
console.log('Updated:', dataPath)
