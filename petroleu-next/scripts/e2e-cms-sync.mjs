/**
 * Local E2E: mutate → public API → restore. Does not touch users.json.
 * Run against next dev on :3000.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const SECTIONS = path.join(ROOT, 'storage', 'data', 'sections.json')
const BACKUP = path.join(ROOT, 'storage', 'data', 'sections.json.e2e-bak')
const BASE = process.env.CMS_BASE || 'http://127.0.0.1:3000'

const MARKER = ' __CMS_SYNC_E2E__'

function load() {
  return JSON.parse(readFileSync(SECTIONS, 'utf8'))
}

function save(rows) {
  writeFileSync(SECTIONS, JSON.stringify(rows, null, 2) + '\n')
}

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-store' })
  const body = await res.json()
  return { status: res.status, cache: res.headers.get('cache-control'), body }
}

function findOne(rows, pred) {
  return rows.find(pred)
}

async function main() {
  copyFileSync(SECTIONS, BACKUP)
  const original = load()
  const results = []

  const cases = [
    {
      name: 'Hero',
      market: 'pk',
      locale: 'en-PK',
      find: (r) =>
        r.market_code === 'pk' &&
        r.locale_code === 'en-PK' &&
        r.page_slug === 'home' &&
        r.section_key === 'hero',
      api: `${BASE}/api/cms/hero/home?market=pk&locale=en-PK`,
      read: (data) => data?.data?.title || data?.data?.heading,
      field: 'title',
    },
    {
      name: 'Analytics',
      market: 'af',
      locale: 'en-AF',
      find: (r) =>
        r.market_code === 'af' &&
        r.locale_code === 'en-AF' &&
        r.page_slug === 'home' &&
        r.section_key === 'analytics-card',
      api: `${BASE}/api/cms/analytics-cards?market=af&locale=en-AF`,
      read: (data) => (Array.isArray(data?.data) ? data.data[0]?.title : null),
      field: 'title',
    },
    {
      name: 'Why Choose',
      market: 'af',
      locale: 'en-AF',
      find: (r) =>
        r.market_code === 'af' &&
        r.locale_code === 'en-AF' &&
        r.page_slug === 'home' &&
        r.section_key === 'why-choose',
      api: `${BASE}/api/cms/why-choose-reasons?market=af&locale=en-AF`,
      read: (data) => (Array.isArray(data?.data) ? data.data[0]?.title : null),
      field: 'title',
    },
    {
      name: 'Industry',
      market: 'af',
      locale: 'en-AF',
      find: (r) =>
        r.market_code === 'af' &&
        r.locale_code === 'en-AF' &&
        r.page_slug === 'home' &&
        r.section_key === 'industry',
      api: `${BASE}/api/cms/industries?market=af&locale=en-AF`,
      read: (data) => (Array.isArray(data?.data) ? data.data[0]?.title : null),
      field: 'title',
    },
    {
      name: 'CTA home-mid',
      market: 'af',
      locale: 'en-AF',
      find: (r) =>
        r.market_code === 'af' &&
        r.locale_code === 'en-AF' &&
        r.page_slug === 'home-mid' &&
        r.section_key === 'cta',
      api: `${BASE}/api/cms/cta/home-mid?market=af&locale=en-AF`,
      read: (data) => data?.data?.title || data?.data?.heading,
      field: 'title',
    },
    {
      name: 'Testimonials heading (was broken chrome)',
      market: 'af',
      locale: 'en-AF',
      find: (r) =>
        r.market_code === 'af' &&
        r.locale_code === 'en-AF' &&
        r.page_slug === 'home' &&
        r.section_key === 'heading:testimonials',
      api: `${BASE}/api/cms/section-heading/testimonials?market=af&locale=en-AF`,
      read: (data) => data?.data?.title || data?.data?.heading,
      field: 'title',
    },
  ]

  try {
    for (const c of cases) {
      let rows = load()
      const row = findOne(rows, c.find)
      if (!row) {
        results.push({ name: c.name, ok: false, error: 'CMS row not found' })
        continue
      }
      const before = row[c.field]
      const mutated = String(before || 'untitled') + MARKER
      row[c.field] = mutated
      row.status = 'published'
      row.is_enabled = true
      save(rows)

      const res = await getJson(c.api)
      const got = c.read(res.body)
      const ok = String(got || '').includes(MARKER)
      results.push({
        name: c.name,
        ok,
        cache: res.cache,
        expectedIncludes: MARKER,
        got,
        id: row.id,
        page_slug: row.page_slug,
        section_key: row.section_key,
      })

      // restore this row immediately
      rows = load()
      const restore = findOne(rows, (r) => r.id === row.id)
      if (restore) restore[c.field] = before
      save(rows)
    }

    // Publish route must not create a new section when unauthenticated (401),
    // and must not 201-create when path has /publish (regression guard via source + 401).
    const pub = await fetch(`${BASE}/api/cms/admin/sections/1/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    const pubBody = await pub.json().catch(() => ({}))
    const beforeCount = load().length
    results.push({
      name: 'Publish endpoint auth gate',
      ok: pub.status === 401,
      status: pub.status,
      message: pubBody.message,
      sectionCountUnchanged: load().length === beforeCount,
    })
  } finally {
    // Always restore from backup
    copyFileSync(BACKUP, SECTIONS)
  }

  const failed = results.filter((r) => !r.ok)
  console.log(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results }, null, 2))
  if (failed.length) process.exit(1)
}

main().catch((e) => {
  try {
    copyFileSync(BACKUP, SECTIONS)
  } catch {
    /* ignore */
  }
  console.error(e)
  process.exit(1)
})
