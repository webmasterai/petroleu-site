import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Tag,
  Layers,
  FileText,
  Navigation,
  Globe,
  Languages,
  Image as ImageIcon,
  Newspaper,
  Search,
  Settings,
  Inbox,
  Users,
  KeyRound,
  ExternalLink,
} from 'lucide-react'
import { adminGet, adminLogout } from '../../services/cmsAdminApi'
import { AdminWorkspaceBar, AdminWorkspaceProvider } from '../../context/AdminWorkspaceContext'

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    title: 'Website',
    items: [
      { to: '/admin/pricing', label: 'Pricing', icon: Tag },
      { to: '/admin/sections', label: 'Sections', icon: Layers },
      { to: '/admin/pages', label: 'Pages', icon: FileText },
      { to: '/admin/navigation', label: 'Navigation', icon: Navigation },
      { to: '/admin/blog', label: 'Blog', icon: Newspaper },
      { to: '/admin/media', label: 'Media', icon: ImageIcon },
      { to: '/admin/seo', label: 'SEO', icon: Search },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { to: '/admin/markets', label: 'Markets', icon: Globe },
      { to: '/admin/locales', label: 'Locales', icon: Languages },
      { to: '/admin/users', label: 'Users & roles', icon: Users },
      { to: '/admin/profile', label: 'Password', icon: KeyRound },
    ],
  },
]

function SidebarNav({ onNavigate }) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="mb-6 last:mb-0">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-orange-500/20'
                          : 'text-muted-foreground hover:bg-black/[0.04] hover:text-foreground',
                      ].join(' ')
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const me = await adminGet('/me')
        if (!cancelled) {
          setUser(me)
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          await adminLogout().catch(() => {})
          navigate('/admin/login', { replace: true })
        }
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    try {
      await adminLogout()
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F5F3F0] text-sm text-muted-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        Checking session…
      </div>
    )
  }

  const pageTitle =
    NAV_GROUPS.flatMap((g) => g.items).find((i) =>
      i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`),
    )?.label || 'Admin'

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-black/[0.06] px-5">
        <img src="/petroleu-logo.png" alt="Petroleu" className="h-8 w-auto object-contain" />
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
          Admin
        </span>
      </div>
      <SidebarNav onNavigate={() => setMobileOpen(false)} />
      <div className="shrink-0 space-y-2 border-t border-black/[0.06] bg-white/80 p-4">
        <div className="truncate px-1 text-xs text-muted-foreground" title={user?.email || ''}>
          {user?.email}
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View website
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="admin-app min-h-screen bg-[#F5F3F0] text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-white shadow-[4px_0_24px_rgb(15_23_42/0.06)] transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-[#F5F3F0]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-white shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="truncate text-lg font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <span className="max-w-[220px] truncate">{user?.email}</span>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <AdminWorkspaceProvider>
              <AdminWorkspaceBar />
              {error ? (
                <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {children}
            </AdminWorkspaceProvider>
          </div>
        </main>
      </div>
    </div>
  )
}
