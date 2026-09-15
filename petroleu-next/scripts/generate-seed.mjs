/**
 * Generate initial JSON CMS seed from static website content.
 * Run: npx tsx scripts/generate-seed.mjs
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const out = path.join(root, 'storage-seed')
mkdirSync(out, { recursive: true })

const require = createRequire(import.meta.url)
// Load JS content module
const contentPath = path.join(root, 'src/content/websiteContent.js')
let websiteContent = { brand: {}, hero: {}, stats: [], features: [], faq: [], testimonials: [] }
try {
  // dynamic import of .js
  const mod = await import(pathToFileURL(contentPath).href)
  websiteContent = mod.websiteContent
} catch (e) {
  console.warn('Could not import websiteContent, using minimal seed', e.message)
}

function pathToFileURL(p) {
  let u = path.resolve(p).replace(/\\/g, '/')
  if (!u.startsWith('/')) u = '/' + u
  return new URL(`file://${u}`)
}

function w(name, data) {
  writeFileSync(path.join(out, name), JSON.stringify(data, null, 2))
  console.log('wrote', name)
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
    phone: websiteContent.brand?.phone || '',
    email: websiteContent.brand?.salesEmail || '',
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
    sort_order: sections.length,
    ...partial,
  })
}

const hero = websiteContent.hero || {}
addSection({
  page_slug: 'home',
  section_key: 'hero',
  title: hero.title || 'Petrol Pump Software',
  description: hero.description || '',
  data: {
    badge: hero.badge,
    titleHighlight: hero.titleHighlight,
    primaryButton: hero.primaryButton,
    secondaryButton: hero.secondaryButton,
    features: hero.features,
    dashboard_image_url: hero.dashboardImageUrl,
    dashboard_url: hero.dashboardUrl,
  },
  image_url: hero.dashboardImageUrl,
})

;(websiteContent.stats || []).forEach((s, i) => {
  addSection({
    page_slug: 'home',
    section_key: 'stat',
    title: s.value,
    description: s.label,
    sort_order: i,
  })
})

;(websiteContent.features || []).forEach((f, i) => {
  addSection({
    page_slug: 'home',
    section_key: 'feature:card',
    title: f.title,
    description: f.description,
    data: { badge: f.badge },
    sort_order: i,
  })
})

;(websiteContent.faq || []).forEach((f, i) => {
  addSection({
    page_slug: 'home',
    section_key: 'faq',
    title: f.question || f.title,
    description: f.answer || f.description,
    content: f.answer || f.description,
    sort_order: i,
  })
})

const testimonialsList = Array.isArray(websiteContent.testimonials)
  ? websiteContent.testimonials
  : Object.values(websiteContent.testimonials || {})
testimonialsList.forEach((t, i) => {
  if (!t || typeof t !== 'object') return
  addSection({
    page_slug: 'home',
    section_key: 'testimonial',
    title: t.name || t.title,
    description: t.role || t.company,
    content: t.quote || t.content,
    data: t,
    sort_order: i,
  })
})

// Minimal AF Dari hero so AF routes are not empty
addSection({
  market_code: 'af',
  locale_code: 'fa-AF',
  page_slug: 'home',
  section_key: 'hero',
  title: 'نرم‌افزار مدیریت پمپ تیل',
  description: 'مدیریت هوشمند پمپ تیل برای افغانستان.',
  data: { badge: 'پترولیو', titleHighlight: 'افغانستان', primaryButton: 'درخواست دمو', secondaryButton: 'قیمت‌ها' },
})
addSection({
  market_code: 'af',
  locale_code: 'ps-AF',
  page_slug: 'home',
  section_key: 'hero',
  title: 'د تیلو پمپ مدیریت سافټویر',
  description: 'د افغانستان د تیلو سټیشنونو لپاره هوښیار مدیریت.',
  data: { badge: 'پټرولیو', titleHighlight: 'افغانستان', primaryButton: 'ډیمو وغواړئ', secondaryButton: 'بیې' },
})
addSection({
  market_code: 'af',
  locale_code: 'en-AF',
  page_slug: 'home',
  section_key: 'hero',
  title: 'Petrol Pump Software',
  description: 'Smarter fuel station management for Afghanistan.',
  data: { badge: 'Petroleu', titleHighlight: 'Afghanistan', primaryButton: 'Request demo', secondaryButton: 'Pricing' },
})

const pages = [
  { id: 1, market_code: 'pk', locale_code: 'en-PK', slug: 'home', title: 'Home', status: 'published', is_enabled: true },
  { id: 2, market_code: 'pk', locale_code: 'en-PK', slug: 'pricing', title: 'Pricing', status: 'published', is_enabled: true },
  { id: 3, market_code: 'af', locale_code: 'fa-AF', slug: 'home', title: 'خانه', status: 'published', is_enabled: true },
]

const settings = [
  { id: 1, market_code: 'pk', locale_code: 'en-PK', key: 'site_name', value: 'Petroleu', type: 'string', grp: 'general' },
  { id: 2, market_code: 'pk', locale_code: 'en-PK', key: 'site_tagline', value: websiteContent.brand?.name || 'Petroleu', type: 'string', grp: 'general' },
  { id: 3, market_code: 'af', locale_code: 'fa-AF', key: 'site_name', value: 'پترولیو', type: 'string', grp: 'general' },
]

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
    description: 'Petrol pump management software for Pakistan.',
    status: 'published',
    noindex: false,
  },
]

let blogPosts = []
const blogCandidates = [
  path.join(root, '../petroleu-site-main/petroleu-site-main/backend/database/seeders/data/blog_posts.json'),
  path.join(root, '../petroleu-site-main/backend/database/seeders/data/blog_posts.json'),
  path.join(root, 'src/content/blog_posts.json'),
]
const blogSrc = blogCandidates.find((p) => existsSync(p))
if (blogSrc) {
  try {
    const raw = JSON.parse(readFileSync(blogSrc, 'utf8'))
    blogPosts = (Array.isArray(raw) ? raw : []).map((p, i) => ({
      id: i + 1,
      market_code: 'pk',
      locale_code: 'en-PK',
      slug: p.slug || `post-${i + 1}`,
      title: p.title || 'Blog post',
      excerpt: p.excerpt || '',
      content: p.content || p.body || '',
      image_url: p.image_url || p.image || null,
      category: p.category || null,
      author: p.author || 'Petroleu',
      media_type: p.media_type || null,
      video_url: p.video_url || null,
      status: 'published',
      is_enabled: true,
      show_on_homepage: Boolean(p.show_on_homepage) || i < 3,
      published_at: p.published_at || p.date || new Date().toISOString(),
    }))
    console.log('blog seed from', blogSrc, blogPosts.length)
  } catch (e) {
    console.warn('blog seed failed', e.message)
  }
}

// Do not embed passwords/hashes in seed — create admin via: npm run cms:create-admin
const users = []

w('markets.json', markets)
w('locales.json', locales)
w('pages.json', pages)
w('sections.json', sections)
w('settings.json', settings)
w('navigation.json', navigation)
w('seo.json', seo)
w('blog-posts.json', blogPosts)
w('blog-categories.json', [])
w('media.json', [])
w('inquiries.json', [])
w('users.json', users)

console.log('Seed complete → storage-seed/')
console.log('Note: users.json is empty — run npm run cms:create-admin')
