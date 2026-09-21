/**
 * Targeted CMS parity patch — only fixes broken/outdated fields and adds missing AF content.
 * Does not reseed, reset users, or wipe existing translations.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'petroleu-next', 'storage', 'data', 'sections.json')
const sections = JSON.parse(fs.readFileSync(file, 'utf8'))
let maxId = Math.max(...sections.map((s) => s.id))
const nextId = () => ++maxId
const changes = []

const pricingFixes = {
  'en-PK': {
    title: 'Simple, Transparent Pricing',
    description: 'Choose the plan that fits your fuel station. All plans include a 14-day free trial.',
  },
  'en-AF': {
    title: 'Simple, Transparent Pricing',
    description: 'Choose the plan that fits your fuel station. All plans include a 14-day free trial.',
  },
  'fa-AF': {
    title: 'قیمت‌گذاری ساده و شفاف',
    description:
      'پلانی را انتخاب کنید که با پمپ تیل شما سازگار باشد. همه پلان‌ها ۱۴ روز آزمایش رایگان دارند.',
  },
  'ps-AF': {
    title: 'ساده او روڼ بیه‌ډول',
    description:
      'هغه پلان وټاکئ چې ستاسو د سون توکو پمپ سره سمون لري. ټول پلانونه ۱۴ ورځنی وړیا ازموینه لري.',
  },
}

for (const s of sections) {
  if (s.section_key !== 'heading:pricing') continue
  const fix = pricingFixes[s.locale_code]
  if (!fix) continue
  if (s.title !== fix.title || s.description !== fix.description) {
    changes.push(`pricing heading ${s.id} ${s.locale_code}`)
    s.title = fix.title
    s.description = fix.description
    s.updated_at = new Date().toISOString()
  }
}

const testimonialFull = {
  56: {
    content:
      'Dari and Pashto interface options help our attendants with nozzle entry and shift closing.',
    title: 'Station Manager',
    data: {
      quote:
        'Dari and Pashto interface options help our attendants with nozzle entry and shift closing.',
      author_name: 'Station Manager',
      author_role: 'Station Manager',
      author_company: 'Afghanistan',
      city: 'Kabul',
      rating: 5,
    },
  },
  132: {
    content: 'رابط دری و پشتو به متصدیان ما در ثبت نوزل و بستن شیفت کمک می‌کند.',
    data: {
      quote: 'رابط دری و پشتو به متصدیان ما در ثبت نوزل و بستن شیفت کمک می‌کند.',
      author_name: 'مدیر پمپ',
      author_role: 'مدیر پمپ',
      author_company: 'افغانستان',
      city: 'کابل',
      rating: 5,
    },
  },
  208: {
    content: 'د دري او پښتو انټرفیس زموږ متصدیانو ته د نوزل ثبت او شفټ بندښت کې مرسته کوي.',
    data: {
      quote: 'د دري او پښتو انټرفیس زموږ متصدیانو ته د نوزل ثبت او شفټ بندښت کې مرسته کوي.',
      author_name: 'د پمپ مدیر',
      author_role: 'د پمپ مدیر',
      author_company: 'افغانستان',
      city: 'کابل',
      rating: 5,
    },
  },
}

const testimonialCities = {
  66: 'Herat',
  76: 'Mazar-e-Sharif',
  142: 'هرات',
  152: 'مزار شریف',
  218: 'هرات',
  228: 'مزار شریف',
}

for (const [idStr, patch] of Object.entries(testimonialFull)) {
  const s = sections.find((x) => x.id === Number(idStr))
  if (!s) continue
  s.content = patch.content
  if (patch.title) s.title = patch.title
  s.data = { ...(s.data || {}), ...patch.data }
  s.updated_at = new Date().toISOString()
  changes.push(`testimonial ${idStr} content`)
}

for (const [idStr, city] of Object.entries(testimonialCities)) {
  const s = sections.find((x) => x.id === Number(idStr))
  if (!s) continue
  s.data = { ...(s.data || {}), city }
  s.updated_at = new Date().toISOString()
  changes.push(`testimonial ${idStr} city=${city}`)
}

const faqUrduFixes = [
  {
    locale: 'en-AF',
    match: /Urdu/i,
    title: 'Does Petroleu support Dari and Pashto?',
    content:
      'Yes. Petroleu supports Dari and Pashto interfaces so station teams can work in the language they prefer.',
  },
  {
    locale: 'fa-AF',
    match: /اردو/,
    title: 'آیا Petroleu از دری و پشتو پشتیبانی می‌کند؟',
    content:
      'بله. Petroleu از رابط دری و پشتو پشتیبانی می‌کند تا تیم پمپ به زبان مورد نظر کار کند.',
  },
  {
    locale: 'ps-AF',
    match: /اردو/,
    title: 'آیا Petroleu دري او پښتو ملاتړ کوي؟',
    content:
      'هو. Petroleu د دري او پښتو انټرفیس ملاتړ کوي ترڅو د پمپ ټیم په خپله خوښه ژبه کار وکړي.',
  },
]

for (const fix of faqUrduFixes) {
  const s = sections.find(
    (x) =>
      x.market_code === 'af' &&
      x.locale_code === fix.locale &&
      x.section_key === 'faq' &&
      x.page_slug === 'home' &&
      fix.match.test(String(x.title || '') + String(x.content || '')),
  )
  if (!s) continue
  s.title = fix.title
  s.content = fix.content
  s.description = fix.content
  s.updated_at = new Date().toISOString()
  changes.push(`faq locale-language ${s.id} ${fix.locale}`)
}

const extraFaqs = {
  'en-AF': [
    {
      title: 'How long does it take to set up Petroleu?',
      content:
        'Most stations go live within a few days after onboarding, training, and initial data setup.',
    },
    {
      title: 'Can I use Petroleu offline?',
      content:
        'Yes. Core sales and stock operations continue offline and sync when the connection returns.',
    },
    {
      title: 'Is my data secure?',
      content:
        'Data is protected with role-based access, secure authentication, and regular backups.',
    },
    {
      title: 'Can I manage multiple fuel stations?',
      content:
        'Yes. Multi-station owners can monitor sales, stock, and receivables from one account.',
    },
  ],
  'fa-AF': [
    {
      title: 'راه‌اندازی Petroleu چقدر طول می‌کشد؟',
      content: 'بیشتر پمپ‌ها پس از آموزش و تنظیم اولیه داده‌ها ظرف چند روز فعال می‌شوند.',
    },
    {
      title: 'آیا می‌توانم Petroleu را آفلاین استفاده کنم؟',
      content:
        'بله. عملیات اصلی فروش و موجودی آفلاین ادامه می‌یابد و با بازگشت اینترنت همگام می‌شود.',
    },
    {
      title: 'آیا داده‌های من امن است؟',
      content:
        'داده‌ها با دسترسی مبتنی بر نقش، احراز هویت امن و پشتیبان‌گیری منظم محافظت می‌شوند.',
    },
    {
      title: 'آیا می‌توانم چند پمپ را مدیریت کنم؟',
      content: 'بله. مالکان چندپمپی می‌توانند فروش، موجودی و مطالبات را از یک حساب ببینند.',
    },
  ],
  'ps-AF': [
    {
      title: 'د Petroleu تنظیم څومره وخت نیسي؟',
      content: 'ډېری پمپونه د روزنې او لومړني معلوماتو تنظیم وروسته په څو ورځو کې فعالېږي.',
    },
    {
      title: 'آیا زه Petroleu پرته له انټرنټ کارولی شم؟',
      content:
        'هو. اصلي پلور او موجودي عملیات آفلاین دوام کوي او د اړیکې په راګرځېدو همغږي کېږي.',
    },
    {
      title: 'آیا زما معلومات خوندي دي؟',
      content: 'معلومات د رول پر بنسټ لاسرسي، خوندي تصدیق او منظم بیک‌اپ سره ساتل کېږي.',
    },
    {
      title: 'آیا زه څو پمپونه مدیریت کولی شم؟',
      content:
        'هو. د څو پمپونو خاوندان کولی شي پلور، موجودي او پورونه له یوه حساب څخه وګوري.',
    },
  ],
}

for (const [locale, faqs] of Object.entries(extraFaqs)) {
  const existing = sections.filter(
    (x) =>
      x.market_code === 'af' &&
      x.locale_code === locale &&
      x.section_key === 'faq' &&
      x.page_slug === 'home',
  )
  const titles = new Set(existing.map((x) => String(x.title || '').trim()))
  let sort = Math.max(0, ...existing.map((x) => Number(x.sort_order) || 0))
  for (const faq of faqs) {
    if (titles.has(faq.title)) continue
    sort += 10
    sections.push({
      id: nextId(),
      market_code: 'af',
      locale_code: locale,
      page_slug: 'home',
      section_key: 'faq',
      title: faq.title,
      description: faq.content,
      content: faq.content,
      image_url: null,
      image_alt: null,
      link_label: null,
      link_url: null,
      sort_order: sort,
      status: 'published',
      is_enabled: true,
      is_shared: false,
      translation_status: 'ready',
      data: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    changes.push(`add faq ${locale}: ${faq.title.slice(0, 48)}`)
  }
}

const fourthTestimonials = [
  {
    locale: 'en-AF',
    title: 'Accountant',
    content: 'Tank dips and book stock stay aligned, so monthly reconciliation takes less time.',
    data: {
      quote: 'Tank dips and book stock stay aligned, so monthly reconciliation takes less time.',
      author_name: 'Accountant',
      author_role: 'Accountant',
      author_company: 'Afghanistan',
      city: 'Kandahar',
      rating: 5,
    },
  },
  {
    locale: 'fa-AF',
    title: 'حسابدار',
    content: 'اندازه‌گیری تانک و موجودی دفتری هم‌خوان است، پس تسویه ماهانه زمان کمتری می‌گیرد.',
    data: {
      quote: 'اندازه‌گیری تانک و موجودی دفتری هم‌خوان است، پس تسویه ماهانه زمان کمتری می‌گیرد.',
      author_name: 'حسابدار',
      author_role: 'حسابدار',
      author_company: 'افغانستان',
      city: 'قندهار',
      rating: 5,
    },
  },
  {
    locale: 'ps-AF',
    title: 'محاسب',
    content: 'د ټانک اندازه‌ګیرۍ او دفتری موجودي سره سمون لري، نو میاشتنی تصفیه لږ وخت نیسي.',
    data: {
      quote: 'د ټانک اندازه‌ګیرۍ او دفتری موجودي سره سمون لري، نو میاشتنی تصفیه لږ وخت نیسي.',
      author_name: 'محاسب',
      author_role: 'محاسب',
      author_company: 'افغانستان',
      city: 'کندهار',
      rating: 5,
    },
  },
]

for (const t of fourthTestimonials) {
  const existing = sections.filter(
    (x) =>
      x.market_code === 'af' &&
      x.locale_code === t.locale &&
      x.section_key === 'testimonial' &&
      x.page_slug === 'home',
  )
  if (
    existing.some(
      (x) => String(x.title || '') === t.title || String(x.data?.author_role || '') === t.title,
    )
  ) {
    continue
  }
  const sort = Math.max(0, ...existing.map((x) => Number(x.sort_order) || 0)) + 10
  sections.push({
    id: nextId(),
    market_code: 'af',
    locale_code: t.locale,
    page_slug: 'home',
    section_key: 'testimonial',
    title: t.title,
    description: null,
    content: t.content,
    image_url: null,
    image_alt: null,
    link_label: t.title,
    link_url: null,
    sort_order: sort,
    status: 'published',
    is_enabled: true,
    is_shared: false,
    translation_status: 'ready',
    data: t.data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  changes.push(`add testimonial ${t.locale} ${t.title}`)
}

fs.writeFileSync(file, JSON.stringify(sections, null, 2) + '\n', 'utf8')
console.log('CHANGES', changes.length)
for (const c of changes) console.log('-', c)
