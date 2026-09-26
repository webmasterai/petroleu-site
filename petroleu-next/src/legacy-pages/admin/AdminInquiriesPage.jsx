import { useCallback, useEffect, useState } from 'react'
import { adminGet, adminPut } from '../../services/cmsAdminApi'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

/** Prefer canonical fields; fall back to legacy aliases if API did not normalize. */
function displayName(row) {
  if (!row) return ''
  return String(row.name || row.full_name || row.fullName || row.contact_name || '').trim()
}

function displayPhone(row) {
  if (!row) return ''
  return String(row.phone || row.phoneNumber || row.mobile || row.contactNumber || '').trim()
}

function displayMessage(row) {
  if (!row) return ''
  return String(row.message || row.messageText || row.body || row.comments || '').trim()
}

function displayMarket(row) {
  if (!row) return ''
  return String(row.market_code || row.market || '').trim()
}

function displayDate(row) {
  const raw = row?.created_at || row?.createdAt
  if (!raw) return ''
  try {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return String(raw)
    return d.toLocaleString()
  } catch {
    return String(raw)
  }
}

const fieldCls = 'admin-input'
const btnOutline = 'admin-btn-secondary text-xs'

const STATUSES = ['new', 'read', 'replied', 'closed', 'spam']

export default function AdminInquiriesPage() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ market: '', status: '', type: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.market) params.market = filters.market
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type
      const res = await adminGet('/inquiries', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  async function updateStatus(id, status) {
    setError('')
    setMessage('')
    try {
      const payload = { status }
      if (selected?.id === id && notes !== (selected.admin_notes || '')) {
        payload.admin_notes = notes
      }
      const updated = await adminPut(`/inquiries/${id}`, payload)
      setMessage('Updated')
      if (selected?.id === id) {
        setSelected(updated)
        setNotes(updated?.admin_notes ?? '')
      }
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Update failed')
    }
  }

  async function saveNotes() {
    if (!selected) return
    setError('')
    try {
      const updated = await adminPut(`/inquiries/${selected.id}`, {
        admin_notes: notes || null,
        status: selected.status,
      })
      setSelected(updated)
      setMessage('Notes saved')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    }
  }

  async function openDetail(row) {
    setError('')
    try {
      const full = await adminGet(`/inquiries/${row.id}`)
      // Guard: list endpoint used to be returned for /:id — never treat an array as a detail row
      if (full && !Array.isArray(full) && full.id != null) {
        setSelected(full)
        setNotes(full?.admin_notes ?? '')
        return
      }
      setSelected(row)
      setNotes(row.admin_notes ?? '')
    } catch {
      setSelected(row)
      setNotes(row.admin_notes ?? '')
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Inquiries</h1>
      <p className="text-sm text-muted-foreground">Contact and demo requests</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          className={fieldCls + ' w-auto'}
          value={filters.market}
          onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value }))}
        >
          <option value="">All markets</option>
          <option value="pk">pk</option>
          <option value="af">af</option>
        </select>
        <select
          className={fieldCls + ' w-auto'}
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className={fieldCls + ' w-32'}
          placeholder="Type"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        />
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      {selected ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm space-y-2">
          <div className="flex justify-between gap-2">
            <h2 className="font-semibold text-sm">Inquiry #{selected.id}</h2>
            <button type="button" className={btnOutline} onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
          <p>
            <span className="text-muted-foreground">Name: </span>
            {displayName(selected) || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {selected.email || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Phone: </span>
            {displayPhone(selected) || '—'}
          </p>
          {selected.company ? (
            <p>
              <span className="text-muted-foreground">Company: </span>
              {selected.company}
            </p>
          ) : null}
          <p>
            <span className="text-muted-foreground">Type / market: </span>
            {selected.type || '—'} / {displayMarket(selected) || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Locale: </span>
            {selected.locale_code || selected.locale || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Source / page: </span>
            {selected.source || selected.page || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Submitted: </span>
            {displayDate(selected) || '—'}
          </p>
          <div>
            <span className="text-muted-foreground text-xs">Message</span>
            <p className="mt-1 whitespace-pre-wrap border border-border rounded-md p-2 bg-background text-xs">
              {displayMessage(selected) || '—'}
            </p>
          </div>
          <label className="block text-xs">
            <span className="text-muted-foreground">Admin notes</span>
            <textarea
              className={fieldCls + ' mt-1 min-h-[60px]'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className={fieldCls + ' w-auto'}
              value={selected.status || 'new'}
              onChange={(e) => updateStatus(selected.id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="button" className={btnOutline} onClick={saveNotes}>
              Save notes
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">ID</th>
              <th className="px-2 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Email</th>
              <th className="px-2 py-2 font-medium">Phone</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium">Market</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-2 py-4 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-2 py-4 text-muted-foreground">
                  No inquiries
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-2 py-1.5">{row.id}</td>
                  <td className="px-2 py-1.5">{displayName(row) || '—'}</td>
                  <td className="px-2 py-1.5">{row.email || '—'}</td>
                  <td className="px-2 py-1.5">{displayPhone(row) || '—'}</td>
                  <td className="px-2 py-1.5">{row.type || '—'}</td>
                  <td className="px-2 py-1.5">{displayMarket(row) || '—'}</td>
                  <td className="px-2 py-1.5">
                    <select
                      className={fieldCls + ' w-auto'}
                      value={row.status || 'new'}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">{displayDate(row) || '—'}</td>
                  <td className="px-2 py-1.5">
                    <button type="button" className={btnOutline} onClick={() => openDetail(row)}>
                      View
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
