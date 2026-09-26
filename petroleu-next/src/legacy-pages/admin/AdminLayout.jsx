import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminGet, adminLogout } from '../../services/cmsAdminApi'
import { AdminWorkspaceBar, AdminWorkspaceProvider } from '../../context/AdminWorkspaceContext'
import AdminErrorBoundary from './AdminErrorBoundary'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/inquiries', label: 'Inquiries' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: '/admin/pages', label: 'Pages' },
      { to: '/admin/sections', label: 'Sections' },
      { to: '/admin/pricing', label: 'Pricing Plans' },
      { to: '/admin/navigation', label: 'Navigation' },
      { to: '/admin/blog', label: 'Blog' },
      { to: '/admin/media', label: 'Media' },
      { to: '/admin/seo', label: 'SEO' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/admin/markets', label: 'Markets' },
      { to: '/admin/locales', label: 'Locales' },
      { to: '/admin/users', label: 'Users & Roles' },
      { to: '/admin/profile', label: 'Password' },
    ],
  },
]

const linkClass = ({ isActive }) =>
  [
    'block rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-[#ea580c] text-white font-medium shadow-sm'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ')

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [bootError, setBootError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const me = await adminGet('/me')
        if (!cancelled) {
          setUser(me)
          setReady(true)
          setBootError('')
        }
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status || err?.status
          if (status === 401 || status === 403) {
            await adminLogout().catch(() => {})
            navigate('/admin/login', { replace: true })
            return
          }
          setBootError(err?.response?.data?.message || err?.message || 'Unable to load admin session.')
          setReady(true)
        }
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    document.title = 'Petroleu CMS'
    let robots = document.head.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', 'noindex, nofollow')
  }, [])

  async function handleLogout() {
    try {
      await adminLogout()
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f3] text-sm text-slate-500">
        Checking session…
      </div>
    )
  }

  if (bootError && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f7f6f3] px-4 text-center">
        <p className="text-sm font-semibold text-slate-900">Unable to load this screen.</p>
        <p className="max-w-md text-sm text-slate-600">{bootError}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md bg-[#ea580c] px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
            onClick={() => navigate('/admin/login', { replace: true })}
          >
            Go to login
          </button>
        </div>
      </div>
    )
  }

  const isSuper = user?.role === 'super_admin' || user?.role === 'cms_admin'

  return (
    <div className="flex min-h-screen bg-[#f7f6f3] text-slate-900">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/petroleu-logo.png"
              alt="Petroleu"
              className="h-8 w-auto max-w-[140px] object-contain object-left"
              width={140}
              height={32}
            />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#ea580c]">
              Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {isSuper ? (
            <div className="mb-2">
              <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Developer tools
              </div>
              <NavLink to="/admin/sections?advanced=1" className={linkClass}>
                Advanced section JSON
              </NavLink>
            </div>
          ) : null}
        </nav>

        <div className="space-y-2 border-t border-slate-200 p-3">
          {user?.email ? (
            <div className="truncate px-2 text-xs text-slate-500">{user.email}</div>
          ) : null}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            View website
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <AdminWorkspaceProvider>
            <AdminWorkspaceBar />
            <AdminErrorBoundary>
              {/*
                Next.js admin pages pass children explicitly.
                Vite React Router nested routes need <Outlet />.
              */}
              {children ?? <Outlet />}
            </AdminErrorBoundary>
          </AdminWorkspaceProvider>
        </div>
      </main>
    </div>
  )
}
