/**
 * Update Getting Started / how-it-works to exactly 3 cards (screenshot content).
 * Updates existing rows — does not insert duplicates. Disables the 4th card.
 * Additive field updates only; no full reseed.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'petroleu-next')
const FILES = [
  path.join(ROOT, 'storage', 'data', 'sections.json'),
  path.join(ROOT, 'storage-seed', 'sections.json'),
]

const STEPS = {
  'en-PK': [
    {
      title: 'Sign up',
      description:
        'Create your account with station details in minutes — no IT team required.',
      icon: 'UserPlus',
      number: '01',
    },
    {
      title: 'Configure',
      description: 'Add tanks, nozzles, and products using the guided setup wizard.',
      icon: 'Settings',
      number: '02',
    },
    {
      title: 'Run & report',
      description: 'Record shifts, nozzle readings, and credit sales; pull reports instantly.',
      icon: 'Rocket',
      number: '03',
    },
  ],
  'en-AF': [
    {
      title: 'Sign up',
      description:
        'Create your account with station details in minutes — no IT team required.',
      icon: 'UserPlus',
      number: '01',
    },
    {
      title: 'Configure',
      description: 'Add tanks, nozzles, and products using the guided setup wizard.',
      icon: 'Settings',
      number: '02',
    },
    {
      title: 'Run & report',
      description: 'Record shifts, nozzle readings, and credit sales; pull reports instantly.',
      icon: 'Rocket',
      number: '03',
    },
  ],
  'fa-AF': [
    {
      title: 'ثبت‌نام',
      description: 'حساب خود را با جزئیات پمپ در چند دقیقه بسازید — بدون نیاز به تیم IT.',
      icon: 'UserPlus',
      number: '01',
    },
    {
      title: 'پیکربندی',
      description: 'تانک‌ها، نوزل‌ها و محصولات را با ویزارد راهنما اضافه کنید.',
      icon: 'Settings',
      number: '02',
    },
    {
      title: 'اجرا و گزارش',
      description: 'شیفت‌ها، قرائت نوزل و فروش اعتباری را ثبت کنید؛ گزارش فوری بگیرید.',
      icon: 'Rocket',
      number: '03',
    },
  ],
  'ps-AF': [
    {
      title: 'نوملیکنه',
      description: 'خپل حساب د پمپ جزئیاتو سره په څو دقیقو کې جوړ کړئ — د IT ټیم ته اړتیا نشته.',
      icon: 'UserPlus',
      number: '01',
    },
    {
      title: 'ترتیب',
      description: 'د لارښود ویزارډ سره ټانکونه، نوزلونه او محصولات اضافه کړئ.',
      icon: 'Settings',
      number: '02',
    },
    {
      title: 'چلول او راپور',
      description: 'شفټونه، نوزل لوستل او اعتباري خرڅلاو ثبت کړئ؛ سمدستي راپور واخلئ.',
      icon: 'Rocket',
      number: '03',
    },
  ],
}

const HEADINGS = {
  'en-PK': {
    eyebrow: 'Best Getting Started',
    title: 'Up & Running in Under 30 Minutes',
    description: 'Three simple steps to digitize your fuel station — no IT team required.',
    cta: 'Start Free Trial',
    ctaUrl: '/get-started',
  },
  'en-AF': {
    eyebrow: 'Best Getting Started',
    title: 'Up & Running in Under 30 Minutes',
    description: 'Three simple steps to digitize your fuel station — no IT team required.',
    cta: 'Start Free Trial',
    ctaUrl: '/af/en/get-started',
  },
  'fa-AF': {
    eyebrow: 'شروع سریع',
    title: 'در کمتر از ۳۰ دقیقه آماده شوید',
    description: 'سه گام ساده برای دیجیتالی کردن پمپ تیل — بدون نیاز به تیم IT.',
    cta: 'شروع آزمایش رایگان',
    ctaUrl: '/af/get-started',
  },
  'ps-AF': {
    eyebrow: 'چټک پیل',
    title: 'په ۳۰ دقیقو کې چمتو شئ',
    description: 'د سون توکو پمپ ډیجیټل کولو لپاره درې ساده ګامونه — د IT ټیم ته اړتیا نشته.',
    cta: 'وړیا ازموینه پیل کړئ',
    ctaUrl: '/af/ps/get-started',
  },
}

function marketFor(locale) {
  return locale.endsWith('PK') ? 'pk' : 'af'
}

function patch(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  const now = new Date().toISOString()
  let updated = 0
  let disabled = 0

  for (const [locale, steps] of Object.entries(STEPS)) {
    const market = marketFor(locale)
    const list = rows
      .filter(
        (s) =>
          s.market_code === market &&
          s.locale_code === locale &&
          s.page_slug === 'home' &&
          s.section_key === 'how-it-works',
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    for (let i = 0; i < list.length; i++) {
      const row = list[i]
      if (i < 3) {
        const step = steps[i]
        row.title = step.title
        row.description = step.description
        row.sort_order = i
        row.status = 'published'
        row.is_enabled = true
        row.data = {
          ...(row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {}),
          icon: step.icon,
          number: step.number,
        }
        row.updated_at = now
        updated++
      } else {
        // Keep record but hide — do not add a 4th card on the site
        row.is_enabled = false
        row.status = 'draft'
        row.updated_at = now
        disabled++
      }
    }

    const heading = rows.find(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'heading:getting-started',
    )
    const h = HEADINGS[locale]
    if (heading && h) {
      heading.title = h.title
      heading.description = h.description
      heading.link_label = h.cta
      heading.link_url = h.ctaUrl
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

// Verify en-PK public count
const live = JSON.parse(fs.readFileSync(FILES[0], 'utf8'))
const pub = live
  .filter(
    (s) =>
      s.market_code === 'pk' &&
      s.locale_code === 'en-PK' &&
      s.section_key === 'how-it-works' &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
console.log(
  'en-PK public how-it-works',
  pub.length,
  pub.map((p) => p.title).join(' | '),
)
