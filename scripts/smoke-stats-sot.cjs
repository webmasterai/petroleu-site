/**
 * Local CMS SoT smoke for stats + logos (no HTTP server required).
 * Simulates public /stats and /logos listSections filters + edit/disable tests.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'petroleu-next', 'storage', 'data', 'sections.json')
const rows = JSON.parse(fs.readFileSync(file, 'utf8'))

function publicStats() {
  return rows
    .filter(
      (s) =>
        s.market_code === 'pk' &&
        s.locale_code === 'en-PK' &&
        s.page_slug === 'home' &&
        s.section_key === 'stat' &&
        s.status === 'published' &&
        s.is_enabled !== false,
    )
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

function publicLogos() {
  return rows.filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'home' &&
      s.section_key === 'logo' &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
}

function heading() {
  return rows.find(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'home' &&
      s.section_key === 'heading:logos' &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
}

const expected = [
  '1350+|Petrol Pumps',
  '500+|Stations Active',
  '20+|Years of Excellence',
  '99.9%|Uptime',
  '4.8|Google Reviews',
  '10M+|Transactions Logged',
  '24/7|Support',
]

let failed = 0
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg)
    failed++
  } else {
    console.log('OK', msg)
  }
}

const stats = publicStats()
assert(stats.length === 7, `stats count === 7 (got ${stats.length})`)
assert(
  stats.map((s) => `${s.title}|${s.description}`).join(';;') === expected.join(';;'),
  'stats match canonical 7',
)

const h = heading()
assert(!!h, 'heading:logos published')
assert(
  /trusted by pakistan/i.test(String(h?.title || '')),
  `trusted heading present (${h?.title})`,
)

const logos = publicLogos()
assert(logos.length >= 1 && !!logos[0].image_url, 'trusted logo image_url present')

// Edit test
const target = stats[1]
const originalDesc = target.description
target.description = 'Stations Active EDITED'
target.data = { ...(target.data || {}), label: 'Stations Active EDITED' }
assert(publicStats()[1].description === 'Stations Active EDITED', 'edit visible in public list')
target.description = originalDesc
target.data = { ...(target.data || {}), label: originalDesc }
assert(publicStats()[1].description === originalDesc, 'edit restored')

// Disable test
const sample = publicStats()[3]
const before = sample.is_enabled
sample.is_enabled = false
assert(publicStats().length === 6, 'disable removes from public list (no fallback)')
assert(!publicStats().some((s) => s.id === sample.id), 'disabled id absent')
sample.is_enabled = before
assert(publicStats().length === 7, 're-enable restores')

// Logo disable
const logo = logos[0]
const logoBefore = logo.is_enabled
logo.is_enabled = false
assert(publicLogos().length === 0, 'logo disable → empty public logos')
logo.is_enabled = logoBefore
assert(publicLogos().length >= 1, 'logo re-enabled')

// Ensure old 4-only set is not the only published set
const titles = publicStats().map((s) => s.title)
assert(titles.includes('1350+') && titles.includes('4.8'), 'not old 4-stat-only set')

if (failed) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log('\nAll local CMS stats/logo SoT tests passed')
