import { useCallback, useEffect, useState } from 'react'
import { adminGet } from '../../services/cmsAdminApi'

function asList(res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  return []
}

const fieldCls = 'admin-input'
const btnOutline = 'admin-btn-secondary text-xs'

/**
 * Media Library image field: preview + choose/remove (no raw URL required for normal use).
 */
export default function MediaImageField({
  label = 'Image',
  url,
  alt,
  onChangeUrl,
  onChangeAlt,
  showRawUrl = true,
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminGet('/media', { params: {} })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const filtered = items.filter((m) => {
    if (!q.trim()) return true
    const term = q.toLowerCase()
    return (
      String(m.filename || '').toLowerCase().includes(term) ||
      String(m.title || '').toLowerCase().includes(term) ||
      String(m.alt_text || '').toLowerCase().includes(term) ||
      String(m.url || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="sm:col-span-2 space-y-2 rounded-md border border-border/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {url ? (
        <div className="flex flex-wrap items-start gap-3">
          <img
            src={url}
            alt={alt || ''}
            className="h-20 w-28 rounded border border-border object-contain bg-[#faf6f1]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnOutline} onClick={() => setOpen(true)}>
              Choose from Media
            </button>
            <button
              type="button"
              className={btnOutline}
              onClick={() => {
                onChangeUrl('')
                if (onChangeAlt) onChangeAlt('')
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">No image selected</span>
          <button type="button" className={btnOutline} onClick={() => setOpen(true)}>
            Choose from Media
          </button>
        </div>
      )}

      <label className="block text-xs">
        <span className="text-muted-foreground">Image alt</span>
        <input
          className={fieldCls + ' mt-1'}
          value={alt || ''}
          onChange={(e) => onChangeAlt?.(e.target.value)}
        />
      </label>

      {showRawUrl ? (
        <label className="block text-xs">
          <span className="text-muted-foreground">URL (advanced)</span>
          <input
            className={fieldCls + ' mt-1 font-mono text-[10px]'}
            value={url || ''}
            onChange={(e) => onChangeUrl(e.target.value)}
          />
        </label>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Media Library</h3>
              <button type="button" className={btnOutline} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="px-4 py-2">
              <input
                className={fieldCls}
                placeholder="Search media…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {error ? <p className="px-4 text-xs text-destructive">{error}</p> : null}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loading ? (
                <p className="text-xs text-muted-foreground col-span-full">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground col-span-full">No media found</p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="rounded-lg border border-border p-2 text-left hover:border-primary hover:bg-orange-50/40"
                    onClick={() => {
                      onChangeUrl(m.url || '')
                      if (onChangeAlt && (m.alt_text || m.title)) {
                        onChangeAlt(m.alt_text || m.title || '')
                      }
                      setOpen(false)
                    }}
                  >
                    {m.url ? (
                      <img
                        src={m.url}
                        alt={m.alt_text || m.filename || ''}
                        className="mb-2 h-20 w-full object-contain rounded bg-[#faf6f1]"
                      />
                    ) : (
                      <div className="mb-2 h-20 rounded bg-muted" />
                    )}
                    <p className="truncate text-[10px] font-medium">{m.title || m.filename}</p>
                    <p className="truncate text-[9px] text-muted-foreground">{m.url}</p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              Upload new files under Website → Media, then select them here.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
