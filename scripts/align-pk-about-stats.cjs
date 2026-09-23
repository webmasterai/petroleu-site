/**
 * Align en-PK About hero + Home stats — canonical 4 stats (field updates only).
 * Prefer scripts/sync-pk-stats-4.cjs for full insert/remove handling.
 * Prefer petroleu-next/scripts/cleanup-pk-home-stats-4.mjs for production-scoped cleanup.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const files = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const PK_STATS = [
  { title: '500+', description: 'Stations Active', sort_order: 0 },
  { title: '99.9%', description: 'Uptime', sort_order: 1 },
  { title: '10M+', description: 'Transactions Logged', sort_order: 2 },
  { title: '24/7', description: 'Support', sort_order: 3 },
]

function rowValue(row) {
  return String(row?.data?.value || row?.title || '').trim()
}

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

  const list = rows.filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'home' &&
      s.section_key === 'stat',
  )

  for (const plan of PK_STATS) {
    const row = list.find((r) => rowValue(r) === plan.title)
    if (!row) continue
    row.title = plan.title
    row.description = plan.description
    row.sort_order = plan.sort_order
    row.status = 'published'
    row.is_enabled = true
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
console.log('Note: run node scripts/sync-pk-stats-4.cjs to insert/remove so exactly 4 public stats remain.')
