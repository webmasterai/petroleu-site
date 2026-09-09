import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Fuel, Menu, X, LayoutDashboard, ChevronDown, BarChart3, FileText, Smartphone, PlayCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { MButton } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { DemoRequestModal } from './DemoRequestModal'
import { ContactTopBar } from './ContactTopBar'
import { pmsAppHref } from '../../config/pmsApp'

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

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  const resourcesRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    function onClick(e) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const navItems = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Mobile App', href: '/#mobile' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const resourceItems = [
    {
      name: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      desc: 'Real-time dashboards & insights',
    },
    {
      name: 'Reports',
      href: '/product/reports',
      icon: <FileText className="h-4 w-4" />,
      desc: '20+ pre-built business reports',
    },
    {
      name: 'FAQ',
      href: '/faq',
      icon: <Smartphone className="h-4 w-4" />,
      desc: 'Common questions answered',
    },
    {
      name: 'Docs',
      href: '/docs',
      icon: <FileText className="h-4 w-4" />,
      desc: 'Petroleu docs and public API notes',
    },
  ]

  return (
    <header className="sticky top-0 z-40">
      <ContactTopBar />
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center" aria-label={websiteContent.brand.name}>
          <img
            src="/petroleu-logo.png"
            alt={websiteContent.brand.name}
            className="h-8 w-auto object-contain"
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
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.name}
              </NavItem>
            )
          })}

          <div ref={resourcesRef} className="relative">
            <button
              type="button"
              onClick={() => setResourcesOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Resources
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
            </button>
            {resourcesOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover p-2 shadow-lg">
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
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                    </div>
                  </NavItem>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={pmsAppHref('/login')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Login
          </a>
          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2 text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
          >
            <PlayCircle className="h-4 w-4" />
            See it in Action
          </button>

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
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resources
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
            </div>
            <div className="pt-3 border-t border-border space-y-2">
              <a
                href={pmsAppHref('/login')}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                Login
              </a>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                <MButton className="w-full">Start Free Trial</MButton>
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
  )
}
