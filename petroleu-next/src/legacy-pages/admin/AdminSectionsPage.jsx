import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  adminDelete,
  adminGet,
  adminPost,
  adminPut,
} from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const EMPTY_FORM = {
  market_code: 'pk',
  locale_code: 'en-PK',
  page_slug: 'home',
  section_key: '',
  frontend_path: '/',
  title: '',
  description: '',
  content: '',
  data: '{}',
  image_url: '',
  image_alt: '',
  link_label: '',
  link_url: '',
  sort_order: 0,
  is_enabled: true,
  status: 'draft',
  is_shared: false,
  translation_status: 'ready',
}

const fieldCls =
  'w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
const btnPrimary =
  'rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
const btnOutline =
  'rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50'
const btnDanger =
  'rounded-md border border-destructive/40 text-destructive px-2.5 py-1.5 text-xs hover:bg-destructive/10 disabled:opacity-50'

function sectionToForm(s) {
  return {
    market_code: s.market_code ?? 'pk',
    locale_code: s.locale_code ?? 'en-PK',
    page_slug: s.page_slug ?? '',
    section_key: s.section_key ?? '',
    title: s.title ?? '',
    description: s.description ?? '',
    content: s.content ?? '',
    data:
      typeof s.data === 'string'
        ? s.data
        : JSON.stringify(s.data ?? {}, null, 2),
    image_url: s.image_url ?? '',
    image_alt: s.image_alt ?? '',
    link_label: s.link_label ?? '',
    link_url: s.link_url ?? '',
    sort_order: s.sort_order ?? 0,
    is_enabled: Boolean(s.is_enabled ?? true),
    status: s.status ?? 'draft',
    is_shared: Boolean(s.is_shared),
  }
}

function formToPayload(form) {
  let data
  try {
    data = form.data.trim() ? JSON.parse(form.data) : null
  } catch {
    throw new Error('Invalid JSON in data field')
  }
  return {
    market_code: form.market_code,
    locale_code: form.locale_code,
    page_slug: form.page_slug,
    section_key: form.section_key,
    title: form.title || null,
    description: form.description || null,
    content: form.content || null,
    data,
    image_url: form.image_url || null,
    image_alt: form.image_alt || null,
    link_label: form.link_label || null,
    link_url: form.link_url || null,
    sort_order: Number(form.sort_order) || 0,
    is_enabled: Boolean(form.is_enabled),
    status: form.status,
    is_shared: Boolean(form.is_shared),
  }
}

export default function AdminSectionsPage() {
  const { market, locale, showAll } = useAdminWorkspace()
  const [filters, setFilters] = useState({
    market: '',
    locale: '',
    page_slug: '',
    status: '',
  })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (showAll) {
      setFilters((f) => ({ ...f, market: '', locale: '' }))
    } else {
      setFilters((f) => ({ ...f, market, locale }))
    }
  }, [market, locale, showAll])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.market) params.market = filters.market
      if (filters.locale) params.locale = filters.locale
      if (filters.page_slug) params.page = filters.page_slug
      if (filters.status) params.status = filters.status
      const res = await adminGet('/sections', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [items]
  )

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, market_code: market || 'pk', locale_code: locale || 'en-PK' })
    setShowForm(true)
    setPreview(null)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm(sectionToForm(row))
    setShowForm(true)
    setPreview(null)
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function saveDraft() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = { ...formToPayload(form), status: 'draft' }
      if (editingId) {
        await adminPut(`/sections/${editingId}`, payload)
        setForm((prev) => ({ ...prev, status: 'draft' }))
        setMessage('Saved as draft — publish to update the live website.')
      } else {
        const created = await adminPost('/sections', payload)
        setEditingId(created?.id ?? null)
        setForm((prev) => ({ ...prev, status: 'draft' }))
        setMessage('Saved as draft — publish to update the live website.')
      }
      await load()
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function publish(id) {
    setError('')
    setMessage('')
    try {
      if (showForm && editingId === id) {
        const payload = { ...formToPayload(form), status: 'published' }
        await adminPut(`/sections/${id}`, payload)
        setForm((prev) => ({ ...prev, status: 'published' }))
      }
      await adminPost(`/sections/${id}/publish`)
      setMessage('Published successfully.')
      await load()
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Publish failed')
    }
  }

  async function unpublish(id) {
    setError('')
    setMessage('')
    try {
      await adminPost(`/sections/${id}/unpublish`)
      if (editingId === id) setForm((prev) => ({ ...prev, status: 'draft' }))
      setMessage('Unpublished — section is draft and no longer live.')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unpublish failed')
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this section?')) return
    setError('')
    try {
      await adminDelete(`/sections/${id}`)
      setMessage('Deleted')
      if (editingId === id) setShowForm(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed')
    }
  }

  async function move(row, direction) {
    const list = [...sorted]
    const idx = list.findIndex((s) => s.id === row.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return
    const a = list[idx]
    const b = list[swapIdx]
    const itemsPayload = [
      { id: a.id, sort_order: b.sort_order ?? swapIdx },
      { id: b.id, sort_order: a.sort_order ?? idx },
    ]
    try {
      await adminPost('/sections/reorder', { items: itemsPayload })
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Reorder failed')
    }
  }

  async function showPreview(id) {
    setError('')
    try {
      const data = await adminGet(`/sections/${id}/preview`)
      setPreview(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Preview failed')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Sections</h1>
          <p className="text-sm text-muted-foreground">
            Filtered by workspace (use “Show all markets/locales” to override). Save stores a draft;
            Publish is required for the live website. Homepage CTAs use page_slug{' '}
            <code className="text-xs">home-mid</code> / <code className="text-xs">home-bottom</code>{' '}
            (not <code className="text-xs">home</code>).
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          New section
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          className={fieldCls + ' w-auto'}
          value={filters.market}
          onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value }))}
        >
          <option value="">All markets</option>
          <option value="pk">pk</option>
          <option value="af">af</option>
          <option value="shared">shared</option>
        </select>
        <input
          className={fieldCls + ' w-28'}
          placeholder="Locale"
          value={filters.locale}
          onChange={(e) => setFilters((f) => ({ ...f, locale: e.target.value }))}
        />
        <input
          className={fieldCls + ' w-36'}
          placeholder="Page slug"
          value={filters.page_slug}
          onChange={(e) => setFilters((f) => ({ ...f, page_slug: e.target.value }))}
        />
        <select
          className={fieldCls + ' w-auto'}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive whitespace-pre-wrap">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}

      {showForm ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold">{editingId ? `Edit #${editingId}` : 'Create section'}</h2>
            <button type="button" className={btnOutline} onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['market_code', 'Market'],
              ['locale_code', 'Locale'],
              ['page_slug', 'Page slug'],
              ['section_key', 'Section key'],
              ['title', 'Title'],
              ['image_url', 'Image URL'],
              ['image_alt', 'Image alt'],
              ['link_label', 'Link label'],
              ['link_url', 'Link URL'],
              ['sort_order', 'Sort order'],
            ].map(([key, label]) => (
              <label key={key} className="block text-xs">
                <span className="text-muted-foreground">{label}</span>
                <input
                  className={fieldCls + ' mt-1'}
                  type={key === 'sort_order' ? 'number' : 'text'}
                  value={form[key]}
                  onChange={(e) =>
                    setField(key, key === 'sort_order' ? e.target.value : e.target.value)
                  }
                />
              </label>
            ))}
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Description</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[60px]'}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </label>
            <label className="block text-xs sm:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Content</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[80px] font-mono text-xs'}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
              />
            </label>
            <details className="sm:col-span-2 lg:col-span-3 rounded-md border border-border p-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Advanced only — raw data JSON (prefer Pages → Edit page for normal content/images)
              </summary>
              <textarea
                className={fieldCls + ' mt-2 min-h-[100px] font-mono text-xs'}
                value={form.data}
                onChange={(e) => setField('data', e.target.value)}
              />
            </details>
            <label className="flex items-center gap-2 text-xs mt-2">
              <input
                type="checkbox"
                checked={form.is_enabled}
                onChange={(e) => setField('is_enabled', e.target.checked)}
              />
              Enabled
            </label>
            <label className="flex items-center gap-2 text-xs mt-2">
              <input
                type="checkbox"
                checked={form.is_shared}
                onChange={(e) => setField('is_shared', e.target.checked)}
              />
              Shared
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Status</span>
              <select
                className={fieldCls + ' mt-1'}
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                disabled
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Use Save draft / Publish / Unpublish — do not edit status directly.
              </span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} disabled={saving} onClick={saveDraft}>
              Save draft
            </button>
            {editingId ? (
              <>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={() => publish(editingId)}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={async () => {
                    try {
                      await adminPost(`/sections/${editingId}/duplicate`)
                      setMessage('Duplicated as draft')
                      await load()
                    } catch (err) {
                      setError(err?.response?.data?.message || 'Duplicate failed')
                    }
                  }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className={btnOutline}
                  onClick={() => unpublish(editingId)}
                >
                  Unpublish
                </button>
                <button type="button" className={btnOutline} onClick={() => showPreview(editingId)}>
                  Preview
                </button>
                <button type="button" className={btnDanger} onClick={() => remove(editingId)}>
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Preview JSON</h3>
            <button type="button" className={btnOutline} onClick={() => setPreview(null)}>
              Close
            </button>
          </div>
          <pre className="text-xs overflow-auto max-h-80 whitespace-pre-wrap font-mono">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Order</th>
              <th className="px-2 py-2 font-medium">Key</th>
              <th className="px-2 py-2 font-medium">Page</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">Locale</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Title</th>
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-2 py-4 text-muted-foreground">
                  No sections found
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-2 py-1.5 tabular-nums">{row.sort_order ?? idx}</td>
                  <td className="px-2 py-1.5 font-mono">{row.section_key}</td>
                  <td className="px-2 py-1.5">{row.page_slug}</td>
                  <td className="px-2 py-1.5">{row.market_code}</td>
                  <td className="px-2 py-1.5">{row.locale_code}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        row.status === 'published'
                          ? 'rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800'
                          : 'rounded bg-amber-100 px-1.5 py-0.5 text-amber-900'
                      }
                    >
                      {row.status === 'published' ? 'Published' : 'Draft'}
                      {row.is_enabled === false ? ' (disabled)' : ''}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 max-w-[160px] truncate">{row.title || '—'}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className={btnOutline} onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className={btnOutline} onClick={() => move(row, 'up')}>
                        ↑
                      </button>
                      <button type="button" className={btnOutline} onClick={() => move(row, 'down')}>
                        ↓
                      </button>
                      <button type="button" className={btnOutline} onClick={() => publish(row.id)}>
                        Publish
                      </button>
                      <button type="button" className={btnOutline} onClick={() => unpublish(row.id)}>
                        Unpublish
                      </button>
                      <button type="button" className={btnOutline} onClick={() => showPreview(row.id)}>
                        Preview
                      </button>
                      <button type="button" className={btnDanger} onClick={() => remove(row.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
