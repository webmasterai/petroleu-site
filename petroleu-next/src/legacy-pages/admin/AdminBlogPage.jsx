import { useCallback, useEffect, useState } from 'react'
import { adminDelete, adminGet, adminPost, adminPut } from '../../services/cmsAdminApi'

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

const EMPTY = {
  market_code: 'pk',
  locale_code: 'en-PK',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  image_alt: '',
  media_type: 'article',
  video_url: '',
  duration: '',
  show_on_homepage: false,
  category_id: '',
  author: '',
  sort_order: 0,
  is_enabled: true,
  status: 'draft',
  is_shared: false,
  noindex: false,
}

export default function AdminBlogPage() {
  const [filters, setFilters] = useState({ market: 'pk', locale: '' })
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
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
      const [postsRes, catsRes] = await Promise.all([
        adminGet('/blog/posts', { params }),
        adminGet('/blog/categories', { params: filters.market ? { market: filters.market } : {} }),
      ])
      setItems(asList(postsRes))
      setCategories(asList(catsRes))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load blog')
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
    setShowForm(true)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      market_code: row.market_code || 'pk',
      locale_code: row.locale_code || 'en-PK',
      slug: row.slug || '',
      title: row.title || '',
      excerpt: row.excerpt || '',
      content: row.content || '',
      image_url: row.image_url || '',
      image_alt: row.image_alt || '',
      media_type: row.media_type || (row.video_url ? 'video' : 'article'),
      video_url: row.video_url || '',
      duration: row.duration || '',
      show_on_homepage: Boolean(row.show_on_homepage),
      category_id: row.category_id ?? '',
      author: row.author || '',
      sort_order: row.sort_order ?? 0,
      is_enabled: Boolean(row.is_enabled ?? true),
      status: row.status || 'draft',
      is_shared: Boolean(row.is_shared),
      noindex: Boolean(row.noindex),
    })
    setShowForm(true)
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
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || null,
        content: form.content || null,
        image_url: form.image_url || null,
        image_alt: form.image_alt || null,
        media_type: form.media_type || 'article',
        video_url: form.media_type === 'video' ? form.video_url || null : null,
        duration: form.duration || null,
        show_on_homepage: Boolean(form.show_on_homepage),
        category_id: form.category_id === '' ? null : Number(form.category_id),
        author: form.author || null,
        sort_order: Number(form.sort_order) || 0,
        is_enabled: Boolean(form.is_enabled),
        status: form.status,
        is_shared: Boolean(form.is_shared),
        noindex: Boolean(form.noindex),
      }
      if (editingId) {
        const { market_code, locale_code, slug, ...updatePayload } = payload
        await adminPut(`/blog/posts/${editingId}`, updatePayload)
        setMessage('Post updated')
      } else {
        await adminPost('/blog/posts', payload)
        setMessage('Post created')
      }
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this post?')) return
    try {
      await adminDelete(`/blog/posts/${id}`)
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
          <h1 className="text-lg font-semibold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">Create and update blog posts</p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          New post
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
        <button type="button" className={btnOutline} onClick={load}>
          Refresh
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}

      {showForm ? (
        <form onSubmit={save} className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between mb-3">
            <h2 className="text-sm font-semibold">{editingId ? `Edit #${editingId}` : 'Create post'}</h2>
            <button type="button" className={btnOutline} onClick={() => setShowForm(false)}>
              Close
            </button>
          </div>
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
                  <span className="text-muted-foreground">Slug</span>
                  <input
                    className={fieldCls + ' mt-1'}
                    required
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </label>
              </>
            ) : null}
            <label className="block text-xs sm:col-span-2">
              <span className="text-muted-foreground">Title</span>
              <input
                className={fieldCls + ' mt-1'}
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Author</span>
              <input
                className={fieldCls + ' mt-1'}
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Category</span>
              <select
                className={fieldCls + ' mt-1'}
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Type</span>
              <select
                className={fieldCls + ' mt-1'}
                value={form.media_type}
                onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value }))}
              >
                <option value="article">Article (image)</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Image URL (thumbnail / cover)</span>
              <input
                className={fieldCls + ' mt-1'}
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted-foreground">Image alt</span>
              <input
                className={fieldCls + ' mt-1'}
                value={form.image_alt}
                onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))}
              />
            </label>
            {form.media_type === 'video' ? (
              <>
                <label className="block text-xs sm:col-span-2">
                  <span className="text-muted-foreground">Video URL (YouTube / MP4 / embed)</span>
                  <input
                    className={fieldCls + ' mt-1'}
                    required
                    value={form.video_url}
                    onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=... or /uploads/video.mp4"
                  />
                </label>
                <label className="block text-xs">
                  <span className="text-muted-foreground">Duration (optional)</span>
                  <input
                    className={fieldCls + ' mt-1'}
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="3:45"
                  />
                </label>
              </>
            ) : null}
            <label className="flex items-center gap-2 text-xs mt-5">
              <input
                type="checkbox"
                checked={form.show_on_homepage}
                onChange={(e) => setForm((f) => ({ ...f, show_on_homepage: e.target.checked }))}
              />
              Show on homepage
            </label>
            <label className="block text-xs sm:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Excerpt</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[60px]'}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </label>
            <label className="block text-xs sm:col-span-2 lg:col-span-3">
              <span className="text-muted-foreground">Content</span>
              <textarea
                className={fieldCls + ' mt-1 min-h-[120px] font-mono text-xs'}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
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
            <label className="block text-xs">
              <span className="text-muted-foreground">Sort order</span>
              <input
                className={fieldCls + ' mt-1'}
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
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
            <label className="flex items-center gap-2 text-xs mt-5">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => setForm((f) => ({ ...f, noindex: e.target.checked }))}
              />
              Noindex
            </label>
          </div>
          <button type="submit" className={btnPrimary + ' mt-3'} disabled={saving}>
            Save
          </button>
        </form>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-2 py-2 font-medium">Title</th>
              <th className="px-2 py-2 font-medium">Slug</th>
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
                  No posts
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-2 py-1.5 max-w-[220px] truncate">{row.title}</td>
                  <td className="px-2 py-1.5 font-mono">{row.slug}</td>
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
