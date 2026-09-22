import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, ChevronDown, FileText, PlayCircle } from 'lucide-react'
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

/** Map CMS nav only — no slice, no hardcoded merge. Empty CMS = empty menu. */
function mapCmsNav(cmsRows, routePrefix, { withIcons = false } = {}) {
  if (!Array.isArray(cmsRows)) return []

  return [...cmsRows]
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((n) => {
      const name = String(n.label || n.title || n.name || '').trim()
      const rawUrl = n.url || '/'
      const href = /^(https?:|mailto:|tel:)/i.test(rawUrl)
        ? rawUrl
        : marketPath(rawUrl, routePrefix)
      const item = { id: n.id, name, href }
      if (withIcons) {
        item.icon = <FileText className="h-4 w-4" />
        item.desc = n.children_data?.desc || n.description || ''
      }
      return item
    })
    .filter((n) => n.name)
}

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const resourcesRef = useRef(null)
  const { pathname } = useLocation()
  const { routePrefix, isAfghanistan } = useMarketLocale()
  const { copy, whatsappUrl } = useUiCopy()
  const { data: headerNav, isSuccess: headerOk } = useCmsQuery(['nav', 'header'], '/navigation', {
    config: { params: { location: 'header' } },
  })
  const { data: megaNav, isSuccess: megaOk } = useCmsQuery(['nav', 'mega'], '/navigation', {
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

  // CMS only — never invent menu items from hardcoded defaults
  const navItems = useMemo(() => {
    if (!headerOk || !Array.isArray(headerNav)) return []
    return mapCmsNav(headerNav, routePrefix)
  }, [headerNav, headerOk, routePrefix])

  const resourceItems = useMemo(() => {
    if (!megaOk || !Array.isArray(megaNav)) return []
    return mapCmsNav(megaNav, routePrefix, { withIcons: true })
  }, [megaNav, megaOk, routePrefix])

  const resourcesLabel = copy.resources || 'Resources'
  const loginLabel = copy.login || 'Login'
  const demoLabel = copy.see_demo || 'See it in Action'
  const trialLabel = copy.start_trial || 'Start Free Trial'

  return (
    <header className="sticky top-0 z-40">
      <ContactTopBar />
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {/* min-h (not fixed clip) so wrapped Dari/Pashto labels never get cut off */}
        <div className="container mx-auto flex max-w-7xl min-h-16 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 lg:flex-nowrap lg:py-0">
          <Link
            to={marketPath('/', routePrefix)}
            className="flex shrink-0 items-center"
            aria-label="Petroleu"
          >
            <img src="/petroleu-logo.png" alt="Petroleu" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop nav: no overflow-hidden / overflow-x-auto — all CMS items stay visible */}
          <nav className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-0.5 gap-y-1 lg:flex xl:gap-x-1">
            {navItems.map((item, idx) => {
              const isHash = item.href.includes('#')
              const active =
                !isHash &&
                (pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href)))
              return (
                <NavItem
                  key={item.id != null ? `nav-${item.id}` : `${item.href}-${item.name}-${idx}`}
                  to={item.href}
                  className={`shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition-colors xl:px-2.5 ${
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
              <div ref={resourcesRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setResourcesOpen((v) => !v)}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground xl:px-2.5"
                >
                  {resourcesLabel}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {resourcesOpen && (
                  <div className="absolute end-0 z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-lg">
                    {resourceItems.map((r, idx) => (
                      <NavItem
                        key={r.id != null ? `mega-${r.id}` : `${r.href}-${r.name}-${idx}`}
                        to={r.href}
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {r.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground">{r.name}</div>
                          {r.desc ? (
                            <div className="text-xs text-muted-foreground">{r.desc}</div>
                          ) : null}
                        </div>
                      </NavItem>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
            {loginLabel ? (
              <a
                href={pmsAppHref('/login')}
                className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted md:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                {loginLabel}
              </a>
            ) : null}
            {demoLabel && (whatsappUrl || !isAfghanistan) ? (
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="hidden items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1ebe5d] md:inline-flex"
              >
                <PlayCircle className="h-4 w-4" />
                {demoLabel}
              </button>
            ) : null}

            <DemoRequestModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu — separate from desktop nav */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card lg:hidden">
            <div className="container mx-auto max-w-7xl space-y-1 px-4 py-4">
              {navItems.map((item, idx) => (
                <NavItem
                  key={item.id != null ? `m-nav-${item.id}` : `${item.href}-${item.name}-${idx}`}
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
                    {resourceItems.map((r, idx) => (
                      <NavItem
                        key={r.id != null ? `m-mega-${r.id}` : `${r.href}-${r.name}-${idx}`}
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
              <div className="space-y-2 border-t border-border pt-3">
                {loginLabel ? (
                  <a
                    href={pmsAppHref('/login')}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {loginLabel}
                  </a>
                ) : null}
                {trialLabel ? (
                  <Link
                    to={marketPath('/contact', routePrefix)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
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
