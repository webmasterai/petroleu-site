/**
 * Production-mode local smoke: 5 reloads of /stats + /navigation.
 */
const BASE = process.env.CMS_BASE || 'http://127.0.0.1:3000/api/cms'

async function get(path, params = {}) {
  const u = new URL(BASE + path)
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
  const res = await fetch(u, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return json.data !== undefined ? json.data : json
}

const expectedStats = [
  '500+|Stations Active',
  '99.9%|Uptime',
  '10M+|Transactions Logged',
  '24/7|Support',
]
const expectedNav = ['Features', 'Pricing', 'FAQ', 'Mobile App', 'About', 'Blog', 'Contact']
const banned = ['1350+', '20+', '4.8', 'Petrol Pumps', 'Years of Excellence', 'Google Reviews']

async function main() {
  let failed = 0
  for (let i = 1; i <= 5; i++) {
    const stats = await get('/stats', { market: 'pk', locale: 'en-PK' })
    const nav = await get('/navigation', {
      market: 'pk',
      locale: 'en-PK',
      location: 'header',
    })
    const sKeys = (stats || []).map(
      (s) => `${s.value || s.title}|${s.label || s.description}`,
    )
    const nLabels = (nav || []).map((n) => n.label || n.title)
    const blob = sKeys.join(' ')
    const okStats = sKeys.length === 4 && sKeys.join(';;') === expectedStats.join(';;')
    const okBanned = banned.every((b) => !blob.includes(b))
    const okNav = nLabels.length === 7 && nLabels.join('|') === expectedNav.join('|')
    const aboutCount = nLabels.filter((l) => l === 'About').length
    const contactCount = nLabels.filter((l) => l === 'Contact').length
    console.log('reload', i, {
      stats: sKeys.length,
      nav: nLabels.length,
      aboutCount,
      contactCount,
      okStats,
      okBanned,
      okNav,
      sKeys,
      nLabels,
    })
    if (!okStats || !okBanned || !okNav || aboutCount !== 1 || contactCount !== 1) failed++
  }
  if (failed) {
    console.error('FAILED reloads', failed)
    process.exit(1)
  }
  console.log('All 5 reloads passed')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
