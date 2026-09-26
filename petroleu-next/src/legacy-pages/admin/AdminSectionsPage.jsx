import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'
import {
  ALL_MAIN_SECTIONS,
  HOME_PAGE_SLUGS,
  LAYOUT_PAGE_SLUGS,
  EXTRA_SECTION_PAGE_SLUGS,
  keysForSectionDef,
  isCityPageSlug,
} from '../../lib/cms/homeSections'
import AdminHomeSectionEditor from './AdminHomeSectionEditor'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls = 'admin-input'
const btnOutline = 'admin-btn-secondary text-xs'

function formatUpdated(rows) {
  let best = null
  for (const r of rows || []) {
    const raw = r.updated_at || r.published_at || r.created_at
    if (!raw) continue
    const t = new Date(raw).getTime()
    if (!Number.isNaN(t) && (best == null || t > best)) best = t
  }
  if (best == null) return '—'
  return new Date(best).toLocaleString()
}

function statusOf(rows) {
  if (!rows?.length) return 'missing'
  if (rows.every((r) => r.status === 'published' && r.is_enabled !== false)) return 'published'
  if (rows.some((r) => r.status === 'published')) return 'partial'
  return 'draft'
}

function sortItems(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function dataObj(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return { ...raw }
  return {}
}

/**
 * CMS → Sections: Home main sections only (locale-scoped).
 * Child cards/FAQs/testimonials are edited inside the parent section.
 */
export default function AdminSectionsPage() {
  const { market, locale, showAll } = useAdminWorkspace()
  const searchParams = useSearchParams()
  const showAdvancedJson = searchParams?.get('advanced') === '1'

  const [rawRows, setRawRows] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editor, setEditor] = useState(null)
  const [saving, setSaving] = useState(false)

  const effectiveMarket = showAll ? '' : market
  const effectiveLocale = showAll ? '' : locale

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (effectiveMarket) params.market = effectiveMarket
      if (effectiveLocale) params.locale = effectiveLocale
      const res = await adminGet('/sections', { params })
      const all = asList(res).filter((r) => !isCityPageSlug(r.page_slug))
      const scoped = all.filter(
        (r) =>
          HOME_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
          LAYOUT_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
          EXTRA_SECTION_PAGE_SLUGS.includes(String(r.page_slug || '')),
      )
      setRawRows(scoped)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }, [effectiveMarket, effectiveLocale])

  useEffect(() => {
    load()
  }, [load])

  const logicalRows = useMemo(() => {
    return ALL_MAIN_SECTIONS.map((def) => {
      const keys = keysForSectionDef(def)
      const matched = rawRows.filter(
        (r) =>
          def.pageSlugs.includes(String(r.page_slug || '')) &&
          keys.has(String(r.section_key || '')),
      )
      const scoped = matched.filter((r) => {
        if (effectiveMarket && r.market_code !== effectiveMarket) return false
        if (effectiveLocale && r.locale_code !== effectiveLocale) return false
        return true
      })
      const rows = scoped.length ? scoped : matched
      return {
        id: def.id,
        def,
        rows,
        status: statusOf(rows),
        updatedLabel: formatUpdated(rows),
      }
    }).filter((row) => {
      if (!statusFilter) return true
      if (statusFilter === 'published') return row.status === 'published'
      if (statusFilter === 'draft') return row.status === 'draft' || row.status === 'partial'
      if (statusFilter === 'missing') return row.status === 'missing'
      return true
    })
  }, [rawRows, effectiveMarket, effectiveLocale, statusFilter])

  async function openEdit(logical) {
    const def = logical.def
    let rows = (logical.rows || []).filter((r) =>
      keysForSectionDef(def).has(String(r.section_key || '')),
    )

    // Auto-create Header / Footer chrome rows if missing for this locale
    if (
      (def.type === 'header' || def.type === 'footer') &&
      !rows.some((r) => r.section_key === def.primaryKey)
    ) {
      try {
        const key = def.primaryKey
        await adminPost('/sections', {
          market_code: market,
          locale_code: locale,
          page_slug: 'layout',
          section_key: key,
          title: 'Petroleu',
          description:
            key === 'footer'
              ? 'Petrol pump management software for fuel inventory, sales, credit, and daily closing.'
              : null,
          image_url: '/petroleu-logo.png',
          image_alt: 'Petroleu',
          status: 'published',
          is_enabled: true,
          sort_order: key === 'header' ? 0 : 1,
          data:
            key === 'header'
              ? { brand_name: 'Petroleu' }
              : {
                  brand_name: 'Petroleu',
                  footer_credit: 'Made with care in Pakistan',
                  phone: '',
                  phone_tel: '',
                  email: '',
                  address: '',
                  facebook_url: '',
                  instagram_url: '',
                  linkedin_url: '',
                  youtube_url: '',
                },
        })
        const params = {}
        if (effectiveMarket) params.market = effectiveMarket
        if (effectiveLocale) params.locale = effectiveLocale
        const res = await adminGet('/sections', { params })
        const all = asList(res).filter((r) => !isCityPageSlug(r.page_slug))
        const scoped = all.filter(
          (r) =>
            HOME_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
            LAYOUT_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
            EXTRA_SECTION_PAGE_SLUGS.includes(String(r.page_slug || '')),
        )
        setRawRows(scoped)
        rows = scoped.filter(
          (r) =>
            def.pageSlugs.includes(String(r.page_slug || '')) &&
            keysForSectionDef(def).has(String(r.section_key || '')),
        )
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to create layout section')
        return
      }
    }

    const keys = keysForSectionDef(def)
    rows = rows.filter((r) => keys.has(String(r.section_key || '')))

    const headingRow =
      (def.headingKey && rows.find((r) => r.section_key === def.headingKey)) || null
    const primaryRow =
      (def.primaryKey &&
        rows.find(
          (r) =>
            r.section_key === def.primaryKey &&
            def.pageSlugs.includes(String(r.page_slug || '')),
        )) ||
      null

    const headingData = dataObj(headingRow?.data)
    const primaryData = dataObj(primaryRow?.data)

    const itemsByKey = {}
    for (const itemKey of def.itemKeys || []) {
      itemsByKey[itemKey] = sortItems(rows.filter((r) => r.section_key === itemKey)).map((r) => ({
        id: r.id,
        section_key: r.section_key,
        page_slug: r.page_slug,
        title: r.title || '',
        description: r.description || '',
        content: r.content || '',
        image_url: r.image_url || '',
        image_alt: r.image_alt || '',
        link_label: r.link_label || '',
        link_url: r.link_url || '',
        sort_order: r.sort_order ?? 0,
        is_enabled: r.is_enabled !== false,
        status: r.status || 'draft',
        data: dataObj(r.data),
        icon: dataObj(r.data).icon || '',
      }))
    }

    // Testimonials: prefer data[] array on the primary testimonial row
    let reviews = []
    let reviewsRowId = null
    if (def.id === 'testimonials') {
      const arrayRow = rows.find((r) => Array.isArray(r.data) && r.data.length)
      if (arrayRow) {
        reviewsRowId = arrayRow.id
        reviews = arrayRow.data.map((item) => ({
          name: item.name || '',
          role: item.role || '',
          city: item.city || '',
          rating: item.rating ?? 5,
          date: item.date || '',
          content: item.content || '',
        }))
      } else {
        reviews = (itemsByKey.testimonial || []).map((t) => ({
          name: t.title || t.data?.author_name || '',
          role: t.data?.author_role || t.link_label || '',
          city: t.data?.city || '',
          rating: t.data?.rating ?? 5,
          date: t.data?.date || '',
          content: t.description || t.data?.quote || t.content || '',
          _rowId: t.id,
        }))
      }
    }

    setEditingId(def.id)
    setEditor({
      sectionId: def.id,
      label: def.label,
      type: def.type,
      pageSlug: def.pageSlugs?.[0] || 'home',
      heading: headingRow
        ? {
            id: headingRow.id,
            title: headingRow.title || '',
            description: headingRow.description || '',
            content: headingRow.content || '',
            badge: headingData.badge || headingData.eyebrow || '',
            image_url: headingRow.image_url || '',
            image_alt: headingRow.image_alt || '',
            link_label: headingRow.link_label || '',
            link_url: headingRow.link_url || '',
            data: headingData,
          }
        : null,
      primary: primaryRow
        ? {
            id: primaryRow.id,
            section_key: primaryRow.section_key,
            page_slug: primaryRow.page_slug,
            title: primaryRow.title || '',
            description: primaryRow.description || '',
            content: primaryRow.content || '',
            image_url:
              primaryRow.image_url ||
              primaryData.dashboard_image_url ||
              primaryData.dashboardImageUrl ||
              '',
            image_alt: primaryRow.image_alt || '',
            link_label:
              primaryRow.link_label ||
              primaryData.primaryButton ||
              primaryData.cta_text ||
              '',
            link_url: primaryRow.link_url || primaryData.dashboard_url || '',
            is_enabled: primaryRow.is_enabled !== false,
            status: primaryRow.status || 'draft',
            data: {
              ...primaryData,
              badge: primaryData.badge || '',
              primaryButton:
                primaryData.primaryButton || primaryRow.link_label || primaryData.cta_text || '',
              secondaryButton:
                primaryData.secondaryButton || primaryData.cta2_text || '',
              features: Array.isArray(primaryData.features) ? primaryData.features : [],
              title_highlight:
                primaryData.title_highlight || primaryData.titleHighlight || '',
              titleHighlight:
                primaryData.titleHighlight || primaryData.title_highlight || '',
              dashboard_url: primaryData.dashboard_url || '',
              dashboard_image_url:
                primaryData.dashboard_image_url || primaryRow.image_url || '',
            },
          }
        : null,
      itemsByKey,
      itemKeys: def.itemKeys || [],
      reviews,
      reviewsRowId,
      advancedJson: showAdvancedJson
        ? JSON.stringify(
            rows.map((r) => ({
              id: r.id,
              section_key: r.section_key,
              title: r.title,
              description: r.description,
              image_url: r.image_url,
              data: r.data,
            })),
            null,
            2,
          )
        : null,
    })
    setMessage('')
    setError('')
  }

  async function saveEditor(andPublish) {
    if (!editor) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const patches = []
      const statusPatch = andPublish ? { status: 'published' } : {}

      if (editor.heading?.id) {
        const hData = {
          ...(editor.heading.data || {}),
          badge: editor.heading.badge || null,
          eyebrow: editor.heading.badge || null,
        }
        patches.push(
          adminPut(`/sections/${editor.heading.id}`, {
            title: editor.heading.title || null,
            description: editor.heading.description || null,
            content: editor.heading.content || null,
            image_url: editor.heading.image_url || null,
            image_alt: editor.heading.image_alt || null,
            link_label: editor.heading.link_label || null,
            link_url: editor.heading.link_url || null,
            data: hData,
            ...statusPatch,
          }),
        )
      }

      if (editor.primary?.id) {
        const pData = {
          ...(editor.primary.data || {}),
          dashboard_image_url: editor.primary.image_url || editor.primary.data?.dashboard_image_url,
        }
        patches.push(
          adminPut(`/sections/${editor.primary.id}`, {
            title: editor.primary.title || null,
            description: editor.primary.description || null,
            content: editor.primary.content || null,
            image_url: editor.primary.image_url || null,
            image_alt: editor.primary.image_alt || null,
            link_label: editor.primary.link_label || pData.primaryButton || null,
            link_url: editor.primary.link_url || null,
            is_enabled: Boolean(editor.primary.is_enabled),
            data: pData,
            ...statusPatch,
          }),
        )
      }

      if (editor.reviewsRowId && Array.isArray(editor.reviews)) {
        patches.push(
          adminPut(`/sections/${editor.reviewsRowId}`, {
            data: editor.reviews.map((rev) => ({
              name: rev.name || '',
              role: rev.role || '',
              city: rev.city || '',
              rating: rev.rating ?? 5,
              date: rev.date || '',
              content: rev.content || '',
            })),
            ...statusPatch,
          }),
        )
      } else if (editor.type === 'testimonials' && editor.reviews?.length) {
        for (const rev of editor.reviews) {
          const payload = {
            market_code: market,
            locale_code: locale,
            page_slug: 'home',
            section_key: 'testimonial',
            title: rev.name || null,
            description: rev.content || null,
            content: rev.content || null,
            is_enabled: true,
            sort_order: Number(rev.sort_order) || 0,
            data: {
              author_name: rev.name,
              author_role: rev.role,
              city: rev.city,
              rating: rev.rating,
              date: rev.date,
              quote: rev.content,
              name: rev.name,
              role: rev.role,
              content: rev.content,
            },
            ...statusPatch,
            status: andPublish ? 'published' : 'draft',
          }
          if (rev._rowId) {
            patches.push(adminPut(`/sections/${rev._rowId}`, payload))
          } else if (String(rev.name || '').trim() && String(rev.content || '').trim()) {
            patches.push(adminPost('/sections', payload))
          }
        }
      }

      for (const itemKey of editor.itemKeys || []) {
        if (editor.type === 'testimonials' && itemKey === 'testimonial' && editor.reviewsRowId) {
          continue
        }
        for (const item of editor.itemsByKey[itemKey] || []) {
          const payload = {
            market_code: market,
            locale_code: locale,
            page_slug: item.page_slug || editor.pageSlug || 'home',
            section_key: itemKey,
            title: item.title || null,
            description: item.description || null,
            content: item.content || null,
            image_url: item.image_url || null,
            image_alt: item.image_alt || null,
            link_label: item.link_label || null,
            link_url: item.link_url || null,
            sort_order: Number(item.sort_order) || 0,
            is_enabled: Boolean(item.is_enabled),
            data: item.data || {},
            ...statusPatch,
            status: andPublish ? 'published' : item.status || 'draft',
          }
          if (!item.id) {
            // New FAQ / card rows created in the editor
            if (itemKey === 'logo') continue
            patches.push(adminPost('/sections', payload))
            continue
          }
          patches.push(
            adminPut(`/sections/${item.id}`, {
              title: payload.title,
              description: payload.description,
              content: payload.content,
              image_url: payload.image_url,
              image_alt: payload.image_alt,
              link_label: payload.link_label,
              link_url: payload.link_url,
              sort_order: payload.sort_order,
              is_enabled: payload.is_enabled,
              data: payload.data,
              ...statusPatch,
            }),
          )
        }
      }

      await Promise.all(patches)
      setMessage(andPublish ? 'Saved & published for this locale.' : 'Saved for this locale.')
      const keepId = editor.sectionId
      await load()
      // Re-open editor so newly created FAQ/testimonial rows get real ids
      if (keepId) {
        // load() updates rawRows async via setState — open on next tick from fresh fetch
        const params = {}
        if (effectiveMarket) params.market = effectiveMarket
        if (effectiveLocale) params.locale = effectiveLocale
        const res = await adminGet('/sections', { params })
        const all = asList(res).filter((r) => !isCityPageSlug(r.page_slug))
        const scoped = all.filter(
          (r) =>
            HOME_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
            LAYOUT_PAGE_SLUGS.includes(String(r.page_slug || '')) ||
            EXTRA_SECTION_PAGE_SLUGS.includes(String(r.page_slug || '')),
        )
        setRawRows(scoped)
        const def = ALL_MAIN_SECTIONS.find((s) => s.id === keepId)
        if (def) {
          const keys = keysForSectionDef(def)
          const matched = scoped.filter(
            (r) =>
              def.pageSlugs.includes(String(r.page_slug || '')) &&
              keys.has(String(r.section_key || '')),
          )
          openEdit({ id: def.id, def, rows: matched })
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const workspaceNote = showAll
    ? 'Showing all markets/locales (Show all is on). Prefer a single market + locale for editing.'
    : `Editing Header, Footer & Home for ${market} / ${locale}.`

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Sections</h1>
          <p className="text-sm text-muted-foreground">
            Header, Footer, and Home sections. Menu links stay under Website → Navigation. City
            pages are under Pages.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{workspaceNote}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">
          Market/Locale: use the workspace bar above
        </span>
        <select
          className={fieldCls + ' w-auto'}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">published</option>
          <option value="draft">draft / partial</option>
          <option value="missing">missing</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      <AdminHomeSectionEditor
        editor={editor}
        setEditor={setEditor}
        market={market}
        locale={locale}
        saving={saving}
        showAdvancedJson={showAdvancedJson}
        onClose={() => {
          setEditor(null)
          setEditingId(null)
        }}
        onSave={saveEditor}
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Order</th>
              <th className="px-2 py-2 font-medium">Section</th>
              <th className="px-2 py-2 font-medium">Section Type</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Last Updated</th>
              <th className="px-2 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : logicalRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-muted-foreground">
                  No Home sections for this market/locale
                </td>
              </tr>
            ) : (
              logicalRows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t border-border hover:bg-muted/30 ${
                    editingId === row.id ? 'bg-orange-50/40' : ''
                  }`}
                >
                  <td className="px-2 py-1.5 tabular-nums">{row.def.order}</td>
                  <td className="px-2 py-1.5 font-medium">{row.def.label}</td>
                  <td className="px-2 py-1.5 font-mono text-[10px]">{row.def.type}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        row.status === 'published'
                          ? 'rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800'
                          : row.status === 'missing'
                            ? 'rounded bg-slate-100 px-1.5 py-0.5 text-slate-600'
                            : 'rounded bg-amber-100 px-1.5 py-0.5 text-amber-900'
                      }
                    >
                      {row.status === 'published'
                        ? 'Published'
                        : row.status === 'missing'
                          ? 'Missing'
                          : row.status === 'partial'
                            ? 'Partial'
                            : 'Draft'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">{row.updatedLabel}</td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      className={btnOutline}
                      disabled={row.status === 'missing'}
                      onClick={() => openEdit(row)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        Showing {logicalRows.length} Home main sections
        {effectiveMarket ? ` · ${effectiveMarket}` : ''}
        {effectiveLocale ? ` / ${effectiveLocale}` : ''}.
      </p>
    </div>
  )
}
