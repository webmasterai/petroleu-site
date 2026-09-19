import { useCallback, useEffect, useState } from 'react'
import { adminGet, adminPost } from '../../services/cmsAdminApi'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls = 'admin-input'
const btnPrimary = 'admin-btn-primary text-xs'
const btnOutline = 'admin-btn-secondary text-xs'

const EMPTY = {
  market_code: 'pk',
  locale_code: 'en',
  path: '/',
  title: '',
  description: '',
  keywords: '',
  canonical_url: '',
  og_title: '',
  og_description: '',
  og_image: '',
  og_locale: '',
  noindex: false,
  status: 'draft',
  is_shared: false,
}

export default function AdminSeoPage() {
  const [filters, setFilters] = useState({ market: 'pk', locale: '' })
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.market) params.market = filters.market
      if (filters.locale) params.locale = filters.locale
      const res = await adminGet('/seo', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load SEO')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  function editRow(row) {
    setForm({
      market_code: row.market_code || 'pk',
      locale_code: row.locale_code || 'en',
      path: row.path || '/',
      title: row.title || '',
      description: row.description || '',
      keywords: row.keywords || '',
      canonical_url: row.canonical_url || '',
      og_title: row.og_title || '',
      og_description: row.og_description || '',
      og_image: row.og_image || '',
      og_locale: row.og_locale || '',
      noindex: Boolean(row.noindex),
      status: row.status || 'draft',
      is_shared: Boolean(row.is_shared),
    })
  }

  async function upsert(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminPost('/seo', {
        ...form,
        title: form.title || null,
        description: form.description || null,
        keywords: form.keywords || null,
        canonical_url: form.canonical_url || null,
        og_title: form.og_title || null,
        og_description: form.og_description || null,
        og_image: form.og_image || null,
        og_locale: form.og_locale || null,
        noindex: Boolean(form.noindex),
        is_shared: Boolean(form.is_shared),
      })
      setMessage('SEO entry saved')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">SEO</h1>
      <p className="text-sm text-muted-foreground">List and upsert SEO entries</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          className={fieldCls + ' w-auto'}
          value={filters.market}
          onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value }))}
        >
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
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <form onSubmit={upsert} className="mt-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">Upsert SEO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            ['market_code', 'Market'],
            ['locale_code', 'Locale'],
            ['path', 'Path'],
            ['title', 'Title'],
            ['keywords', 'Keywords'],
            ['canonical_url', 'Canonical URL'],
            ['og_title', 'OG title'],
            ['og_image', 'OG image'],
            ['og_locale', 'OG locale'],
          ].map(([key, label]) => (
            <label key={key} className="block text-xs">
              <span className="text-muted-foreground">{label}</span>
              <input
                className={fieldCls + ' mt-1'}
                required={['market_code', 'locale_code', 'path'].includes(key)}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-xs sm:col-span-2">
            <span className="text-muted-foreground">Description</span>
            <textarea
              className={fieldCls + ' mt-1 min-h-[60px]'}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="text-muted-foreground">OG description</span>
            <textarea
              className={fieldCls + ' mt-1 min-h-[60px]'}
              value={form.og_description}
              onChange={(e) => setForm((f) => ({ ...f, og_description: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Status</span>
            <select
              className={fieldCls + ' mt-1'}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs mt-5">
            <input
              type="checkbox"
              checked={form.noindex}
              onChange={(e) => setForm((f) => ({ ...f, noindex: e.target.checked }))}
            />
            Noindex
          </label>
          <label className="flex items-center gap-2 text-xs mt-5">
            <input
              type="checkbox"
              checked={form.is_shared}
              onChange={(e) => setForm((f) => ({ ...f, is_shared: e.target.checked }))}
            />
            Shared
          </label>
        </div>
        <button type="submit" className={btnPrimary + ' mt-3'} disabled={saving}>
          Save
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Path</th>
              <th className="px-2 py-2 font-medium">Title</th>
              <th className="px-2 py-2 font-medium">Locale</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-muted-foreground">
                  No SEO entries
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id ?? `${row.market_code}-${row.locale_code}-${row.path}`} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono">{row.path}</td>
                  <td className="px-2 py-1.5 max-w-[220px] truncate">{row.title || '—'}</td>
                  <td className="px-2 py-1.5">{row.locale_code}</td>
                  <td className="px-2 py-1.5">{row.status}</td>
                  <td className="px-2 py-1.5">
                    <button type="button" className={btnOutline} onClick={() => editRow(row)}>
                      Edit
                    </button>
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
