import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, ChevronDown, BarChart3, FileText, Smartphone, PlayCircle } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { MButton } from './ui'
import { DemoRequestModal } from './DemoRequestModal'
import { ContactTopBar } from './ContactTopBar'
import { pmsAppHref } from '../../config/pmsApp'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { marketPath } from '../../utils/marketPath'
import { useUiCopy } from '../../hooks/useUiCopy'

/**
 * Smart link that scrolls to a hash on the same page or navigates first
 * if the hash route lives on a different page. React Router Link doesn't
 * scroll-to-anchor by default, so we handle it explicitly.
 */
function NavItem({ to, className, onClick, children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!to.includes('#')) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }

  const [path, hash] = to.split('#')
  const targetPath = path || '/'
  const handleClick = (e) => {
    e.preventDefault()
    if (onClick) onClick()
    if (pathname === targetPath) {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(targetPath)
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(hash)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      })
    }
  }

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

/** Compare nav URLs ignoring trailing slash and hash (except keep # for mobile). */
function navPathKey(href) {
  if (!href) return '/'
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href
  const [base, hash] = String(href).split('#')
  const normalized = (base.replace(/\/+$/, '') || '/') + (hash != null && hash !== '' ? `#${hash}` : '')
  return normalized
}

/**
 * CMS items first (sorted), then default items whose paths are not already covered.
 * Prevents PK CMS (4 header links) from permanently replacing the full fallback set.
 */
function mergeCmsNav(cmsRows, defaults, routePrefix, { withIcons = false } = {}) {
  if (!Array.isArray(cmsRows) || !cmsRows.length) return defaults

  const cmsItems = [...cmsRows]
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((n) => {
      const name = String(n.label || n.title || n.name || '').trim()
      const href = n.url?.startsWith('http') ? n.url : marketPath(n.url || '/', routePrefix)
      const item = { name, href }
      if (withIcons) {
        item.icon = <FileText className="h-4 w-4" />
        item.desc = n.children_data?.desc || n.description || ''
      }
      return item
    })
    .filter((n) => n.name)

  if (!cmsItems.length) return defaults

  const covered = new Set(cmsItems.map((i) => navPathKey(i.href)))
  const extras = defaults.filter((d) => !covered.has(navPathKey(d.href)))
  return [...cmsItems, ...extras]
}

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const resourcesRef = useRef(null)
  const { pathname } = useLocation()
  const { routePrefix, isAfghanistan } = useMarketLocale()
  const { copy, whatsappUrl } = useUiCopy()
  const { data: headerNav, isFetched: headerFetched } = useCmsQuery(['nav', 'header'], '/navigation', {
    config: { params: { location: 'header' } },
  })
  const { data: megaNav, isFetched: megaFetched } = useCmsQuery(['nav', 'mega'], '/navigation', {
    config: { params: { location: 'mega' } },
  })

  useEffect(() => {
    function onClick(e) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const defaultNav = useMemo(
    () => [
      { name: 'Features', href: marketPath('/features', routePrefix) },
      { name: 'Pricing', href: marketPath('/pricing', routePrefix) },
      { name: 'FAQ', href: marketPath('/faq', routePrefix) },
      { name: 'Mobile App', href: marketPath('/#mobile', routePrefix) },
      { name: 'About', href: marketPath('/about', routePrefix) },
      { name: 'Blog', href: marketPath('/blog', routePrefix) },
      { name: 'Contact', href: marketPath('/contact', routePrefix) },
    ],
    [routePrefix],
  )

  const defaultResources = useMemo(
    () => [
      {
        name: 'Analytics',
        href: marketPath('/analytics', routePrefix),
        icon: <BarChart3 className="h-4 w-4" />,
        desc: 'Real-time dashboards & insights',
      },
      {
        name: 'Reports',
        href: marketPath('/product/reports', routePrefix),
        icon: <FileText className="h-4 w-4" />,
        desc: '20+ pre-built business reports',
      },
      {
        name: 'FAQ',
        href: marketPath('/faq', routePrefix),
        icon: <Smartphone className="h-4 w-4" />,
        desc: 'Common questions answered',
      },
      {
        name: 'Docs',
        href: marketPath('/docs', routePrefix),
        icon: <FileText className="h-4 w-4" />,
        desc: 'Petroleu docs and public API notes',
      },
    ],
    [routePrefix],
  )

  const navItems = useMemo(() => {
    // Stable first paint: keep defaults until CMS responds (avoids 7→4 flicker)
    if (!headerFetched) return defaultNav
    return mergeCmsNav(headerNav, defaultNav, routePrefix)
  }, [headerNav, headerFetched, defaultNav, routePrefix])

  const resourceItems = useMemo(() => {
    if (!megaFetched) return defaultResources
    return mergeCmsNav(megaNav, defaultResources, routePrefix, { withIcons: true })
  }, [megaNav, megaFetched, defaultResources, routePrefix])

  const resourcesLabel = copy.resources || 'Resources'
  const loginLabel = copy.login || 'Login'
  const demoLabel = copy.see_demo || 'See it in Action'
  const trialLabel = copy.start_trial || 'Start Free Trial'

  return (
    <header className="sticky top-0 z-40">
      <ContactTopBar />
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link to={marketPath('/', routePrefix)} className="flex items-center" aria-label="Petroleu">
          <img
            src="/petroleu-logo.png"
            alt="Petroleu"
            className="h-7 w-auto max-w-[140px] object-contain sm:h-8 sm:max-w-none"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isHash = item.href.includes('#')
            const active =
              !isHash &&
              (pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href)))
            return (
              <NavItem
                key={item.name}
                to={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.name}
              </NavItem>
            )
          })}

          {resourcesLabel && resourceItems.length > 0 ? (
          <div ref={resourcesRef} className="relative">
            <button
              type="button"
              onClick={() => setResourcesOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
            >
              {resourcesLabel}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
            </button>
            {resourcesOpen && (
              <div className="absolute end-0 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-lg">
                {resourceItems.map((r) => (
                  <NavItem
                    key={r.name}
                    to={r.href}
                    onClick={() => setResourcesOpen(false)}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{r.name}</div>
                      {r.desc ? <div className="text-xs text-muted-foreground">{r.desc}</div> : null}
                    </div>
                  </NavItem>
                ))}
              </div>
            )}
          </div>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {loginLabel ? (
          <a
            href={pmsAppHref('/login')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            {loginLabel}
          </a>
          ) : null}
          {demoLabel && (whatsappUrl || !isAfghanistan) ? (
          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
          >
            <PlayCircle className="h-4 w-4" />
            {demoLabel}
          </button>
          ) : null}

          <DemoRequestModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="container mx-auto max-w-7xl px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.name}
              </NavItem>
            ))}
            <div className="pt-2">
              {resourcesLabel && resourceItems.length > 0 ? (
                <>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {resourcesLabel}
              </p>
              {resourceItems.map((r) => (
                <NavItem
                  key={r.name}
                  to={r.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {r.name}
                </NavItem>
              ))}
                </>
              ) : null}
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              {loginLabel ? (
              <a
                href={pmsAppHref('/login')}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                {loginLabel}
              </a>
              ) : null}
              {trialLabel ? (
              <Link to={marketPath('/contact', routePrefix)} onClick={() => setMobileMenuOpen(false)}>
                <MButton className="w-full">{trialLabel}</MButton>
              </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
  )
}
