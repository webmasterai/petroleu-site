import { Link } from 'react-router-dom'
import { BookOpen, Code2, ExternalLink, FileText, Globe } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MButton } from '../../components/marketing/ui'
import { getDocumentationUrl } from '../../config/documentation'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useUiCopy } from '../../hooks/useUiCopy'

/** Absolute in production (VITE_CMS_API_BASE_URL); relative `/api/cms` for local Vite proxy. */
function resolveCmsPublicBase() {
  try {
    const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
    if (viteEnv && typeof viteEnv === 'object' && viteEnv.VITE_CMS_API_BASE_URL) {
      return String(viteEnv.VITE_CMS_API_BASE_URL).replace(/\/+$/, '')
    }
  } catch {
    /* ignore */
  }
  return '/api/cms'
}
const CMS_PUBLIC_BASE = resolveCmsPublicBase()
const ICON_MAP = { BookOpen, Code2, Globe, FileText }

export default function DevelopersMarketingPage() {
  const { isAfghanistan, mp, settings } = useUiCopy()
  const docsUrl = getDocumentationUrl()
  const brand = websiteContent.brand
  const { data: hero } = useCmsQuery(['hero', 'developers'], '/hero/developers')
  const { data: cardsCms } = useCmsQuery(['page-cards', 'developers'], '/page-cards/developers')

  const pkResources = [
    {
      icon: 'Globe',
      title: 'Public marketing content API',
      description:
        'Read-only CMS endpoints serve hero sections, pricing, FAQs, and legal pages for the Petroleu website.',
      href: `${CMS_PUBLIC_BASE}/pricing`,
      external: CMS_PUBLIC_BASE.startsWith('http'),
    },
    {
      icon: 'FileText',
      title: 'Sitemap & LLMs index',
      description: 'Public machine-readable files for agents: /llms.txt and /sitemap.xml.',
      href: '/llms.txt',
      external: false,
    },
  ]

  const resources = (
    Array.isArray(cardsCms) && cardsCms.length
      ? cardsCms.map((c) => ({
          icon: c.icon || 'BookOpen',
          title: c.title,
          description: c.description,
          href: c.link_url || '/',
          label: c.link_label || 'View resource',
          external: Boolean(c.external),
        }))
      : isAfghanistan
        ? []
        : pkResources.map((r) => ({ ...r, label: 'View resource' }))
  ).filter((r) => {
    const href = String(r.href || '')
    return !/\/docs(\/|$)/.test(href) && !href.includes('openapi.json')
  })

  const title =
    hero?.heading || hero?.title || (isAfghanistan ? '' : 'Petroleu Developer Resources')
  const subtitle =
    hero?.subheading ||
    hero?.description ||
    (isAfghanistan
      ? ''
      : 'Integration notes, public CMS endpoints, operator documentation, and machine-readable indexes for Petroleu — petrol pump and fuel station management software for Pakistan.')

  const privateTitle = settings.ui_docs_private_note || (isAfghanistan ? null : 'Authenticated PMS API')
  const privateBody =
    settings.ui_docs_private_body ||
    (isAfghanistan
      ? null
      : 'The Petroleu application API (`/api/v1/*`) requires Sanctum authentication and is intended for licensed station tenants — not anonymous public access.')

  const salesEmail = isAfghanistan
    ? settings.sales_email || settings.contact_email || null
    : brand.salesEmail

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/developers" />
      <MarketingPageJsonLd path="/developers" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {title ? (
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            ) : null}
            {subtitle ? (
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {resources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {resources.map(({ icon, title: cardTitle, description, href, label, external }) => {
                  const Icon = ICON_MAP[icon] || BookOpen
                  const isAbs = String(href || '').startsWith('http') || String(href || '').startsWith('/api') || String(href || '').startsWith('/openapi')
                  const to = isAbs
                    ? href
                    : mp(String(href || '/').replace(/^\/(af(\/ps|\/en)?)?/, '') || '/')
                  return (
                    <article
                      key={cardTitle}
                      className="rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="mt-4 text-xl font-semibold text-foreground">{cardTitle}</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
                      {external || String(href || '').startsWith('http') ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {label}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : isAbs ? (
                        <a href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                          {label}
                        </a>
                      ) : (
                        <Link
                          to={to}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {label}
                        </Link>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : null}

            {privateTitle && privateBody ? (
              <div className="mt-12 rounded-xl border border-border bg-muted/30 p-8">
                <h2 className="text-2xl font-semibold text-foreground">{privateTitle}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {privateBody}
                  {salesEmail ? (
                    <>
                      {' '}
                      <a href={`mailto:${salesEmail}`} className="text-primary hover:underline" dir="ltr">
                        {salesEmail}
                      </a>
                    </>
                  ) : null}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={mp('/contact')}>
                    <MButton>{settings.ui_contact_us || (isAfghanistan ? null : 'Contact integrations')}</MButton>
                  </Link>
                  {!isAfghanistan ? (
                    <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                      <MButton variant="outline" className="gap-2">
                        Operator docs
                        <ExternalLink className="h-4 w-4" />
                      </MButton>
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
