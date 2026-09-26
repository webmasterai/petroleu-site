import { Link } from 'react-router-dom'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MButton } from '../../components/marketing/ui'
import { useUiCopy } from '../../hooks/useUiCopy'

/**
 * Public documentation is hidden from marketing navigation and search.
 * Routes remain reachable for internal tooling but are noindex and do not expose OpenAPI/cards.
 */
export default function DocsMarketingPage() {
  const { mp } = useUiCopy()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/docs"
        title="Documentation — Petroleu"
        description="Petroleu product documentation is not publicly listed."
        noindex
      />
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
          <p className="mt-3 text-muted-foreground">
            Public documentation and API specifications are not listed on this website. For product
            questions, contact our team or visit developer resources.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={mp('/developers')}>
              <MButton variant="outline">Developer resources</MButton>
            </Link>
            <Link to={mp('/contact')}>
              <MButton>Contact</MButton>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
