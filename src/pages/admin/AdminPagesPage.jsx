import { useCallback, useEffect, useState } from 'react'
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
  ready: 'bg-sky-100 text-sky-900',
}

function badge(label, tone = 'missing') {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[tone] || STATUS_BADGE.missing}`}>
      {label}
    </span>
  )
}

export default function AdminPagesPage() {
  const { market, locale, showAll, localeOptions } = useAdminWorkspace()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [items, setItems] = useState([])
  const [form, setForm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { group: 1 }
      if (!showAll) {
        params.market = market
      }
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

  function openCreate() {
    setEditingId(null)
    setForm({
      market_code: market,
      locale_code: locale,
      slug: '',
      title: '',
      description: '',
      template: 'default',
      is_enabled: true,
      status: 'draft',
      is_shared: false,
    })
  }

  function openEdit(translation) {
    setEditingId(translation.id)
    setForm({
      market_code: translation.market_code || market,
      locale_code: translation.locale_code || locale,
      slug: translation.slug || '',
      title: translation.title || '',
      description: translation.description || '',
      template: translation.template || 'default',
      is_enabled: Boolean(translation.is_enabled ?? true),
      status: translation.status || 'draft',
      is_shared: Boolean(translation.is_shared),
    })
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (editingId) {
        await adminPut(`/pages/${editingId}`, {
          title: form.title,
          description: form.description || null,
          template: form.template || null,
          is_enabled: Boolean(form.is_enabled),
          status: form.status,
          is_shared: Boolean(form.is_shared),
        })
        setMessage('Page updated')
      } else {
        await adminPost('/pages', form)
        setMessage('Page created')
      }
      setForm(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const expectedLocales = showAll
    ? ['en-PK', 'fa-AF', 'ps-AF', 'en-AF']
    : localeOptions.map((o) => o.value)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">
            One logical page per market slug — translations shown as language badges
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          New page
        </button>
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

      {form ? (
        <form onSubmit={save} className="mt-4 rounded-lg border border-border bg-card p-4 max-w-2xl space-y-3">
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold">{editingId ? `Edit #${editingId}` : 'Create page translation'}</h2>
            <button type="button" className={btnOutline} onClick={() => setForm(null)}>
              Close
            </button>
          </div>
          {!editingId ? (
            <div className="grid sm:grid-cols-3 gap-2">
              <input className={fieldCls} value={form.market_code} onChange={(e) => setForm({ ...form, market_code: e.target.value })} placeholder="market" required />
              <input className={fieldCls} value={form.locale_code} onChange={(e) => setForm({ ...form, locale_code: e.target.value })} placeholder="locale" required />
              <input className={fieldCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" required />
            </div>
          ) : null}
          <input className={fieldCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea className={fieldCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <div className="flex gap-2 items-center">
            <select className={fieldCls + ' w-auto'} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <button type="submit" className={btnPrimary} disabled={saving}>
              Save
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Slug</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">Languages</th>
              <th className="px-2 py-2 font-medium">Actions</th>
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
                    <td className="px-2 py-2 font-mono">{row.slug}</td>
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
                              onClick={() =>
                                openEdit({
                                  ...t,
                                  market_code: row.market_code,
                                  slug: row.slug,
                                  template: row.template,
                                  is_enabled: row.is_enabled,
                                })
                              }
                              title="Edit translation"
                            >
                              {badge(`${loc}: ${t.status}${t.translation_status === 'needs_review' ? ' · review' : ''}`, tone)}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      {byLocale[locale] ? (
                        <button type="button" className={btnOutline} onClick={() => openEdit({ ...byLocale[locale], market_code: row.market_code, slug: row.slug })}>
                          Edit {locale}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={btnOutline}
                          onClick={() => {
                            setEditingId(null)
                            setForm({
                              market_code: row.market_code,
                              locale_code: locale,
                              slug: row.slug,
                              title: row.title || row.slug,
                              description: '',
                              template: row.template || 'default',
                              is_enabled: true,
                              status: 'draft',
                              is_shared: false,
                            })
                          }}
                        >
                          Add {locale}
                        </button>
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
