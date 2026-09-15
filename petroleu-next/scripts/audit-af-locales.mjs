import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'storage', 'data')
const load = (n) => JSON.parse(fs.readFileSync(path.join(dataDir, n), 'utf8'))

const markets = load('markets.json')
const locales = load('locales.json')
const pages = load('pages.json')
const sections = load('sections.json')
const nav = load('navigation.json')
const settings = load('settings.json')
const seo = load('seo.json')
const media = load('media.json')

console.log('=== STORAGE ===')
console.log('dataDir:', dataDir)
console.log(
  'files:',
  fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith('.json'))
    .join(', '),
)

console.log('\n=== MARKETS/LOCALES ===')
console.log(markets.map((m) => ({ code: m.code, default: m.default_locale, active: m.is_active })))
console.log(
  locales.map((l) => ({
    code: l.code,
    name: l.name,
    native: l.native_name,
    dir: l.dir,
    active: l.is_active,
  })),
)

function sk(x) {
  return `${x.page_slug}|${x.section_key}|${x.sort_order ?? 0}`
}

function audit(locale) {
  const p = pages.filter((x) => x.market_code === 'af' && x.locale_code === locale)
  const s = sections.filter((x) => x.market_code === 'af' && x.locale_code === locale)
  const n = nav.filter((x) => x.market_code === 'af' && x.locale_code === locale)
  const st = settings.filter((x) => x.market_code === 'af' && x.locale_code === locale)
  const se = seo.filter((x) => x.market_code === 'af' && x.locale_code === locale)

  const published = s.filter((x) => x.status === 'published' && x.is_enabled !== false)
  const draft = s.filter((x) => x.status !== 'published' || x.is_enabled === false)
  const pageSlugs = [...new Set(s.map((x) => x.page_slug))].sort()
  const sectionKeys = [...new Set(s.map((x) => x.section_key))].sort()
  const pageSlugsPages = [...new Set(p.map((x) => x.slug))].sort()

  const counts = {}
  for (const x of s) counts[sk(x)] = (counts[sk(x)] || 0) + 1
  const dups = Object.entries(counts).filter(([, c]) => c > 1)

  const heroes = s.filter((x) => x.page_slug === 'home' && x.section_key === 'hero')
  const hero = heroes.find((h) => h.image_url) || heroes[0]

  return {
    pages: p.length,
    pageSlugs: pageSlugsPages,
    sections: s.length,
    published: published.length,
    draftOrDisabled: draft.length,
    pageSlugsInSections: pageSlugs,
    sectionKeys,
    nav: n.length,
    navLocations: [...new Set(n.map((x) => x.location))],
    settings: st.length,
    settingKeys: st.map((x) => x.key).sort(),
    seo: se.length,
    seoPaths: se.map((x) => x.path),
    duplicates: dups,
    heroCount: heroes.length,
    heroTitle: hero?.title,
    heroImg: !!(hero?.image_url || hero?.data?.dashboard_image_url),
    heroImgUrl: hero?.image_url || hero?.data?.dashboard_image_url || null,
  }
}

const fa = audit('fa-AF')
const ps = audit('ps-AF')
const en = audit('en-AF')

console.log('\n=== DARI fa-AF ===')
console.log(
  JSON.stringify(
    {
      pages: fa.pages,
      sections: fa.sections,
      published: fa.published,
      draft: fa.draftOrDisabled,
      nav: fa.nav,
      settings: fa.settings,
      seo: fa.seo,
      dups: fa.duplicates,
      heroImg: fa.heroImg,
      heroTitle: fa.heroTitle,
      heroUrl: fa.heroImgUrl,
      pageSlugs: fa.pageSlugs,
      sectionKeys: fa.sectionKeys,
      seoPaths: fa.seoPaths,
    },
    null,
    2,
  ),
)

console.log('\n=== PASHTO ps-AF ===')
console.log(
  JSON.stringify(
    {
      pages: ps.pages,
      sections: ps.sections,
      published: ps.published,
      draft: ps.draftOrDisabled,
      nav: ps.nav,
      settings: ps.settings,
      seo: ps.seo,
      dups: ps.duplicates,
      heroImg: ps.heroImg,
      heroTitle: ps.heroTitle,
      heroUrl: ps.heroImgUrl,
      pageSlugs: ps.pageSlugs,
      sectionKeys: ps.sectionKeys,
      seoPaths: ps.seoPaths,
    },
    null,
    2,
  ),
)

const faKeys = new Set(
  sections.filter((x) => x.market_code === 'af' && x.locale_code === 'fa-AF').map(sk),
)
const psKeys = new Set(
  sections.filter((x) => x.market_code === 'af' && x.locale_code === 'ps-AF').map(sk),
)
const onlyFa = [...faKeys].filter((k) => !psKeys.has(k))
const onlyPs = [...psKeys].filter((k) => !faKeys.has(k))
console.log('\n=== STRUCT DIFF sections ===')
console.log('onlyDari', onlyFa.length, onlyFa)
console.log('onlyPashto', onlyPs.length, onlyPs)

const faPages = new Set(
  pages.filter((x) => x.market_code === 'af' && x.locale_code === 'fa-AF').map((x) => x.slug),
)
const psPages = new Set(
  pages.filter((x) => x.market_code === 'af' && x.locale_code === 'ps-AF').map((x) => x.slug),
)
console.log('pages onlyDari', [...faPages].filter((x) => !psPages.has(x)))
console.log('pages onlyPashto', [...psPages].filter((x) => !faPages.has(x)))

const faNav = new Set(
  nav
    .filter((x) => x.market_code === 'af' && x.locale_code === 'fa-AF')
    .map((x) => `${x.location}|${x.sort_order ?? 0}|${x.menu_group || ''}`),
)
const psNav = new Set(
  nav
    .filter((x) => x.market_code === 'af' && x.locale_code === 'ps-AF')
    .map((x) => `${x.location}|${x.sort_order ?? 0}|${x.menu_group || ''}`),
)
console.log('nav onlyDari', [...faNav].filter((x) => !psNav.has(x)))
console.log('nav onlyPashto', [...psNav].filter((x) => !faNav.has(x)))

const faSet = new Set(
  settings.filter((x) => x.market_code === 'af' && x.locale_code === 'fa-AF').map((x) => x.key),
)
const psSet = new Set(
  settings.filter((x) => x.market_code === 'af' && x.locale_code === 'ps-AF').map((x) => x.key),
)
console.log('settings onlyDari', [...faSet].filter((x) => !psSet.has(x)))
console.log('settings onlyPashto', [...psSet].filter((x) => !faSet.has(x)))

console.log(
  'seo fa',
  seo.filter((x) => x.market_code === 'af' && x.locale_code === 'fa-AF').map((x) => x.path),
)
console.log(
  'seo ps',
  seo.filter((x) => x.market_code === 'af' && x.locale_code === 'ps-AF').map((x) => x.path),
)

// Check if Pashto text is actually Pashto vs copied Dari/English
function sampleText(locale) {
  const s = sections.filter(
    (x) => x.market_code === 'af' && x.locale_code === locale && x.page_slug === 'home',
  )
  const hero = s.find((x) => x.section_key === 'hero')
  const feat = s.find((x) => x.section_key === 'feature:card')
  const n = nav.find((x) => x.market_code === 'af' && x.locale_code === locale && x.location === 'header')
  return {
    hero: hero?.title,
    heroDesc: (hero?.description || '').slice(0, 80),
    feature: feat?.title,
    nav: n?.label,
  }
}
console.log('\n=== SAMPLE TEXT ===')
console.log('Dari', sampleText('fa-AF'))
console.log('Pashto', sampleText('ps-AF'))
console.log('EN-AF', sampleText('en-AF'))

console.log('\n=== PK SAFETY ===')
console.log('pk sections', sections.filter((x) => x.market_code === 'pk').length)
console.log('media', media.length)
console.log('en-AF sections', en.sections)

// Homepage required keys vs present
const requiredHomeKeys = [
  'hero',
  'stat',
  'feature:card',
  'how-it-works',
  'industry',
  'mobile-feature',
  'analytics-card',
  'why-choose',
  'testimonial',
  'faq',
  'supported-brand',
  'logo',
  'cta',
  'heading:features',
  'heading:getting-started',
  'heading:industries',
  'heading:mobile',
  'heading:analytics',
  'heading:faq',
  'heading:pricing',
  'heading:testimonials',
  'heading:blog',
  'heading:invoice',
  'heading:reports',
  'heading:why-choose',
  'heading:logos',
]
for (const locale of ['fa-AF', 'ps-AF']) {
  const present = new Set(
    sections
      .filter((x) => x.market_code === 'af' && x.locale_code === locale && x.page_slug === 'home')
      .map((x) => x.section_key),
  )
  // also home-mid/home-bottom cta
  const mid = sections.some(
    (x) =>
      x.market_code === 'af' &&
      x.locale_code === locale &&
      x.page_slug === 'home-mid' &&
      x.section_key === 'cta',
  )
  const bot = sections.some(
    (x) =>
      x.market_code === 'af' &&
      x.locale_code === locale &&
      x.page_slug === 'home-bottom' &&
      x.section_key === 'cta',
  )
  const missing = requiredHomeKeys.filter((k) => !present.has(k))
  console.log(`\n${locale} home missing keys:`, missing)
  console.log(`${locale} home-mid cta:`, mid, 'home-bottom cta:', bot)
}
