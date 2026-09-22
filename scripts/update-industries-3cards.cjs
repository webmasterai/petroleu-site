/**
 * Industries home section: exactly 3 cards matching marketing design.
 * Updates existing `home`/`industry` (+ industries page cards) — no duplicate inserts.
 * Disables extra cards beyond 3.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const FILES = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const CARDS = {
  'en-PK': [
    {
      title: 'Petrol Pumps',
      description: 'PSO, Shell, Total, Attock and independent fuel stations',
      icon: 'Fuel',
      color_class: 'bg-primary/10 text-primary',
    },
    {
      title: 'CNG Stations',
      description: 'Compressed natural gas filling stations and hybrid pumps',
      icon: 'Droplets',
      color_class: 'bg-accent/10 text-accent',
    },
    {
      title: 'Fleet Fueling',
      description: 'Transport companies with in-house fueling facilities',
      icon: 'Truck',
      color_class: 'bg-chart-5/10 text-chart-5',
    },
  ],
  'en-AF': [
    {
      title: 'Petrol Pumps',
      description: 'PSO, Shell, Total, Attock and independent fuel stations',
      icon: 'Fuel',
      color_class: 'bg-primary/10 text-primary',
    },
    {
      title: 'CNG Stations',
      description: 'Compressed natural gas filling stations and hybrid pumps',
      icon: 'Droplets',
      color_class: 'bg-accent/10 text-accent',
    },
    {
      title: 'Fleet Fueling',
      description: 'Transport companies with in-house fueling facilities',
      icon: 'Truck',
      color_class: 'bg-chart-5/10 text-chart-5',
    },
  ],
  'fa-AF': [
    {
      title: 'پمپ‌های تیل',
      description: 'PSO، Shell، Total، Attock و پمپ‌های مستقل',
      icon: 'Fuel',
      color_class: 'bg-primary/10 text-primary',
    },
    {
      title: 'ایستگاه‌های CNG',
      description: 'جایگاه‌های گاز طبیعی فشرده و پمپ‌های ترکیبی',
      icon: 'Droplets',
      color_class: 'bg-accent/10 text-accent',
    },
    {
      title: 'سوخت‌گیری ناوگان',
      description: 'شرکت‌های ترانسپورت با تأسیسات سوخت‌گیری داخلی',
      icon: 'Truck',
      color_class: 'bg-chart-5/10 text-chart-5',
    },
  ],
  'ps-AF': [
    {
      title: 'تیل پمپونه',
      description: 'PSO، Shell، Total، Attock او خپلواک تیل پمپونه',
      icon: 'Fuel',
      color_class: 'bg-primary/10 text-primary',
    },
    {
      title: 'CNG سټیشنونه',
      description: 'د فشار شوي طبیعي ګاز ډکولو سټیشنونه او هایبرډ پمپونه',
      icon: 'Droplets',
      color_class: 'bg-accent/10 text-accent',
    },
    {
      title: 'د بیړۍ سون',
      description: 'د ترانسپورت شرکتونه د کور دننه سون تاسیساتو سره',
      icon: 'Truck',
      color_class: 'bg-chart-5/10 text-chart-5',
    },
  ],
}

const HEADINGS = {
  'en-PK': {
    eyebrow: 'Best Industries',
    title: 'Built for Fuel Businesses',
    description: 'Tailored features for different fuel station types',
  },
  'en-AF': {
    eyebrow: 'Best Industries',
    title: 'Built for Fuel Businesses',
    description: 'Tailored features for different fuel station types',
  },
  'fa-AF': {
    eyebrow: 'صنایع',
    title: 'ساخته‌شده برای کسب‌وکارهای سوخت',
    description: 'ویژگی‌های متناسب با انواع پمپ تیل',
  },
  'ps-AF': {
    eyebrow: 'صنایع',
    title: 'د سون توکو سوداګریو لپاره جوړ شوی',
    description: 'د بېلابېلو سون توکو پمپ ډولونو لپاره ځانګړي ځانګړتیاوې',
  },
}

function marketFor(locale) {
  return locale.endsWith('PK') ? 'pk' : 'af'
}

function applyCard(row, card, sortOrder, now) {
  row.title = card.title
  row.description = card.description
  row.sort_order = sortOrder
  row.status = 'published'
  row.is_enabled = true
  row.data = {
    ...(row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}),
    icon: card.icon,
    color_class: card.color_class,
    colorClass: card.color_class,
  }
  row.updated_at = now
}

function patchList(rows, filterFn, cards, now) {
  const list = rows.filter(filterFn).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  let updated = 0
  let disabled = 0
  for (let i = 0; i < list.length; i++) {
    if (i < 3) {
      applyCard(list[i], cards[i], i, now)
      updated++
    } else {
      list[i].is_enabled = false
      list[i].status = 'draft'
      list[i].updated_at = now
      disabled++
    }
  }
  // If fewer than 3 home industry rows, we only update what exists (no insert)
  return { updated, disabled, count: list.length }
}

function patch(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  const now = new Date().toISOString()
  let updated = 0
  let disabled = 0

  for (const [locale, cards] of Object.entries(CARDS)) {
    const market = marketFor(locale)

    const home = patchList(
      rows,
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'industry',
      cards,
      now,
    )
    updated += home.updated
    disabled += home.disabled

    const page = patchList(
      rows,
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'industries' &&
        s.section_key === 'industry-card',
      cards,
      now,
    )
    updated += page.updated
    disabled += page.disabled

    const heading = rows.find(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'heading:industries',
    )
    const h = HEADINGS[locale]
    if (heading && h) {
      heading.title = h.title
      heading.description = h.description
      heading.status = 'published'
      heading.is_enabled = true
      heading.data = {
        ...(heading.data && typeof heading.data === 'object' ? heading.data : {}),
        eyebrow: h.eyebrow,
        badge: h.eyebrow,
      }
      heading.updated_at = now
      updated++
    }
  }

  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  console.log(path.basename(path.dirname(file)) + '/' + path.basename(file), {
    updated,
    disabled,
  })
}

for (const f of FILES) patch(f)

const live = JSON.parse(fs.readFileSync(FILES[0], 'utf8'))
const pub = live
  .filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.page_slug === 'home' &&
      s.section_key === 'industry' &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
console.log(
  'en-PK home industry public',
  pub.length,
  pub.map((p) => p.title).join(' | '),
)
