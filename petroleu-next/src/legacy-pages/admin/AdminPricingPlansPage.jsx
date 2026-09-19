import { useCallback, useEffect, useState } from 'react'
import { adminDelete, adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const empty = {
  name: '',
  price: '',
  price_yearly: '',
  description: '',
  is_popular: false,
  featuresText: '',
  cta_text: 'Get Started',
  cta_link: '/get-started',
}

function featuresToText(features = []) {
  return features
    .map((f) => {
      const text = typeof f === 'string' ? f : f.feature_text || f.text || ''
      const included = typeof f === 'string' ? true : f.is_included !== false
      return included ? text : `- ${text}`
    })
    .filter(Boolean)
    .join('\n')
}

function parseFeatures(txt) {
  return txt
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const disabled = line.startsWith('- ')
      return {
        feature_text: disabled ? line.slice(2).trim() : line,
        is_included: !disabled,
      }
    })
}

export default function AdminPricingPlansPage() {
  const { market, locale, showAll } = useAdminWorkspace()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page: 'pricing', ...(showAll ? {} : { market, locale }) }
      const rows = asList(await adminGet('/sections', { params }))
      setItems(rows.filter((r) => r.section_key === 'plan'))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load plans')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [market, locale, showAll])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm({ ...empty })
    setOpen(true)
  }

  function openEdit(row) {
    const data = row.data || {}
    setEditingId(row.id)
    setForm({
      name: data.name || row.title || '',
      price: data.price || '',
      price_yearly: data.price_yearly || '',
      description: row.description || data.description || '',
      is_popular: Boolean(data.is_popular ?? data.popular),
      featuresText: featuresToText(data.features || []),
      cta_text: row.link_label || data.cta_text || 'Get Started',
      cta_link: row.link_url || data.cta_link || '/get-started',
    })
    setOpen(true)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const features = parseFeatures(form.featuresText)
      const payload = {
        market_code: market,
        locale_code: locale,
        page_slug: 'pricing',
        section_key: 'plan',
        title: form.name,
        description: form.description,
        link_label: form.cta_text,
        link_url: form.cta_link,
        status: 'published',
        is_enabled: true,
        sort_order: editingId
          ? items.find((i) => i.id === editingId)?.sort_order || 0
          : items.length + 1,
        data: {
          name: form.name,
          price: form.price,
          price_yearly: form.price_yearly || form.price,
          period: 'month',
          is_popular: form.is_popular,
          popular: form.is_popular,
          currency: 'PKR',
          features,
        },
      }
      if (editingId) await adminPut(`/sections/${editingId}`, payload)
      else await adminPost('/sections', payload)
      setOpen(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this plan?')) return
    try {
      await adminDelete(`/sections/${id}`)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed')
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="max-w-xl text-sm text-muted-foreground">
            Live website plans for this market/locale. Changes publish immediately.
          </p>
        </div>
        <button type="button" onClick={openCreate} className="admin-btn-primary">
          Add plan
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {open ? (
        <form
          onSubmit={save}
          className="space-y-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_24px_rgb(15_23_42/0.04)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-sm font-medium">Plan name</span>
              <input
                required
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-sm font-medium">Monthly price</span>
              <input
                required
                className="admin-input"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="1999 or call for special prices"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-sm font-medium">Yearly price</span>
              <input
                className="admin-input"
                value={form.price_yearly}
                onChange={(e) => setForm((f) => ({ ...f, price_yearly: e.target.value }))}
                placeholder="19990"
              />
            </label>
            <label className="flex items-center gap-2 pt-7 text-sm font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={form.is_popular}
                onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
              />
              Most popular
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <textarea
              className="admin-input min-h-24"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-sm font-medium">
              Features (one per line, prefix with “- ” to exclude)
            </span>
            <textarea
              className="admin-input min-h-40 font-mono"
              value={form.featuresText}
              onChange={(e) => setForm((f) => ({ ...f, featuresText: e.target.value }))}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="admin-btn-primary">
              {saving ? 'Saving…' : 'Save plan'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgb(15_23_42/0.04)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Monthly</th>
              <th>Yearly</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground">
                  No plans yet. Add the first plan.
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const data = row.data || {}
                return (
                  <tr key={row.id} className="border-t border-black/[0.05]">
                    <td>
                      <div className="font-medium">{data.name || row.title}</div>
                      <div className="max-w-xs truncate text-xs text-muted-foreground">
                        {row.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-medium">{data.price}</td>
                    <td className="whitespace-nowrap">{data.price_yearly || '—'}</td>
                    <td>
                      <span className="admin-chip">
                        {row.status === 'published' ? 'Published' : 'Draft'}
                        {data.is_popular || data.popular ? ' · Popular' : ''}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="admin-btn-secondary text-xs" onClick={() => openEdit(row)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5"
                          onClick={() => remove(row.id)}
                        >
                          Delete
                        </button>
                      </div>
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
