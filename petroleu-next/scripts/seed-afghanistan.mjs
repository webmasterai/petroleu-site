/**
 * Idempotent Afghanistan CMS seed for petroleu-next (JSON storage).
 * - Does NOT touch Pakistan (pk) rows
 * - Upserts by natural keys (market+locale+slug/section/path/key)
 * - Reuses af_en_source.json + af_locale_string_maps.json from original project
 *
 * Run: node scripts/seed-afghanistan.mjs
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data')
const seedDir = path.join(root, 'storage-seed')

const HERO_IMAGE =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PetroleuDashboard-45o0LNfASWEDxtDgDI6KSRExrYyMNC.png'

const HEADINGS = {
  features: {
    eyebrow: 'Features',
    title: 'Everything your petrol pump needs',
    subtitle: 'From nozzle readings to accounts — modules built for Afghanistan fuel stations.',
  },
  'getting-started': {
    eyebrow: 'Getting Started',
    title: 'Supported onboarding',
    subtitle: 'Training and setup help your team start with confidence.',
    cta: 'Get Started',
    cta_url: '/get-started',
  },
  industries: {
    eyebrow: 'Industries',
    title: 'Built for fuel businesses',
    subtitle:
      'Independent pumps, dealer networks, and multi-station operators who need reliable daily closing and stock control.',
  },
  mobile: {
    eyebrow: 'Mobile App',
    title: 'Mobile Owner Dashboard',
    subtitle:
      'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
  },
  analytics: {
    eyebrow: 'Analytics',
    title: 'Sales Analytics',
    subtitle:
      'Use smart reports to review station performance, stock movement, receivables, and business trends.',
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Common Questions',
    subtitle: 'Everything your petrol pump needs',
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Plans are available monthly and yearly. Contact sales for multi-station quotes.',
    subtitle: 'Plans are available monthly and yearly. Contact sales for multi-station quotes.',
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: 'Work with the Petroleu team',
    subtitle: 'We help fuel stations across Afghanistan run cleaner daily operations.',
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Latest From Petroleu',
    subtitle: 'Guides and product updates for fuel station operators.',
    cta: 'View All Resources',
  },
  invoice: {
    eyebrow: 'Invoicing',
    title: 'Cash & Credit Sales',
    subtitle:
      'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.',
    cta: 'View Pricing',
    cta_url: '/pricing',
  },
  reports: {
    eyebrow: 'Reports',
    title: 'Daily Closing Reports',
    subtitle:
      'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.',
    cta: 'See every module in action',
    cta_url: '/features',
  },
  'why-choose': {
    eyebrow: 'Why Petroleu',
    title: 'Built for Afghanistan pumps',
    subtitle: 'Workflows match local nozzle, dipping, and credit practices.',
  },
  logos: {
    eyebrow: 'Partners',
    title: 'Trusted oil marketing companies',
    subtitle: 'Trusted brands strip',
  },
}


const LOCALES = {
  'en-AF': { prefix: '/af/en', mapKey: null },
  'fa-AF': { prefix: '/af', mapKey: 'fa' },
  'ps-AF': { prefix: '/af/ps', mapKey: 'ps' },
}

const PAGE_TITLES = {
  'en-AF': {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    about: 'About',
    contact: 'Contact',
    blog: 'Blog',
    faq: 'FAQ',
    industries: 'Industries',
    analytics: 'Analytics',
    developers: 'Developers',
    docs: 'Docs',
    'product-reports': 'Product Reports',
    legal: 'Legal',
  },
  'fa-AF': {
    home: 'خانه',
    features: 'امکانات',
    pricing: 'قیمت‌ها',
    about: 'درباره ما',
    contact: 'تماس',
    blog: 'وبلاگ',
    faq: 'پرسش‌های متداول',
    industries: 'صنایع',
    analytics: 'تحلیل‌ها',
    developers: 'توسعه‌دهندگان',
    docs: 'اسناد',
    'product-reports': 'گزارش‌های محصول',
    legal: 'حقوقی',
  },
  'ps-AF': {
    home: 'کور',
    features: 'ځانګړتیاوې',
    pricing: 'بیې',
    about: 'زموږ په اړه',
    contact: 'اړیکه',
    blog: 'بلاګ',
    faq: 'پوښتنې',
    industries: 'صنعتونه',
    analytics: 'تحلیلونه',
    developers: 'پراختیاونکي',
    docs: 'اسناد',
    'product-reports': 'د محصول راپورونه',
    legal: 'حقوقي',
  },
}

const NAV_ITEMS = [
  { location: 'header', label: 'Features', path: '/features', sort_order: 0 },
  { location: 'header', label: 'Pricing', path: '/pricing', sort_order: 1 },
  { location: 'header', label: 'FAQ', path: '/faq', sort_order: 2 },
  { location: 'header', label: 'Mobile App', path: '/#mobile', sort_order: 3 },
  { location: 'header', label: 'About', path: '/about', sort_order: 4 },
  { location: 'header', label: 'Blog', path: '/blog', sort_order: 5 },
  { location: 'header', label: 'Contact', path: '/contact', sort_order: 6 },
  { location: 'mega', label: 'Analytics', path: '/analytics', sort_order: 0, menu_group: 'resources' },
  { location: 'mega', label: 'Reports', path: '/product/reports', sort_order: 1, menu_group: 'resources' },
  { location: 'mega', label: 'FAQ', path: '/faq', sort_order: 2, menu_group: 'resources' },
  { location: 'mega', label: 'Docs', path: '/docs', sort_order: 3, menu_group: 'resources' },
]

const SEO_BY_LOCALE = {
  'en-AF': {
    '/af/en': ['Petroleu — Petrol Pump Software Afghanistan', 'Fuel station management software for Afghanistan — stock, nozzle sales, credit, and reports.'],
    '/af/en/about': ['About | Petroleu Afghanistan', 'About Petroleu for Afghanistan fuel stations.'],
    '/af/en/blog': ['Blog | Petroleu Afghanistan', 'Guides for fuel station operators in Afghanistan.'],
    '/af/en/contact': ['Contact | Petroleu Afghanistan', 'Contact Petroleu about Afghanistan deployments.'],
    '/af/en/faq': ['FAQ | Petroleu Afghanistan', 'Frequently asked questions about Petroleu.'],
    '/af/en/features': ['Features | Petroleu Afghanistan', 'Petroleu modules for nozzle, stock, credit, and reports.'],
    '/af/en/pricing': ['Pricing | Petroleu Afghanistan', 'Contact Petroleu for Afghanistan pricing.'],
  },
  'fa-AF': {
    '/af': ['Petroleu — نرم‌افزار پمپ تیل افغانستان', 'نرم‌افزار مدیریت پمپ تیل برای افغانستان — موجودی، فروش نوزل، اعتبار و گزارش‌ها.'],
    '/af/about': ['درباره ما | Petroleu', 'درباره Petroleu برای پمپ‌های تیل افغانستان.'],
    '/af/blog': ['وبلاگ | Petroleu', 'راهنما برای اپراتورهای پمپ تیل در افغانستان.'],
    '/af/contact': ['تماس | Petroleu', 'تماس با Petroleu درباره افغانستان.'],
    '/af/faq': ['پرسش‌های متداول | Petroleu', 'پرسش‌های رایج درباره Petroleu.'],
    '/af/features': ['امکانات | Petroleu', 'ماژول‌های نوزل، موجودی، اعتبار و گزارش.'],
    '/af/pricing': ['قیمت‌ها | Petroleu', 'برای قیمت‌گذاری افغانستان با Petroleu تماس بگیرید.'],
  },
  'ps-AF': {
    '/af/ps': ['Petroleu — د افغانستان تیل پمپ سافټویر', 'د افغانستان لپاره د تیل پمپ مدیریت سافټویر — موجودي، نوزل پلور، اعتبار او راپورونه.'],
    '/af/ps/about': ['زموږ په اړه | Petroleu', 'د افغانستان تیل پمپونو لپاره د Petroleu په اړه.'],
    '/af/ps/blog': ['بلاګ | Petroleu', 'د افغانستان تیل پمپ چلوونکو لپاره لارښودونه.'],
    '/af/ps/contact': ['اړیکه | Petroleu', 'د افغانستان په اړه له Petroleu سره اړیکه.'],
    '/af/ps/faq': ['پوښتنې | Petroleu', 'د Petroleu په اړه عامې پوښتنې.'],
    '/af/ps/features': ['ځانګړتیاوې | Petroleu', 'نوزل، موجودي، اعتبار او راپور ماډیولونه.'],
    '/af/ps/pricing': ['بیې | Petroleu', 'د افغانستان بیو لپاره له Petroleu سره اړیکه ونیسئ.'],
  },
}

const UI_SETTINGS = {
  'en-AF': {
    site_name: 'Petroleu',
    site_tagline: 'Modern fuel station management software for Afghanistan.',
    footer_description:
      'Petroleu helps fuel station owners run nozzle sales, tank stock, credit, and reporting from one system.',
    footer_credit: 'Petroleu',
    country_label: 'Afghanistan',
    currency: 'AFN',
    sales_email: 'sales@petroleu.com',
    primary_email: 'support@petroleu.com',
    contact_email: 'sales@petroleu.com',
    phone: '',
    phone_tel: '',
    whatsapp: '',
    address: '',
    announcement_text: 'Petroleu — Fuel station software for Afghanistan',
    ui_see_demo: 'See it in Action',
    ui_view_pricing: 'View Pricing',
    ui_resources: 'Resources',
    ui_product: 'Product',
    ui_company: 'Company',
    ui_legal: 'Legal',
    ui_login: 'Login',
    ui_start_trial: 'Start Free Trial',
    ui_privacy_policy: 'Privacy Policy',
    ui_admin_login: 'Admin Login',
    ui_monthly: 'Monthly',
    ui_yearly: 'Yearly',
    ui_contact_sales: 'Contact Sales',
    ui_most_popular: 'Most Popular',
    ui_pricing_note: 'Contact us for Afghanistan pricing.',
    ui_mobile_platforms: 'Available on both Android and iOS',
    ui_ready_to_start: 'Ready to start?',
    ui_step: 'STEP',
    ui_about_us: 'About',
    ui_get_started: 'Get Started',
    ui_save_2_months: 'Save 2 Months',
    ui_explore_analytics: 'Explore Analytics',
    ui_unlock_insights: 'Unlock powerful station insights today',
    ui_contact_us: 'Contact us',
    ui_phone_label: 'Phone',
    ui_email_label: 'Email',
  },
  'fa-AF': {
    site_name: 'پترولیو',
    site_tagline: 'نرم‌افزار مدرن مدیریت پمپ تیل برای افغانستان.',
    footer_description:
      'Petroleu به مالکان پمپ تیل کمک می‌کند فروش نوزل، موجودی تانک، اعتبار و گزارش‌دهی را از یک سیستم اداره کنند.',
    footer_credit: 'Petroleu',
    country_label: 'افغانستان',
    currency: 'AFN',
    sales_email: 'sales@petroleu.com',
    primary_email: 'support@petroleu.com',
    contact_email: 'sales@petroleu.com',
    phone: '',
    phone_tel: '',
    whatsapp: '',
    address: '',
    announcement_text: 'Petroleu — نرم‌افزار پمپ تیل برای افغانستان',
    ui_see_demo: 'در عمل ببینید',
    ui_view_pricing: 'دیدن قیمت‌ها',
    ui_resources: 'منابع',
    ui_product: 'محصول',
    ui_company: 'شرکت',
    ui_legal: 'حقوقی',
    ui_login: 'ورود',
    ui_start_trial: 'آغاز آزمایش رایگان',
    ui_privacy_policy: 'سیاست حریم خصوصی',
    ui_admin_login: 'ورود مدیر',
    ui_monthly: 'ماهانه',
    ui_yearly: 'سالانه',
    ui_contact_sales: 'تماس با فروش',
    ui_most_popular: 'محبوب‌ترین',
    ui_pricing_note: 'برای قیمت‌گذاری افغانستان با ما تماس بگیرید.',
    ui_mobile_platforms: 'موجود برای Android و iOS',
    ui_ready_to_start: 'آماده شروع هستید؟',
    ui_step: 'گام',
    ui_about_us: 'درباره ما',
    ui_get_started: 'شروع کنید',
    ui_save_2_months: '۲ ماه صرفه‌جویی',
    ui_explore_analytics: 'کاوش تحلیل‌ها',
    ui_unlock_insights: 'امروز بینش قدرتمند ایستگاه را باز کنید',
    ui_contact_us: 'با ما تماس بگیرید',
    ui_phone_label: 'تلفن',
    ui_email_label: 'ایمیل',
  },
  'ps-AF': {
    site_name: 'پترولیو',
    site_tagline: 'د افغانستان لپاره عصري د تیل پمپ مدیریت سافټویر.',
    footer_description:
      'Petroleu د تیل پمپ مالکانو سره مرسته کوي چې نوزل پلور، ټانک موجودي، اعتبار او راپورونه له یوه سیستم اداره کړي.',
    footer_credit: 'Petroleu',
    country_label: 'افغانستان',
    currency: 'AFN',
    sales_email: 'sales@petroleu.com',
    primary_email: 'support@petroleu.com',
    contact_email: 'sales@petroleu.com',
    phone: '',
    phone_tel: '',
    whatsapp: '',
    address: '',
    announcement_text: 'Petroleu — د افغانستان لپاره د تیل پمپ سافټویر',
    ui_see_demo: 'په عمل کې وګورئ',
    ui_view_pricing: 'بیې وګورئ',
    ui_resources: 'سرچینې',
    ui_product: 'محصول',
    ui_company: 'شرکت',
    ui_legal: 'حقوقي',
    ui_login: 'ننوتل',
    ui_start_trial: 'وړیا ازموینه پیل کړئ',
    ui_privacy_policy: 'د محرمیت تګلاره',
    ui_admin_login: 'د مدیر ننوتل',
    ui_monthly: 'میاشتنی',
    ui_yearly: 'کلنی',
    ui_contact_sales: 'له پلور سره اړیکه',
    ui_most_popular: 'ډېر مشهور',
    ui_pricing_note: 'د افغانستان بیو لپاره له موږ سره اړیکه ونیسئ.',
    ui_mobile_platforms: 'په Android او iOS دواړو شته',
    ui_ready_to_start: 'چمتو یاست چې پیل کړئ؟',
    ui_step: 'ګام',
    ui_about_us: 'زموږ په اړه',
    ui_get_started: 'پیل وکړئ',
    ui_save_2_months: '۲ میاشتې سپما',
    ui_explore_analytics: 'تحلیلونه وپلټئ',
    ui_unlock_insights: 'نن د سټیشن پیاوړي بصیرتونه خلاص کړئ',
    ui_contact_us: 'له موږ سره اړیکه',
    ui_phone_label: 'تلیفون',
    ui_email_label: 'برېښنالیک',
  },
}

function loadJson(name, fallback = []) {
  const p = path.join(dataDir, name)
  if (!existsSync(p)) return fallback
  return JSON.parse(readFileSync(p, 'utf8'))
}

function atomicWrite(name, data) {
  mkdirSync(dataDir, { recursive: true })
  const target = path.join(dataDir, name)
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  renameSync(tmp, target)
}

function nextId(rows) {
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
}

/** Longest-key-first phrase replacement (mirrors Laravel seeder). */
function translate(text, map) {
  if (text == null || text === '') return text
  if (typeof text !== 'string') return text
  if (!map) return text
  let out = text
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length)
  for (const [en, loc] of entries) {
    if (!en) continue
    if (out.includes(en)) out = out.split(en).join(loc)
  }
  return out
}

function walk(value, map, prefix) {
  if (typeof value === 'string') {
    let s = translate(value, map)
    s = remapUrl(s, prefix)
    return s
  }
  if (Array.isArray(value)) return value.map((v) => walk(v, map, prefix))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = walk(v, map, prefix)
    return out
  }
  return value
}

function remapUrl(url, prefix) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return url
  if (url.startsWith('/af/en')) return url.replace(/^\/af\/en/, prefix === '/af' ? '/af' : prefix)
  if (url.startsWith('/af/ps')) return url.replace(/^\/af\/ps/, prefix)
  if (url === '/af' || url.startsWith('/af/')) {
    // already AF path — keep if matching locale prefix
    return url
  }
  if (url.startsWith('/#')) return `${prefix}${url}`
  if (url.startsWith('/')) return `${prefix}${url}`
  return url
}

function upsert(rows, matchFn, payload) {
  const idx = rows.findIndex(matchFn)
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...payload, id: rows[idx].id }
    return { rows, created: false, id: rows[idx].id }
  }
  const id = nextId(rows)
  rows.push({ id, ...payload })
  return { rows, created: true, id }
}

function main() {
  const mapsPath = path.join(__dirname, 'data', 'af_locale_string_maps.json')
  const sourcePath = path.join(__dirname, 'data', 'af_en_source.json')
  if (!existsSync(mapsPath) || !existsSync(sourcePath)) {
    console.error('Missing scripts/data/af_*.json — copy from original seeders first')
    process.exit(1)
  }
  const maps = JSON.parse(readFileSync(mapsPath, 'utf8'))
  const source = JSON.parse(readFileSync(sourcePath, 'utf8'))

  let pages = loadJson('pages.json', [])
  let sections = loadJson('sections.json', [])
  let navigation = loadJson('navigation.json', [])
  let settings = loadJson('settings.json', [])
  let seo = loadJson('seo.json', [])
  let locales = loadJson('locales.json', [])
  let markets = loadJson('markets.json', [])

  // Fix locale native names (encoding corruption)
  locales = locales.map((l) => {
    if (l.code === 'fa-AF') return { ...l, native_name: 'دری', dir: 'rtl', is_active: true, font_stack: 'naskh' }
    if (l.code === 'ps-AF') return { ...l, native_name: 'پښتو', dir: 'rtl', is_active: true, font_stack: 'naskh' }
    if (l.code === 'en-AF') return { ...l, native_name: 'English', dir: 'ltr', is_active: true }
    return l
  })
  for (const code of ['fa-AF', 'ps-AF', 'en-AF']) {
    if (!locales.some((l) => l.code === code)) {
      const defs = {
        'fa-AF': { name: 'Dari', native_name: 'دری', dir: 'rtl', font_stack: 'naskh' },
        'ps-AF': { name: 'Pashto', native_name: 'پښتو', dir: 'rtl', font_stack: 'naskh' },
        'en-AF': { name: 'English (Afghanistan)', native_name: 'English', dir: 'ltr' },
      }
      locales.push({ id: nextId(locales), code, ...defs[code], is_active: true })
    }
  }

  // Ensure AF market
  upsert(
    markets,
    (m) => m.code === 'af',
    {
      code: 'af',
      name: 'Afghanistan',
      default_locale: 'fa-AF',
      currency: 'AFN',
      is_active: true,
      is_shared: false,
    },
  )

  const stats = {
    pagesCreated: 0,
    pagesUpdated: 0,
    sectionsCreated: 0,
    sectionsUpdated: 0,
    navCreated: 0,
    settingsCreated: 0,
    seoCreated: 0,
    byLocale: { 'fa-AF': 0, 'ps-AF': 0, 'en-AF': 0 },
  }

  const pageSlugs = [...new Set((source.pages || []).map((p) => p.slug).concat(['home']))]

  for (const [locale, meta] of Object.entries(LOCALES)) {
    const map = meta.mapKey ? maps[meta.mapKey] || {} : null
    const prefix = meta.prefix

    // Pages
    for (const slug of pageSlugs) {
      const titles = PAGE_TITLES[locale] || PAGE_TITLES['en-AF']
      const title = titles[slug] || slug
      const frontend_path =
        slug === 'home'
          ? prefix
          : slug === 'product-reports'
            ? `${prefix}/product/reports`
            : `${prefix}/${slug}`
      const r = upsert(
        pages,
        (p) => p.market_code === 'af' && p.locale_code === locale && p.slug === slug,
        {
          market_code: 'af',
          locale_code: locale,
          slug,
          title: map ? translate(title, map) : title,
          description: map
            ? translate(`Afghanistan ${slug} page`, map)
            : `Afghanistan ${slug} page`,
          frontend_path,
          status: 'published',
          is_enabled: true,
          translation_status: map ? 'needs_review' : 'ready',
        },
      )
      if (r.created) stats.pagesCreated++
      else stats.pagesUpdated++
    }

    // Sections from AF EN source
    for (const src of source.sections || []) {
      // Skip unverified social proof for AF publish? Original drafts testimonials —
      // user asked for testimonials to load; keep published but translated.
      let title = src.title
      let description = src.description
      let content = src.content
      let link_label = src.link_label
      let image_alt = src.image_alt
      let data = src.data ? structuredClone(src.data) : {}
      let link_url = src.link_url || data?.btn1_link || null

      if (map) {
        title = translate(title, map)
        description = translate(description, map)
        content = translate(content, map)
        link_label = translate(link_label, map)
        image_alt = translate(image_alt, map)
        data = walk(data, map, prefix)
        link_url = remapUrl(link_url, prefix)
      } else {
        data = walk(data, null, prefix)
        link_url = remapUrl(link_url, prefix)
      }

      // Hero media fix
      let image_url = src.image_url || null
      if (src.section_key === 'hero') {
        image_url = image_url || HERO_IMAGE
        data = data || {}
        data.dashboard_image_url = data.dashboard_image_url || HERO_IMAGE
        data.titleHighlight = data.titleHighlight || data.title_highlight || 'Afghanistan'
        data.title_highlight = data.titleHighlight
        if (!data.cta_text && !data.primaryButton) {
          data.cta_text = map ? translate('See it in Action', map) : 'See it in Action'
        }
        if (!data.cta2_text && !data.secondaryButton) {
          data.cta2_text = map ? translate('View Pricing', map) : 'View Pricing'
        }
        // Normalize button fields used by HeroSection
        data.primary_button = data.cta_text || data.primary_button || data.primaryButton
        data.secondary_button = data.cta2_text || data.secondary_button || data.secondaryButton
        data.badge = data.badge || (map ? translate('Best Petrol Pump Management Software', map) : 'Best Petrol Pump Management Software')
      }

      const status =
        src.section_key === 'testimonial' || src.section_key === 'supported-brand' || src.section_key === 'logo'
          ? 'published'
          : 'published'

      const r = upsert(
        sections,
        (s) =>
          s.market_code === 'af' &&
          s.locale_code === locale &&
          s.page_slug === src.page_slug &&
          s.section_key === src.section_key &&
          Number(s.sort_order || 0) === Number(src.sort_order || 0),
        {
          market_code: 'af',
          locale_code: locale,
          page_slug: src.page_slug,
          section_key: src.section_key,
          sort_order: src.sort_order || 0,
          title,
          description,
          content,
          data,
          image_url,
          image_alt,
          link_label,
          link_url,
          status,
          is_enabled: true,
          is_shared: false,
          translation_status: map ? 'needs_review' : 'ready',
          published_at: new Date().toISOString(),
        },
      )
      if (r.created) stats.sectionsCreated++
      else stats.sectionsUpdated++
      stats.byLocale[locale]++
    }

    // Section headings (required — AF frontend hides sections without CMS headings)
    for (const [key, en] of Object.entries(HEADINGS)) {
      const title = map ? translate(en.title, map) : en.title
      const description = map ? translate(en.subtitle, map) : en.subtitle
      const eyebrow = map ? translate(en.eyebrow, map) : en.eyebrow
      const cta = en.cta ? (map ? translate(en.cta, map) : en.cta) : null
      const ctaUrl = en.cta_url ? remapUrl(en.cta_url, prefix) : null
      const r = upsert(
        sections,
        (s) =>
          s.market_code === 'af' &&
          s.locale_code === locale &&
          s.page_slug === 'home' &&
          s.section_key === `heading:${key}` &&
          Number(s.sort_order || 0) === 0,
        {
          market_code: 'af',
          locale_code: locale,
          page_slug: 'home',
          section_key: `heading:${key}`,
          sort_order: 0,
          title,
          description,
          data: { badge: eyebrow, eyebrow },
          link_label: cta,
          link_url: ctaUrl,
          status: 'published',
          is_enabled: true,
          is_shared: false,
          translation_status: map ? 'needs_review' : 'ready',
          published_at: new Date().toISOString(),
        },
      )
      if (r.created) {
        stats.sectionsCreated++
        stats.byLocale[locale]++
      } else stats.sectionsUpdated++
    }

    // Demo blocks (invoice + reports) — required for AF InvoiceSection / ReportsSection
    {
      const invoiceData = {
        badge: map ? translate('Invoicing', map) : 'Invoicing',
        stationName: map ? translate('Sample Fuel Station', map) : 'Sample Fuel Station',
        stationAddress: '',
        invoiceNumber: 'INV-DEMO-001',
        date: '2026-01-15',
        customerName: map ? translate('Credit Account', map) : 'Credit Account',
        customerAccount: '#DEMO',
        amountDue: '—',
        rows: [
          { vehicle: 'VEH-01', fuel: 'HSD', qty: '250', amount: '—' },
          { vehicle: 'VEH-02', fuel: 'Petrol', qty: '40', amount: '—' },
        ],
        subtotal: '—',
        previousBalance: '—',
        total: '—',
        is_sample: true,
        labels: {
          badge: map ? translate('FUEL INVOICE', map) : 'FUEL INVOICE',
          date: map ? translate('Date', map) : 'Date',
          customer: map ? translate('Customer', map) : 'Customer',
          amountDue: map ? translate('Amount Due', map) : 'Amount Due',
          vehicle: map ? translate('Vehicle', map) : 'Vehicle',
          fuel: map ? translate('Fuel', map) : 'Fuel',
          qty: map ? translate('Qty (L)', map) : 'Qty (L)',
          amount: map ? translate('Amount', map) : 'Amount',
          subtotal: map ? translate('Subtotal', map) : 'Subtotal',
          previousBalance: map ? translate('Previous Balance', map) : 'Previous Balance',
          total: map ? translate('Total', map) : 'Total',
          print: map ? translate('Print', map) : 'Print',
          pdf: 'PDF',
          whatsapp: 'WhatsApp',
        },
      }
      const reportsData = {
        badge: map ? translate('Reports', map) : 'Reports',
        tankDipping: [
          {
            tank: `${map ? translate('Tank', map) : 'Tank'} 1`,
            opening: '—',
            received: '—',
            sales: '—',
            closing: '—',
            variance: '—',
          },
          {
            tank: `${map ? translate('Tank', map) : 'Tank'} 2`,
            opening: '—',
            received: '—',
            sales: '—',
            closing: '—',
            variance: '—',
          },
        ],
        nozzleReadings: [
          {
            nozzle: `${map ? translate('Nozzle', map) : 'Nozzle'} 1`,
            opening: '—',
            closing: '—',
            sales: '—',
            amount: '—',
          },
          {
            nozzle: `${map ? translate('Nozzle', map) : 'Nozzle'} 2`,
            opening: '—',
            closing: '—',
            sales: '—',
            amount: '—',
          },
        ],
        is_sample: true,
        labels: {
          tankTitle: map ? translate('Tank Dipping Report', map) : 'Tank Dipping Report',
          tankSubtitle: map
            ? translate('Track fuel stock levels across all tanks with variance detection.', map)
            : 'Track fuel stock levels across all tanks with variance detection.',
          tankBadge: map ? translate('Daily Tank Summary', map) : 'Daily Tank Summary',
          nozzleTitle: map ? translate('Nozzle Readings', map) : 'Nozzle Readings',
          nozzleSubtitle: map
            ? translate('Track sales from each nozzle with opening and closing readings.', map)
            : 'Track sales from each nozzle with opening and closing readings.',
          nozzleBadge: map ? translate('Shift-wise Readings', map) : 'Shift-wise Readings',
          tank: map ? translate('TANK', map) : 'TANK',
          open: map ? translate('OPEN', map) : 'OPEN',
          recv: map ? translate('RECV', map) : 'RECV',
          sales: map ? translate('SALES', map) : 'SALES',
          close: map ? translate('CLOSE', map) : 'CLOSE',
          var: map ? translate('VAR', map) : 'VAR',
          nozzle: map ? translate('NOZZLE', map) : 'NOZZLE',
          salesL: map ? translate('SALES (L)', map) : 'SALES (L)',
          amount: map ? translate('Amount', map) : 'Amount',
          accessNote: map
            ? translate('Access all reports anytime, anywhere', map)
            : 'Access all reports anytime, anywhere',
        },
      }

      for (const demo of [
        {
          section_key: 'demo:invoice',
          title: map ? translate('Cash & Credit Sales', map) : 'Cash & Credit Sales',
          description: map
            ? translate(
                'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.',
                map,
              )
            : 'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.',
          data: invoiceData,
          link_label: map ? translate('View Pricing', map) : 'View Pricing',
          link_url: `${prefix}/pricing`,
        },
        {
          section_key: 'demo:reports',
          title: map ? translate('Daily Closing Reports', map) : 'Daily Closing Reports',
          description: map
            ? translate(
                'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.',
                map,
              )
            : 'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.',
          data: reportsData,
          link_label: map ? translate('See every module in action', map) : 'See every module in action',
          link_url: `${prefix}/features`,
        },
      ]) {
        const r = upsert(
          sections,
          (s) =>
            s.market_code === 'af' &&
            s.locale_code === locale &&
            s.page_slug === 'home' &&
            s.section_key === demo.section_key &&
            Number(s.sort_order || 0) === 0,
          {
            market_code: 'af',
            locale_code: locale,
            page_slug: 'home',
            section_key: demo.section_key,
            sort_order: 0,
            title: demo.title,
            description: demo.description,
            data: demo.data,
            link_label: demo.link_label,
            link_url: demo.link_url,
            status: 'published',
            is_enabled: true,
            is_shared: false,
            translation_status: map ? 'needs_review' : 'ready',
            published_at: new Date().toISOString(),
          },
        )
        if (r.created) {
          stats.sectionsCreated++
          stats.byLocale[locale]++
        } else stats.sectionsUpdated++
      }
    }

    // Add home CTAs if missing from source
    const homeCtas = [
      {
        section_key: 'cta',
        sort_order: 0,
        title: map ? translate('Ready to modernize your fuel station?', map) : 'Ready to modernize your fuel station?',
        description: map
          ? translate('Talk to Petroleu about Afghanistan deployments.', map)
          : 'Talk to Petroleu about Afghanistan deployments.',
        data: {
          btn1_text: map ? translate('Contact', map) : 'Contact',
          btn1_link: `${prefix}/contact`,
        },
        link_label: map ? translate('Contact', map) : 'Contact',
        link_url: `${prefix}/contact`,
      },
      {
        section_key: 'cta',
        sort_order: 1,
        title: map ? translate('See Petroleu in action', map) : 'See Petroleu in action',
        description: map
          ? translate('Book a walkthrough for your Afghanistan fuel stations.', map)
          : 'Book a walkthrough for your Afghanistan fuel stations.',
        data: {
          btn1_text: map ? translate('Get Started', map) : 'Get Started',
          btn1_link: `${prefix}/get-started`,
        },
        link_label: map ? translate('Get Started', map) : 'Get Started',
        link_url: `${prefix}/get-started`,
      },
    ]
    for (const cta of homeCtas) {
      const r = upsert(
        sections,
        (s) =>
          s.market_code === 'af' &&
          s.locale_code === locale &&
          s.page_slug === 'home' &&
          s.section_key === 'cta' &&
          Number(s.sort_order || 0) === cta.sort_order,
        {
          market_code: 'af',
          locale_code: locale,
          page_slug: 'home',
          ...cta,
          status: 'published',
          is_enabled: true,
          is_shared: false,
          published_at: new Date().toISOString(),
        },
      )
      if (r.created) {
        stats.sectionsCreated++
        stats.byLocale[locale]++
      } else stats.sectionsUpdated++
    }

    // Navigation — replace AF locale nav set idempotently by removing AF+locale then recreate
    // Safer: upsert each item by location+label+sort
    for (const item of NAV_ITEMS) {
      const url =
        item.path === '/#mobile' ? `${prefix}/#mobile` : `${prefix}${item.path}`
      const label = map ? translate(item.label, map) : item.label
      const r = upsert(
        navigation,
        (n) =>
          n.market_code === 'af' &&
          n.locale_code === locale &&
          n.location === item.location &&
          Number(n.sort_order || 0) === item.sort_order &&
          (n.menu_group || 'primary') === (item.menu_group || 'primary'),
        {
          market_code: 'af',
          locale_code: locale,
          location: item.location,
          menu_group: item.menu_group || 'primary',
          label,
          url,
          sort_order: item.sort_order,
          status: 'published',
          is_enabled: true,
        },
      )
      if (r.created) stats.navCreated++
    }
    // Announcement
    {
      const label = map
        ? translate('Petroleu — Fuel station software for Afghanistan', map)
        : 'Petroleu — Fuel station software for Afghanistan'
      const r = upsert(
        navigation,
        (n) =>
          n.market_code === 'af' &&
          n.locale_code === locale &&
          n.location === 'announcement',
        {
          market_code: 'af',
          locale_code: locale,
          location: 'announcement',
          menu_group: 'announcement',
          label,
          url: null,
          sort_order: 0,
          status: 'published',
          is_enabled: true,
        },
      )
      if (r.created) stats.navCreated++
    }

    // Settings
    const ui = UI_SETTINGS[locale] || {}
    for (const [key, value] of Object.entries(ui)) {
      const r = upsert(
        settings,
        (s) => s.market_code === 'af' && s.locale_code === locale && s.key === key,
        {
          market_code: 'af',
          locale_code: locale,
          key,
          value,
          type: 'string',
          grp: key.startsWith('ui_') ? 'ui' : 'general',
        },
      )
      if (r.created) stats.settingsCreated++
    }

    // SEO
    const seoMap = SEO_BY_LOCALE[locale] || {}
    for (const [seoPath, [title, description]] of Object.entries(seoMap)) {
      const r = upsert(
        seo,
        (e) => e.market_code === 'af' && e.locale_code === locale && e.path === seoPath,
        {
          market_code: 'af',
          locale_code: locale,
          path: seoPath,
          title,
          description,
          canonical_url: `https://petroleu.com${seoPath}`,
          og_title: title,
          og_description: description,
          og_locale: locale.replace('-', '_'),
          noindex: false,
          status: 'published',
          hreflang: {
            'fa-af': 'https://petroleu.com/af',
            'ps-af': 'https://petroleu.com/af/ps',
            'en-af': 'https://petroleu.com/af/en',
            'en-pk': 'https://petroleu.com/',
          },
        },
      )
      if (r.created) stats.seoCreated++
    }
  }

  // Remove duplicate stub AF heroes that don't match sort_order upsert if any orphans
  // (old stubs may have sort_order 0 same as source — already upserted)

  // Remove duplicate AF home heroes without image when a good one exists
  {
    const drop = new Set()
    for (const loc of Object.keys(LOCALES)) {
      const list = sections.filter(
        (s) =>
          s.market_code === 'af' &&
          s.locale_code === loc &&
          s.page_slug === 'home' &&
          s.section_key === 'hero',
      )
      const good = list.find((h) => h.image_url)
      if (good) list.filter((h) => h.id !== good.id).forEach((h) => drop.add(h.id))
    }
    if (drop.size) sections = sections.filter((s) => !drop.has(s.id))
  }

  atomicWrite('pages.json', pages)
  atomicWrite('sections.json', sections)
  atomicWrite('navigation.json', navigation)
  atomicWrite('settings.json', settings)
  atomicWrite('seo.json', seo)
  atomicWrite('locales.json', locales)
  atomicWrite('markets.json', markets)

  // Mirror into storage-seed (AF-enriched) without wiping users/inquiries/blog/media
  mkdirSync(seedDir, { recursive: true })
  for (const name of [
    'pages.json',
    'sections.json',
    'navigation.json',
    'settings.json',
    'seo.json',
    'locales.json',
    'markets.json',
  ]) {
    writeFileSync(path.join(seedDir, name), readFileSync(path.join(dataDir, name)))
  }

  const afSections = sections.filter((s) => s.market_code === 'af')
  const report = {
    pages_af: pages.filter((p) => p.market_code === 'af').length,
    sections_fa: afSections.filter((s) => s.locale_code === 'fa-AF').length,
    sections_ps: afSections.filter((s) => s.locale_code === 'ps-AF').length,
    sections_en: afSections.filter((s) => s.locale_code === 'en-AF').length,
    nav_af: navigation.filter((n) => n.market_code === 'af').length,
    settings_af: settings.filter((s) => s.market_code === 'af').length,
    seo_af: seo.filter((e) => e.market_code === 'af').length,
    stats,
  }
  console.log(JSON.stringify(report, null, 2))
  console.log('Afghanistan CMS seed complete (Pakistan untouched).')
}

main()
