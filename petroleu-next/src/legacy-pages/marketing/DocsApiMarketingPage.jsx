import { Link } from 'react-router-dom'
import { FileJson, ShieldOff } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MButton } from '../../components/marketing/ui'
import { websiteContent } from '../../content/websiteContent'

const PUBLIC_GROUPS = [
  {
    title: 'Health',
    items: ['GET /api/health — Laravel API liveness used by the website stack.'],
  },
  {
    title: 'Public marketing CMS (read)',
    items: [
      'GET /api/cms/hero/{page}, /features, /pricing, /faq, /testimonials, /stats, and related marketing content.',
      'These endpoints power petroleu.com and return the standard success envelope used by the website.',
    ],
  },
  {
    title: 'Public inquiries (write)',
    items: [
      'POST /api/cms/contact — website contact form.',
      'POST /api/cms/demo-request — website demo request form.',
    ],
  },
]

export default function DocsApiMarketingPage() {
  const brand = websiteContent.brand

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/docs/api" />
      <MarketingPageJsonLd path="/docs/api" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Petroleu API Docs
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Petroleu API documentation for the official website. This page describes only
              intentionally public endpoints. Download the OpenAPI 3.1 specification for typed
              request and response schemas.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
            {PUBLIC_GROUPS.map((group) => (
              <article key={group.title}>
                <h2 className="text-2xl font-semibold text-foreground">{group.title}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}

            <article className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-primary">
                <FileJson className="h-5 w-5" />
                <h2 className="text-xl font-semibold text-foreground">OpenAPI 3.1</h2>
              </div>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                The published specification is available at{' '}
                <a href="/openapi.json" className="text-primary hover:underline">
                  /openapi.json
                </a>
                . Every listed operation includes an operationId, summary, description, tags, typed
                parameters, success and error schemas, authentication requirements, and rate-limit
                response documentation.
              </p>
            </article>

            <article className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="flex items-center gap-2">
                <ShieldOff className="h-5 w-5 text-foreground" />
                <h2 className="text-xl font-semibold text-foreground">Not in the public spec</h2>
              </div>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Product decision: `/api/v1/*` tenant ERP, `/api/cms/admin/*`, authentication
                internals, onboarding tokens, WhatsApp operational routes, and signed internal PDFs
                are private. Petroleu does not currently offer public webhooks or a hosted MCP
                server. Markdown content negotiation (`Accept: text/markdown`) applies to public
                marketing pages, not to these private APIs.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                For partner access questions, email{' '}
                <a href={`mailto:${brand.salesEmail}`} className="text-primary hover:underline">
                  {brand.salesEmail}
                </a>
                .
              </p>
            </article>

            <div className="flex flex-wrap gap-3">
              <a href="/openapi.json">
                <MButton>Download OpenAPI</MButton>
              </a>
              <Link to="/docs">
                <MButton variant="outline">Petroleu docs</MButton>
              </Link>
              <Link to="/developers">
                <MButton variant="outline">Developer resources</MButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
