import { Link } from 'react-router-dom'
import { BookOpen, Code2, FileJson, Globe, Mail } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MButton } from '../../components/marketing/ui'
import { getDocumentationUrl } from '../../config/documentation'
import { websiteContent } from '../../content/websiteContent'

export default function DocsMarketingPage() {
  const operatorDocsUrl = getDocumentationUrl()
  const brand = websiteContent.brand

  const cards = [
    {
      icon: Globe,
      title: 'Product overview',
      description:
        'Petroleu is petrol pump and fuel station management software for Pakistan — tanks, nozzles, sales, inventory, accounts, shifts, rate changes, dip gain/loss, and reporting.',
      href: '/',
      label: 'Open product overview',
    },
    {
      icon: Code2,
      title: 'Public API notes',
      description:
        'Truthful documentation for the official website API: public CMS reads, contact forms, health, and the OpenAPI specification.',
      href: '/docs/api',
      label: 'Open Petroleu API docs',
    },
    {
      icon: FileJson,
      title: 'OpenAPI specification',
      description:
        'Machine-readable OpenAPI 3.1 document at /openapi.json. It lists only intentionally public website endpoints.',
      href: '/openapi.json',
      label: 'View openapi.json',
    },
    {
      icon: BookOpen,
      title: 'Operator guides',
      description:
        'Module guides for licensed Petroleu PMS operators. These are product manuals, not a public tenant API.',
      href: operatorDocsUrl,
      label: 'Open operator documentation',
      external: operatorDocsUrl.startsWith('http'),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/docs" />
      <MarketingPageJsonLd path="/docs" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Petroleu Docs
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Petroleu documentation for the official website, public developer resources, and
              operator guides. Start here to learn what the product does and which HTTP endpoints
              are intentionally public.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {cards.map(({ icon: Icon, title, description, href, label, external }) => (
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
                      className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      {label}
                    </Link>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-border bg-muted/30 p-8">
              <h2 className="text-2xl font-semibold text-foreground">What is not public</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                The tenant petrol-pump ERP (`/api/v1/*`), CMS admin, authentication internals, and
                operational WhatsApp routes stay private. Petroleu does not currently publish
                webhooks or a hosted MCP server. For licensed integrations, contact{' '}
                <a href={`mailto:${brand.salesEmail}`} className="text-primary hover:underline">
                  {brand.salesEmail}
                </a>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/docs/api">
                  <MButton>Petroleu API docs</MButton>
                </Link>
                <Link to="/developers">
                  <MButton variant="outline">Developer resources</MButton>
                </Link>
                <Link to="/contact">
                  <MButton variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </MButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
