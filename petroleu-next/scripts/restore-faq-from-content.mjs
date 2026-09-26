/**
 * Restore full FAQ set from src/content/faqPageContent.js into CMS page_slug=faq.
 * Additive for locales: never overwrites existing non-empty answers for fa-AF / ps-AF.
 * For pk/en-PK: fills missing questions from recovered content; updates empty answers only.
 *
 *   node scripts/restore-faq-from-content.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sectionsPath = path.join(root, 'storage', 'data', 'sections.json')
const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'))

const mod = await import(pathToFileURL(path.join(root, 'src/content/faqPageContent.js')).href)
const FAQ_CATEGORIES = mod.FAQ_CATEGORIES || []

const TARGETS = [
  { market_code: 'pk', locale_code: 'en-PK', allowEnglishImport: true },
  { market_code: 'af', locale_code: 'en-AF', allowEnglishImport: true },
  // fa-AF / ps-AF: do not import English — only report missing
]

let nextId = sections.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
const stats = { added: 0, skippedExisting: 0, categories: {} }

function findFaq(market, locale, question) {
  return sections.find(
    (r) =>
      r.page_slug === 'faq' &&
      r.section_key === 'faq' &&
      r.market_code === market &&
      r.locale_code === locale &&
      String(r.title || '').trim() === question,
  )
}

for (const target of TARGETS) {
  let order = 0
  for (const cat of FAQ_CATEGORIES) {
    stats.categories[cat.id] = (stats.categories[cat.id] || 0) + cat.faqs.length
    for (const faq of cat.faqs) {
      const q = String(faq.question || '').trim()
      if (!q) continue
      const existing = findFaq(target.market_code, target.locale_code, q)
      if (existing) {
        // Preserve existing CMS answers; only backfill category if missing
        const data =
          existing.data && typeof existing.data === 'object' && !Array.isArray(existing.data)
            ? { ...existing.data }
            : {}
        if (!data.category) {
          data.category = cat.id
          data.category_label = cat.label
          existing.data = data
        }
        stats.skippedExisting += 1
        order += 1
        continue
      }
      if (!target.allowEnglishImport) continue
      sections.push({
        id: nextId++,
        market_code: target.market_code,
        locale_code: target.locale_code,
        page_slug: 'faq',
        section_key: 'faq',
        title: q,
        description: faq.answer || '',
        content: faq.answer || '',
        image_url: null,
        image_alt: null,
        link_label: null,
        link_url: null,
        sort_order: order++,
        is_enabled: true,
        status: 'published',
        published_at: new Date().toISOString(),
        data: {
          category: cat.id,
          category_label: cat.label,
          question: q,
          answer: faq.answer || '',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      stats.added += 1
    }
  }
}

// Ensure existing incomplete PK FAQs get categories where we can match by fuzzy title
const CAT_HINTS = [
  { re: /what is petroleu|who is petroleu|suitable/i, id: 'general', label: 'General' },
  { re: /pricing|plan|payment/i, id: 'pricing-demo', label: 'Pricing & Demo' },
  { re: /training|support|demo/i, id: 'support-training', label: 'Support & Training' },
]
for (const r of sections) {
  if (r.page_slug !== 'faq' || r.section_key !== 'faq') continue
  const data = r.data && typeof r.data === 'object' && !Array.isArray(r.data) ? { ...r.data } : {}
  if (data.category) continue
  const title = String(r.title || '')
  const hint = CAT_HINTS.find((h) => h.re.test(title))
  if (hint) {
    data.category = hint.id
    data.category_label = hint.label
    r.data = data
  } else {
    data.category = 'general'
    data.category_label = 'General'
    r.data = data
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(root, 'storage', 'backups', `faq-restore-${stamp}`)
fs.mkdirSync(backupDir, { recursive: true })
fs.copyFileSync(sectionsPath, path.join(backupDir, 'sections.json'))
fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + '\n')

const pk = sections.filter(
  (r) =>
    r.page_slug === 'faq' &&
    r.section_key === 'faq' &&
    r.market_code === 'pk' &&
    r.locale_code === 'en-PK' &&
    r.is_enabled !== false,
)
console.log(
  JSON.stringify(
    {
      ...stats,
      pkFaqCount: pk.length,
      backup: backupDir,
      note: 'fa-AF/ps-AF not overwritten with English',
    },
    null,
    2,
  ),
)
