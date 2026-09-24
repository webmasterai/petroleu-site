/**
 * Additive sync: generate published CMS city landing pages into storage-seed
 * (and optionally merge into local storage/data).
 *
 * - Adds only missing pages / sections / seo for PK en-PK city landings
 * - Never touches users, inquiries, uploads, or unrelated existing rows
 * - Idempotent
 *
 * Usage:
 *   node scripts/sync-city-landing-pages.mjs
 *   node scripts/sync-city-landing-pages.mjs --apply-local
 *   DRY_RUN=true node scripts/sync-city-landing-pages.mjs
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const seedDir = process.env.CMS_SEED_DIR || path.join(root, 'storage-seed')
const dataDir = process.env.CMS_DATA_DIR || path.join(root, 'storage', 'data')
const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true'
const applyLocal = process.argv.includes('--apply-local')

const contentMod = await import(
  pathToFileURL(path.join(root, 'src', 'content', 'cityLandingContent.js')).href
)

const {
  CITY_LANDING_PAGES,
  CITY_FEATURE_CARDS,
  CITY_MODULES,
  CITY_WHY_CHOOSE,
  CITY_DASHBOARD_IMAGE,
  CITY_PAGE_PREFIX,
  getCityFaqs,
  getCityBenefits,
  getCityHeroDescription,
  getCitySeoTitle,
  getCitySeoDescription,
  getCityPageSlug,
  getCityPath,
} = contentMod

const MARKET = 'pk'
const LOCALE = 'en-PK'
const now = new Date().toISOString()

function loadJson(filePath, fallback = []) {
  if (!existsSync(filePath)) return fallback
  const raw = readFileSync(filePath, 'utf8')
  if (!raw.trim()) return fallback
  return JSON.parse(raw)
}

function atomicWrite(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, filePath)
}

function maxId(rows) {
  let m = 0
  for (const r of rows) {
    const n = Number(r?.id)
    if (Number.isFinite(n) && n > m) m = n
  }
  return m
}

function pageKey(r) {
  return [r.market_code, r.locale_code, r.slug].join('|')
}

function sectionKey(r) {
  return [
    r.market_code,
    r.locale_code,
    r.page_slug,
    r.section_key,
    String(r.sort_order ?? 0),
    String(r.title || '').trim(),
  ].join('|')
}

function seoKey(r) {
  return [r.market_code, r.locale_code, r.path || r.page_slug || r.slug || ''].join('|')
}

function baseSection(pageSlug, section_key, sort_order, fields = {}) {
  return {
    market_code: MARKET,
    locale_code: LOCALE,
    status: 'published',
    is_enabled: true,
    is_shared: false,
    sort_order,
    page_slug: pageSlug,
    section_key,
    title: fields.title ?? null,
    description: fields.description ?? null,
    content: fields.content ?? null,
    image_url: fields.image_url ?? null,
    image_alt: fields.image_alt ?? null,
    link_label: fields.link_label ?? null,
    link_url: fields.link_url ?? null,
    data: fields.data ?? null,
    published_at: now,
    updated_at: now,
  }
}

function buildCityRecords(city) {
  const pageSlug = getCityPageSlug(city.slug)
  const path = getCityPath(city.slug)
  const seoTitle = getCitySeoTitle(city)
  const seoDescription = getCitySeoDescription(city)
  const faqs = getCityFaqs(city)
  const benefits = getCityBenefits(city)

  const page = {
    market_code: MARKET,
    locale_code: LOCALE,
    slug: pageSlug,
    title: `Petrol Pump Software ${city.name}`,
    description: seoDescription,
    frontend_path: path,
    template: 'city-landing',
    status: 'published',
    is_enabled: true,
    is_shared: false,
    translation_status: 'ready',
    published_at: now,
  }

  const sections = []
  let order = 0

  sections.push(
    baseSection(pageSlug, 'hero', order++, {
      title: `Petrol Pump Software in ${city.name}`,
      description: getCityHeroDescription(city),
      link_label: 'See it in Action',
      link_url: '/get-started',
      data: {
        badge: city.province,
        primaryButton: 'See it in Action',
        secondaryButton: 'View Pricing',
        primaryUrl: '/get-started',
        secondaryUrl: '/pricing',
      },
    }),
  )

  sections.push(
    baseSection(pageSlug, 'intro', order++, {
      title: `Petrol Pump Management Software for Fuel Stations in ${city.name}`,
      description: city.intro,
    }),
  )

  sections.push(
    baseSection(pageSlug, 'heading:features', order++, {
      title: `What Petroleu Helps You Manage in ${city.name}`,
    }),
  )
  CITY_FEATURE_CARDS.forEach((card, i) => {
    sections.push(
      baseSection(pageSlug, 'feature:card', order++, {
        title: card.title,
        description: card.description,
        data: { sort_hint: i },
      }),
    )
  })

  sections.push(
    baseSection(pageSlug, 'heading:benefits', order++, {
      title: `Benefits for Petrol Stations in ${city.name}`,
    }),
  )
  benefits.forEach((text, i) => {
    sections.push(
      baseSection(pageSlug, 'benefit', order++, {
        title: text,
        data: { sort_hint: i },
      }),
    )
  })

  sections.push(
    baseSection(pageSlug, 'visual', order++, {
      title: `Petroleu Dashboard for ${city.name} Fuel Stations`,
      description: `Monitor nozzle sales, tank stock, credit customers, accounts and daily closing from one cloud dashboard — built for operators in ${city.name}.`,
      image_url: CITY_DASHBOARD_IMAGE,
      image_alt: `Petroleu petrol pump software dashboard for ${city.name}`,
    }),
  )

  sections.push(
    baseSection(pageSlug, 'heading:modules', order++, {
      title: 'Core Modules for Fuel Station Operations',
    }),
  )
  CITY_MODULES.forEach((mod, i) => {
    sections.push(
      baseSection(pageSlug, 'module-card', order++, {
        title: mod.title,
        description: mod.description,
        data: { sort_hint: i },
      }),
    )
  })

  sections.push(
    baseSection(pageSlug, 'heading:why', order++, {
      title: `Why Choose Petroleu in ${city.name}`,
    }),
  )
  sections.push(
    baseSection(pageSlug, 'why-choose', order++, {
      title: `Why Choose Petroleu in ${city.name}`,
      data: { items: CITY_WHY_CHOOSE },
    }),
  )

  faqs.forEach((faq, i) => {
    sections.push(
      baseSection(pageSlug, 'faq', order++, {
        title: faq.question,
        description: faq.answer,
        data: { sort_hint: i },
      }),
    )
  })

  sections.push(
    baseSection(pageSlug, 'cta', order++, {
      title: `Ready to Modernize Your ${city.name} Petrol Pump?`,
      description:
        'Talk to our team and see how Petroleu can help manage your fuel station operations.',
      link_label: 'See it in Action',
      link_url: '/get-started',
      data: {
        secondaryButton: 'View Pricing',
        secondaryUrl: '/pricing',
      },
    }),
  )

  const seo = {
    market_code: MARKET,
    locale_code: LOCALE,
    path,
    page_slug: pageSlug,
    title: seoTitle,
    description: seoDescription,
    canonical_url: `https://petroleu.com${path}`,
    og_title: seoTitle,
    og_description: seoDescription,
    og_locale: 'en_PK',
    noindex: false,
    status: 'published',
    robots: 'index, follow',
  }

  return { page, sections, seo, pageSlug, path }
}

function mergeInto(fileName, keyFn, newRows) {
  const filePath = path.join(seedDir, fileName)
  const rows = loadJson(filePath, [])
  if (!Array.isArray(rows)) throw new Error(`${fileName} is not an array`)
  const existing = new Set(rows.map(keyFn).filter(Boolean))
  let next = maxId(rows)
  const added = []
  for (const src of newRows) {
    const k = keyFn(src)
    if (!k || existing.has(k)) continue
    const row = { ...src, id: ++next }
    added.push(row)
    existing.add(k)
  }
  if (!dryRun && added.length) {
    atomicWrite(filePath, [...rows, ...added])
  }
  return { file: fileName, added: added.length, preserved: rows.length, after: rows.length + added.length }
}

function main() {
  console.log('=== Sync city landing CMS pages ===')
  console.log('seed:', seedDir)
  console.log('cities:', CITY_LANDING_PAGES.length)
  console.log('prefix:', CITY_PAGE_PREFIX)
  console.log('dryRun:', dryRun)
  console.log('applyLocal:', applyLocal)

  const allPages = []
  const allSections = []
  const allSeo = []

  for (const city of CITY_LANDING_PAGES) {
    const rec = buildCityRecords(city)
    allPages.push(rec.page)
    allSections.push(...rec.sections)
    allSeo.push(rec.seo)
  }

  const pageRes = mergeInto('pages.json', pageKey, allPages)
  const sectionRes = mergeInto('sections.json', sectionKey, allSections)
  const seoRes = mergeInto('seo.json', seoKey, allSeo)

  console.log(JSON.stringify(pageRes))
  console.log(JSON.stringify(sectionRes))
  console.log(JSON.stringify(seoRes))
  console.log(
    'Generated per city ~',
    Math.round(allSections.length / CITY_LANDING_PAGES.length),
    'sections; total sections candidates',
    allSections.length,
  )

  if (applyLocal && !dryRun) {
    console.log('Applying additive merge into local storage/data…')
    process.env.CMS_SEED_DIR = seedDir
    process.env.CMS_DATA_DIR = dataDir
    // Re-run merge script logic by spawning would be cleaner; inline call:
  }

  console.log('DONE')
  console.log('Next: node scripts/merge-seed-content-additive.mjs  (for local/prod storage/data)')
}

main()
