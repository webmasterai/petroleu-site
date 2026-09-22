/**
 * Mobile Owner Dashboard features: exactly 6 cards (screenshot content).
 * Updates existing `home`/`mobile-feature` rows; inserts only if fewer than 6.
 * Also refreshes `heading:mobile`.
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
      title: 'Live Sales Overview',
      description:
        "See today's nozzle sales, cash totals, and credit charges from your phone.",
      icon: 'BarChart3',
    },
    {
      title: 'Tank Stock Status',
      description:
        'Check petrol, diesel, and HOBC stock levels without calling the forecourt.',
      icon: 'Droplets',
    },
    {
      title: 'Cash and Credit Summary',
      description:
        'Review how much was collected in cash versus charged to credit accounts.',
      icon: 'Wallet',
    },
    {
      title: 'Customer Outstanding Balances',
      description:
        'See which credit customers owe money before month-end collection.',
      icon: 'Fuel',
    },
    {
      title: 'Daily Closing Reports',
      description:
        'Open shift and day-end closing figures from the mobile owner dashboard.',
      icon: 'FileText',
    },
    {
      title: 'Mobile-Friendly Dashboard',
      description:
        'Built for quick checks while travelling or managing more than one station.',
      icon: 'Activity',
    },
  ],
  'en-AF': [
    {
      title: 'Live Sales Overview',
      description:
        "See today's nozzle sales, cash totals, and credit charges from your phone.",
      icon: 'BarChart3',
    },
    {
      title: 'Tank Stock Status',
      description:
        'Check petrol, diesel, and HOBC stock levels without calling the forecourt.',
      icon: 'Droplets',
    },
    {
      title: 'Cash and Credit Summary',
      description:
        'Review how much was collected in cash versus charged to credit accounts.',
      icon: 'Wallet',
    },
    {
      title: 'Customer Outstanding Balances',
      description:
        'See which credit customers owe money before month-end collection.',
      icon: 'Fuel',
    },
    {
      title: 'Daily Closing Reports',
      description:
        'Open shift and day-end closing figures from the mobile owner dashboard.',
      icon: 'FileText',
    },
    {
      title: 'Mobile-Friendly Dashboard',
      description:
        'Built for quick checks while travelling or managing more than one station.',
      icon: 'Activity',
    },
  ],
  'fa-AF': [
    {
      title: 'نمای کلی فروش زنده',
      description: 'فروش نازل، جمع نقدی و شارژ اعتباری امروز را از موبایل ببینید.',
      icon: 'BarChart3',
    },
    {
      title: 'وضعیت موجودی تانک',
      description: 'سطح موجودی پترول، دیزل و HOBC را بدون تماس با پیشخوان چک کنید.',
      icon: 'Droplets',
    },
    {
      title: 'خلاصه نقد و اعتبار',
      description: 'ببینید چقدر نقد جمع شده و چقدر به حساب‌های اعتباری شارژ شده است.',
      icon: 'Wallet',
    },
    {
      title: 'مانده بدهی مشتریان',
      description: 'قبل از وصول پایان ماه ببینید کدام مشتریان اعتباری بدهکارند.',
      icon: 'Fuel',
    },
    {
      title: 'گزارش‌های بستن روزانه',
      description: 'ارقام بستن شیفت و روز را از داشبورد موبایل مالک باز کنید.',
      icon: 'FileText',
    },
    {
      title: 'داشبورد سازگار با موبایل',
      description: 'برای بررسی سریع هنگام سفر یا مدیریت چند پمپ طراحی شده است.',
      icon: 'Activity',
    },
  ],
  'ps-AF': [
    {
      title: 'د ژوندي پلور لنډیز',
      description: 'د نن ورځې نوزل پلور، نغدي ټولګه او کریډیټ چارجونه له موبایل وګورئ.',
      icon: 'BarChart3',
    },
    {
      title: 'د ټانک ذخیره حالت',
      description: 'د پټرول، ډیزل او HOBC ذخیره پرته له مخکینۍ برخې ته زنګ وهلو وګورئ.',
      icon: 'Droplets',
    },
    {
      title: 'نغدي او کریډیټ لنډیز',
      description: 'وګورئ څومره نغدي راټول شوي او څومره کریډیټ حسابونو ته چارج شوي.',
      icon: 'Wallet',
    },
    {
      title: 'د پیرودونکو پاتې پور',
      description: 'د میاشتې پای راټولولو دمخه وګورئ کوم کریډیټ پیرودونکي پور لري.',
      icon: 'Fuel',
    },
    {
      title: 'ورځني بند راپورونه',
      description: 'د شفټ او ورځې پای بند شمیرې د مالک موبایل ډشبورډ څخه پرانیزئ.',
      icon: 'FileText',
    },
    {
      title: 'موبایل دوستانه ډشبورډ',
      description: 'د سفر پر مهال یا د څو سټیشنونو مدیریت لپاره چټک چک جوړ شوی.',
      icon: 'Activity',
    },
  ],
}

const HEADINGS = {
  'en-PK': {
    eyebrow: 'Mobile App',
    title: 'Mobile Owner Dashboard',
    description:
      'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
  },
  'en-AF': {
    eyebrow: 'Mobile App',
    title: 'Mobile Owner Dashboard',
    description:
      'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
  },
  'fa-AF': {
    eyebrow: 'اپ موبایل',
    title: 'داشبورد موبایل مالک',
    description:
      'فروش، موجودی، نقد، اعتبار و گزارش‌ها را از موبایل ببینید — بدون ماندن تمام‌روز در پمپ.',
  },
  'ps-AF': {
    eyebrow: 'موبایل اپ',
    title: 'د مالک موبایل ډشبورډ',
    description:
      'پلور، ذخیره، نغدي، کریډیټ او راپورونه له موبایل وګورئ — پرته له دې چې ټوله ورځ سټیشن کې پاتې شئ.',
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
  }
  row.updated_at = now
}

function patch(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  let maxId = Math.max(0, ...rows.map((s) => Number(s.id) || 0))
  const nextId = () => ++maxId
  const now = new Date().toISOString()
  let updated = 0
  let inserted = 0
  let disabled = 0

  for (const [locale, cards] of Object.entries(CARDS)) {
    const market = marketFor(locale)
    const list = rows
      .filter(
        (s) =>
          s.market_code === market &&
          s.locale_code === locale &&
          s.page_slug === 'home' &&
          s.section_key === 'mobile-feature',
      )
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    for (let i = 0; i < cards.length; i++) {
      if (list[i]) {
        applyCard(list[i], cards[i], i, now)
        updated++
      } else {
        const template = list[0] || {
          market_code: market,
          locale_code: locale,
          page_slug: 'home',
          section_key: 'mobile-feature',
          content: null,
          image_url: null,
          image_alt: null,
          link_label: null,
          link_url: null,
          is_shared: false,
          translation_status: 'ready',
        }
        const row = {
          ...template,
          id: nextId(),
          title: cards[i].title,
          description: cards[i].description,
          sort_order: i,
          status: 'published',
          is_enabled: true,
          data: { icon: cards[i].icon },
          published_at: now,
          created_at: now,
          updated_at: now,
        }
        rows.push(row)
        list.push(row)
        inserted++
      }
    }

    for (let i = cards.length; i < list.length; i++) {
      list[i].is_enabled = false
      list[i].status = 'draft'
      list[i].updated_at = now
      disabled++
    }

    const heading = rows.find(
      (s) =>
        s.market_code === market &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'heading:mobile',
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
    inserted,
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
      s.section_key === 'mobile-feature' &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
console.log(
  'en-PK public mobile-feature',
  pub.length,
  pub.map((p) => p.title).join(' | '),
)
