import { Link, useParams } from 'react-router-dom'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { CmsContentBlock } from '../../components/marketing/CmsContentBlocks'
import { MBadge, MButton } from '../../components/marketing/ui'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { marketPath } from '../../utils/marketPath'
import NotFoundPage from './NotFoundPage'

/**
 * CMS-driven marketing page for pages created in admin (and any slug not hardcoded).
 * Renders published hero + content/cta/faq sections from /api/cms/page/:slug
 */
export default function CmsMarketingPage({ slug: slugProp } = {}) {
  const params = useParams()
  const slug = slugProp || params.slug
  const { routePrefix } = useMarketLocale()
  const { data, isLoading, isError } = useCmsQuery(['page', slug], `/page/${slug}`, {
    enabled: Boolean(slug),
    staleTime: 15_000,
  })

  const page = data?.page
  const sections = Array.isArray(data?.sections) ? data.sections : []

  if (!slug) return <NotFoundPage />
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 px-4 py-20 text-center text-muted-foreground">Loading…</main>
        <SiteFooter />
      </div>
    )
  }

  // No published content yet
  if (isError || (!sections.length && !page?.title)) {
    return <NotFoundPage />
  }

  const heroes = sections.filter((s) => s.section_key === 'hero')
  const rest = sections.filter((s) => s.section_key !== 'hero')
  const hero = heroes[0]
  const path = page?.frontend_path || `/${slug}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path={path} title={page?.title} description={page?.description} />
      <SiteHeader />
      <main className="flex-1">
        {hero ? (
          <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              {(hero.badge || hero.data?.badge) && (
                <MBadge variant="secondary" className="mb-4">
                  {hero.badge || hero.data?.badge}
                </MBadge>
              )}
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {hero.title || hero.heading || page?.title || slug}
              </h1>
              {(hero.description || hero.subheading) && (
                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
                  {hero.description || hero.subheading}
                </p>
              )}
              {(hero.link_url || hero.link_label) && (
                <div className="mt-8 flex justify-center">
                  <Link to={marketPath(hero.link_url || '/contact', routePrefix)}>
                    <MButton size="lg">{hero.link_label || hero.cta_text || 'Contact'}</MButton>
                  </Link>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {page?.title || slug}
              </h1>
              {page?.description ? (
                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
                  {page.description}
                </p>
              ) : null}
            </div>
          </section>
        )}

        {rest.map((block) => {
          if (block.section_key === 'faq') {
            return (
              <section key={block.id} className="border-t border-border bg-background py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                  <h3 className="text-lg font-semibold text-foreground">{block.title}</h3>
                  <p className="mt-2 text-muted-foreground">{block.description || block.content}</p>
                </div>
              </section>
            )
          }
          if (block.section_key === 'cta') {
            return (
              <section key={block.id} className="bg-primary py-16 text-primary-foreground">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold">{block.title}</h2>
                  {block.description ? <p className="mt-3 opacity-90">{block.description}</p> : null}
                  {(block.link_url || block.link_label) && (
                    <div className="mt-8">
                      <Link to={marketPath(block.link_url || '/contact', routePrefix)}>
                        <MButton size="lg" variant="secondary">
                          {block.link_label || 'Get started'}
                        </MButton>
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )
          }
          return <CmsContentBlock key={block.id || `${block.section_key}-${block.sort_order}`} block={block} />
        })}
      </main>
      <SiteFooter />
    </div>
  )
}
