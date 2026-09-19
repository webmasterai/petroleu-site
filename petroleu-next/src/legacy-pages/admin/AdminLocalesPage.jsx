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
  code: '',
  name: '',
  native_name: '',
  dir: 'ltr',
  font_stack: '',
  is_active: true,
}

export default function AdminLocalesPage() {
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
      const res = await adminGet('/locales')
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load locales')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createLocale(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminPost('/locales', {
        code: form.code.trim(),
        name: form.name.trim(),
        native_name: form.native_name.trim() || null,
        dir: form.dir,
        font_stack: form.font_stack.trim() || null,
        is_active: Boolean(form.is_active),
      })
      setMessage('Locale created')
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Locales</h1>
      <p className="text-sm text-muted-foreground">Available languages and text direction</p>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <form onSubmit={createLocale} className="mt-4 rounded-lg border border-border bg-card p-4 max-w-xl">
        <h2 className="text-sm font-semibold mb-3">Create locale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-xs">
            <span className="text-muted-foreground">Code</span>
            <input
              className={fieldCls + ' mt-1'}
              required
              placeholder="en"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Name</span>
            <input
              className={fieldCls + ' mt-1'}
              required
              placeholder="English"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Native name</span>
            <input
              className={fieldCls + ' mt-1'}
              value={form.native_name}
              onChange={(e) => setForm((f) => ({ ...f, native_name: e.target.value }))}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted-foreground">Direction</span>
            <select
              className={fieldCls + ' mt-1'}
              value={form.dir}
              onChange={(e) => setForm((f) => ({ ...f, dir: e.target.value }))}
            >
              <option value="ltr">ltr</option>
              <option value="rtl">rtl</option>
            </select>
          </label>
          <label className="block text-xs sm:col-span-2">
            <span className="text-muted-foreground">Font stack</span>
            <input
              className={fieldCls + ' mt-1'}
              value={form.font_stack}
              onChange={(e) => setForm((f) => ({ ...f, font_stack: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            Create
          </button>
          <button type="button" className={btnOutline} onClick={load}>
            Refresh
          </button>
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Code</th>
              <th className="px-2 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Native</th>
              <th className="px-2 py-2 font-medium">Dir</th>
              <th className="px-2 py-2 font-medium">Active</th>
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
                  No locales
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id ?? row.code} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono">{row.code}</td>
                  <td className="px-2 py-1.5">{row.name}</td>
                  <td className="px-2 py-1.5">{row.native_name || '—'}</td>
                  <td className="px-2 py-1.5">{row.dir}</td>
                  <td className="px-2 py-1.5">{row.is_active ? 'yes' : 'no'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
