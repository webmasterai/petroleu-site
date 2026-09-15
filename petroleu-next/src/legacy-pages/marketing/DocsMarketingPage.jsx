import { Link } from 'react-router-dom'
import { BookOpen, Code2, FileJson, Globe, Mail, FileText } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MButton } from '../../components/marketing/ui'
import { getDocumentationUrl } from '../../config/documentation'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useUiCopy } from '../../hooks/useUiCopy'

const ICON_MAP = { Globe, Code2, FileJson, BookOpen, FileText, Mail }

export default function DocsMarketingPage() {
  const { market, isAfghanistan, mp, settings } = useUiCopy()
  const operatorDocsUrl = getDocumentationUrl()
  const brand = websiteContent.brand
  const { data: hero } = useCmsQuery(['hero', 'docs'], '/hero/docs')
  const { data: cardsCms } = useCmsQuery(['page-cards', 'docs'], '/page-cards/docs')

  const pkCards = [
    {
      icon: 'Globe',
      title: 'Product overview',
      description:
        'Petroleu is petrol pump and fuel station management software for Pakistan — tanks, nozzles, sales, inventory, accounts, shifts, rate changes, dip gain/loss, and reporting.',
      href: '/',
      label: 'Open product overview',
    },
    {
      icon: 'Code2',
      title: 'Public API notes',
      description:
        'Truthful documentation for the official website API: public CMS reads, contact forms, health, and the OpenAPI specification.',
      href: '/docs/api',
      label: 'Open Petroleu API docs',
    },
    {
      icon: 'FileJson',
      title: 'OpenAPI specification',
      description:
        'Machine-readable OpenAPI 3.1 document at /openapi.json. It lists only intentionally public website endpoints.',
      href: '/openapi.json',
      label: 'View openapi.json',
    },
    {
      icon: 'BookOpen',
      title: 'Operator guides',
      description:
        'Module guides for licensed Petroleu PMS operators. These are product manuals, not a public tenant API.',
      href: operatorDocsUrl,
      label: 'Open operator documentation',
      external: operatorDocsUrl.startsWith('http'),
    },
  ]

  const cards =
    Array.isArray(cardsCms) && cardsCms.length
      ? cardsCms.map((c) => ({
          icon: c.icon || 'Globe',
          title: c.title,
          description: c.description,
          href: c.link_url || c.href || '/',
          label: c.link_label || c.label,
          external: Boolean(c.external) || String(c.link_url || '').startsWith('http'),
        }))
      : isAfghanistan
        ? []
        : pkCards

  const title =
    hero?.heading || hero?.title || (isAfghanistan ? '' : 'Petroleu Docs')
  const subtitle =
    hero?.subheading ||
    hero?.description ||
    (isAfghanistan
      ? ''
      : 'Petroleu documentation for the official website, public developer resources, and operator guides. Start here to learn what the product does and which HTTP endpoints are intentionally public.')

  const privateTitle = settings.ui_docs_private_note || (isAfghanistan ? null : 'What is not public')
  const privateBody =
    settings.ui_docs_private_body ||
    (isAfghanistan
      ? null
      : 'The tenant petrol-pump ERP (`/api/v1/*`), CMS admin, authentication internals, and operational WhatsApp routes stay private. Petroleu does not currently publish webhooks or a hosted MCP server. For licensed integrations, contact us.')

  if (isAfghanistan && !title && cards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingSeo path="/docs" />
        <SiteHeader />
        <main className="flex-1" />
        <SiteFooter />
      </div>
    )
  }

  const salesEmail = isAfghanistan
    ? settings.sales_email || settings.contact_email || null
    : brand.salesEmail

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/docs" />
      <MarketingPageJsonLd path="/docs" />
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
            {cards.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {cards.map(({ icon, title: cardTitle, description, href, label, external }) => {
                  const Icon = ICON_MAP[icon] || Globe
                  const to = href?.startsWith('http') || href?.startsWith('/api') || href?.startsWith('/openapi')
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
                          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                        >
                          {label}
                        </a>
                      ) : href?.startsWith('/api') || href?.startsWith('/openapi') ? (
                        <a href={href} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                          {label}
                        </a>
                      ) : (
                        <Link to={to} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
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
                  <Link to={mp('/docs/api')}>
                    <MButton>{settings.ui_docs_api_btn || 'API'}</MButton>
                  </Link>
                  <Link to={mp('/developers')}>
                    <MButton variant="outline">
                      {settings.ui_developer_resources || settings.ui_resources || 'Developers'}
                    </MButton>
                  </Link>
                  {settings.ui_contact_us ? (
                    <Link to={mp('/contact')}>
                      <MButton variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" />
                        {settings.ui_contact_us}
                      </MButton>
                    </Link>
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
