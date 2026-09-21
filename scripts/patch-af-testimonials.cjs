/**
 * Upgrade AF testimonials to PK-style named carousel cards (6 reviews, dates, cities).
 * Additive: adds one array section per locale; disables old generic single-card rows.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'petroleu-next', 'storage', 'data', 'sections.json')
const sections = JSON.parse(fs.readFileSync(file, 'utf8'))
let maxId = Math.max(0, ...sections.map((s) => Number(s.id) || 0))
const nextId = () => ++maxId
const changes = []

const PACKS = {
  'en-AF': [
    {
      name: 'Ahmad Rahimi',
      role: 'Owner, Fuel Station',
      city: 'Kabul',
      rating: 5,
      date: '2 weeks ago',
      content:
        'Nozzle readings and daily closing are much easier now. We catch meter variances during the shift instead of finding problems in the register at night.',
    },
    {
      name: 'Omar Habibi',
      role: 'Manager, City Pump',
      city: 'Herat',
      rating: 5,
      date: '1 month ago',
      content:
        'Daily closing used to take hours with manual registers. Credit customer ledgers and shift reports are now in one place, which saves our team real time.',
    },
    {
      name: 'Farid Nazari',
      role: 'Owner, Highway Station',
      city: 'Mazar-e-Sharif',
      rating: 5,
      date: '3 weeks ago',
      content:
        'I check sales, tank stock, and credit outstanding from mobile when I am away from the forecourt. Support has been responsive when we needed help.',
    },
    {
      name: 'Karim Saberi',
      role: 'Director, Fuel Network',
      city: 'Kandahar',
      rating: 5,
      date: '1 week ago',
      content:
        'We run multiple stations and needed location-wise closing reports without collecting notebooks from each site. Petroleu gives us that view from one login.',
    },
    {
      name: 'Najib Ahmadi',
      role: 'Owner, Retail Pump',
      city: 'Jalalabad',
      rating: 4,
      date: '2 months ago',
      content:
        'Tank dipping reports help us compare book stock with physical dips. Variance shows up early, which makes stock follow-up more practical.',
    },
    {
      name: 'Zalmai Noori',
      role: 'Station Manager',
      city: 'Kabul',
      rating: 5,
      date: '3 days ago',
      content:
        'Dari and Pashto interface options help our attendants with nozzle entry and shift closing. Credit customers like receiving WhatsApp invoice details after fills.',
    },
  ],
  'fa-AF': [
    {
      name: 'احمد رحیمی',
      role: 'مالک پمپ تیل',
      city: 'کابل',
      rating: 5,
      date: '۲ هفته پیش',
      content:
        'خوانش نوزل و بستن روزانه حالا خیلی آسان‌تر است. اختلاف متر را در شیفت می‌گیریم نه اینکه شب در دفتر پیدا کنیم.',
    },
    {
      name: 'عمر حبیبی',
      role: 'مدیر پمپ شهری',
      city: 'هرات',
      rating: 5,
      date: '۱ ماه پیش',
      content:
        'بستن روزانه قبلاً با دفاتر دستی ساعت‌ها طول می‌کشید. دفتر مشتریان اعتباری و گزارش شیفت حالا در یک جا است و وقت تیم را ذخیره می‌کند.',
    },
    {
      name: 'فرید نظری',
      role: 'مالک ایستگاه جاده',
      city: 'مزار شریف',
      rating: 5,
      date: '۳ هفته پیش',
      content:
        'وقتی از محوطه دور هستم فروش، موجودی تانک و اعتبار باقی‌مانده را از موبایل می‌بینم. پشتیبانی وقتی نیاز داشتیم پاسخگو بود.',
    },
    {
      name: 'کریم صابری',
      role: 'مدیر شبکه سوخت',
      city: 'قندهار',
      rating: 5,
      date: '۱ هفته پیش',
      content:
        'چند پمپ داریم و بدون جمع‌کردن دفتر از هر سایت به گزارش بستن هر مکان نیاز داشتیم. Petroleu این دید را از یک ورود می‌دهد.',
    },
    {
      name: 'نجیب احمدی',
      role: 'مالک پمپ خرده‌فروشی',
      city: 'جلال‌آباد',
      rating: 4,
      date: '۲ ماه پیش',
      content:
        'گزارش اندازه‌گیری تانک کمک می‌کند موجودی دفتری را با اندازه‌گیری فیزیکی مقایسه کنیم. اختلاف زود دیده می‌شود و پیگیری موجودی عملی‌تر است.',
    },
    {
      name: 'زلمای نوری',
      role: 'مدیر پمپ',
      city: 'کابل',
      rating: 5,
      date: '۳ روز پیش',
      content:
        'رابط دری و پشتو به متصدیان در ثبت نوزل و بستن شیفت کمک می‌کند. مشتریان اعتباری جزئیات فاکتور را پس از سوخت‌گیری در واتساپ می‌گیرند.',
    },
  ],
  'ps-AF': [
    {
      name: 'احمد رحیمي',
      role: 'د تیل پمپ خاوند',
      city: 'کابل',
      rating: 5,
      date: '۲ اونۍ وړاندې',
      content:
        'د نوزل لوستل او ورځنی بندښت اوس ډېر اسان دی. د میټر توپیرونه په شفټ کې نیسو نه دا چې شپه په ثبت کې ومومو.',
    },
    {
      name: 'عمر حبیبي',
      role: 'د ښاري پمپ مدیر',
      city: 'هرات',
      rating: 5,
      date: '۱ میاشت وړاندې',
      content:
        'ورځنی بندښت پخوا د لاسي ثبتونو سره ساعتونه نیول. اعتباري پیرودونکو دفترونه او شفټ راپورونه اوس په یو ځای کې دي او د ټیم وخت خوندي کوي.',
    },
    {
      name: 'فرید نظري',
      role: 'د سړک سټیشن خاوند',
      city: 'مزار شریف',
      rating: 5,
      date: '۳ اونۍ وړاندې',
      content:
        'کله چې له محوطې لرې یم پلور، د ټانک موجودي او پاتې اعتبار له موبایل څخه ګورم. کله چې مرستې ته اړتیا وه ملاتړ ځواب ویونکی و.',
    },
    {
      name: 'کریم صابري',
      role: 'د سون شبکې مدیر',
      city: 'کندهار',
      rating: 5,
      date: '۱ اونۍ وړاندې',
      content:
        'موږ څو پمپونه لرو او پرته له دې چې له هر ځای څخه دفترونه راټول کړو د بندښت راپورونو ته اړتیا وه. Petroleu دا لید له یوه ننوتلو ورکوي.',
    },
    {
      name: 'نجیب احمدي',
      role: 'د پرچون پمپ خاوند',
      city: 'جلال اباد',
      rating: 4,
      date: '۲ میاشتې وړاندې',
      content:
        'د ټانک اندازه‌ګیرۍ راپورونه مرسته کوي دفتری موجودي د فزیکي اندازه‌ګیرۍ سره پرتله کړو. توپیر ژر ښکاري نو د موجودي تعقیب عملي دی.',
    },
    {
      name: 'زلمي نوري',
      role: 'د پمپ مدیر',
      city: 'کابل',
      rating: 5,
      date: '۳ ورځې وړاندې',
      content:
        'د دري او پښتو انټرفیس زموږ متصدیانو ته د نوزل ثبت او شفټ بندښت کې مرسته کوي. اعتباري پیرودونکي د تیل ډکولو وروسته د رسید جزئیات په WhatsApp ترلاسه کوي.',
    },
  ],
}

for (const locale of ['en-AF', 'fa-AF', 'ps-AF']) {
  const existingArray = sections.find(
    (s) =>
      s.market_code === 'af' &&
      s.locale_code === locale &&
      s.section_key === 'testimonial' &&
      s.page_slug === 'home' &&
      Array.isArray(s.data) &&
      s.data.length >= 4,
  )

  // Disable old single-card rows so API prefers the rich array
  for (const s of sections) {
    if (
      s.market_code === 'af' &&
      s.locale_code === locale &&
      s.section_key === 'testimonial' &&
      s.page_slug === 'home' &&
      !Array.isArray(s.data)
    ) {
      if (s.is_enabled !== false) {
        s.is_enabled = false
        s.status = 'draft'
        s.updated_at = new Date().toISOString()
        changes.push(`disable single testimonial ${s.id} ${locale}`)
      }
    }
  }

  if (existingArray) {
    existingArray.data = PACKS[locale]
    existingArray.status = 'published'
    existingArray.is_enabled = true
    existingArray.title = null
    existingArray.content = null
    existingArray.updated_at = new Date().toISOString()
    changes.push(`update array testimonial ${existingArray.id} ${locale}`)
    continue
  }

  sections.push({
    id: nextId(),
    market_code: 'af',
    locale_code: locale,
    page_slug: 'home',
    section_key: 'testimonial',
    title: null,
    description: null,
    content: null,
    image_url: null,
    image_alt: null,
    link_label: null,
    link_url: null,
    sort_order: 50,
    status: 'published',
    is_enabled: true,
    is_shared: false,
    translation_status: 'ready',
    data: PACKS[locale],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  changes.push(`add array testimonial ${locale} (6 cards)`)
}

fs.writeFileSync(file, JSON.stringify(sections, null, 2) + '\n', 'utf8')
console.log('CHANGES', changes.length)
for (const c of changes) console.log('-', c)
