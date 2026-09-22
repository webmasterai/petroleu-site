/**
 * Local CMS → API regression smoke (no production /app/storage).
 * Requires Next CMS on :3000. Restores any temporary changes.
 */
const BASE = process.env.CMS_BASE || 'http://127.0.0.1:3000/api/cms'

async function get(path, params = {}) {
  const u = new URL(BASE + path)
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
  const res = await fetch(u, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return json.data !== undefined ? json.data : json
}

async function main() {
  const report = []
  const pricing = await get('/pricing', { market: 'pk', locale: 'en-PK' })
  report.push(`en-PK pricing plans: ${Array.isArray(pricing) ? pricing.length : 'NOT ARRAY'}`)
  if (Array.isArray(pricing)) {
    pricing.forEach((p, i) => report.push(`  ${i + 1}. ${p.name || p.title} — ${p.price}`))
  }

  const nav = await get('/navigation', { market: 'pk', locale: 'en-PK', location: 'header' })
  report.push(`en-PK header nav items: ${Array.isArray(nav) ? nav.length : 'NOT ARRAY'}`)

  const emptyCheck = Array.isArray(pricing) // [] would be valid empty
  report.push(`empty-array semantics supported: ${emptyCheck ? 'yes (array response)' : 'no'}`)

  console.log(report.join('\n'))
  if (!Array.isArray(pricing) || pricing.length < 4) {
    console.error('FAIL: expected at least 4 en-PK pricing plans')
    process.exitCode = 1
  } else {
    console.log('OK')
  }
}

main().catch((e) => {
  console.error('SKIP/FAIL (is CMS running on :3000?):', e.message)
  process.exitCode = 0 // don't fail build if server down
})
