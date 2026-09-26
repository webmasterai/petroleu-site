import { Link } from 'react-router-dom'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MButton } from '../../components/marketing/ui'
import { useUiCopy } from '../../hooks/useUiCopy'

/** API docs landing — noindex; does not expose OpenAPI JSON in the UI. */
export default function DocsApiMarketingPage() {
  const { mp } = useUiCopy()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/docs/api"
        title="API documentation — Petroleu"
        description="Petroleu API documentation is not publicly listed."
        noindex
      />
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">API documentation</h1>
          <p className="mt-3 text-muted-foreground">
            Public API notes and OpenAPI listings are not shown here. Reach out if you need
            integration support.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={mp('/contact')}>
              <MButton>Contact sales</MButton>
            </Link>
            <Link to={mp('/')}>
              <MButton variant="outline">Home</MButton>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
