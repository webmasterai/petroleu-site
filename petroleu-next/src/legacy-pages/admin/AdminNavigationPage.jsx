import { useCallback, useEffect, useState } from 'react'
import { adminDelete, adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls = 'admin-input'
const btnPrimary = 'admin-btn-primary text-xs'
const btnOutline = 'admin-btn-secondary text-xs'
const btnDanger = 'rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50'

const EMPTY = {
  market_code: 'pk',
  locale_code: 'en',
  location: 'header',
  label: '',
  url: '',
  parent_id: '',
  sort_order: 0,
  is_enabled: true,
  status: 'published',
  is_shared: false,
}

export default function AdminNavigationPage() {
  const [filters, setFilters] = useState({ market: 'pk', locale: '', location: '' })
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
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
      if (filters.location) params.location = filters.location
      const res = await adminGet('/navigation', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load navigation')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY, market_code: filters.market || 'pk' })
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      market_code: row.market_code || 'pk',
      locale_code: row.locale_code || 'en',
      location: row.location || 'header',
      label: row.label || '',
      url: row.url || '',
      parent_id: row.parent_id ?? '',
      sort_order: row.sort_order ?? 0,
      is_enabled: Boolean(row.is_enabled ?? true),
      status: row.status || 'published',
      is_shared: Boolean(row.is_shared),
    })
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        market_code: form.market_code,
        locale_code: form.locale_code,
        location: form.location,
        label: form.label,
        url: form.url || null,
        parent_id: form.parent_id === '' ? null : Number(form.parent_id),
        sort_order: Number(form.sort_order) || 0,
        is_enabled: Boolean(form.is_enabled),
        status: form.status,
        is_shared: Boolean(form.is_shared),
      }
      if (editingId) {
        const { market_code, locale_code, location, ...updatePayload } = payload
        await adminPut(`/navigation/${editingId}`, updatePayload)
        setMessage('Updated')
      } else {
        await adminPost('/navigation', payload)
        setMessage('Created')
      }
      setEditingId(null)
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this nav item?')) return
    try {
      await adminDelete(`/navigation/${id}`)
      setMessage('Deleted')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Navigation</h1>
          <p className="text-sm text-muted-foreground">Header / footer / mega menu items</p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          New item
        </button>
      </div>

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
        <select
          className={fieldCls + ' w-auto'}
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        >
          <option value="">All locations</option>
          <option value="header">header</option>
          <option value="footer">footer</option>
          <option value="mega">mega</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <form onSubmit={save} className="mt-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold mb-3">{editingId ? `Edit #${editingId}` : 'Create nav item'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {!editingId ? (
            <>
              <label className="block text-xs">
                <span className="text-muted-foreground">Market</span>
                <input
                  className={fieldCls + ' mt-1'}
                  required
                  value={form.market_code}
                  onChange={(e) => setForm((f) => ({ ...f, market_code: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                <span className="text-muted-foreground">Locale</span>
                <input
                  className={fieldCls + ' mt-1'}
                  required
                  value={form.locale_code}
                  onChange={(e) => setForm((f) => ({ ...f, locale_code: e.target.value }))}
                />
              </label>
              <label className="block text-xs">
                <span className="text-muted-foreground">Location</span>
                <select
                  className={fieldCls + ' mt-1'}
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                >
                  <option value="header">header</option>
                  <option value="footer">footer</option>
                  <option value="mega">mega</option>
                </select>
              </label>
            </>
          ) : null}
          <label className="block text-xs">
            <span className="text-muted-foreground">Label</span>
            <input
              className={fieldCls + ' mt-1'}
              required
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">URL</span>
            <input
              className={fieldCls + ' mt-1'}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Parent ID</span>
            <input
              className={fieldCls + ' mt-1'}
              type="number"
              value={form.parent_id}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Sort order</span>
            <input
              className={fieldCls + ' mt-1'}
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
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
              checked={form.is_enabled}
              onChange={(e) => setForm((f) => ({ ...f, is_enabled: e.target.checked }))}
            />
            Enabled
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
        <div className="mt-3 flex gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId ? (
            <button type="button" className={btnOutline} onClick={openCreate}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Order</th>
              <th className="px-2 py-2 font-medium">Label</th>
              <th className="px-2 py-2 font-medium">URL</th>
              <th className="px-2 py-2 font-medium">Location</th>
              <th className="px-2 py-2 font-medium">Locale</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-4 text-muted-foreground">
                  No nav items
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-2 py-1.5">{row.sort_order}</td>
                  <td className="px-2 py-1.5">{row.label}</td>
                  <td className="px-2 py-1.5 font-mono max-w-[180px] truncate">{row.url || '—'}</td>
                  <td className="px-2 py-1.5">{row.location}</td>
                  <td className="px-2 py-1.5">{row.locale_code}</td>
                  <td className="px-2 py-1.5">{row.status}</td>
                  <td className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button type="button" className={btnOutline} onClick={() => openEdit(row)}>
                        Edit
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
