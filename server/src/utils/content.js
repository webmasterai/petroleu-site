import { query, queryOne } from '../db.js'
import { parseJson } from './response.js'

export function fallbackChain(market, locale, marketDefaultLocale = null) {
  const chain = [{ market, locale }]
  if (market === 'af') return chain
  if (marketDefaultLocale && marketDefaultLocale !== locale) {
    chain.push({ market, locale: marketDefaultLocale })
  }
  chain.push({ market: 'shared', locale })
  if (!['en', 'en-PK', 'en-AF'].includes(locale)) {
    chain.push({ market: 'shared', locale: 'en' })
  }
  return chain
}

export async function resolveContext(req) {
  const market = String(req.query.market || 'pk')
  const locale = String(req.query.locale || (market === 'af' ? 'fa-AF' : 'en-PK'))
  const marketRow = await queryOne(
    `SELECT * FROM cms_markets WHERE code = :code AND is_active = 1 LIMIT 1`,
    { code: market },
  )
  return {
    market,
    locale,
    defaultLocale: marketRow?.default_locale || null,
    marketRow,
  }
}

export function sectionData(section) {
  if (!section) return null
  const data = parseJson(section.data, {}) || {}
  return {
    id: section.id,
    title: section.title,
    heading: section.title,
    description: section.description,
    subheading: section.description,
    content: section.content,
    image_url: section.image_url,
    dashboard_image_url: section.image_url,
    image_alt: section.image_alt,
    link_label: section.link_label,
    link_url: section.link_url,
    cta_text: section.link_label,
    cta_link: section.link_url,
    sort_order: section.sort_order,
    ...data,
  }
}

async function fetchPublishedSections({ pageSlug, sectionKey }) {
  let sql = `SELECT * FROM cms_sections
    WHERE status = 'published' AND is_enabled = 1 AND deleted_at IS NULL
      AND page_slug = :pageSlug`
  const params = { pageSlug }
  if (sectionKey) {
    sql += ` AND section_key = :sectionKey`
    params.sectionKey = sectionKey
  }
  sql += ` ORDER BY sort_order ASC`
  return query(sql, params)
}

function filterByMarketLocale(rows, ctx) {
  for (const step of fallbackChain(ctx.market, ctx.locale, ctx.defaultLocale)) {
    if (step.market !== ctx.market && step.market !== 'shared') continue
    if (ctx.market === 'af' && step.market !== 'af') continue
    if (ctx.market === 'pk' && step.market === 'af') continue

    const batch = rows.filter((row) => {
      if (row.market_code !== step.market || row.locale_code !== step.locale) return false
      if (step.market === 'shared' && !Number(row.is_shared)) return false
      return true
    })
    if (batch.length) return batch
  }
  return []
}

export async function listSections(ctx, pageSlug, sectionKey) {
  const rows = await fetchPublishedSections({ pageSlug, sectionKey })
  return filterByMarketLocale(rows, ctx).map(sectionData)
}

export async function firstSection(ctx, pageSlug, sectionKey) {
  const list = await listSections(ctx, pageSlug, sectionKey)
  return list[0] || null
}
