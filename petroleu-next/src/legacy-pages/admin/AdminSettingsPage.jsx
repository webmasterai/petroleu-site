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
  locale_code: '',
  key: '',
  value: '',
  type: 'string',
  label: '',
  grp: 'general',
  is_shared: false,
}

export default function AdminSettingsPage() {
  const [market, setMarket] = useState('pk')
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
      if (market) params.market = market
      const res = await adminGet('/settings', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [market])

  useEffect(() => {
    load()
  }, [load])

  function editRow(row) {
    setForm({
      market_code: row.market_code || market,
      locale_code: row.locale_code || '',
      key: row.key || '',
      value: row.value ?? '',
      type: row.type || 'string',
      label: row.label || '',
      grp: row.grp || 'general',
      is_shared: Boolean(row.is_shared),
    })
    setMessage('')
  }

  async function upsert(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await adminPost('/settings', {
        market_code: form.market_code,
        locale_code: form.locale_code || null,
        key: form.key,
        value: form.value,
        type: form.type || null,
        label: form.label || null,
        grp: form.grp || null,
        is_shared: Boolean(form.is_shared),
      })
      setMessage('Saved')
      setForm({ ...EMPTY, market_code: market })
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">Upsert key/value settings per market</p>

      <div className="mt-4 flex gap-2">
        <select className={fieldCls + ' w-auto'} value={market} onChange={(e) => setMarket(e.target.value)}>
          <option value="pk">pk</option>
          <option value="af">af</option>
          <option value="shared">shared</option>
        </select>
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      <form onSubmit={upsert} className="mt-4 rounded-lg border border-border bg-card p-4 max-w-2xl">
        <h2 className="text-sm font-semibold mb-3">Upsert setting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['market_code', 'Market'],
            ['locale_code', 'Locale (optional)'],
            ['key', 'Key'],
            ['type', 'Type'],
            ['label', 'Label'],
            ['grp', 'Group'],
          ].map(([key, label]) => (
            <label key={key} className="block text-xs">
              <span className="text-muted-foreground">{label}</span>
              <input
                className={fieldCls + ' mt-1'}
                required={key === 'key' || key === 'market_code'}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-xs sm:col-span-2">
            <span className="text-muted-foreground">Value</span>
            <textarea
              className={fieldCls + ' mt-1 min-h-[70px]'}
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
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
              <th className="px-2 py-2 font-medium">Key</th>
              <th className="px-2 py-2 font-medium">Value</th>
              <th className="px-2 py-2 font-medium">Group</th>
              <th className="px-2 py-2 font-medium">Locale</th>
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
                  No settings
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id ?? `${row.market_code}-${row.key}-${row.locale_code}`} className="border-t border-border">
                  <td className="px-2 py-1.5 font-mono">{row.key}</td>
                  <td className="px-2 py-1.5 max-w-[240px] truncate">{row.value ?? '—'}</td>
                  <td className="px-2 py-1.5">{row.grp || '—'}</td>
                  <td className="px-2 py-1.5">{row.locale_code || '—'}</td>
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
