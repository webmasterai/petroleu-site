/**
 * Set home stats to the canonical 4-item list (CMS source of truth).
 * Updates/creates the four keepers; removes obsolete homepage stats
 * (1350+ Petrol Pumps, 20+ Years of Excellence, 4.8 Google Reviews).
 * Refreshes PK + AF locale rows so storage-seed cannot reintroduce the old 7.
 * Does not touch users/inquiries/uploads. Local storage/data + storage-seed only.
 *
 * Run: node scripts/sync-pk-stats-4.cjs
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const FILES = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const OBSOLETE_VALUES = new Set(['1350+', '20+', '4.8'])

const STATS = {
  'en-PK': [
    { title: '500+', description: 'Stations Active' },
    { title: '99.9%', description: 'Uptime' },
    { title: '10M+', description: 'Transactions Logged' },
    { title: '24/7', description: 'Support' },
  ],
  'en-AF': [
    { title: '500+', description: 'Stations Active' },
    { title: '99.9%', description: 'Uptime' },
    { title: '10M+', description: 'Transactions Logged' },
    { title: '24/7', description: 'Support' },
  ],
  'fa-AF': [
    { title: '500+', description: 'ایستگاه‌های فعال' },
    { title: '99.9%', description: 'آپ‌تایم' },
    { title: '10M+', description: 'تراکنش ثبت‌شده' },
    { title: '24/7', description: 'پشتیبانی' },
  ],
  'ps-AF': [
    { title: '500+', description: 'فعال سټیشنونه' },
    { title: '99.9%', description: 'اپ‌ټایم' },
    { title: '10M+', description: 'ثبت شوي لیږدونه' },
    { title: '24/7', description: 'ملاتړ' },
  ],
}

function marketFor(locale) {
  return locale.endsWith('PK') ? 'pk' : 'af'
}

function rowValue(row) {
  return String(row?.data?.value || row?.title || '').trim()
}

function applyStat(row, stat, sortOrder, now) {
  row.title = stat.title
  row.description = stat.description
  row.sort_order = sortOrder
  row.status = 'published'
  row.is_enabled = true
  row.page_slug = 'home'
  row.section_key = 'stat'
  row.data = {
    ...(row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}),
    value: stat.title,
    label: stat.description,
  }
  row.updated_at = now
}

function pickRow(list, wantTitle, keepIds) {
  const exact = list.find((r) => rowValue(r) === wantTitle && !keepIds.has(r.id))
  if (exact) return exact
  const reusable = list.find((r) => !keepIds.has(r.id) && !OBSOLETE_VALUES.has(rowValue(r)))
  if (reusable) return reusable
  return list.find((r) => !keepIds.has(r.id)) || null
}

function patch(file) {
  let rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  let maxId = Math.max(0, ...rows.map((r) => Number(r.id) || 0))
  const nextId = () => ++maxId
  const now = new Date().toISOString()
  let updated = 0
  let inserted = 0
  let removed = 0

  for (const [locale, stats] of Object.entries(STATS)) {
    const market = marketFor(locale)
    const list = rows.filter(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'stat',
    )

    const keepIds = new Set()

    for (let i = 0; i < stats.length; i++) {
      const want = stats[i]
      let row = pickRow(list, want.title, keepIds)

      if (row) {
        applyStat(row, want, i, now)
        keepIds.add(row.id)
        updated++
      } else {
        const created = {
          id: nextId(),
          market_code: market,
          locale_code: locale,
          page_slug: 'home',
          section_key: 'stat',
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
        inserted++
      }
    }

    const before = rows.length
    rows = rows.filter((s) => {
      if (
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'stat' &&
        !keepIds.has(s.id)
      ) {
        return false
      }
      return true
    })
    removed += before - rows.length
  }

  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  console.log(path.basename(path.dirname(file)) + '/' + path.basename(file), {
    updated,
    inserted,
    removed,
  })
}

for (const f of FILES) {
  if (fs.existsSync(f)) patch(f)
}

const livePath = FILES[0]
if (fs.existsSync(livePath)) {
  const live = JSON.parse(fs.readFileSync(livePath, 'utf8'))
  const pub = live
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
  console.log(
    'en-PK public stats',
    pub.length,
    pub.map((p) => `${p.title} ${p.description}`).join(' | '),
  )
}
