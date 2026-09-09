import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminGet, adminLogout, getAdminToken } from '../../services/cmsAdminApi'
import { AdminWorkspaceBar, AdminWorkspaceProvider } from '../../context/AdminWorkspaceContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
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
    'block rounded-md px-3 py-1.5 text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground font-medium'
      : 'text-foreground hover:bg-muted',
  ].join(' ')

export default function AdminLayout() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!getAdminToken()) {
        navigate('/admin/login', { replace: true })
        return
      }
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
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Checking session…
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <div className="text-sm font-semibold tracking-tight">Petroleu CMS</div>
          {user?.email ? (
            <div className="mt-0.5 text-xs text-muted-foreground truncate">{user.email}</div>
          ) : null}
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-1.5 text-sm text-left text-foreground hover:bg-muted"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <AdminWorkspaceProvider>
            <AdminWorkspaceBar />
            {error ? (
              <p className="mb-3 text-sm text-destructive">{error}</p>
            ) : null}
            <Outlet context={{ user, setError }} />
          </AdminWorkspaceProvider>
        </div>
      </main>
    </div>
  )
}
