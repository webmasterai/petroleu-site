import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { BlogCard } from '../../components/marketing/BlogCard'
import { MBadge } from '../../components/marketing/ui'
import { getPublishedResources } from '../../content/resources'

export default function BlogMarketingPage() {
  const allResources = getPublishedResources()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/blog"
        title="Resources — Petroleu | Videos & Petrol Pump Software Guides"
        description="Petroleu resources: product videos, automation guides, ATG monitoring, AI reporting, WhatsApp invoices, and fuel station management tips."
        keywords="Petroleu resources, petrol pump software, dispenser integration, ATG monitoring, fuel station automation, daily closing report"
      />
      <MarketingPageJsonLd path="/blog" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-4">
              Videos & Guides
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Petroleu Resources
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Videos, guides, and automation resources for petrol pump owners.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {allResources.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
