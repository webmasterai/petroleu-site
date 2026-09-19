import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Layers,
  CheckCircle2,
  Pencil,
  AlertCircle,
  Image as ImageIcon,
  Inbox,
  Newspaper,
  Tag,
  ExternalLink,
} from 'lucide-react'
import { adminGet } from '../../services/cmsAdminApi'
import { useAdminWorkspace } from '../../context/AdminWorkspaceContext'

const CARDS = [
  { key: 'pages', label: 'Pages', to: '/admin/pages', icon: FileText },
  { key: 'sections', label: 'Sections', to: '/admin/sections', icon: Layers },
  { key: 'published_sections', label: 'Published', to: '/admin/sections', icon: CheckCircle2 },
  { key: 'draft_sections', label: 'Drafts', to: '/admin/sections', icon: Pencil },
  { key: 'needs_review_sections', label: 'Needs review', to: '/admin/sections', icon: AlertCircle },
  { key: 'media', label: 'Media', to: '/admin/media', icon: ImageIcon },
  { key: 'inquiries_new', label: 'New inquiries', to: '/admin/inquiries', icon: Inbox },
  { key: 'blog_posts', label: 'Blog posts', to: '/admin/blog', icon: Newspaper },
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

  const previews = [
    { label: 'Pakistan', href: `${previewBase}/` },
    { label: 'AF Dari', href: `${previewBase}/af` },
    { label: 'AF Pashto', href: `${previewBase}/af/ps` },
    { label: 'AF English', href: `${previewBase}/af/en` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {showAll ? 'All markets' : workspaceLabel}
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Edit live website content, then preview the matching locale.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/pricing" className="admin-btn-primary gap-2">
            <Tag className="h-4 w-4" />
            Edit pricing
          </Link>
          <a
            href={`${previewBase}${previewPath}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-secondary gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Preview site
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {previews.map((p) => (
          <a key={p.href} href={p.href} target="_blank" rel="noreferrer" className="admin-chip">
            {p.label}
          </a>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-black/[0.06] bg-white" />
          ))}
        </div>
      ) : null}

      {!loading && stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link key={card.key} to={card.to} className="admin-stat-card">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 text-2xl font-semibold tabular-nums tracking-tight">
                  {stats[card.key] ?? 0}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{card.label}</div>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
