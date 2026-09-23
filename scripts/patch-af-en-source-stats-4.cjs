/**
 * Align af_en_source.json home stats to canonical 4 (prevent re-seed of obsolete stats).
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'petroleu-next', 'scripts', 'data', 'af_en_source.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))

const keep = new Set(['500+', '99.9%', '10M+', '24/7'])
const order = ['500+', '99.9%', '10M+', '24/7']
const labels = {
  '500+': 'Stations Active',
  '99.9%': 'Uptime',
  '10M+': 'Transactions Logged',
  '24/7': 'Support',
}

function patchSections(sections) {
  const stats = sections.filter((s) => s.section_key === 'stat' && s.page_slug === 'home')
  const others = sections.filter((s) => !(s.section_key === 'stat' && s.page_slug === 'home'))
  const byVal = new Map()
  for (const s of stats) {
    const v = String(s.data?.value || s.title || '')
    if (keep.has(v) && !byVal.has(v)) byVal.set(v, s)
  }
  const next = order.map((v, i) => {
    let row = byVal.get(v)
    if (!row) {
      row = {
        section_key: 'stat',
        page_slug: 'home',
        title: v,
        description: labels[v],
        sort_order: i,
        data: { value: v, label: labels[v] },
        status: 'published',
      }
    } else {
      row.title = v
      row.description = labels[v]
      row.sort_order = i
      row.data = { ...(row.data || {}), value: v, label: labels[v] }
    }
    return row
  })
  return [...others, ...next]
}

let patchedArrays = 0
function walk(obj) {
  if (!obj || typeof obj !== 'object') return
  if (Array.isArray(obj)) {
    if (obj.some((x) => x && x.section_key === 'stat' && x.page_slug === 'home')) {
      const patched = patchSections(obj)
      obj.length = 0
      patched.forEach((x) => obj.push(x))
      patchedArrays++
      return
    }
    obj.forEach(walk)
    return
  }
  for (const k of Object.keys(obj)) walk(obj[k])
}

walk(data)
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')

const blob = JSON.stringify(data)
console.log({
  patchedArrays,
  has1350: blob.includes('1350+'),
  has500: blob.includes('500+'),
  hasPetrolPumpsLabel: /"label"\s*:\s*"Petrol Pumps"/.test(blob),
})
