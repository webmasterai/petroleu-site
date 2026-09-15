import { Link } from 'react-router-dom'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MButton } from '../../components/marketing/ui'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          This URL is not part of the Petroleu website. Return home or explore product and developer
          resources.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <MButton>Back to home</MButton>
          </Link>
          <Link to="/developers">
            <MButton variant="outline">Developer resources</MButton>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
