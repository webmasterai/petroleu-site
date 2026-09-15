import { Router } from 'express'
import { query, queryOne } from '../db.js'
import { success, error, parseJson } from '../utils/response.js'
import {
  resolveContext,
  listSections,
  firstSection,
  sectionData,
  fallbackChain,
} from '../utils/content.js'

const router = Router()

function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch((err) => {
    console.error(err)
    error(res, err.message || 'Server error', 500)
  })
}

router.get('/markets', asyncHandler(async (_req, res) => {
  const rows = await query(
    `SELECT * FROM cms_markets WHERE is_active = 1 AND code <> 'shared' ORDER BY code`,
  )
  success(res, rows.map((m) => ({
    ...m,
    social_links: parseJson(m.social_links, null),
    regional_settings: parseJson(m.regional_settings, null),
  })))
}))

router.get('/hero/:page', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await firstSection(ctx, req.params.page, 'hero'))
}))

router.get('/features', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const page = String(req.query.page || 'home')
  const type = String(req.query.type || 'card')
  success(res, await listSections(ctx, page, `feature:${type}`))
}))

router.get('/logos', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'logo'))
}))

router.get('/testimonials', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'testimonial'))
}))

router.get('/pricing', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'pricing', 'plan'))
}))

router.get(['/faq', '/faqs'], asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const page = String(req.query.page || 'home')
  success(res, await listSections(ctx, page, 'faq'))
}))

router.get('/stats', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'stat'))
}))

router.get('/team', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'about', 'team'))
}))

router.get('/cta/:page', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await firstSection(ctx, req.params.page, 'cta'))
}))

router.get('/settings', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const map = {}
  for (const step of fallbackChain(ctx.market, ctx.locale, ctx.defaultLocale)) {
    if (ctx.market === 'af' && step.market !== 'af') continue
    const rows = await query(
      `SELECT * FROM cms_settings
       WHERE market_code = :market
         AND (locale_code = :locale OR locale_code IS NULL OR locale_code = '')`,
      { market: step.market, locale: step.locale },
    )
    for (const row of rows) {
      if (map[row.key] === undefined) map[row.key] = row.value
    }
  }
  success(res, map)
}))

router.get('/mission-values', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'about', 'mission-value'))
}))

router.get('/how-it-works', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'how-it-works'))
}))

router.get('/company-story', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await firstSection(ctx, 'about', 'company-story'))
}))

router.get('/industries', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'industries', 'industry'))
}))

router.get('/mobile-features', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'mobile-feature'))
}))

router.get('/analytics-cards', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'analytics', 'analytics-card'))
}))

router.get('/why-choose-reasons', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'why-choose'))
}))

router.get('/supported-brands', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, 'home', 'supported-brand'))
}))

router.get('/section-heading/:key', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const page = String(req.query.page || 'home')
  success(res, await firstSection(ctx, page, `heading:${req.params.key}`))
}))

router.get('/demo-block/:key', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await firstSection(ctx, 'home', `demo:${req.params.key}`))
}))

router.get('/page-cards/:page', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await listSections(ctx, req.params.page, 'page-card'))
}))

router.get('/legal-pages/:slug', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  success(res, await firstSection(ctx, 'legal', req.params.slug))
}))

router.get('/navigation', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const location = String(req.query.location || 'header')
  const all = await query(
    `SELECT * FROM cms_navigation_items
     WHERE location = :location AND status = 'published' AND is_enabled = 1 AND deleted_at IS NULL
     ORDER BY sort_order ASC`,
    { location },
  )
  let items = []
  for (const step of fallbackChain(ctx.market, ctx.locale, ctx.defaultLocale)) {
    if (ctx.market === 'af' && step.market !== 'af') continue
    items = all.filter((r) => r.market_code === step.market && r.locale_code === step.locale)
    if (items.length) break
  }
  success(res, items.map((i) => ({
    ...i,
    children_data: parseJson(i.children_data, null),
  })))
}))

router.get('/seo', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const path = String(req.query.path || '/')
  for (const step of fallbackChain(ctx.market, ctx.locale, ctx.defaultLocale)) {
    if (ctx.market === 'af' && step.market !== 'af') continue
    const row = await queryOne(
      `SELECT * FROM cms_seo_entries
       WHERE market_code = :market AND locale_code = :locale AND path = :path
         AND status = 'published' LIMIT 1`,
      { market: step.market, locale: step.locale, path },
    )
    if (row) {
      return success(res, {
        ...row,
        hreflang: parseJson(row.hreflang, null),
        og: parseJson(row.og, null),
      })
    }
  }
  success(res, null)
}))

router.get('/blog', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  let sql = `SELECT * FROM cms_blog_posts
    WHERE status = 'published' AND deleted_at IS NULL
      AND market_code = :market AND locale_code = :locale`
  const params = { market: ctx.market, locale: ctx.locale }
  if (String(req.query.homepage) === '1' || String(req.query.homepage) === 'true') {
    sql += ` AND show_on_homepage = 1`
  }
  sql += ` ORDER BY published_at DESC, id DESC`
  const rows = await query(sql, params)
  success(res, rows.map((p) => ({
    ...p,
    tags: parseJson(p.tags, []),
    related_slugs: parseJson(p.related_slugs, []),
  })))
}))

router.get('/blog/:slug', asyncHandler(async (req, res) => {
  const ctx = await resolveContext(req)
  const row = await queryOne(
    `SELECT * FROM cms_blog_posts
     WHERE slug = :slug AND status = 'published' AND deleted_at IS NULL
       AND market_code = :market AND locale_code = :locale LIMIT 1`,
    { slug: req.params.slug, market: ctx.market, locale: ctx.locale },
  )
  if (!row) return error(res, 'Not found', 404)
  success(res, {
    ...row,
    tags: parseJson(row.tags, []),
    related_slugs: parseJson(row.related_slugs, []),
  })
}))

async function createInquiry(req, res, type) {
  const market = req.body?.market || req.query.market || 'pk'
  const locale = req.body?.locale || req.query.locale || (market === 'af' ? 'fa-AF' : 'en-PK')
  const result = await query(
    `INSERT INTO cms_inquiries
      (type, market_code, locale_code, source, full_name, email, phone, company, message, status, ip_address, user_agent, created_at, updated_at)
     VALUES
      (:type, :market, :locale, :source, :full_name, :email, :phone, :company, :message, 'new', :ip, :ua, NOW(), NOW())`,
    {
      type,
      market,
      locale,
      source: req.body?.source || 'website',
      full_name: req.body?.full_name || req.body?.name || 'Unknown',
      email: req.body?.email || '',
      phone: req.body?.phone || null,
      company: req.body?.company || null,
      message: req.body?.message || null,
      ip: req.ip || null,
      ua: req.get('user-agent') || null,
    },
  )
  success(res, { id: result.insertId }, 'Submitted', 201)
}

router.post('/contact', asyncHandler(async (req, res) => createInquiry(req, res, 'contact')))
router.post('/demo-request', asyncHandler(async (req, res) => createInquiry(req, res, 'demo')))

router.get('/draft-preview', asyncHandler(async (req, res) => {
  // Signed Laravel URLs not reimplemented yet — return published home hero for compatibility
  const ctx = await resolveContext(req)
  const pageSlug = String(req.query.page_slug || 'home')
  const sections = await query(
    `SELECT * FROM cms_sections
     WHERE market_code = :market AND locale_code = :locale AND page_slug = :page
       AND deleted_at IS NULL
     ORDER BY sort_order`,
    { market: ctx.market, locale: ctx.locale, page: pageSlug },
  )
  success(res, sections.map(sectionData))
}))

export default router
