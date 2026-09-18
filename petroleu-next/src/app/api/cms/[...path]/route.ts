import { NextRequest, NextResponse } from 'next/server'
import { ensureSeedData } from '@/lib/storage/ensureSeed'
import { findAll, findWhere, createRow, updateRow, deleteRow, replaceAll } from '@/lib/storage/jsonStore'
import {
  findUserByEmail,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
  isCmsUser,
  normalizeRole,
} from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function withCmsCacheHeaders(res: NextResponse) {
  // Public + admin CMS JSON must reflect Publish immediately (no Next/CDN stale HTML/JSON).
  res.headers.set('Cache-Control', 'private, no-store, must-revalidate')
  return res
}

function ok(data: unknown = null, message = 'OK', status = 200) {
  return withCmsCacheHeaders(
    NextResponse.json({ success: true, message, data }, { status }),
  )
}

function fail(message: string, status = 400, errors: unknown = null) {
  return withCmsCacheHeaders(
    NextResponse.json({ success: false, message, errors, data: null }, { status }),
  )
}

type Section = {
  id: number
  market_code: string
  locale_code: string
  page_slug: string
  section_key: string
  title?: string
  description?: string
  content?: string
  data?: Record<string, unknown>
  image_url?: string
  image_alt?: string
  link_label?: string
  link_url?: string
  sort_order?: number
  status?: string
  is_enabled?: boolean
  is_shared?: boolean
}

function ctx(req: NextRequest) {
  const market = req.nextUrl.searchParams.get('market') || 'pk'
  const locale =
    req.nextUrl.searchParams.get('locale') || (market === 'af' ? 'fa-AF' : 'en-PK')
  return { market, locale }
}

function fallbackChain(market: string, locale: string) {
  if (market === 'af') return [{ market, locale }]
  return [
    { market, locale },
    { market: 'shared', locale },
  ]
}

function sectionData(s: Section) {
  const data = s.data || {}
  return {
    id: s.id,
    title: s.title,
    heading: s.title,
    description: s.description,
    subheading: s.description,
    content: s.content,
    image_url: s.image_url,
    dashboard_image_url: s.image_url,
    image_alt: s.image_alt,
    link_label: s.link_label,
    link_url: s.link_url,
    cta_text: s.link_label,
    cta_link: s.link_url,
    sort_order: s.sort_order,
    ...data,
  }
}

async function listSections(market: string, locale: string, pageSlug: string, sectionKey: string) {
  const all = await findAll<Section>('sections')
  const published = all.filter(
    (s) =>
      s.page_slug === pageSlug &&
      s.section_key === sectionKey &&
      s.status === 'published' &&
      s.is_enabled !== false,
  )
  for (const step of fallbackChain(market, locale)) {
    if (market === 'af' && step.market !== 'af') continue
    const batch = published
      .filter((s) => s.market_code === step.market && s.locale_code === step.locale)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    if (batch.length) return batch.map(sectionData)
  }
  return []
}

async function requireAdmin(req?: NextRequest) {
  const auth = req?.headers.get('authorization')
  const user = await getSessionUser(auth)
  if (!user || !isCmsUser(user.role)) return null
  return user
}

export async function GET(
  req: NextRequest,
  ctxParams: { params: Promise<{ path?: string[] }> },
) {
  await ensureSeedData()
  const { path = [] } = await ctxParams.params
  const parts = path
  const join = parts.join('/')
  const { market, locale } = ctx(req)

  // Public
  if (join === 'markets') {
    const rows = await findAll<{ code: string; is_active?: boolean }>('markets')
    return ok(rows.filter((m) => m.is_active !== false && m.code !== 'shared'))
  }
  if (parts[0] === 'hero' && parts[1]) {
    const list = await listSections(market, locale, parts[1], 'hero')
    return ok(list[0] || null)
  }
  if (join === 'features') {
    const page = req.nextUrl.searchParams.get('page') || 'home'
    const type = req.nextUrl.searchParams.get('type') || 'card'
    return ok(await listSections(market, locale, page, `feature:${type}`))
  }
  if (join === 'logos') return ok(await listSections(market, locale, 'home', 'logo'))
  if (join === 'testimonials') return ok(await listSections(market, locale, 'home', 'testimonial'))
  if (join === 'pricing') return ok(await listSections(market, locale, 'pricing', 'plan'))
  if (join === 'faq' || join === 'faqs') {
    const page = req.nextUrl.searchParams.get('page') || 'home'
    return ok(await listSections(market, locale, page, 'faq'))
  }
  if (join === 'stats') return ok(await listSections(market, locale, 'home', 'stat'))
  if (join === 'team') return ok(await listSections(market, locale, 'about', 'team'))
  if (parts[0] === 'cta' && parts[1]) {
    const list = await listSections(market, locale, parts[1], 'cta')
    return ok(list[0] || null)
  }
  if (join === 'settings') {
    const rows = await findAll<{ market_code: string; locale_code?: string; key: string; value: string }>('settings')
    const map: Record<string, string> = {}
    for (const step of fallbackChain(market, locale)) {
      for (const r of rows) {
        if (r.market_code === step.market && (!r.locale_code || r.locale_code === step.locale)) {
          if (map[r.key] === undefined) map[r.key] = r.value
        }
      }
    }
    return ok(map)
  }
  if (join === 'mission-values') return ok(await listSections(market, locale, 'about', 'mission-value'))
  if (join === 'how-it-works') return ok(await listSections(market, locale, 'home', 'how-it-works'))
  if (join === 'company-story') {
    const list = await listSections(market, locale, 'about', 'company-story')
    return ok(list[0] || null)
  }
  if (join === 'industries') {
    const home = await listSections(market, locale, 'home', 'industry')
    if (home.length) return ok(home)
    const cards = await listSections(market, locale, 'industries', 'industry-card')
    if (cards.length) return ok(cards)
    return ok(await listSections(market, locale, 'industries', 'industry'))
  }
  if (join === 'mobile-features') return ok(await listSections(market, locale, 'home', 'mobile-feature'))
  if (join === 'analytics-cards') {
    const home = await listSections(market, locale, 'home', 'analytics-card')
    if (home.length) return ok(home)
    return ok(await listSections(market, locale, 'analytics', 'analytics-card'))
  }
  if (join === 'why-choose-reasons') return ok(await listSections(market, locale, 'home', 'why-choose'))
  if (join === 'supported-brands') return ok(await listSections(market, locale, 'home', 'supported-brand'))
  if (parts[0] === 'section-heading' && parts[1]) {
    const page = req.nextUrl.searchParams.get('page') || 'home'
    const list = await listSections(market, locale, page, `heading:${parts[1]}`)
    return ok(list[0] || null)
  }
  if (parts[0] === 'demo-block' && parts[1]) {
    const list = await listSections(market, locale, 'home', `demo:${parts[1]}`)
    return ok(list[0] || null)
  }
  if (parts[0] === 'page-cards' && parts[1]) {
    return ok(await listSections(market, locale, parts[1], 'page-card'))
  }
  if (parts[0] === 'legal-pages' && parts[1]) {
    const list = await listSections(market, locale, 'legal', parts[1])
    return ok(list[0] || null)
  }
  if (join === 'navigation') {
    const location = req.nextUrl.searchParams.get('location') || 'header'
    const rows = await findAll<{
      market_code: string
      locale_code: string
      location: string
      status?: string
      is_enabled?: boolean
    }>('navigation')
    for (const step of fallbackChain(market, locale)) {
      const batch = rows.filter(
        (r) =>
          r.market_code === step.market &&
          r.locale_code === step.locale &&
          r.location === location &&
          r.status === 'published' &&
          r.is_enabled !== false,
      )
      if (batch.length) return ok(batch)
    }
    return ok([])
  }
  if (join === 'seo') {
    const p = req.nextUrl.searchParams.get('path') || '/'
    const rows = await findAll<{ market_code: string; locale_code: string; path: string; status?: string }>('seo')
    for (const step of fallbackChain(market, locale)) {
      const row = rows.find(
        (r) =>
          r.market_code === step.market &&
          r.locale_code === step.locale &&
          r.path === p &&
          r.status === 'published',
      )
      if (row) return ok(row)
    }
    return ok(null)
  }
  if (join === 'blog') {
    const rows = await findAll<{
      market_code: string
      locale_code: string
      status?: string
      show_on_homepage?: boolean
    }>('blog-posts')
    let list = rows.filter(
      (r) => r.market_code === market && r.locale_code === locale && r.status === 'published',
    )
    if (req.nextUrl.searchParams.get('homepage') === 'true' || req.nextUrl.searchParams.get('homepage') === '1') {
      list = list.filter((r) => r.show_on_homepage)
    }
    return ok(list)
  }
  if (parts[0] === 'blog' && parts[1]) {
    const rows = await findWhere<{
      slug: string
      market_code: string
      locale_code: string
      status?: string
    }>('blog-posts', (r) => r.slug === parts[1] && r.market_code === market && r.locale_code === locale && r.status === 'published')
    if (!rows[0]) return fail('Not found', 404)
    return ok(rows[0])
  }

  // Admin GET
  if (parts[0] === 'admin') {
    if (parts[1] === 'me') {
      const user = await requireAdmin(req)
      if (!user) return fail('Unauthenticated', 401)
      return ok(user)
    }
    const user = await requireAdmin(req)
    if (!user) return fail('Unauthenticated', 401)

    const resource = parts[1]
    const map: Record<string, string> = {
      pages: 'pages',
      sections: 'sections',
      navigation: 'navigation',
      markets: 'markets',
      locales: 'locales',
      settings: 'settings',
      seo: 'seo',
      media: 'media',
      inquiries: 'inquiries',
      users: 'users',
    }
    if (resource === 'dashboard') {
      const sections = await findAll('sections')
      const pages = await findAll('pages')
      const inquiries = await findAll<{ status?: string }>('inquiries')
      return ok({
        pages: pages.length,
        sections: sections.length,
        inquiries_new: inquiries.filter((i) => i.status === 'new').length,
        markets: (await findAll('markets')).length,
        blog_posts: (await findAll('blog-posts')).length,
        media: (await findAll('media')).length,
      })
    }
    if (resource === 'blog' && parts[2] === 'posts') return ok(await findAll('blog-posts'))
    if (resource === 'blog' && parts[2] === 'categories') return ok(await findAll('blog-categories'))
    if (resource === 'pages') {
      let rows = (await findAll('pages')) as Record<string, unknown>[]
      const group = req.nextUrl.searchParams.get('group')
      const m = req.nextUrl.searchParams.get('market')
      const l = req.nextUrl.searchParams.get('locale')
      const q = req.nextUrl.searchParams.get('q')
      const status = req.nextUrl.searchParams.get('status')
      const grouped = group === '1' || group === 'true'

      if (grouped) {
        if (m) rows = rows.filter((r) => r.market_code === m)
        if (status) rows = rows.filter((r) => String(r.status || '') === status)
        if (q) {
          const term = q.toLowerCase()
          rows = rows.filter(
            (r) =>
              String(r.slug || '')
                .toLowerCase()
                .includes(term) ||
              String(r.title || '')
                .toLowerCase()
                .includes(term),
          )
        }

        const localeOrder = ['fa-AF', 'ps-AF', 'en-AF', 'en-PK']
        const buckets = new Map<string, Record<string, unknown>[]>()
        for (const row of rows) {
          const marketCode = String(row.market_code || 'shared')
          const slug = String(row.slug || '')
          const key = `${marketCode}:${slug}`
          const list = buckets.get(key)
          if (list) list.push(row)
          else buckets.set(key, [row])
        }

        const logical = Array.from(buckets.entries())
          .map(([logical_key, items]) => {
            const translations = [...items].sort((a, b) => {
              const la = String(a.locale_code || '')
              const lb = String(b.locale_code || '')
              const ia = localeOrder.indexOf(la)
              const ib = localeOrder.indexOf(lb)
              const oa = ia === -1 ? 999 : ia
              const ob = ib === -1 ? 999 : ib
              if (oa !== ob) return oa - ob
              return la.localeCompare(lb)
            })
            const first = translations[0] || {}
            return {
              logical_key,
              market_code: first.market_code,
              slug: first.slug,
              title: first.title,
              template: first.template ?? null,
              is_enabled: first.is_enabled !== false,
              translations: translations.map((t) => ({
                id: t.id,
                market_code: t.market_code,
                locale_code: t.locale_code,
                slug: t.slug,
                title: t.title,
                description: t.description ?? null,
                status: t.status,
                translation_status: t.translation_status ?? null,
                frontend_path: t.frontend_path ?? null,
                template: t.template ?? null,
                is_enabled: t.is_enabled !== false,
                is_shared: Boolean(t.is_shared),
              })),
            }
          })
          .sort((a, b) => String(a.slug || '').localeCompare(String(b.slug || '')))

        return ok(logical)
      }

      if (m) rows = rows.filter((r) => r.market_code === m)
      if (l) rows = rows.filter((r) => r.locale_code === l)
      return ok(rows)
    }
    if (resource === 'sections' && parts[2] && parts[3] === 'preview') {
      const rows = await findAll<Section>('sections')
      const row = rows.find((r) => String(r.id) === String(parts[2]))
      if (!row) return fail('Not found', 404)
      return ok({
        ...row,
        public_payload: sectionData(row),
        note:
          row.status === 'published' && row.is_enabled !== false
            ? 'This row is live on the public API for its market/locale.'
            : 'Draft / disabled — not served by the public API until published and enabled.',
      })
    }
    if (map[resource]) {
      let rows = (await findAll(map[resource])) as Record<string, unknown>[]
      const m = req.nextUrl.searchParams.get('market')
      const l = req.nextUrl.searchParams.get('locale')
      if (m) rows = rows.filter((r) => r.market_code === m)
      if (l) rows = rows.filter((r) => r.locale_code === l)
      if (resource === 'sections') {
        const page = req.nextUrl.searchParams.get('page')
        const status = req.nextUrl.searchParams.get('status')
        if (page) rows = rows.filter((r) => String(r.page_slug || '') === page)
        if (status) rows = rows.filter((r) => String(r.status || '') === status)
      }
      if (resource === 'users') {
        rows = rows.map((row) => {
          const { passwordHash, ...rest } = row
          void passwordHash
          return {
            ...rest,
            is_active: Boolean(row.isActive ?? row.is_active),
            assigned_markets: row.assignedMarkets ?? row.assigned_markets ?? null,
            assigned_locales: row.assignedLocales ?? row.assigned_locales ?? null,
          }
        })
      }
      return ok(rows)
    }
  }

  return fail('Not found', 404)
}

export async function POST(
  req: NextRequest,
  ctxParams: { params: Promise<{ path?: string[] }> },
) {
  await ensureSeedData()
  const { path = [] } = await ctxParams.params
  const join = path.join('/')
  const contentType = req.headers.get('content-type') || ''

  // Multipart media upload (admin)
  if (join === 'admin/media' && contentType.includes('multipart/form-data')) {
    const admin = await requireAdmin(req)
    if (!admin) return fail('Unauthenticated', 401)
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return fail('File is required', 422)
    const allowed = /\.(png|jpe?g|webp|gif|mp4|pdf|svg)$/i
    const original = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    if (!allowed.test(original)) return fail('Unsupported file type', 422)
    const { promises: fs } = await import('fs')
    const pathMod = await import('path')
    const uploadRoot =
      process.env.CMS_UPLOAD_DIR || pathMod.join(process.cwd(), 'storage', 'uploads')
    await fs.mkdir(uploadRoot, { recursive: true })
    const stamp = Date.now()
    const safeName = `${stamp}-${original}`
    const dest = pathMod.join(uploadRoot, safeName)
    const resolved = pathMod.resolve(dest)
    if (!resolved.startsWith(pathMod.resolve(uploadRoot))) return fail('Invalid path', 403)
    const buf = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(resolved, buf)
    const url = `/uploads/${safeName}`
    const row = await createRow('media', {
      url,
      path: safeName,
      filename: original,
      mime_type: file.type || 'application/octet-stream',
      size: buf.length,
      alt_text: String(form.get('alt_text') || ''),
      caption: String(form.get('caption') || ''),
      title: String(form.get('title') || ''),
      poster_url: String(form.get('poster_url') || '') || null,
      market_code: String(form.get('market_code') || 'pk'),
      created_at: new Date().toISOString(),
    } as never)
    return ok(row, 'Uploaded', 201)
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  if (join === 'contact' || join === 'demo-request') {
    const row = await createRow('inquiries', {
      type: join === 'contact' ? 'contact' : 'demo',
      market_code: body.market || 'pk',
      locale_code: body.locale || 'en-PK',
      full_name: body.full_name || body.name || 'Unknown',
      email: body.email || '',
      phone: body.phone || null,
      company: body.company || null,
      message: body.message || null,
      source: body.source || 'website',
      status: 'new',
      created_at: new Date().toISOString(),
    } as never)
    return ok(row, 'Submitted', 201)
  }

  if (join === 'admin/login') {
    const email = String(body.email || '')
    const password = String(body.password || '')
    if (!email || !password) {
      return NextResponse.json(
        { message: 'The given data was invalid.', errors: { email: ['Email and password are required.'] } },
        { status: 422 },
      )
    }
    const user = await findUserByEmail(email)
    const passOk = user ? await verifyPassword(password, user.passwordHash) : false
    if (!user || !user.isActive || !isCmsUser(user.role) || !passOk) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: { email: ['The provided credentials are incorrect.'] },
        },
        { status: 422 },
      )
    }
    const token = await createSessionToken(user)
    await setSessionCookie(token)
    return ok(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: normalizeRole(user.role),
          assigned_markets: user.assignedMarkets ?? null,
          assigned_locales: user.assignedLocales ?? null,
        },
      },
      'Logged in',
    )
  }

  if (join === 'admin/logout') {
    await clearSessionCookie()
    return ok(null, 'Logged out')
  }

  const admin = await requireAdmin(req)
  if (!admin) return fail('Unauthenticated', 401)

  const resource = path[1]
  const collectionMap: Record<string, string> = {
    pages: 'pages',
    sections: 'sections',
    navigation: 'navigation',
    markets: 'markets',
    locales: 'locales',
    settings: 'settings',
    seo: 'seo',
    media: 'media',
  }
  if (resource === 'blog' && path[2] === 'posts') {
    const row = await createRow('blog-posts', body as never)
    return ok(row, 'Created', 201)
  }
  if (resource === 'blog' && path[2] === 'categories') {
    const row = await createRow('blog-categories', body as never)
    return ok(row, 'Created', 201)
  }

  if (resource === 'users' && path[2] && path[3] === 'reset-link') {
    return ok({ email: 'out-of-band', token: `reset-${path[2]}-${Date.now()}` }, 'Reset token created')
  }

  if (resource === 'change-password') {
    const current = String(body.current_password || '')
    const next = String(body.password || '')
    const confirm = String(body.password_confirmation || '')
    if (!current || !next || next.length < 8) return fail('Invalid password', 422)
    if (next !== confirm) return fail('Password confirmation mismatch', 422)
    const full = await findUserByEmail(admin.email)
    if (!full || !(await verifyPassword(current, full.passwordHash))) {
      return fail('Current password is incorrect', 422)
    }
    const { hashPassword } = await import('@/lib/auth/session')
    await updateRow('users', full.id, { passwordHash: await hashPassword(next) })
    return ok(null, 'Password updated')
  }

  if (resource === 'users' && !path[2]) {
    const email = String(body.email || '')
    const password = String(body.password || '')
    if (!email || !password || password.length < 8) return fail('Email and password required', 422)
    if (password !== String(body.password_confirmation || password)) {
      return fail('Password confirmation mismatch', 422)
    }
    const existing = await findUserByEmail(email)
    if (existing) return fail('Email already exists', 422)
    const { hashPassword } = await import('@/lib/auth/session')
    const row = await createRow('users', {
      name: String(body.name || email),
      email,
      passwordHash: await hashPassword(password),
      role: normalizeRole(String(body.role || 'editor')),
      isActive: body.is_active !== false && body.isActive !== false,
      assignedMarkets: (body.assigned_markets as string[] | null) ?? null,
      assignedLocales: (body.assigned_locales as string[] | null) ?? null,
    } as never)
    const { passwordHash, ...safe } = row as { passwordHash?: string } & Record<string, unknown>
    void passwordHash
    return ok(
      {
        ...safe,
        is_active: (row as { isActive?: boolean }).isActive,
        assigned_markets: (row as { assignedMarkets?: string[] | null }).assignedMarkets ?? null,
        assigned_locales: (row as { assignedLocales?: string[] | null }).assignedLocales ?? null,
      },
      'Created',
      201,
    )
  }

  if (resource === 'settings' || resource === 'seo') {
    // upsert by natural key
    const file = resource === 'settings' ? 'settings' : 'seo'
    const rows = await findAll<Record<string, unknown>>(file)
    if (resource === 'settings') {
      const idx = rows.findIndex(
        (r) => r.market_code === body.market_code && r.key === body.key && (r.locale_code || null) === (body.locale_code || null),
      )
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], ...body }
        await replaceAll(file, rows)
        return ok(rows[idx])
      }
    }
    const row = await createRow(file, body as never)
    return ok(row, 'Created', 201)
  }

  // Section helpers MUST run before createRow — otherwise /sections/:id/publish creates junk rows.
  if (resource === 'sections' && path[2] === 'reorder') {
    const items = Array.isArray(body.items) ? (body.items as { id?: unknown; sort_order?: unknown }[]) : []
    if (!items.length) return fail('items required', 422)
    const rows = await findAll<Section>('sections')
    const byId = new Map(rows.map((r) => [String(r.id), r]))
    for (const item of items) {
      const row = byId.get(String(item.id))
      if (!row) continue
      row.sort_order = Number(item.sort_order) || 0
    }
    await replaceAll('sections', rows)
    return ok({ updated: items.length }, 'Reordered')
  }
  if (resource === 'sections' && path[3] === 'publish') {
    const id = path[2]
    const row = await updateRow('sections', id, {
      status: 'published',
      published_at: new Date().toISOString(),
    })
    return row ? ok(row, 'Published successfully.') : fail('Not found', 404)
  }
  if (resource === 'sections' && path[3] === 'unpublish') {
    const id = path[2]
    const row = await updateRow('sections', id, { status: 'draft', published_at: null })
    return row ? ok(row, 'Unpublished') : fail('Not found', 404)
  }
  if (resource === 'sections' && path[3] === 'duplicate') {
    const id = path[2]
    const rows = await findAll<Section>('sections')
    const source = rows.find((r) => String(r.id) === String(id))
    if (!source) return fail('Not found', 404)
    const { id: _omit, ...rest } = source
    void _omit
    const row = await createRow('sections', {
      ...rest,
      title: source.title ? `${source.title} (copy)` : source.title,
      status: 'draft',
      published_at: null,
    } as never)
    return ok(row, 'Duplicated as draft', 201)
  }

  // Create only at collection root (e.g. POST /admin/sections) — never for /:id/* actions.
  if (collectionMap[resource] && !path[2]) {
    const row = await createRow(collectionMap[resource], body as never)
    return ok(row, 'Created', 201)
  }

  return fail('Not found', 404)
}

export async function PUT(
  req: NextRequest,
  ctxParams: { params: Promise<{ path?: string[] }> },
) {
  await ensureSeedData()
  const admin = await requireAdmin(req)
  if (!admin) return fail('Unauthenticated', 401)
  const { path = [] } = await ctxParams.params
  const body = await req.json().catch(() => ({}))
  const resource = path[1]
  const id = path[2]
  const map: Record<string, string> = {
    pages: 'pages',
    sections: 'sections',
    navigation: 'navigation',
    markets: 'markets',
    settings: 'settings',
    seo: 'seo',
    media: 'media',
    inquiries: 'inquiries',
  }
  if (resource === 'blog' && path[2] === 'posts' && path[3]) {
    const row = await updateRow('blog-posts', path[3], body)
    return row ? ok(row) : fail('Not found', 404)
  }
  if (resource === 'users' && id) {
    const patch: Record<string, unknown> = {
      name: body.name,
      email: body.email,
      role: body.role ? normalizeRole(String(body.role)) : undefined,
      isActive: body.is_active !== undefined ? Boolean(body.is_active) : body.isActive,
      assignedMarkets: body.assigned_markets ?? body.assignedMarkets,
      assignedLocales: body.assigned_locales ?? body.assignedLocales,
    }
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])
    if (body.password) {
      if (String(body.password) !== String(body.password_confirmation || body.password)) {
        return fail('Password confirmation mismatch', 422)
      }
      const { hashPassword } = await import('@/lib/auth/session')
      patch.passwordHash = await hashPassword(String(body.password))
    }
    const row = await updateRow('users', id, patch)
    if (!row) return fail('Not found', 404)
    const { passwordHash, ...safe } = row as { passwordHash?: string } & Record<string, unknown>
    void passwordHash
    return ok({
      ...safe,
      is_active: (row as { isActive?: boolean }).isActive,
      assigned_markets: (row as { assignedMarkets?: unknown }).assignedMarkets ?? null,
      assigned_locales: (row as { assignedLocales?: unknown }).assignedLocales ?? null,
    })
  }
  if (map[resource] && id) {
    const patch = { ...body }
    if (patch.status === 'published' && !patch.published_at) {
      patch.published_at = new Date().toISOString()
    }
    if (patch.status === 'draft' && patch.published_at === undefined) {
      patch.published_at = null
    }
    const row = await updateRow(map[resource], id, patch)
    return row ? ok(row) : fail('Not found', 404)
  }
  return fail('Not found', 404)
}

export async function DELETE(
  req: NextRequest,
  ctxParams: { params: Promise<{ path?: string[] }> },
) {
  await ensureSeedData()
  const admin = await requireAdmin(req)
  if (!admin) return fail('Unauthenticated', 401)
  const { path = [] } = await ctxParams.params
  const resource = path[1]
  const id = path[2]
  const map: Record<string, string> = {
    pages: 'pages',
    sections: 'sections',
    navigation: 'navigation',
    media: 'media',
  }
  if (resource === 'blog' && path[2] === 'posts' && path[3]) {
    await deleteRow('blog-posts', path[3])
    return ok(null, 'Deleted')
  }
  if (map[resource] && id) {
    await deleteRow(map[resource], id)
    return ok(null, 'Deleted')
  }
  return fail('Not found', 404)
}
