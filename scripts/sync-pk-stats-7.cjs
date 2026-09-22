/**
 * Set en-PK home stats to the canonical 7-item list (CMS source of truth).
 * Updates existing `stat` rows; inserts only if fewer than 7.
 * Also refreshes AF locale stats to the same 7 values (localized labels).
 * Does not touch users/inquiries. Local storage/data + storage-seed only.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const FILES = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const STATS = {
  'en-PK': [
    { title: '1350+', description: 'Petrol Pumps' },
    { title: '500+', description: 'Stations Active' },
    { title: '20+', description: 'Years of Excellence' },
    { title: '99.9%', description: 'Uptime' },
    { title: '4.8', description: 'Google Reviews' },
    { title: '10M+', description: 'Transactions Logged' },
    { title: '24/7', description: 'Support' },
  ],
  'en-AF': [
    { title: '1350+', description: 'Petrol Pumps' },
    { title: '500+', description: 'Stations Active' },
    { title: '20+', description: 'Years of Excellence' },
    { title: '99.9%', description: 'Uptime' },
    { title: '4.8', description: 'Google Reviews' },
    { title: '10M+', description: 'Transactions Logged' },
    { title: '24/7', description: 'Support' },
  ],
  'fa-AF': [
    { title: '1350+', description: 'پمپ‌های تیل' },
    { title: '500+', description: 'ایستگاه‌های فعال' },
    { title: '20+', description: 'سال‌ها تجربه' },
    { title: '99.9%', description: 'آپ‌تایم' },
    { title: '4.8', description: 'Google Reviews' },
    { title: '10M+', description: 'تراکنش ثبت‌شده' },
    { title: '24/7', description: 'پشتیبانی' },
  ],
  'ps-AF': [
    { title: '1350+', description: 'تیل پمپونه' },
    { title: '500+', description: 'فعال سټیشنونه' },
    { title: '20+', description: 'کلونه تجربه' },
    { title: '99.9%', description: 'اپ‌ټایم' },
    { title: '4.8', description: 'Google Reviews' },
    { title: '10M+', description: 'ثبت شوي لیږدونه' },
    { title: '24/7', description: 'ملاتړ' },
  ],
}

function marketFor(locale) {
  return locale.endsWith('PK') ? 'pk' : 'af'
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

function patch(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  let maxId = Math.max(0, ...rows.map((r) => Number(r.id) || 0))
  const nextId = () => ++maxId
  const now = new Date().toISOString()
  let updated = 0
  let inserted = 0
  let disabled = 0

  for (const [locale, stats] of Object.entries(STATS)) {
    const market = marketFor(locale)
    const list = rows
      .filter(
        (s) =>
          s.market_code === market &&
          s.locale_code === locale &&
          s.page_slug === 'home' &&
          s.section_key === 'stat',
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    for (let i = 0; i < stats.length; i++) {
      if (list[i]) {
        applyStat(list[i], stats[i], i, now)
        updated++
      } else {
        const row = {
          id: nextId(),
          market_code: market,
          locale_code: locale,
          page_slug: 'home',
          section_key: 'stat',
          title: stats[i].title,
          description: stats[i].description,
          content: null,
          data: { value: stats[i].title, label: stats[i].description },
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
        rows.push(row)
        list.push(row)
        inserted++
      }
    }

    for (let i = stats.length; i < list.length; i++) {
      list[i].is_enabled = false
      list[i].status = 'draft'
      list[i].updated_at = now
      disabled++
    }

    // Ensure trusted heading exists / published
    const heading = rows.find(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'heading:logos',
    )
    if (heading && locale === 'en-PK') {
      heading.title = "Trusted by Pakistan's leading fuel networks"
      heading.status = 'published'
      heading.is_enabled = true
      heading.data = {
        ...(heading.data && typeof heading.data === 'object' ? heading.data : {}),
        eyebrow: heading.data?.eyebrow || 'Trusted networks',
        badge: heading.data?.badge || 'Trusted networks',
      }
      heading.updated_at = now
      updated++
    }
  }

  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  console.log(path.basename(path.dirname(file)) + '/' + path.basename(file), {
    updated,
    inserted,
    disabled,
  })
}

for (const f of FILES) {
  if (fs.existsSync(f)) patch(f)
}

const live = JSON.parse(fs.readFileSync(FILES[0], 'utf8'))
const pub = live
  .filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
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
