const fs = require('fs')

const LOGO =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-25%20at%2010.54.14%E2%80%AFPM-tCsoz7x0MUzpqAy3VGnkK5P2cKj1bN.png'

function patch(file) {
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
  let n = 0
  for (const s of rows) {
    if (s.section_key === 'logo' && s.page_slug === 'home' && !s.image_url) {
      s.image_url = LOGO
      s.updated_at = new Date().toISOString()
      n++
    }
    if (s.section_key === 'heading:logos' && s.market_code === 'pk' && s.locale_code === 'en-PK') {
      s.title = "Trusted by Pakistan's leading fuel networks"
      s.updated_at = new Date().toISOString()
      n++
    }
    if (s.section_key === 'heading:logos' && s.market_code === 'af' && s.locale_code === 'en-AF') {
      s.title = "Trusted by Afghanistan's leading fuel networks"
      s.updated_at = new Date().toISOString()
      n++
    }
  }
  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  console.log(file, 'patched', n)
}

patch('storage/data/sections.json')
patch('storage-seed/sections.json')

// Disable/re-enable smoke (restore immediately)
const rows = JSON.parse(fs.readFileSync('storage/data/sections.json', 'utf8'))
const sample = rows.find((s) => s.id === 5)
const before = sample.is_enabled
sample.is_enabled = false
const pub = rows.filter(
  (s) =>
    s.market_code === 'pk' &&
    s.locale_code === 'en-PK' &&
    s.section_key === 'stat' &&
    s.status === 'published' &&
    s.is_enabled !== false,
)
console.log(
  'After disable id5 public stats',
  pub.length,
  pub.map((p) => p.title).join(','),
)
sample.is_enabled = before
const pub2 = rows.filter(
  (s) =>
    s.market_code === 'pk' &&
    s.locale_code === 'en-PK' &&
    s.section_key === 'stat' &&
    s.status === 'published' &&
    s.is_enabled !== false,
)
console.log('Restored public stats', pub2.length)
fs.writeFileSync('storage/data/sections.json', JSON.stringify(rows, null, 2) + '\n')

const logos = rows.filter((s) => s.section_key === 'logo' && s.page_slug === 'home')
console.log(
  'logos with image',
  logos.map((l) => ({ id: l.id, locale: l.locale_code, hasImg: !!l.image_url })),
)
