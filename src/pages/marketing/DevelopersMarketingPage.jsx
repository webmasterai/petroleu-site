import { Link } from 'react-router-dom'
import { BookOpen, Code2, ExternalLink, FileText, Globe } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MButton } from '../../components/marketing/ui'
import { getDocumentationUrl } from '../../config/documentation'
import { websiteContent } from '../../content/websiteContent'

const CMS_PUBLIC_BASE = '/api/cms'

export default function DevelopersMarketingPage() {
  const docsUrl = getDocumentationUrl()
  const brand = websiteContent.brand

  const resources = [
    {
      icon: BookOpen,
      title: 'Petroleu docs',
      description:
        'Petroleu documentation index — product overview, public API notes, and operator guide links.',
      href: '/docs',
      external: false,
    },
    {
      icon: Code2,
      title: 'Petroleu API docs',
      description:
        'Truthful public website API notes and the OpenAPI 3.1 specification. Tenant ERP routes stay private.',
      href: '/docs/api',
      external: false,
    },
    {
      icon: Globe,
      title: 'Public marketing content API',
      description:
        'Read-only CMS endpoints serve hero sections, pricing, FAQs, and legal pages for the Petroleu website.',
      href: `${CMS_PUBLIC_BASE}/pricing`,
      external: false,
    },
    {
      icon: FileText,
      title: 'OpenAPI, LLMs & sitemap',
      description:
        'Machine-readable files: /openapi.json, /llms.txt, and /sitemap.xml for agents and integrators.',
      href: '/openapi.json',
      external: false,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/developers" />
      <MarketingPageJsonLd path="/developers" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Petroleu Developer Resources
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Integration notes, public CMS endpoints, operator documentation, and machine-readable
              indexes for Petroleu — petrol pump and fuel station management software for Pakistan.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map(({ icon: Icon, title, description, href, external }) => (
                <article
                  key={title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Open documentation
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to={href.startsWith('/') ? href : `/${href}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View resource
                    </Link>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-border bg-muted/30 p-8">
              <h2 className="text-2xl font-semibold text-foreground">Authenticated PMS API</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                The Petroleu application API ({`/api/v1/*`}) requires Sanctum authentication and is
                intended for licensed station tenants — not anonymous public access. Petroleu does
                not currently publish webhooks or a hosted MCP server. Contact{' '}
                <a href={`mailto:${brand.salesEmail}`} className="text-primary hover:underline">
                  {brand.salesEmail}
                </a>{' '}
                for integration or partner access questions.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact">
                  <MButton>Contact integrations</MButton>
                </Link>
                <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                  <MButton variant="outline" className="gap-2">
                    Operator docs
                    <ExternalLink className="h-4 w-4" />
                  </MButton>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
