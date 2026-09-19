import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { adminGet, adminLogout } from '../../services/cmsAdminApi'
import { AdminWorkspaceBar, AdminWorkspaceProvider } from '../../context/AdminWorkspaceContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/pricing', label: 'Pricing' },
  { to: '/admin/sections', label: 'Sections' },
  { to: '/admin/pages', label: 'Pages' },
  { to: '/admin/navigation', label: 'Navigation' },
  { to: '/admin/markets', label: 'Markets' },
  { to: '/admin/locales', label: 'Locales' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/seo', label: 'SEO' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/inquiries', label: 'Inquiries' },
  { to: '/admin/users', label: 'Users & Roles' },
  { to: '/admin/profile', label: 'Change Password' },
]

const linkClass = ({ isActive }) =>
  [
    'block rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground font-medium'
      : 'text-foreground hover:bg-muted',
  ].join(' ')

function Sidebar({ user, onLogout, onNavigate }) {
  return (
    <>
      <div className="px-4 py-4 border-b border-border">
        <div className="text-sm font-semibold tracking-tight">Petroleu CMS</div>
        {user?.email ? (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  )
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
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

  async function handleLogout() {
    try {
      await adminLogout()
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-foreground">
      <aside className="hidden w-56 shrink-0 flex-col border-e border-border bg-card md:flex">
        <Sidebar user={user} onLogout={handleLogout} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-64 max-w-[85vw] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-2 backdrop-blur md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 truncate text-sm font-semibold">Petroleu CMS</div>
        </div>
        <div className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6">
          <AdminWorkspaceProvider>
            <AdminWorkspaceBar />
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            {children}
          </AdminWorkspaceProvider>
        </div>
      </main>
    </div>
  )
}
