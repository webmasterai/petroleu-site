/**
 * Align en-PK About hero + Home stats with the published PMS dump content
 * the frontend is expected to show — field updates only, no reseed.
 * Does not overwrite AF locales with Pakistan-specific copy.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const files = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const PK_STATS = [
  { id: 2, title: '500+', description: 'Stations Active', sort_order: 0 },
  { id: 3, title: '99.9%', description: 'Uptime', sort_order: 1 },
  { id: 4, title: '10M+', description: 'Transactions Logged', sort_order: 2 },
  { id: 5, title: '24/7', description: 'Support', sort_order: 3 },
]

function patch(file) {
  if (!fs.existsSync(file)) {
    console.log('skip missing', file)
    return
  }
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  let n = 0
  const now = new Date().toISOString()

  const aboutHero = rows.find(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'about' &&
      s.section_key === 'hero',
  )
  if (aboutHero) {
    aboutHero.title = 'About Petroleu'
    aboutHero.description =
      'We are building the future of fuel station management in Pakistan.'
    aboutHero.status = 'published'
    aboutHero.is_enabled = true
    aboutHero.updated_at = now
    n++
  }

  for (const plan of PK_STATS) {
    const row = rows.find((s) => s.id === plan.id)
    if (!row) continue
    row.title = plan.title
    row.description = plan.description
    row.sort_order = plan.sort_order
    row.status = 'published'
    row.is_enabled = true
    row.page_slug = 'home'
    row.section_key = 'stat'
    row.data = {
      ...(row.data && typeof row.data === 'object' ? row.data : {}),
      value: plan.title,
      label: plan.description,
    }
    row.updated_at = now
    n++
  }

  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  console.log(path.relative(ROOT, file), 'updated fields', n)
}

for (const f of files) patch(f)

// Disable/restore smoke on id 5
const live = path.join(ROOT, 'storage', 'data', 'sections.json')
const rows = JSON.parse(fs.readFileSync(live, 'utf8'))
const sample = rows.find((s) => s.id === 5)
const before = sample.is_enabled
sample.is_enabled = false
let pub = rows.filter(
  (s) =>
    s.market_code === 'pk' &&
    s.locale_code === 'en-PK' &&
    s.section_key === 'stat' &&
    s.status === 'published' &&
    s.is_enabled !== false,
)
console.log('disable test public stats', pub.length, pub.map((p) => p.title).join(','))
sample.is_enabled = before
pub = rows.filter(
  (s) =>
    s.market_code === 'pk' &&
    s.locale_code === 'en-PK' &&
    s.section_key === 'stat' &&
    s.status === 'published' &&
    s.is_enabled !== false,
)
console.log('restored public stats', pub.length, pub.map((p) => `${p.title}=${p.description}`).join(' | '))
fs.writeFileSync(live, JSON.stringify(rows, null, 2) + '\n')
