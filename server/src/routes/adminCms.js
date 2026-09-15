import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { query, queryOne } from '../db.js'
import { success, error, parseJson } from '../utils/response.js'
import { requireCmsAdmin } from '../middleware/auth.js'
import { canWrite, canPublish, canManageUsers } from '../utils/roles.js'
import { config } from '../config.js'
import { sectionData } from '../utils/content.js'

const router = Router()
router.use(requireCmsAdmin)

function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch((err) => {
    console.error(err)
    error(res, err.message || 'Server error', 500)
  })
}

function notDeleted(alias = '') {
  const col = alias ? `${alias}.deleted_at` : 'deleted_at'
  return `${col} IS NULL`
}

// ── Dashboard ──────────────────────────────────────────────────────────
router.get('/dashboard', asyncHandler(async (req, res) => {
  const market = req.query.market
  const locale = req.query.locale
  const all = String(req.query.all) === '1' || String(req.query.all) === 'true'

  const scope = (table, mCol = 'market_code', lCol = 'locale_code') => {
    const parts = []
    const params = {}
    if (!all && market) {
      parts.push(`${mCol} = :market`)
      params.market = market
    }
    if (!all && locale) {
      parts.push(`${lCol} = :locale`)
      params.locale = locale
    }
    return { where: parts.length ? `WHERE ${parts.join(' AND ')}` : '', params }
  }

  const sec = scope('cms_sections')
  const soft = notDeleted()
  const secWhere = sec.where ? `${sec.where} AND ${soft}` : `WHERE ${soft}`

  const markets = await queryOne(`SELECT COUNT(*) AS c FROM cms_markets`)
  const pagesScope = scope('cms_pages')
  const pagesWhere = pagesScope.where ? `${pagesScope.where} AND ${soft}` : `WHERE ${soft}`
  const pages = await queryOne(`SELECT COUNT(*) AS c FROM cms_pages ${pagesWhere}`, pagesScope.params)
  const sections = await queryOne(`SELECT COUNT(*) AS c FROM cms_sections ${secWhere}`, sec.params)
  const published = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_sections ${secWhere} AND status = 'published'`,
    sec.params,
  )
  const drafts = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_sections ${secWhere} AND status = 'draft'`,
    sec.params,
  )
  const needs = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_sections ${secWhere} AND translation_status = 'needs_review'`,
    sec.params,
  )
  const media = await queryOne(`SELECT COUNT(*) AS c FROM cms_media WHERE ${soft}`)
  const inquiries = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_inquiries ${!all && market ? 'WHERE market_code = :market AND status = \'new\'' : 'WHERE status = \'new\''}`,
    !all && market ? { market } : {},
  )
  const postsScope = scope('cms_blog_posts')
  const postsWhere = postsScope.where ? `${postsScope.where} AND ${soft}` : `WHERE ${soft}`
  const posts = await queryOne(`SELECT COUNT(*) AS c FROM cms_blog_posts ${postsWhere}`, postsScope.params)

  success(res, {
    scope: all ? 'all' : { market, locale },
    markets: Number(markets.c),
    pages: Number(pages.c),
    sections: Number(sections.c),
    published_sections: Number(published.c),
    draft_sections: Number(drafts.c),
    needs_review_sections: Number(needs.c),
    media: Number(media.c),
    inquiries_new: Number(inquiries.c),
    blog_posts: Number(posts.c),
  })
}))

// ── Markets / locales ──────────────────────────────────────────────────
router.get('/markets', asyncHandler(async (_req, res) => {
  const rows = await query(`SELECT * FROM cms_markets ORDER BY code`)
  success(res, rows.map((m) => ({
    ...m,
    social_links: parseJson(m.social_links, null),
    regional_settings: parseJson(m.regional_settings, null),
  })))
}))

router.post('/markets', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_markets
      (code, name, default_locale, currency, phone, phone_tel, whatsapp, email, sales_email, support_email,
       address, inquiry_recipients, form_source, social_links, regional_settings, is_active, is_shared, created_at, updated_at)
     VALUES
      (:code, :name, :default_locale, :currency, :phone, :phone_tel, :whatsapp, :email, :sales_email, :support_email,
       :address, :inquiry_recipients, :form_source, :social_links, :regional_settings, :is_active, :is_shared, NOW(), NOW())`,
    {
      code: b.code,
      name: b.name,
      default_locale: b.default_locale,
      currency: b.currency || null,
      phone: b.phone || null,
      phone_tel: b.phone_tel || null,
      whatsapp: b.whatsapp || null,
      email: b.email || null,
      sales_email: b.sales_email || null,
      support_email: b.support_email || null,
      address: b.address || null,
      inquiry_recipients: b.inquiry_recipients || null,
      form_source: b.form_source || null,
      social_links: b.social_links ? JSON.stringify(b.social_links) : null,
      regional_settings: b.regional_settings ? JSON.stringify(b.regional_settings) : null,
      is_active: b.is_active === false ? 0 : 1,
      is_shared: b.is_shared ? 1 : 0,
    },
  )
  const row = await queryOne(`SELECT * FROM cms_markets WHERE id = :id`, { id: result.insertId })
  success(res, row, 'Created', 201)
}))

router.put('/markets/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_markets WHERE id = :id`, { id })
  if (!existing) return error(res, 'Not found', 404)
  await query(
    `UPDATE cms_markets SET
      name = :name, default_locale = :default_locale, currency = :currency, phone = :phone,
      phone_tel = :phone_tel, whatsapp = :whatsapp, email = :email, sales_email = :sales_email,
      support_email = :support_email, address = :address, inquiry_recipients = :inquiry_recipients,
      form_source = :form_source, social_links = :social_links, regional_settings = :regional_settings,
      is_active = :is_active, is_shared = :is_shared, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      name: b.name ?? existing.name,
      default_locale: b.default_locale ?? existing.default_locale,
      currency: b.currency ?? existing.currency,
      phone: b.phone ?? existing.phone,
      phone_tel: b.phone_tel ?? existing.phone_tel,
      whatsapp: b.whatsapp ?? existing.whatsapp,
      email: b.email ?? existing.email,
      sales_email: b.sales_email ?? existing.sales_email,
      support_email: b.support_email ?? existing.support_email,
      address: b.address ?? existing.address,
      inquiry_recipients: b.inquiry_recipients ?? existing.inquiry_recipients,
      form_source: b.form_source ?? existing.form_source,
      social_links: b.social_links !== undefined ? JSON.stringify(b.social_links) : existing.social_links,
      regional_settings: b.regional_settings !== undefined ? JSON.stringify(b.regional_settings) : existing.regional_settings,
      is_active: b.is_active !== undefined ? (b.is_active ? 1 : 0) : existing.is_active,
      is_shared: b.is_shared !== undefined ? (b.is_shared ? 1 : 0) : existing.is_shared,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_markets WHERE id = :id`, { id }))
}))

router.get('/locales', asyncHandler(async (_req, res) => {
  success(res, await query(`SELECT * FROM cms_locales ORDER BY code`))
}))

router.post('/locales', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_locales (code, name, native_name, dir, font_stack, is_active, created_at, updated_at)
     VALUES (:code, :name, :native_name, :dir, :font_stack, :is_active, NOW(), NOW())`,
    {
      code: b.code,
      name: b.name,
      native_name: b.native_name || null,
      dir: b.dir || 'ltr',
      font_stack: b.font_stack || null,
      is_active: b.is_active === false ? 0 : 1,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_locales WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

// ── Pages ──────────────────────────────────────────────────────────────
router.get('/pages', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_pages WHERE deleted_at IS NULL`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  if (req.query.locale) {
    sql += ` AND locale_code = :locale`
    params.locale = req.query.locale
  }
  sql += ` ORDER BY slug`
  success(res, await query(sql, params))
}))

router.post('/pages', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_pages
      (market_code, locale_code, slug, title, description, template, frontend_path, sort_order,
       is_enabled, status, translation_status, is_shared, published_at, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :slug, :title, :description, :template, :frontend_path, :sort_order,
       :is_enabled, :status, :translation_status, :is_shared, :published_at, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code,
      slug: b.slug,
      title: b.title,
      description: b.description || null,
      template: b.template || 'default',
      frontend_path: b.frontend_path || null,
      sort_order: b.sort_order || 0,
      is_enabled: b.is_enabled === false ? 0 : 1,
      status: b.status || 'draft',
      translation_status: b.translation_status || null,
      is_shared: b.is_shared ? 1 : 0,
      published_at: b.published_at || null,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_pages WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.put('/pages/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_pages WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_pages SET
      title = :title, description = :description, template = :template, frontend_path = :frontend_path,
      sort_order = :sort_order, is_enabled = :is_enabled, status = :status,
      translation_status = :translation_status, is_shared = :is_shared, published_at = :published_at, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      title: b.title ?? existing.title,
      description: b.description ?? existing.description,
      template: b.template ?? existing.template,
      frontend_path: b.frontend_path ?? existing.frontend_path,
      sort_order: b.sort_order ?? existing.sort_order,
      is_enabled: b.is_enabled !== undefined ? (b.is_enabled ? 1 : 0) : existing.is_enabled,
      status: b.status ?? existing.status,
      translation_status: b.translation_status ?? existing.translation_status,
      is_shared: b.is_shared !== undefined ? (b.is_shared ? 1 : 0) : existing.is_shared,
      published_at: b.published_at !== undefined ? b.published_at : existing.published_at,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_pages WHERE id = :id`, { id }))
}))

router.delete('/pages/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const page = await queryOne(`SELECT * FROM cms_pages WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!page) return error(res, 'Not found', 404)
  const deps = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_sections WHERE market_code = :m AND locale_code = :l AND page_slug = :s AND deleted_at IS NULL`,
    { m: page.market_code, l: page.locale_code, s: page.slug },
  )
  if (Number(deps.c) > 0 && String(req.query.force) !== '1') {
    return error(res, 'Page has sections', 409, { sections: Number(deps.c) })
  }
  await query(`UPDATE cms_pages SET deleted_at = NOW() WHERE id = :id`, { id })
  success(res, null, 'Deleted')
}))

router.post('/pages/:id/restore', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_pages SET deleted_at = NULL WHERE id = :id`, { id: req.params.id })
  success(res, await queryOne(`SELECT * FROM cms_pages WHERE id = :id`, { id: req.params.id }))
}))

router.get('/pages/:id/dependencies', asyncHandler(async (req, res) => {
  const page = await queryOne(`SELECT * FROM cms_pages WHERE id = :id`, { id: req.params.id })
  if (!page) return error(res, 'Not found', 404)
  const sections = await queryOne(
    `SELECT COUNT(*) AS c FROM cms_sections WHERE market_code = :m AND locale_code = :l AND page_slug = :s AND deleted_at IS NULL`,
    { m: page.market_code, l: page.locale_code, s: page.slug },
  )
  success(res, { sections: Number(sections.c) })
}))

// ── Sections ───────────────────────────────────────────────────────────
router.get('/sections', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_sections WHERE deleted_at IS NULL`
  const params = {}
  for (const key of ['market', 'locale', 'page', 'section_key', 'status']) {
    const qk = key === 'page' ? 'page_slug' : key === 'market' ? 'market_code' : key === 'locale' ? 'locale_code' : key
    const val = req.query[key] ?? req.query[qk]
    if (val) {
      sql += ` AND ${qk} = :${qk}`
      params[qk] = val
    }
  }
  sql += ` ORDER BY page_slug, section_key, sort_order`
  const rows = await query(sql, params)
  success(res, rows.map((r) => ({ ...r, data: parseJson(r.data, null) })))
}))

router.post('/sections', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_sections
      (market_code, locale_code, page_slug, section_key, title, description, content, data,
       image_url, image_alt, media_id, link_label, link_url, sort_order, is_enabled, status,
       translation_status, frontend_path, is_shared, published_at, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :page_slug, :section_key, :title, :description, :content, :data,
       :image_url, :image_alt, :media_id, :link_label, :link_url, :sort_order, :is_enabled, :status,
       :translation_status, :frontend_path, :is_shared, :published_at, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code,
      page_slug: b.page_slug,
      section_key: b.section_key,
      title: b.title || null,
      description: b.description || null,
      content: b.content || null,
      data: b.data ? JSON.stringify(b.data) : null,
      image_url: b.image_url || null,
      image_alt: b.image_alt || null,
      media_id: b.media_id || null,
      link_label: b.link_label || null,
      link_url: b.link_url || null,
      sort_order: b.sort_order || 0,
      is_enabled: b.is_enabled === false ? 0 : 1,
      status: b.status || 'draft',
      translation_status: b.translation_status || null,
      frontend_path: b.frontend_path || null,
      is_shared: b.is_shared ? 1 : 0,
      published_at: b.published_at || null,
    },
  )
  const row = await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: result.insertId })
  success(res, { ...row, data: parseJson(row.data, null) }, 'Created', 201)
}))

router.put('/sections/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_sections WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_sections SET
      title = :title, description = :description, content = :content, data = :data,
      image_url = :image_url, image_alt = :image_alt, media_id = :media_id,
      link_label = :link_label, link_url = :link_url, sort_order = :sort_order,
      is_enabled = :is_enabled, status = :status, translation_status = :translation_status,
      frontend_path = :frontend_path, is_shared = :is_shared, published_at = :published_at, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      title: b.title ?? existing.title,
      description: b.description ?? existing.description,
      content: b.content ?? existing.content,
      data: b.data !== undefined ? JSON.stringify(b.data) : existing.data,
      image_url: b.image_url ?? existing.image_url,
      image_alt: b.image_alt ?? existing.image_alt,
      media_id: b.media_id ?? existing.media_id,
      link_label: b.link_label ?? existing.link_label,
      link_url: b.link_url ?? existing.link_url,
      sort_order: b.sort_order ?? existing.sort_order,
      is_enabled: b.is_enabled !== undefined ? (b.is_enabled ? 1 : 0) : existing.is_enabled,
      status: b.status ?? existing.status,
      translation_status: b.translation_status ?? existing.translation_status,
      frontend_path: b.frontend_path ?? existing.frontend_path,
      is_shared: b.is_shared !== undefined ? (b.is_shared ? 1 : 0) : existing.is_shared,
      published_at: b.published_at !== undefined ? b.published_at : existing.published_at,
    },
  )
  const row = await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id })
  success(res, { ...row, data: parseJson(row.data, null) })
}))

router.delete('/sections/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_sections SET deleted_at = NOW() WHERE id = :id`, { id: req.params.id })
  success(res, null, 'Deleted')
}))

router.post('/sections/:id/publish', asyncHandler(async (req, res) => {
  if (!canPublish(req.user.role)) return error(res, 'Forbidden', 403)
  await query(
    `UPDATE cms_sections SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW() WHERE id = :id`,
    { id: req.params.id },
  )
  success(res, await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: req.params.id }))
}))

router.post('/sections/:id/unpublish', asyncHandler(async (req, res) => {
  if (!canPublish(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_sections SET status = 'draft', updated_at = NOW() WHERE id = :id`, { id: req.params.id })
  success(res, await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: req.params.id }))
}))

router.post('/sections/:id/duplicate', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const src = await queryOne(`SELECT * FROM cms_sections WHERE id = :id AND deleted_at IS NULL`, { id: req.params.id })
  if (!src) return error(res, 'Not found', 404)
  const result = await query(
    `INSERT INTO cms_sections
      (market_code, locale_code, page_slug, section_key, title, description, content, data,
       image_url, image_alt, media_id, link_label, link_url, sort_order, is_enabled, status,
       translation_status, frontend_path, is_shared, published_at, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :page_slug, :section_key, :title, :description, :content, :data,
       :image_url, :image_alt, :media_id, :link_label, :link_url, :sort_order, :is_enabled, 'draft',
       :translation_status, :frontend_path, :is_shared, NULL, NOW(), NOW())`,
    {
      market_code: src.market_code,
      locale_code: src.locale_code,
      page_slug: src.page_slug,
      section_key: src.section_key,
      title: src.title ? `${src.title} (copy)` : src.title,
      description: src.description,
      content: src.content,
      data: src.data,
      image_url: src.image_url,
      image_alt: src.image_alt,
      media_id: src.media_id,
      link_label: src.link_label,
      link_url: src.link_url,
      sort_order: src.sort_order,
      is_enabled: src.is_enabled,
      translation_status: src.translation_status,
      frontend_path: src.frontend_path,
      is_shared: src.is_shared,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.post('/sections/:id/restore', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_sections SET deleted_at = NULL WHERE id = :id`, { id: req.params.id })
  success(res, await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: req.params.id }))
}))

router.post('/sections/reorder', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const items = req.body?.items || []
  for (const item of items) {
    await query(`UPDATE cms_sections SET sort_order = :sort_order WHERE id = :id`, {
      id: item.id,
      sort_order: item.sort_order,
    })
  }
  success(res, null, 'Reordered')
}))

router.get('/sections/:id/preview', asyncHandler(async (req, res) => {
  const row = await queryOne(`SELECT * FROM cms_sections WHERE id = :id`, { id: req.params.id })
  if (!row) return error(res, 'Not found', 404)
  success(res, sectionData(row))
}))

router.post('/preview/signed', asyncHandler(async (_req, res) => {
  // Placeholder — full Laravel signed URLs not ported yet
  success(res, { url: null, message: 'Signed preview not implemented in Node yet' })
}))

// ── Navigation ─────────────────────────────────────────────────────────
router.get('/navigation', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_navigation_items WHERE deleted_at IS NULL`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  if (req.query.locale) {
    sql += ` AND locale_code = :locale`
    params.locale = req.query.locale
  }
  sql += ` ORDER BY sort_order`
  const rows = await query(sql, params)
  success(res, rows.map((r) => ({ ...r, children_data: parseJson(r.children_data, null) })))
}))

router.post('/navigation', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_navigation_items
      (market_code, locale_code, location, menu_group, label, url, parent_id, children_data,
       sort_order, is_enabled, status, is_shared, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :location, :menu_group, :label, :url, :parent_id, :children_data,
       :sort_order, :is_enabled, :status, :is_shared, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code,
      location: b.location || 'header',
      menu_group: b.menu_group || null,
      label: b.label,
      url: b.url || null,
      parent_id: b.parent_id || null,
      children_data: b.children_data ? JSON.stringify(b.children_data) : null,
      sort_order: b.sort_order || 0,
      is_enabled: b.is_enabled === false ? 0 : 1,
      status: b.status || 'draft',
      is_shared: b.is_shared ? 1 : 0,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_navigation_items WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.put('/navigation/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_navigation_items WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_navigation_items SET
      label = :label, url = :url, location = :location, menu_group = :menu_group,
      children_data = :children_data, sort_order = :sort_order, is_enabled = :is_enabled,
      status = :status, is_shared = :is_shared, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      label: b.label ?? existing.label,
      url: b.url ?? existing.url,
      location: b.location ?? existing.location,
      menu_group: b.menu_group ?? existing.menu_group,
      children_data: b.children_data !== undefined ? JSON.stringify(b.children_data) : existing.children_data,
      sort_order: b.sort_order ?? existing.sort_order,
      is_enabled: b.is_enabled !== undefined ? (b.is_enabled ? 1 : 0) : existing.is_enabled,
      status: b.status ?? existing.status,
      is_shared: b.is_shared !== undefined ? (b.is_shared ? 1 : 0) : existing.is_shared,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_navigation_items WHERE id = :id`, { id }))
}))

router.delete('/navigation/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_navigation_items SET deleted_at = NOW() WHERE id = :id`, { id: req.params.id })
  success(res, null, 'Deleted')
}))

// ── Settings / SEO ─────────────────────────────────────────────────────
router.get('/settings', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_settings WHERE 1=1`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  if (req.query.locale) {
    sql += ` AND (locale_code = :locale OR locale_code IS NULL)`
    params.locale = req.query.locale
  }
  sql += ` ORDER BY grp, \`key\``
  success(res, await query(sql, params))
}))

router.post('/settings', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const existing = await queryOne(
    `SELECT * FROM cms_settings WHERE market_code = :market AND \`key\` = :key
       AND (locale_code <=> :locale) LIMIT 1`,
    { market: b.market_code, key: b.key, locale: b.locale_code || null },
  )
  if (existing) {
    await query(
      `UPDATE cms_settings SET value = :value, type = :type, label = :label, grp = :grp, is_shared = :is_shared, updated_at = NOW() WHERE id = :id`,
      {
        id: existing.id,
        value: b.value ?? existing.value,
        type: b.type ?? existing.type,
        label: b.label ?? existing.label,
        grp: b.grp ?? existing.grp,
        is_shared: b.is_shared !== undefined ? (b.is_shared ? 1 : 0) : existing.is_shared,
      },
    )
    return success(res, await queryOne(`SELECT * FROM cms_settings WHERE id = :id`, { id: existing.id }))
  }
  const result = await query(
    `INSERT INTO cms_settings (market_code, locale_code, \`key\`, value, type, label, grp, is_shared, created_at, updated_at)
     VALUES (:market_code, :locale_code, :key, :value, :type, :label, :grp, :is_shared, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code || null,
      key: b.key,
      value: b.value || null,
      type: b.type || 'string',
      label: b.label || null,
      grp: b.grp || null,
      is_shared: b.is_shared ? 1 : 0,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_settings WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.get('/seo', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_seo_entries WHERE 1=1`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  if (req.query.locale) {
    sql += ` AND locale_code = :locale`
    params.locale = req.query.locale
  }
  success(res, await query(sql, params))
}))

router.post('/seo', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const existing = await queryOne(
    `SELECT * FROM cms_seo_entries WHERE market_code = :m AND locale_code = :l AND path = :p LIMIT 1`,
    { m: b.market_code, l: b.locale_code, p: b.path },
  )
  const payload = {
    title: b.title || null,
    description: b.description || null,
    keywords: b.keywords || null,
    canonical_url: b.canonical_url || null,
    og: b.og ? JSON.stringify(b.og) : null,
    hreflang: b.hreflang ? JSON.stringify(b.hreflang) : null,
    noindex: b.noindex ? 1 : 0,
    status: b.status || 'draft',
    is_shared: b.is_shared ? 1 : 0,
    published_at: b.published_at || null,
  }
  if (existing) {
    await query(
      `UPDATE cms_seo_entries SET title = :title, description = :description, keywords = :keywords,
        canonical_url = :canonical_url, og = :og, hreflang = :hreflang, noindex = :noindex,
        status = :status, is_shared = :is_shared, published_at = :published_at, updated_at = NOW()
       WHERE id = :id`,
      { ...payload, id: existing.id },
    )
    return success(res, await queryOne(`SELECT * FROM cms_seo_entries WHERE id = :id`, { id: existing.id }))
  }
  const result = await query(
    `INSERT INTO cms_seo_entries
      (market_code, locale_code, path, title, description, keywords, canonical_url, og, hreflang, noindex, status, is_shared, published_at, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :path, :title, :description, :keywords, :canonical_url, :og, :hreflang, :noindex, :status, :is_shared, :published_at, NOW(), NOW())`,
    { ...payload, market_code: b.market_code, locale_code: b.locale_code, path: b.path },
  )
  success(res, await queryOne(`SELECT * FROM cms_seo_entries WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

// ── Blog ───────────────────────────────────────────────────────────────
router.get('/blog/categories', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_blog_categories WHERE 1=1`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  success(res, await query(sql, params))
}))

router.post('/blog/categories', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_blog_categories (market_code, locale_code, slug, name, is_enabled, status, created_at, updated_at)
     VALUES (:market_code, :locale_code, :slug, :name, :is_enabled, :status, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code,
      slug: b.slug,
      name: b.name,
      is_enabled: b.is_enabled === false ? 0 : 1,
      status: b.status || 'draft',
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_blog_categories WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.get('/blog/posts', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_blog_posts WHERE deleted_at IS NULL`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  if (req.query.locale) {
    sql += ` AND locale_code = :locale`
    params.locale = req.query.locale
  }
  sql += ` ORDER BY id DESC`
  const rows = await query(sql, params)
  success(res, rows.map((p) => ({ ...p, tags: parseJson(p.tags, []), related_slugs: parseJson(p.related_slugs, []) })))
}))

router.post('/blog/posts', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const b = req.body || {}
  const result = await query(
    `INSERT INTO cms_blog_posts
      (market_code, locale_code, slug, title, excerpt, content, image_url, video_url, status, is_enabled,
       show_on_homepage, tags, related_slugs, published_at, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, :slug, :title, :excerpt, :content, :image_url, :video_url, :status, :is_enabled,
       :show_on_homepage, :tags, :related_slugs, :published_at, NOW(), NOW())`,
    {
      market_code: b.market_code,
      locale_code: b.locale_code,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt || null,
      content: b.content || null,
      image_url: b.image_url || null,
      video_url: b.video_url || null,
      status: b.status || 'draft',
      is_enabled: b.is_enabled === false ? 0 : 1,
      show_on_homepage: b.show_on_homepage ? 1 : 0,
      tags: b.tags ? JSON.stringify(b.tags) : null,
      related_slugs: b.related_slugs ? JSON.stringify(b.related_slugs) : null,
      published_at: b.published_at || null,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_blog_posts WHERE id = :id`, { id: result.insertId }), 'Created', 201)
}))

router.put('/blog/posts/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_blog_posts WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_blog_posts SET
      title = :title, excerpt = :excerpt, content = :content, image_url = :image_url, video_url = :video_url,
      status = :status, is_enabled = :is_enabled, show_on_homepage = :show_on_homepage,
      tags = :tags, related_slugs = :related_slugs, published_at = :published_at, updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      title: b.title ?? existing.title,
      excerpt: b.excerpt ?? existing.excerpt,
      content: b.content ?? existing.content,
      image_url: b.image_url ?? existing.image_url,
      video_url: b.video_url ?? existing.video_url,
      status: b.status ?? existing.status,
      is_enabled: b.is_enabled !== undefined ? (b.is_enabled ? 1 : 0) : existing.is_enabled,
      show_on_homepage: b.show_on_homepage !== undefined ? (b.show_on_homepage ? 1 : 0) : existing.show_on_homepage,
      tags: b.tags !== undefined ? JSON.stringify(b.tags) : existing.tags,
      related_slugs: b.related_slugs !== undefined ? JSON.stringify(b.related_slugs) : existing.related_slugs,
      published_at: b.published_at !== undefined ? b.published_at : existing.published_at,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_blog_posts WHERE id = :id`, { id }))
}))

router.delete('/blog/posts/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  await query(`UPDATE cms_blog_posts SET deleted_at = NOW() WHERE id = :id`, { id: req.params.id })
  success(res, null, 'Deleted')
}))

// ── Media ──────────────────────────────────────────────────────────────
fs.mkdirSync(config.uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isVideo = (file.mimetype || '').startsWith('video/')
    const sub = path.join(isVideo ? 'cms-media/videos' : 'cms-media/images', new Date().toISOString().slice(0, 7).replace('-', path.sep))
    const dest = path.join(config.uploadDir, sub)
    fs.mkdirSync(dest, { recursive: true })
    req._uploadSub = sub.replace(/\\/g, '/')
    cb(null, dest)
  },
  filename(_req, file, cb) {
    const base = (file.originalname || 'asset').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40) || 'asset'
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin'
    cb(null, `${base}-${crypto.randomBytes(4).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.CMS_MEDIA_MAX_KB || 102400) * 1024 },
})

router.get('/media', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_media WHERE deleted_at IS NULL`
  const params = {}
  if (req.query.market) {
    sql += ` AND (market_code = :market OR market_code IS NULL)`
    params.market = req.query.market
  }
  sql += ` ORDER BY id DESC`
  success(res, await query(sql, params))
}))

router.post('/media', upload.single('file'), asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  if (!req.file) return error(res, 'file required', 422)
  const rel = `${req._uploadSub}/${req.file.filename}`.replace(/\\/g, '/')
  const urlPath = `/uploads/${rel}`
  const url = config.appUrl ? `${config.appUrl}${urlPath}` : urlPath
  const mime = req.file.mimetype || ''
  const isVideo = mime.startsWith('video/')
  const result = await query(
    `INSERT INTO cms_media
      (market_code, locale_code, disk, path, url, original_name, mime_type, media_kind, size,
       alt_text, caption, title, poster_url, uploaded_by, created_at, updated_at)
     VALUES
      (:market_code, :locale_code, 'uploads', :path, :url, :original_name, :mime_type, :media_kind, :size,
       :alt_text, :caption, :title, :poster_url, :uploaded_by, NOW(), NOW())`,
    {
      market_code: req.body?.market_code || null,
      locale_code: req.body?.locale_code || null,
      path: rel,
      url,
      original_name: req.file.originalname,
      mime_type: mime,
      media_kind: isVideo ? 'video' : mime.includes('pdf') ? 'document' : 'image',
      size: req.file.size,
      alt_text: req.body?.alt_text || null,
      caption: req.body?.caption || null,
      title: req.body?.title || req.file.originalname,
      poster_url: req.body?.poster_url || null,
      uploaded_by: req.user.id,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_media WHERE id = :id`, { id: result.insertId }), 'Uploaded', 201)
}))

router.put('/media/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_media WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_media SET alt_text = :alt_text, caption = :caption, title = :title, poster_url = :poster_url, updated_at = NOW() WHERE id = :id`,
    {
      id,
      alt_text: b.alt_text ?? existing.alt_text,
      caption: b.caption ?? existing.caption,
      title: b.title ?? existing.title,
      poster_url: b.poster_url ?? existing.poster_url,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_media WHERE id = :id`, { id }))
}))

router.delete('/media/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const media = await queryOne(`SELECT * FROM cms_media WHERE id = :id AND deleted_at IS NULL`, { id })
  if (!media) return error(res, 'Not found', 404)
  const inUse = await queryOne(
    `SELECT
      (SELECT COUNT(*) FROM cms_sections WHERE media_id = :id AND deleted_at IS NULL) +
      (SELECT COUNT(*) FROM cms_sections WHERE image_url = :url AND deleted_at IS NULL) AS c`,
    { id, url: media.url },
  )
  if (Number(inUse.c) > 0 && String(req.query.force) !== '1') {
    return error(res, 'Media in use', 409)
  }
  const filePath = path.join(config.uploadDir, media.path)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  await query(`UPDATE cms_media SET deleted_at = NOW() WHERE id = :id`, { id })
  success(res, null, 'Deleted')
}))

// ── Inquiries ──────────────────────────────────────────────────────────
router.get('/inquiries', asyncHandler(async (req, res) => {
  let sql = `SELECT * FROM cms_inquiries WHERE 1=1`
  const params = {}
  if (req.query.market) {
    sql += ` AND market_code = :market`
    params.market = req.query.market
  }
  sql += ` ORDER BY id DESC`
  success(res, await query(sql, params))
}))

router.get('/inquiries/:id', asyncHandler(async (req, res) => {
  const row = await queryOne(`SELECT * FROM cms_inquiries WHERE id = :id`, { id: req.params.id })
  if (!row) return error(res, 'Not found', 404)
  success(res, row)
}))

router.put('/inquiries/:id', asyncHandler(async (req, res) => {
  if (!canWrite(req.user.role)) return error(res, 'Forbidden', 403)
  const id = req.params.id
  const existing = await queryOne(`SELECT * FROM cms_inquiries WHERE id = :id`, { id })
  if (!existing) return error(res, 'Not found', 404)
  const b = req.body || {}
  await query(
    `UPDATE cms_inquiries SET status = :status, admin_notes = :admin_notes, replied_at = :replied_at, updated_at = NOW() WHERE id = :id`,
    {
      id,
      status: b.status ?? existing.status,
      admin_notes: b.admin_notes ?? existing.admin_notes,
      replied_at: b.replied_at !== undefined ? b.replied_at : existing.replied_at,
    },
  )
  success(res, await queryOne(`SELECT * FROM cms_inquiries WHERE id = :id`, { id }))
}))

// ── Users (minimal) ────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  if (!canManageUsers(req.user.role)) return error(res, 'Forbidden', 403)
  const rows = await query(
    `SELECT id, name, email, role, is_active, assigned_markets, assigned_locales, last_login_at, created_at
     FROM users ORDER BY id`,
  )
  success(res, rows.map((u) => ({
    ...u,
    assigned_markets: parseJson(u.assigned_markets, null),
    assigned_locales: parseJson(u.assigned_locales, null),
  })))
}))

export default router
