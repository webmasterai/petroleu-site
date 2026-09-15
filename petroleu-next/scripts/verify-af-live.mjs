import fs from 'fs'

const base = 'http://127.0.0.1:3000'

async function get(p) {
  const r = await fetch(base + p)
  const ct = r.headers.get('content-type') || ''
  return {
    status: r.status,
    json: ct.includes('json') ? await r.json() : null,
    text: ct.includes('json') ? null : await r.text(),
  }
}

async function check(locale, route) {
  const q = `market=af&locale=${locale}`
  const endpoints = [
    'hero/home',
    'stats',
    'features?page=home&type=card',
    'faq?page=home',
    'industries',
    'how-it-works',
    'why-choose-reasons',
    'supported-brands',
    'testimonials',
    'navigation?location=header',
    'navigation?location=mega',
    'settings',
    'section-heading/features?page=home',
    'section-heading/invoice?page=home',
    'section-heading/reports?page=home',
    'cta/home-mid',
    'cta/home-bottom',
    'pricing',
    'mobile-features',
    'analytics-cards',
    `demo-block/invoice`,
    `demo-block/reports`,
    `seo?path=${encodeURIComponent(route)}`,
  ]
  const api = {}
  for (const ep of endpoints) {
    const url = `/api/cms/${ep}${ep.includes('?') ? '&' : '?'}${q}`
    const r = await get(url)
    const d = r.json?.data
    if (Array.isArray(d)) api[ep.split('?')[0]] = { status: r.status, n: d.length, ok: d.length > 0 }
    else if (d && typeof d === 'object')
      api[ep.split('?')[0]] = {
        status: r.status,
        ok: true,
        title: d.title || d.site_name || d.heading || null,
      }
    else api[ep.split('?')[0]] = { status: r.status, ok: !!d }
  }

  const pages = {}
  for (const path of [
    route,
    `${route}/features`,
    `${route}/pricing`,
    `${route}/about`,
    `${route}/contact`,
    `${route}/faq`,
    `${route}/industries`,
  ]) {
    const r = await fetch(base + path)
    const html = await r.text()
    pages[path] = {
      status: r.status,
      hasDashboardImg: html.includes('PetroleuDashboard'),
      len: html.length,
    }
  }
  return { locale, route, api, pages }
}

const fa = await check('fa-AF', '/af')
const ps = await check('ps-AF', '/af/ps')
console.log(JSON.stringify({ fa, ps }, null, 2))

const img =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PetroleuDashboard-45o0LNfASWEDxtDgDI6KSRExrYyMNC.png'
try {
  const r = await fetch(img, { method: 'HEAD' })
  console.log('heroImageStatus', r.status)
} catch (e) {
  console.log('heroImageErr', e.message)
}

const login = await (
  await fetch(base + '/api/cms/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@petroleu.local', password: 'PetroleuAdmin123!' }),
  })
).json()
const h = { Authorization: 'Bearer ' + login.data.token }
async function admin(path) {
  const r = await fetch(base + '/api/cms/admin/' + path, { headers: h })
  return (await r.json()).data
}
console.log('admin', {
  faSecs: (await admin('sections?market=af&locale=fa-AF')).length,
  psSecs: (await admin('sections?market=af&locale=ps-AF')).length,
  faPages: (await admin('pages?market=af&locale=fa-AF')).length,
  psPages: (await admin('pages?market=af&locale=ps-AF')).length,
  faNav: (await admin('navigation?market=af&locale=fa-AF')).length,
  psNav: (await admin('navigation?market=af&locale=ps-AF')).length,
  faSeo: (await admin('seo?market=af&locale=fa-AF')).length,
  psSeo: (await admin('seo?market=af&locale=ps-AF')).length,
  faSettings: (await admin('settings?market=af&locale=fa-AF')).length,
  psSettings: (await admin('settings?market=af&locale=ps-AF')).length,
})
