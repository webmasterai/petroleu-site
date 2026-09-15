import { useCallback, useEffect, useState } from 'react'
import { adminGet, adminPut } from '../../services/cmsAdminApi'

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

const EDIT_FIELDS = [
  'phone',
  'phone_tel',
  'whatsapp',
  'currency',
  'email',
  'sales_email',
  'support_email',
  'inquiry_recipients',
  'address',
]

export default function AdminMarketsPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminGet('/markets')
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load markets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openEdit(row) {
    setEditing(row)
    const next = {}
    EDIT_FIELDS.forEach((k) => {
      next[k] = row[k] ?? ''
    })
    setForm(next)
    setMessage('')
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = {}
      EDIT_FIELDS.forEach((k) => {
        payload[k] = form[k] === '' ? null : form[k]
      })
      await adminPut(`/markets/${editing.id}`, payload)
      setMessage('Market updated')
      setEditing(null)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Markets</h1>
      <p className="text-sm text-muted-foreground">Contact and currency settings per market</p>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      {editing ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">
              Edit {editing.code} — {editing.name}
            </h2>
            <button type="button" className={btnOutline} onClick={() => setEditing(null)}>
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EDIT_FIELDS.map((key) => (
              <label key={key} className="block text-xs">
                <span className="text-muted-foreground">{key}</span>
                {key === 'address' || key === 'inquiry_recipients' ? (
                  <textarea
                    className={fieldCls + ' mt-1 min-h-[60px]'}
                    value={form[key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={fieldCls + ' mt-1'}
                    value={form[key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="mt-3">
            <button type="button" className={btnPrimary} disabled={saving} onClick={save}>
              Save
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Code</th>
              <th className="px-2 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Phone</th>
              <th className="px-2 py-2 font-medium">WhatsApp</th>
              <th className="px-2 py-2 font-medium">Currency</th>
              <th className="px-2 py-2 font-medium">Email</th>
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
                  No markets
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono">{row.code}</td>
                  <td className="px-2 py-1.5">{row.name}</td>
                  <td className="px-2 py-1.5">{row.phone || '—'}</td>
                  <td className="px-2 py-1.5">{row.whatsapp || '—'}</td>
                  <td className="px-2 py-1.5">{row.currency || '—'}</td>
                  <td className="px-2 py-1.5">{row.email || '—'}</td>
                  <td className="px-2 py-1.5">
                    <button type="button" className={btnOutline} onClick={() => openEdit(row)}>
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
