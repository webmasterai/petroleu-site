/**
 * Build storage-seed JSON from PMS_Lite live CMS dump (scripts/pms-cms-dump).
 * Keeps Afghanistan translations from the previous seed file when present.
 *
 * Run: node scripts/seed-from-pms-lite.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dumpDir = path.join(root, 'scripts', 'pms-cms-dump')
const out = path.join(root, 'storage-seed')
mkdirSync(out, { recursive: true })

function loadDump(name) {
  const p = path.join(dumpDir, name)
  if (!existsSync(p)) return []
  return JSON.parse(readFileSync(p, 'utf8'))
}

function w(name, data) {
  writeFileSync(path.join(out, name), JSON.stringify(data, null, 2))
  console.log('wrote', name, Array.isArray(data) ? data.length : '')
}

const YEARLY_BY_NAME = {
  'Lite Version': '19990',
  'Professional Version': '39990',
  'Automation Station Version': '69990',
  'Multi Station Sites': 'call for special prices',
}

const plans = loadDump('cms_pricing_plans.json').filter((p) => p.is_active !== false)
const planFeatures = loadDump('cms_pricing_features.json')
const heroes = loadDump('cms_hero_sections.json').filter((h) => h.is_active !== false)
const features = loadDump('cms_features.json').filter((f) => f.is_active !== false)
const faqs = loadDump('cms_faq_items.json').filter((f) => f.is_active !== false)
const testimonials = loadDump('cms_testimonials.json').filter((t) => t.is_active !== false)
const stats = loadDump('cms_stats.json').filter((s) => s.is_active !== false)
const ctas = loadDump('cms_cta_sections.json').filter((c) => c.is_active !== false)
const headings = loadDump('cms_section_headings.json')
const logos = loadDump('cms_trusted_logos.json').filter((l) => l.is_active !== false)
const how = loadDump('cms_how_it_works.json').filter((h) => h.is_active !== false)
const benefits = loadDump('cms_benefits.json').filter((b) => b.is_active !== false)
const settingsRows = loadDump('cms_site_settings.json').filter(
  (s) => s.key && !String(s.key).includes('smtp_password') && s.grp !== 'mail',
)

let sectionId = 1
const sections = []

function addSection(partial) {
  sections.push({
    id: sectionId++,
    market_code: 'pk',
    locale_code: 'en-PK',
    status: 'published',
    is_enabled: true,
    is_shared: false,
    sort_order: 0,
    ...partial,
  })
}

for (const h of heroes) {
  addSection({
    page_slug: h.page || 'home',
    section_key: 'hero',
    title: h.heading || '',
    description: h.subheading || '',
    image_url: h.image_url || h.bg_image || null,
    link_label: h.cta_text || null,
    link_url: h.cta_link || null,
    data: {
      badge: h.badge,
      primaryButton: h.cta_text,
      secondaryButton: h.cta2_text,
      cta2_link: h.cta2_link,
    },
    sort_order: Number(h.id) || 0,
  })
}

for (const p of plans) {
  const feats = planFeatures
    .filter((f) => String(f.plan_id) === String(p.id))
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
    .filter((f) => f.feature_text && !/^-+$/.test(String(f.feature_text).trim()))
  addSection({
    page_slug: 'pricing',
    section_key: 'plan',
    title: p.name,
    description: p.description || '',
    sort_order: Number(p.sort_order) || 0,
    link_label: p.cta_text || 'Get Started',
    link_url: p.cta_link || '/get-started',
    data: {
      name: p.name,
      price: p.price,
      price_yearly: p.price_yearly || YEARLY_BY_NAME[p.name] || p.price,
      period: p.period || 'month',
      badge: p.badge,
      is_popular: Boolean(p.is_popular),
      popular: Boolean(p.is_popular),
      currency: p.currency || 'PKR',
      features: feats.map((f) => ({
        feature_text: f.feature_text,
        is_included: f.is_included !== false,
      })),
    },
  })
}

for (const f of features) {
  const key = f.type === 'card' ? 'feature:card' : f.type === 'pain' ? 'feature:pain' : `feature:${f.type}`
  addSection({
    page_slug: f.page || 'home',
    section_key: key,
    title: f.title,
    description: f.description || '',
    image_url: f.image || null,
    sort_order: Number(f.sort_order) || 0,
    data: { icon: f.icon, badge: f.badge, type: f.type, bullet_points: f.bullet_points },
  })
}

for (const f of faqs) {
  addSection({
    page_slug: f.page || 'home',
    section_key: 'faq',
    title: f.question,
    description: f.answer,
    content: f.answer,
    sort_order: Number(f.sort_order) || 0,
  })
}

for (const t of testimonials) {
  addSection({
    page_slug: 'home',
    section_key: 'testimonial',
    title: t.author_name,
    description: [t.author_role, t.author_company].filter(Boolean).join(' · '),
    content: t.quote,
    sort_order: Number(t.sort_order) || 0,
    data: {
      quote: t.quote,
      name: t.author_name,
      role: t.author_role,
      company: t.author_company,
      rating: Number(t.rating) || 5,
    },
  })
}

for (const s of stats) {
  addSection({
    page_slug: 'home',
    section_key: 'stat',
    title: s.value,
    description: s.label,
    sort_order: Number(s.sort_order) || 0,
    data: { icon: s.icon, value: s.value, label: s.label },
  })
}

for (const c of ctas) {
  addSection({
    page_slug: c.page || 'home',
    section_key: 'cta',
    title: c.heading,
    description: c.subheading || '',
    link_label: c.btn1_text,
    link_url: c.btn1_link,
    sort_order: 0,
    data: { btn2_text: c.btn2_text, btn2_link: c.btn2_link },
  })
}

for (const h of headings) {
  const section = String(h.section || 'generic').replace(/_/g, '-')
  addSection({
    page_slug: h.page || 'home',
    section_key: `heading:${section}`,
    title: h.heading,
    description: h.subheading || '',
    sort_order: 0,
    data: { eyebrow: null },
  })
}

for (const l of logos) {
  addSection({
    page_slug: 'home',
    section_key: 'logo',
    title: l.name,
    image_url: l.logo_url || null,
    link_url: l.website || null,
    sort_order: Number(l.sort_order) || 0,
    data: { color: l.color, name: l.name },
  })
}

for (const h of how) {
  addSection({
    page_slug: 'home',
    section_key: 'how-it-works',
    title: h.title,
    description: h.description,
    sort_order: Number(h.sort_order) || Number(h.step_number) || 0,
    data: { icon: h.icon, step_number: h.step_number },
  })
}

for (const b of benefits) {
  let bullets = b.bullet_points
  if (typeof bullets === 'string') {
    try {
      bullets = JSON.parse(bullets)
    } catch {
      bullets = []
    }
  }
  addSection({
    page_slug: b.page || 'home',
    section_key: 'benefit',
    title: b.heading,
    description: b.description || '',
    image_url: b.image || null,
    sort_order: Number(b.sort_order) || 0,
    data: { bullet_points: bullets, image_position: b.image_position },
  })
}

// Preserve AF translations from previous seed
const prevSectionsPath = path.join(out, 'sections.json')
if (existsSync(prevSectionsPath)) {
  try {
    const prev = JSON.parse(readFileSync(prevSectionsPath, 'utf8'))
    const af = (Array.isArray(prev) ? prev : []).filter((s) => s.market_code === 'af')
    for (const s of af) {
      const { id: _id, ...rest } = s
      addSection(rest)
    }
    console.log('kept AF sections', af.length)
  } catch (e) {
    console.warn('could not merge AF sections', e.message)
  }
}

const markets = [
  {
    id: 1,
    code: 'pk',
    name: 'Pakistan',
    default_locale: 'en-PK',
    currency: 'PKR',
    is_active: true,
    is_shared: false,
    phone: settingsRows.find((s) => s.key === 'phone')?.value || '',
    email: settingsRows.find((s) => s.key === 'sales_email')?.value || '',
  },
  {
    id: 2,
    code: 'af',
    name: 'Afghanistan',
    default_locale: 'fa-AF',
    currency: 'AFN',
    is_active: true,
    is_shared: false,
  },
]

const locales = [
  { id: 1, code: 'en-PK', name: 'English (Pakistan)', native_name: 'English', dir: 'ltr', is_active: true },
  { id: 2, code: 'fa-AF', name: 'Dari', native_name: 'دری', dir: 'rtl', is_active: true, font_stack: 'naskh' },
  { id: 3, code: 'ps-AF', name: 'Pashto', native_name: 'پښتو', dir: 'rtl', is_active: true, font_stack: 'naskh' },
  { id: 4, code: 'en-AF', name: 'English (Afghanistan)', native_name: 'English', dir: 'ltr', is_active: true },
]

const pages = [
  ['home', 'Home', '/'],
  ['pricing', 'Pricing', '/pricing'],
  ['about', 'About', '/about'],
  ['analytics', 'Analytics', '/analytics'],
  ['blog', 'Blog', '/blog'],
  ['contact', 'Contact', '/contact'],
  ['developers', 'Developers', '/developers'],
  ['docs', 'Docs', '/docs'],
  ['faq', 'FAQ', '/faq'],
  ['features', 'Features', '/features'],
  ['industries', 'Industries', '/industries'],
  ['get-started', 'Get started', '/get-started'],
  ['privacy', 'Privacy', '/privacy'],
  ['product-reports', 'Product Reports', '/product/reports'],
].map((row, i) => ({
  id: i + 1,
  market_code: 'pk',
  locale_code: 'en-PK',
  slug: row[0],
  title: row[1],
  frontend_path: row[2],
  status: 'published',
  is_enabled: true,
  translation_status: 'ready',
}))

const settings = settingsRows.map((s, i) => ({
  id: i + 1,
  market_code: 'pk',
  locale_code: 'en-PK',
  key: s.key,
  value: s.value,
  type: s.type || 'string',
  label: s.label || s.key,
  grp: s.grp || 'general',
}))

settings.push({
  id: settings.length + 1,
  market_code: 'af',
  locale_code: 'fa-AF',
  key: 'site_name',
  value: 'پترولیو',
  type: 'string',
  grp: 'general',
})

const navigation = [
  { id: 1, market_code: 'pk', locale_code: 'en-PK', location: 'header', label: 'Features', url: '/features', sort_order: 1, status: 'published', is_enabled: true },
  { id: 2, market_code: 'pk', locale_code: 'en-PK', location: 'header', label: 'Pricing', url: '/pricing', sort_order: 2, status: 'published', is_enabled: true },
  { id: 3, market_code: 'pk', locale_code: 'en-PK', location: 'header', label: 'About', url: '/about', sort_order: 3, status: 'published', is_enabled: true },
  { id: 4, market_code: 'pk', locale_code: 'en-PK', location: 'header', label: 'Contact', url: '/contact', sort_order: 4, status: 'published', is_enabled: true },
]

const seo = [
  {
    id: 1,
    market_code: 'pk',
    locale_code: 'en-PK',
    path: '/',
    title: 'Petroleu — Petrol Pump Software Pakistan',
    description: 'Petrol pump management software for Pakistan. Sales, inventory, accounts, and WhatsApp from one system.',
    status: 'published',
    noindex: false,
  },
  {
    id: 2,
    market_code: 'pk',
    locale_code: 'en-PK',
    path: '/pricing',
    title: 'Petroleu Pricing — Lite, Professional, Automation',
    description: 'Petroleu plans from PKR 1,999/month. Lite, Professional, Automation Station, and Multi Station pricing.',
    status: 'published',
    noindex: false,
  },
]

let blogPosts = []
const prevBlog = path.join(out, 'blog-posts.json')
if (existsSync(prevBlog)) {
  try {
    blogPosts = JSON.parse(readFileSync(prevBlog, 'utf8'))
  } catch {
    blogPosts = []
  }
}

w('markets.json', markets)
w('locales.json', locales)
w('pages.json', pages)
w('sections.json', sections)
w('settings.json', settings)
w('navigation.json', navigation)
w('seo.json', seo)
w('blog-posts.json', blogPosts)
w('blog-categories.json', existsSync(path.join(out, 'blog-categories.json'))
  ? JSON.parse(readFileSync(path.join(out, 'blog-categories.json'), 'utf8'))
  : [])
w('media.json', [])
w('inquiries.json', [])
if (!existsSync(path.join(out, 'users.json'))) w('users.json', [])

console.log('Fresh PMS_Lite seed complete → storage-seed/')
console.log('Plans:', plans.length, 'PK sections:', sections.filter((s) => s.market_code === 'pk').length)
