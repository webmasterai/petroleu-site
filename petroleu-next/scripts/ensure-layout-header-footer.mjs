/**
 * Ensure Header + Footer layout section rows exist for each market/locale.
 * Additive only — does not overwrite existing rows.
 *
 *   node scripts/ensure-layout-header-footer.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sectionsPath = path.join(root, 'storage', 'data', 'sections.json')
const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'))

const LOCALES = [
  { market_code: 'pk', locale_code: 'en-PK' },
  { market_code: 'af', locale_code: 'en-AF' },
  { market_code: 'af', locale_code: 'fa-AF' },
  { market_code: 'af', locale_code: 'ps-AF' },
]

let nextId = sections.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
let added = 0

function exists(market, locale, key) {
  return sections.some(
    (r) =>
      r.page_slug === 'layout' &&
      r.section_key === key &&
      r.market_code === market &&
      r.locale_code === locale,
  )
}

for (const { market_code, locale_code } of LOCALES) {
  if (!exists(market_code, locale_code, 'header')) {
    sections.push({
      id: nextId++,
      market_code,
      locale_code,
      page_slug: 'layout',
      section_key: 'header',
      title: 'Petroleu',
      description: null,
      content: null,
      image_url: '/petroleu-logo.png',
      image_alt: 'Petroleu',
      link_label: null,
      link_url: '/',
      sort_order: 0,
      is_enabled: true,
      status: 'published',
      published_at: new Date().toISOString(),
      data: { brand_name: 'Petroleu' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    added += 1
  }
  if (!exists(market_code, locale_code, 'footer')) {
    sections.push({
      id: nextId++,
      market_code,
      locale_code,
      page_slug: 'layout',
      section_key: 'footer',
      title: 'Petroleu',
      description:
        'Petrol pump management software for fuel inventory, sales, credit, and daily closing.',
      content: null,
      image_url: '/petroleu-logo.png',
      image_alt: 'Petroleu',
      link_label: null,
      link_url: '/',
      sort_order: 1,
      is_enabled: true,
      status: 'published',
      published_at: new Date().toISOString(),
      data: {
        brand_name: 'Petroleu',
        footer_credit: 'Made with care in Pakistan',
        phone: '',
        phone_tel: '',
        email: '',
        address: '',
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    added += 1
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(root, 'storage', 'backups', `layout-chrome-${stamp}`)
fs.mkdirSync(backupDir, { recursive: true })
fs.copyFileSync(sectionsPath, path.join(backupDir, 'sections.json'))
fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + '\n')
console.log(JSON.stringify({ added, total: sections.length, backup: backupDir }, null, 2))
