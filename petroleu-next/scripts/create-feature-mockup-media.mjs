/**
 * Create feature mockup SVG media assets and bind to Home feature:card rows.
 * Visuals previously lived only in FeatureMiniMockup JSX (no image_url).
 *
 *   node scripts/create-feature-mockup-media.mjs [--dry-run]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

const TYPES = [
  'stock-dip',
  'reporting-dashboard',
  'cash-credit',
  'sales-billing',
  'remote-visibility',
  'fuel-inventory',
  'staff-shift',
  'lube-inventory',
  'cloud-access',
]

/** Simplified SVG stand-ins matching FeatureMiniMockup palette (cream #faf6f1, orange #C4511A). */
function svgFor(type) {
  const bg = '#faf6f1'
  const orange = '#C4511A'
  const ink = '#1e293b'
  const muted = '#64748b'
  const white = '#ffffff'
  const border = '#e2e8f0'

  const card = (x, y, w, h, content) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${white}" stroke="${border}"/>${content}`

  switch (type) {
    case 'stock-dip':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 206, 28, `<text x="24" y="31" font-size="11" font-family="system-ui,sans-serif" fill="${ink}" font-weight="600">Tank Stock</text><rect x="150" y="18" width="52" height="16" rx="8" fill="${orange}22"/><text x="162" y="30" font-size="10" fill="${orange}" font-weight="600">Dip</text>`)}
${card(12, 48, 64, 44, `<text x="44" y="66" text-anchor="middle" font-size="9" fill="${muted}">Open</text><text x="44" y="82" text-anchor="middle" font-size="12" font-weight="700" fill="${ink}">22.5K</text>`)}
${card(83, 48, 64, 44, `<text x="115" y="66" text-anchor="middle" font-size="9" fill="${muted}">Close</text><text x="115" y="82" text-anchor="middle" font-size="12" font-weight="700" fill="${ink}">18.2K</text>`)}
${card(154, 48, 64, 44, `<text x="186" y="66" text-anchor="middle" font-size="9" fill="${muted}">Var</text><text x="186" y="82" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">-18L</text>`)}
${card(12, 100, 206, 38, `<text x="24" y="118" font-size="9" fill="${muted}">Level</text><text x="190" y="118" text-anchor="end" font-size="10" font-weight="600" fill="${orange}">72%</text><rect x="24" y="124" width="182" height="8" rx="4" fill="${border}"/><rect x="24" y="124" width="131" height="8" rx="4" fill="${orange}"/>`)}
</svg>`
    case 'reporting-dashboard':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 78, 38, `<text x="22" y="30" font-size="9" fill="${muted}">Sales</text><text x="22" y="44" font-size="13" font-weight="700" fill="${ink}">2.8M</text>`)}
${card(12, 56, 78, 38, `<text x="22" y="74" font-size="9" fill="${muted}">Profit</text><text x="22" y="88" font-size="13" font-weight="700" fill="${ink}">420K</text>`)}
${card(12, 100, 78, 38, `<text x="22" y="118" font-size="9" fill="${muted}">Stock</text><text x="22" y="132" font-size="13" font-weight="700" fill="${ink}">9.8K</text>`)}
${card(100, 12, 118, 126, '')}
<text x="112" y="32" font-size="10" fill="${muted}">Report</text>
<rect x="112" y="110" width="12" height="20" rx="2" fill="#1e293bd9"/>
<rect x="128" y="95" width="12" height="35" rx="2" fill="#1e293bd9"/>
<rect x="144" y="100" width="12" height="30" rx="2" fill="#1e293bd9"/>
<rect x="160" y="82" width="12" height="48" rx="2" fill="#1e293bd9"/>
<rect x="176" y="90" width="12" height="40" rx="2" fill="#1e293bd9"/>
<rect x="192" y="85" width="12" height="45" rx="2" fill="#1e293bd9"/>
</svg>`
    case 'cash-credit':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 66, 42, `<text x="45" y="30" text-anchor="middle" font-size="9" fill="${muted}">Cash</text><text x="45" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="#047857">1.9M</text>`)}
${card(86, 12, 66, 42, `<text x="119" y="30" text-anchor="middle" font-size="9" fill="${muted}">Credit</text><text x="119" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="#c2410c">890K</text>`)}
${card(160, 12, 58, 42, `<text x="189" y="30" text-anchor="middle" font-size="9" fill="${muted}">Due</text><text x="189" y="46" text-anchor="middle" font-size="12" font-weight="700" fill="${orange}">248K</text>`)}
${card(12, 64, 206, 74, `<rect x="12" y="64" width="206" height="22" fill="${border}"/><text x="24" y="79" font-size="10" font-weight="600" fill="${muted}">Ledger</text><text x="24" y="100" font-size="10" fill="${ink}">Shift A</text><text x="200" y="100" text-anchor="end" font-size="10" font-weight="600" fill="${orange}">PKR 45K</text><text x="24" y="120" font-size="10" fill="${ink}">Credit</text><text x="200" y="120" text-anchor="end" font-size="10" font-weight="600" fill="${orange}">PKR 12K</text>`)}
</svg>`
    case 'sales-billing':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(40, 18, 150, 114, '')}
<rect x="40" y="18" width="150" height="28" fill="${orange}"/>
<text x="115" y="37" text-anchor="middle" font-size="12" font-weight="600" fill="${white}">Invoice #1042</text>
<text x="56" y="70" font-size="11" fill="${muted}">Nozzle #2</text><text x="170" y="70" text-anchor="end" font-size="11" fill="${ink}">420 L</text>
<text x="56" y="92" font-size="11" fill="${muted}">Rate</text><text x="170" y="92" text-anchor="end" font-size="11" fill="${ink}">PKR 289</text>
<line x1="56" y1="104" x2="174" y2="104" stroke="${border}"/>
<text x="56" y="122" font-size="13" font-weight="700" fill="${ink}">Total</text><text x="170" y="122" text-anchor="end" font-size="13" font-weight="700" fill="${orange}">PKR 121K</text>
</svg>`
    case 'remote-visibility':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
<rect x="70" y="12" width="90" height="126" rx="10" fill="${white}" stroke="#334155" stroke-width="3"/>
<rect x="70" y="12" width="90" height="22" fill="${orange}"/>
<text x="115" y="28" text-anchor="middle" font-size="10" font-weight="600" fill="${white}">Petroleu</text>
${card(80, 42, 70, 36, `<text x="88" y="58" font-size="9" fill="${muted}">Sales</text><text x="88" y="72" font-size="12" font-weight="700" fill="${ink}">2.8M</text>`)}
${card(80, 84, 32, 36, `<text x="84" y="100" font-size="8" fill="${muted}">Stock</text><text x="84" y="114" font-size="10" font-weight="700" fill="${ink}">9.8K</text>`)}
${card(118, 84, 32, 36, `<text x="122" y="100" font-size="8" fill="${muted}">Cash</text><text x="122" y="114" font-size="10" font-weight="700" fill="${ink}">1.9M</text>`)}
</svg>`
    case 'fuel-inventory':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 206, 28, `<text x="24" y="31" font-size="12" font-weight="600" fill="${ink}">Inventory</text><rect x="150" y="18" width="52" height="16" rx="8" fill="#fff7ed"/><text x="162" y="30" font-size="10" font-weight="600" fill="#c2410c">Low</text>`)}
${card(12, 52, 206, 40, `<text x="24" y="70" font-size="10" fill="${muted}">Petrol</text><text x="200" y="70" text-anchor="end" font-size="11" font-weight="600" fill="${orange}">72%</text><rect x="24" y="78" width="182" height="8" rx="4" fill="${border}"/><rect x="24" y="78" width="131" height="8" rx="4" fill="${orange}"/>`)}
${card(12, 100, 206, 38, `<text x="24" y="118" font-size="10" fill="${muted}">Diesel</text><text x="200" y="118" text-anchor="end" font-size="11" font-weight="600" fill="${orange}">45%</text><rect x="24" y="124" width="182" height="8" rx="4" fill="${border}"/><rect x="24" y="124" width="82" height="8" rx="4" fill="${orange}"/>`)}
</svg>`
    case 'staff-shift':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 206, 28, `<text x="24" y="31" font-size="12" font-weight="600" fill="${ink}">Shift</text><rect x="150" y="18" width="56" height="16" rx="8" fill="#ecfdf5"/><text x="160" y="30" font-size="10" font-weight="600" fill="#047857">Present</text>`)}
${card(12, 52, 206, 86, `<text x="24" y="78" font-size="11" fill="${muted}">Ali K.</text><text x="200" y="78" text-anchor="end" font-size="11" font-weight="600" fill="${ink}">8AM–4PM</text><text x="24" y="100" font-size="11" fill="${muted}">Salary</text><text x="200" y="100" text-anchor="end" font-size="11" font-weight="600" fill="${ink}">PKR 42K</text><text x="24" y="122" font-size="11" fill="${muted}">OT</text><text x="200" y="122" text-anchor="end" font-size="11" font-weight="600" fill="${ink}">+4 hrs</text>`)}
</svg>`
    case 'lube-inventory':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 100, 44, `<text x="22" y="32" font-size="10" fill="${muted}">Engine Oil</text><text x="22" y="48" font-size="13" font-weight="700" fill="${ink}">48 pcs</text>`)}
${card(120, 12, 98, 44, `<text x="130" y="32" font-size="10" fill="${muted}">Brake Fluid</text><text x="130" y="48" font-size="13" font-weight="700" fill="${ink}">22 pcs</text>`)}
${card(12, 66, 206, 58, `<rect x="12" y="66" width="206" height="20" fill="${border}"/><text x="24" y="80" font-size="10" font-weight="600" fill="${muted}">Shop Stock</text><text x="24" y="102" font-size="11" fill="${ink}">5W-30</text><text x="200" y="102" text-anchor="end" font-size="11" font-weight="600" fill="${orange}">12</text><text x="24" y="118" font-size="11" fill="${ink}">ATF</text><text x="200" y="118" text-anchor="end" font-size="11" font-weight="600" fill="${orange}">8</text>`)}
</svg>`
    case 'cloud-access':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="150" viewBox="0 0 230 150">
<rect width="230" height="150" fill="${bg}"/>
${card(12, 12, 88, 126, `<text x="56" y="50" text-anchor="middle" font-size="12" font-weight="600" fill="${ink}">Cloud</text><text x="56" y="72" text-anchor="middle" font-size="10" fill="#047857">Backup OK</text><rect x="26" y="88" width="60" height="18" rx="9" fill="${orange}22"/><text x="56" y="101" text-anchor="middle" font-size="10" font-weight="600" fill="${orange}">Sync</text>`)}
${card(110, 12, 108, 126, `<text x="124" y="40" font-size="12" font-weight="600" fill="${ink}">Roles</text><text x="124" y="70" font-size="11" fill="${muted}">Admin</text><text x="200" y="70" text-anchor="end" font-size="10" font-weight="600" fill="#047857">OK</text><text x="124" y="95" font-size="11" fill="${muted}">Manager</text><text x="200" y="95" text-anchor="end" font-size="10" font-weight="600" fill="#047857">OK</text><text x="124" y="120" font-size="11" fill="${muted}">Staff</text><text x="200" y="120" text-anchor="end" font-size="10" font-weight="600" fill="#047857">OK</text>`)}
</svg>`
  }
}

const mediaDir = path.join(root, 'public', 'media', 'features')
const uploadDir = path.join(root, 'storage', 'uploads')
const mediaPath = path.join(root, 'storage', 'data', 'media.json')
const sectionsPath = path.join(root, 'storage', 'data', 'sections.json')

fs.mkdirSync(mediaDir, { recursive: true })
fs.mkdirSync(uploadDir, { recursive: true })

const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'))
const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'))
let nextId = media.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
const typeToUrl = {}
const added = []

for (const type of TYPES) {
  const filename = `feature-mockup-${type}.svg`
  const publicRel = `/media/features/${filename}`
  const absPublic = path.join(mediaDir, filename)
  const uploadName = `feature-mockup-${type}.svg`
  const absUpload = path.join(uploadDir, uploadName)
  const svg = svgFor(type)

  if (!dryRun) {
    fs.writeFileSync(absPublic, svg, 'utf8')
    fs.writeFileSync(absUpload, svg, 'utf8')
  }

  let row = media.find((m) => m.filename === filename || m.url === publicRel || m.source_key === `feature-mockup:${type}`)
  if (!row) {
    row = {
      id: nextId++,
      url: publicRel,
      path: uploadName,
      filename,
      mime_type: 'image/svg+xml',
      size: Buffer.byteLength(svg),
      width: 230,
      height: 150,
      alt_text: `Feature mockup: ${type}`,
      caption: 'Exported from FeatureMiniMockup for CMS Media Library',
      title: `Feature · ${type}`,
      poster_url: null,
      market_code: 'pk',
      source_key: `feature-mockup:${type}`,
      created_at: new Date().toISOString(),
    }
    media.push(row)
    added.push(publicRel)
  } else if (!row.url) {
    row.url = publicRel
  }
  typeToUrl[type] = row.url
}

// Bind Home feature:card rows by sort_order (same INDEX_TO_TYPE mapping as FeatureMiniMockup)
let linked = 0
const homeFeaturesByLocale = new Map()
for (const row of sections) {
  if (row.page_slug !== 'home' || row.section_key !== 'feature:card') continue
  const key = `${row.market_code}|${row.locale_code}`
  if (!homeFeaturesByLocale.has(key)) homeFeaturesByLocale.set(key, [])
  homeFeaturesByLocale.get(key).push(row)
}

for (const [, list] of homeFeaturesByLocale) {
  list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  list.forEach((row, index) => {
    if (index >= TYPES.length) return
    // Only fill missing image_url (additive)
    if (row.image_url) return
    const type = TYPES[index]
    const url = typeToUrl[type]
    if (!url) return
    row.image_url = url
    row.image_alt = row.image_alt || `${row.title || type} illustration`
    const data = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? { ...row.data } : {}
    data.image_media_key = `feature-mockup:${type}`
    row.data = data
    linked += 1
  })
}

console.log(
  JSON.stringify(
    {
      dryRun,
      mediaAdded: added.length,
      mediaTotal: media.length,
      homeFeatureCardsLinked: linked,
      typeToUrl,
    },
    null,
    2,
  ),
)

if (dryRun) process.exit(0)

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(root, 'storage', 'backups', `feature-mockup-media-${stamp}`)
fs.mkdirSync(backupDir, { recursive: true })
fs.copyFileSync(mediaPath, path.join(backupDir, 'media.json'))
fs.copyFileSync(sectionsPath, path.join(backupDir, 'sections.json'))
fs.writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n')
fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + '\n')
console.log('Backup:', backupDir)
