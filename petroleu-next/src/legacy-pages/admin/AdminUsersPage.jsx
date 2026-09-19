import { useCallback, useEffect, useState } from 'react'
import { adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const ROLES = ['super_admin', 'administrator', 'editor', 'translator', 'viewer']
const fieldCls = 'admin-input'
const btnPrimary = 'admin-btn-primary text-xs'
const btnOutline = 'admin-btn-secondary text-xs'

const EMPTY = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'editor',
  is_active: true,
  assigned_markets: '',
  assigned_locales: '',
}

export default function AdminUsersPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminGet('/users')
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...EMPTY })
    setShowForm(true)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      password_confirmation: '',
      role: row.role || 'editor',
      is_active: Boolean(row.is_active),
      assigned_markets: Array.isArray(row.assigned_markets) ? row.assigned_markets.join(',') : '',
      assigned_locales: Array.isArray(row.assigned_locales) ? row.assigned_locales.join(',') : '',
    })
    setShowForm(true)
  }

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      is_active: Boolean(form.is_active),
      assigned_markets: form.assigned_markets
        ? form.assigned_markets.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
      assigned_locales: form.assigned_locales
        ? form.assigned_locales.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
    }
    try {
      if (editingId) {
        if (form.password) {
          payload.password = form.password
          payload.password_confirmation = form.password_confirmation
        }
        await adminPut(`/users/${editingId}`, payload)
        setMessage('User updated')
      } else {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
        await adminPost('/users', payload)
        setMessage('User created')
      }
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function issueReset(id) {
    setBusy(true)
    setError('')
    try {
      const res = await adminPost(`/users/${id}/reset-link`)
      setMessage(`Reset token created for ${res?.email || 'user'} (deliver out-of-band)`)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Users & Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Super Admin only. Passwords are never displayed.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add user
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}

      {!loading ? (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Markets</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2" dir="ltr">
                    {row.email}
                  </td>
                  <td className="px-3 py-2">{row.role}</td>
                  <td className="px-3 py-2">{row.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {(row.assigned_markets || []).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button type="button" className={btnOutline} onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className={btnOutline} disabled={busy} onClick={() => issueReset(row.id)}>
                      Reset link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
          <label className="text-xs">
            Name
            <input className={fieldCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="text-xs">
            Email
            <input
              className={fieldCls}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              dir="ltr"
            />
          </label>
          <label className="text-xs">
            Role
            <select className={fieldCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs mt-5">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <label className="text-xs">
            Password {editingId ? '(optional)' : ''}
            <input
              className={fieldCls}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
              autoComplete="new-password"
            />
          </label>
          <label className="text-xs">
            Confirm password
            <input
              className={fieldCls}
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              required={!editingId || Boolean(form.password)}
              autoComplete="new-password"
            />
          </label>
          <label className="text-xs">
            Assigned markets (comma)
            <input
              className={fieldCls}
              value={form.assigned_markets}
              onChange={(e) => setForm({ ...form, assigned_markets: e.target.value })}
              placeholder="pk,af"
              dir="ltr"
            />
          </label>
          <label className="text-xs">
            Assigned locales (comma)
            <input
              className={fieldCls}
              value={form.assigned_locales}
              onChange={(e) => setForm({ ...form, assigned_locales: e.target.value })}
              placeholder="fa-AF,ps-AF"
              dir="ltr"
            />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className={btnPrimary} disabled={busy}>
              Save
            </button>
            <button type="button" className={btnOutline} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
