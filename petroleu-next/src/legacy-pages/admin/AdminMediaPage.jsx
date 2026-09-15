import { useCallback, useEffect, useState } from 'react'
import { adminDelete, adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'
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
const btnDanger =
  'rounded-md border border-destructive/40 text-destructive px-2.5 py-1.5 text-xs hover:bg-destructive/10 disabled:opacity-50'

export default function AdminMediaPage() {
  const { market } = useAdminWorkspace()
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [title, setTitle] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [uploadMarket, setUploadMarket] = useState(market || 'pk')
  const [editId, setEditId] = useState(null)
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setUploadMarket(market || 'pk')
  }, [market])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (market) params.market = market
      const res = await adminGet('/media', { params })
      setItems(asList(res))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [market])

  useEffect(() => {
    load()
  }, [load])

  async function upload(e) {
    e.preventDefault()
    if (!file) {
      setError('Choose a file first')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (altText) formData.append('alt_text', altText)
      if (caption) formData.append('caption', caption)
      if (title) formData.append('title', title)
      if (posterUrl) formData.append('poster_url', posterUrl)
      if (uploadMarket) formData.append('market_code', uploadMarket)
      await adminPost('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      setFile(null)
      setAltText('')
      setCaption('')
      setTitle('')
      setPosterUrl('')
      setProgress(0)
      setMessage('Uploaded')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(row) {
    setEditId(row.id)
    setEditAlt(row.alt_text ?? '')
    setEditCaption(row.caption ?? '')
    setEditTitle(row.title ?? '')
  }

  async function saveEdit() {
    setBusy(true)
    setError('')
    try {
      await adminPut(`/media/${editId}`, {
        alt_text: editAlt || null,
        caption: editCaption || null,
        title: editTitle || null,
      })
      setEditId(null)
      setMessage('Updated')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this media asset? If in use you will get a warning.')) return
    setBusy(true)
    setError('')
    try {
      await adminDelete(`/media/${id}`)
      setMessage('Deleted')
      await load()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Delete failed'
      if (err?.response?.status === 409 && window.confirm(`${msg} Force delete?`)) {
        try {
          await adminDelete(`/media/${id}?force=1`)
          setMessage('Force deleted')
          await load()
        } catch (err2) {
          setError(err2?.response?.data?.message || err2?.message || 'Force delete failed')
        }
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  function copyUrl(url) {
    navigator.clipboard?.writeText(url)
    setMessage('URL copied')
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Media</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Images (PNG/JPG/WebP/SVG) and videos (MP4/WebM). Use a persistent public disk volume in Coolify.
      </p>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

      <form onSubmit={upload} className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
        <label className="text-xs sm:col-span-2">
          File
          <input
            className={fieldCls + ' mt-1'}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <label className="text-xs">
          Title / video label
          <input className={fieldCls + ' mt-1'} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="text-xs">
          Market
          <input className={fieldCls + ' mt-1'} value={uploadMarket} onChange={(e) => setUploadMarket(e.target.value)} />
        </label>
        <label className="text-xs">
          Image alt text
          <input className={fieldCls + ' mt-1'} value={altText} onChange={(e) => setAltText(e.target.value)} />
        </label>
        <label className="text-xs">
          Video caption
          <input className={fieldCls + ' mt-1'} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
        <label className="text-xs sm:col-span-2">
          Video poster URL
          <input className={fieldCls + ' mt-1'} value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} dir="ltr" />
        </label>
        {progress > 0 && progress < 100 ? (
          <div className="sm:col-span-2 text-xs text-muted-foreground">Upload progress: {progress}%</div>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={busy}>
          Upload
        </button>
      </form>

      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-card p-3 text-xs">
            {row.media_kind === 'video' || String(row.mime_type || '').startsWith('video/') ? (
              <video
                src={row.url}
                poster={row.poster_url || undefined}
                controls
                className="mb-2 h-32 w-full rounded bg-muted object-cover"
              />
            ) : (
              <img
                src={row.url}
                alt={row.alt_text || row.title || ''}
                className="mb-2 h-32 w-full rounded bg-muted object-cover"
              />
            )}
            <div className="font-medium truncate">{row.title || row.original_name}</div>
            <div className="mt-1 text-muted-foreground">
              {row.media_kind || 'file'} · {row.mime_type} · {Math.round((row.size || 0) / 1024)} KB
              {row.width ? ` · ${row.width}×${row.height}` : ''}
              {row.duration_seconds ? ` · ${row.duration_seconds}s` : ''}
            </div>
            {editId === row.id ? (
              <div className="mt-2 space-y-1">
                <input className={fieldCls} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                <input className={fieldCls} value={editAlt} onChange={(e) => setEditAlt(e.target.value)} placeholder="Alt" />
                <input className={fieldCls} value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Caption" />
                <div className="flex gap-2">
                  <button type="button" className={btnPrimary} onClick={saveEdit}>
                    Save
                  </button>
                  <button type="button" className={btnOutline} onClick={() => setEditId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className={btnOutline} onClick={() => startEdit(row)}>
                  Edit
                </button>
                <button type="button" className={btnOutline} onClick={() => copyUrl(row.url)}>
                  Copy URL
                </button>
                <button type="button" className={btnDanger} onClick={() => remove(row.id)} disabled={busy}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
