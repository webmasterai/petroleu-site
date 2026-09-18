import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
const btnPrimary =
  'rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
const btnOutline =
  'rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50'

const STATUS_BADGE = {
  published: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-900',
  missing: 'bg-muted text-muted-foreground',
  needs_review: 'bg-orange-100 text-orange-900',
}

function badge(label, tone = 'missing') {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[tone] || STATUS_BADGE.missing}`}>
      {label}
    </span>
  )
}

function sectionLabel(section) {
  const key = section.section_key || 'section'
  const title = section.title ? ` — ${section.title}` : ''
  return `${key}${title}`
}

/** Split section.data into friendly editors (no raw JSON shown). */
function parseDataForEditor(data) {
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  const simple = {}
  const listStrings = {}
  let testimonialItems = null

  if (Array.isArray(data)) {
    testimonialItems = data.map((item) => ({
      name: item?.name || '',
      role: item?.role || '',
      city: item?.city || '',
      rating: item?.rating ?? 5,
      date: item?.date || '',
      content: item?.content || '',
    }))
    return { simple, listStrings, testimonialItems, rest: null }
  }

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      simple[key] = value
    } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      listStrings[key] = value
    } else if (
      Array.isArray(value) &&
      value.length &&
      value.every((v) => v && typeof v === 'object' && ('name' in v || 'content' in v))
    ) {
      testimonialItems = value.map((item) => ({
        name: item?.name || '',
        role: item?.role || '',
        city: item?.city || '',
        rating: item?.rating ?? 5,
        date: item?.date || '',
        content: item?.content || '',
      }))
    }
    // Complex nested objects are preserved via originalData on the block
  }

  return { simple, listStrings, testimonialItems, rest: null }
}

function buildDataPayload(block, originalData) {
  if (block.testimonialItems) {
    return block.testimonialItems.map((item) => ({
      name: item.name || '',
      role: item.role || '',
      city: item.city || '',
      rating: Number(item.rating) || 5,
      date: item.date || '',
      content: item.content || '',
    }))
  }

  const base =
    originalData && typeof originalData === 'object' && !Array.isArray(originalData)
      ? { ...originalData }
      : {}

  for (const [key, value] of Object.entries(block.simple || {})) {
    base[key] = value
  }
  for (const [key, value] of Object.entries(block.listStrings || {})) {
    base[key] = value
  }
  return Object.keys(base).length ? base : null
}

function sectionToBlock(section) {
  const parsed = parseDataForEditor(section.data)
  return {
    id: section.id,
    section_key: section.section_key || '',
    page_slug: section.page_slug || '',
    market_code: section.market_code,
    locale_code: section.locale_code,
    sort_order: section.sort_order ?? 0,
    title: section.title || '',
    description: section.description || '',
    content: section.content || '',
    image_url: section.image_url || '',
    image_alt: section.image_alt || '',
    link_label: section.link_label || '',
    link_url: section.link_url || '',
    is_enabled: section.is_enabled !== false,
    status: section.status || 'draft',
    simple: parsed.simple,
    listStrings: parsed.listStrings,
    testimonialItems: parsed.testimonialItems,
    originalData: section.data ?? null,
  }
}

function relatedPageSlugs(slug) {
  if (slug === 'home') return ['home', 'home-mid', 'home-bottom']
  return [slug]
}

export default function AdminPagesPage() {
  const { market, locale, showAll, localeOptions } = useAdminWorkspace()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  /** Full page editor state */
  const [editor, setEditor] = useState(null)
  /** { pageMeta, blocks[], translationId } */

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { group: 1 }
      if (!showAll) params.market = market
      if (q) params.q = q
      if (status) params.status = status
      const res = await adminGet('/pages', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [market, showAll, q, status])

  useEffect(() => {
    load()
  }, [load])

  const expectedLocales = showAll
    ? ['en-PK', 'fa-AF', 'ps-AF', 'en-AF']
    : localeOptions.map((o) => o.value)

  async function openPageEditor(row, translation) {
    setError('')
    setMessage('')
    try {
      const m = translation.market_code || row.market_code || market
      const loc = translation.locale_code || locale
      const slug = row.slug
      const slugs = relatedPageSlugs(slug)

      const sectionLists = await Promise.all(
        slugs.map((pageSlug) =>
          adminGet('/sections', { params: { market: m, locale: loc, page: pageSlug } }),
        ),
      )
      const sections = sectionLists.flatMap((res) => asList(res))
      sections.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

      setEditor({
        translationId: translation.id,
        market_code: m,
        locale_code: loc,
        slug,
        title: translation.title || row.title || slug,
        description: translation.description || '',
        status: translation.status || 'draft',
        is_enabled: translation.is_enabled !== false,
        blocks: sections.map(sectionToBlock),
      })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to open page editor')
    }
  }

  function updateBlock(index, patch) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b))
      return { ...prev, blocks }
    })
  }

  function updateSimpleField(index, key, value) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) =>
        i === index ? { ...b, simple: { ...b.simple, [key]: value } } : b,
      )
      return { ...prev, blocks }
    })
  }

  function updateListStringField(index, key, text) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) =>
        i === index ? { ...b, listStrings: { ...b.listStrings, [key]: lines } } : b,
      )
      return { ...prev, blocks }
    })
  }

  function updateTestimonial(index, tIndex, patch) {
    setEditor((prev) => {
      if (!prev) return prev
      const blocks = prev.blocks.map((b, i) => {
        if (i !== index || !b.testimonialItems) return b
        const testimonialItems = b.testimonialItems.map((t, j) =>
          j === tIndex ? { ...t, ...patch } : t,
        )
        return { ...b, testimonialItems }
      })
      return { ...prev, blocks }
    })
  }

  async function saveAndPublish() {
    if (!editor) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminPut(`/pages/${editor.translationId}`, {
        title: editor.title,
        description: editor.description || null,
        is_enabled: Boolean(editor.is_enabled),
        status: 'published',
      })

      for (const block of editor.blocks) {
        if (!block.id) continue
        const payload = {
          market_code: block.market_code,
          locale_code: block.locale_code,
          page_slug: block.page_slug,
          section_key: block.section_key,
          title: block.title || null,
          description: block.description || null,
          content: block.content || null,
          data: buildDataPayload(block, block.originalData),
          image_url: block.image_url || null,
          image_alt: block.image_alt || null,
          link_label: block.link_label || null,
          link_url: block.link_url || null,
          sort_order: Number(block.sort_order) || 0,
          is_enabled: Boolean(block.is_enabled),
          status: 'published',
        }
        await adminPut(`/sections/${block.id}`, payload)
        await adminPost(`/sections/${block.id}/publish`)
      }

      setMessage('Page saved and published — live website updated.')
      setEditor((prev) => (prev ? { ...prev, status: 'published' } : prev))
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save & publish failed')
    } finally {
      setSaving(false)
    }
  }

  const editorSummary = useMemo(() => {
    if (!editor) return ''
    return `${editor.slug} · ${editor.market_code} · ${editor.locale_code}`
  }, [editor])

  if (editor) {
    return (
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <button type="button" className={btnOutline} onClick={() => setEditor(null)}>
              ← Back to pages
            </button>
            <h1 className="mt-3 text-lg font-semibold tracking-tight">Edit page</h1>
            <p className="text-sm text-muted-foreground">
              {editorSummary} — edit all content and images here. No JSON. Click Save &amp; Publish to
              update the live site.
            </p>
          </div>
          <button type="button" className={btnPrimary} disabled={saving} onClick={saveAndPublish}>
            {saving ? 'Publishing…' : 'Save & Publish'}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

        <div className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Page details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Page title</span>
              <input
                className={fieldCls + ' mt-1'}
                value={editor.title}
                onChange={(e) => setEditor((p) => ({ ...p, title: e.target.value }))}
              />
            </label>
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Page description</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[60px]'}
                value={editor.description}
                onChange={(e) => setEditor((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
          </div>
        </div>

        {editor.blocks.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No content blocks found for this page yet. Content may still be seeded under Sections for
            another market/locale.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {editor.blocks.map((block, index) => (
              <div key={block.id || index} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold capitalize">
                    {sectionLabel(block).replace(/:/g, ' · ')}
                  </h3>
                  {badge(block.status === 'published' ? 'Published' : 'Draft', block.status)}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">Title / heading</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.title}
                      onChange={(e) => updateBlock(index, { title: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">Description</span>
                    <textarea
                      className={fieldCls + ' mt-1 min-h-[60px]'}
                      value={block.description}
                      onChange={(e) => updateBlock(index, { description: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-2">
                    <span className="text-muted-foreground">Content</span>
                    <textarea
                      className={fieldCls + ' mt-1 min-h-[80px]'}
                      value={block.content}
                      onChange={(e) => updateBlock(index, { content: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Image URL</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.image_url}
                      onChange={(e) => updateBlock(index, { image_url: e.target.value })}
                      placeholder="/uploads/... or https://..."
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Image alt text</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.image_alt}
                      onChange={(e) => updateBlock(index, { image_alt: e.target.value })}
                    />
                  </label>
                  {block.image_url ? (
                    <div className="sm:col-span-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.image_url}
                        alt={block.image_alt || block.title || 'Preview'}
                        className="max-h-40 rounded-md border border-border object-contain bg-muted/30"
                      />
                    </div>
                  ) : null}
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Button / link label</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.link_label}
                      onChange={(e) => updateBlock(index, { link_label: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="text-muted-foreground">Button / link URL</span>
                    <input
                      className={fieldCls + ' mt-1'}
                      value={block.link_url}
                      onChange={(e) => updateBlock(index, { link_url: e.target.value })}
                    />
                  </label>

                  {Object.entries(block.simple || {}).map(([key, value]) => (
                    <label key={key} className="block text-xs">
                      <span className="text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                      <input
                        className={fieldCls + ' mt-1'}
                        value={String(value ?? '')}
                        onChange={(e) => updateSimpleField(index, key, e.target.value)}
                      />
                    </label>
                  ))}

                  {Object.entries(block.listStrings || {}).map(([key, lines]) => (
                    <label key={key} className="block text-xs sm:col-span-2">
                      <span className="text-muted-foreground">
                        {key.replace(/_/g, ' ')} (one item per line)
                      </span>
                      <textarea
                        className={fieldCls + ' mt-1 min-h-[90px]'}
                        value={(lines || []).join('\n')}
                        onChange={(e) => updateListStringField(index, key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>

                {block.testimonialItems ? (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground">Testimonials</h4>
                    {block.testimonialItems.map((t, tIndex) => (
                      <div key={tIndex} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                        <input
                          className={fieldCls}
                          placeholder="Name"
                          value={t.name}
                          onChange={(e) => updateTestimonial(index, tIndex, { name: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="Role"
                          value={t.role}
                          onChange={(e) => updateTestimonial(index, tIndex, { role: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="City"
                          value={t.city}
                          onChange={(e) => updateTestimonial(index, tIndex, { city: e.target.value })}
                        />
                        <input
                          className={fieldCls}
                          placeholder="Date"
                          value={t.date}
                          onChange={(e) => updateTestimonial(index, tIndex, { date: e.target.value })}
                        />
                        <textarea
                          className={fieldCls + ' sm:col-span-2 min-h-[70px]'}
                          placeholder="Quote"
                          value={t.content}
                          onChange={(e) =>
                            updateTestimonial(index, tIndex, { content: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="sticky bottom-3 mt-6 flex justify-end">
          <button type="button" className={btnPrimary} disabled={saving} onClick={saveAndPublish}>
            {saving ? 'Publishing…' : 'Save & Publish'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Click a page to open the full editor — change content and images in one place, then Save
            &amp; Publish.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className={fieldCls + ' w-48'}
          placeholder="Search slug/title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldCls + ' w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="published">published</option>
          <option value="draft">draft</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Page</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">Languages</th>
              <th className="px-2 py-2 font-medium">Open editor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-muted-foreground">
                  No pages for this workspace
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const byLocale = Object.fromEntries((row.translations || []).map((t) => [t.locale_code, t]))
                return (
                  <tr key={row.logical_key || row.id} className="border-t border-border align-top">
                    <td className="px-2 py-2">
                      <div className="font-medium">{row.title || row.slug}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{row.slug}</div>
                    </td>
                    <td className="px-2 py-2">{row.market_code}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1.5">
                        {expectedLocales.map((loc) => {
                          const t = byLocale[loc]
                          if (!t) return <span key={loc}>{badge(`${loc}: Missing`, 'missing')}</span>
                          const tone =
                            t.translation_status === 'needs_review'
                              ? 'needs_review'
                              : t.status === 'published'
                                ? 'published'
                                : 'draft'
                          return (
                            <button
                              key={loc}
                              type="button"
                              className="text-left"
                              onClick={() => openPageEditor(row, t)}
                              title="Open full page editor"
                            >
                              {badge(
                                `${loc}: ${t.status}${t.translation_status === 'needs_review' ? ' · review' : ''}`,
                                tone,
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {byLocale[locale] ? (
                        <button
                          type="button"
                          className={btnPrimary}
                          onClick={() => openPageEditor(row, byLocale[locale])}
                        >
                          Edit page
                        </button>
                      ) : (
                        <span className="text-muted-foreground">Add {locale} translation first</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
