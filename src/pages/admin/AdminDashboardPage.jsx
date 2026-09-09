import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGet } from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'

const CARDS = [
  { key: 'pages', label: 'Pages', to: '/admin/pages' },
  { key: 'sections', label: 'Sections', to: '/admin/sections' },
  { key: 'published_sections', label: 'Published sections', to: '/admin/sections' },
  { key: 'draft_sections', label: 'Draft sections', to: '/admin/sections' },
  { key: 'needs_review_sections', label: 'Needs review', to: '/admin/sections' },
  { key: 'media', label: 'Media', to: '/admin/media' },
  { key: 'inquiries_new', label: 'New inquiries', to: '/admin/inquiries' },
  { key: 'blog_posts', label: 'Blog posts', to: '/admin/blog' },
]

export default function AdminDashboardPage() {
  const { market, locale, showAll, previewBase, previewPath, workspaceLabel } = useAdminWorkspace()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const params = showAll ? { all: 1 } : { market, locale }
        const data = await adminGet('/dashboard', { params })
        if (!cancelled) setStats(data || {})
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [market, locale, showAll])

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Metrics for {showAll ? 'all markets' : workspaceLabel}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: 'Pakistan English', href: `${previewBase}/` },
          { label: 'Afghanistan Dari', href: `${previewBase}/af` },
          { label: 'Afghanistan Pashto', href: `${previewBase}/af/ps` },
          { label: 'Afghanistan English', href: `${previewBase}/af/en` },
        ].map((p) => (
          <a
            key={p.href}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Preview {p.label} ↗
          </a>
        ))}
        <a
          href={`${previewBase}${previewPath}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
        >
          Preview Website ↗
        </a>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading…</p> : null}

      {!loading && stats ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="text-2xl font-semibold tabular-nums">{stats[card.key] ?? 0}</div>
              <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
