import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingBlogPostingJsonLd } from '../../components/marketing/MarketingJsonLd'
import { ResourceThumbnail } from '../../components/marketing/ResourceThumbnail'
import { BlogCard } from '../../components/marketing/BlogCard'
import { MButton, MBadge } from '../../components/marketing/ui'
import { getResourceBySlug, getRelatedResources } from '../../content/resources'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { mapCmsBlogPost } from '../../utils/cmsContent'
import { marketPath } from '../../utils/marketPath'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { market, locale } = useMarketLocale()
  const { data: cmsPost, isLoading } = useCmsQuery(['blog', slug], `/blog/${slug}`, {
    enabled: !!slug,
  })
  const mapped = mapCmsBlogPost(cmsPost)
  const fallback = market === 'af' ? null : getResourceBySlug(slug)
  const resource = mapped || fallback

  const notFoundCopy =
    locale === 'fa-AF'
      ? 'این مطلب برای افغانستان هنوز منتشر نشده است.'
      : locale === 'ps-AF'
        ? 'دا مطلب تر اوسه د افغانستان لپاره خپور شوی نه دی.'
        : market === 'af'
          ? 'This Afghanistan resource is not published yet.'
          : 'This guide may have moved or is not available yet.'

  if (isLoading && !resource) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-24 text-muted-foreground">
          Loading…
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingSeo path={`/blog/${slug || ''}`} title="Resource Not Found — Petroleu" noindex />
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-foreground">Resource not found</h1>
            <p className="mt-3 text-muted-foreground">{notFoundCopy}</p>
            <Link to={marketPath('/blog')} className="mt-8 inline-block">
              <MButton>
                <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
                Back to Resources
              </MButton>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const related = mapped
    ? (resource.relatedSlugs || [])
        .map((s) => null)
        .filter(Boolean)
    : getRelatedResources(resource)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path={`/blog/${resource.slug}`}
        title={resource.seoTitle || `${resource.title} — Petroleu Resources`}
        description={resource.seoDescription || resource.description}
      />
      <MarketingBlogPostingJsonLd
        title={resource.title}
        description={resource.seoDescription || resource.description}
        url={`/blog/${resource.slug}`}
        image={resource.image || resource.coverImage || resource.thumbnail}
        datePublished={resource.publishedAt || resource.date}
        dateModified={resource.updatedAt || resource.publishedAt || resource.date}
        authorName={resource.author || 'Petroleu'}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4 cms-directional-icon" />
              Back to Resources
            </Link>
            <MBadge variant="secondary" className="mt-6">
              {resource.category}
            </MBadge>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {resource.title}
            </h1>
            {resource.date && (
              <time className="mt-3 block text-sm text-muted-foreground">{resource.date}</time>
            )}
            <p className="mt-4 text-pretty text-lg text-muted-foreground">{resource.description}</p>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ResourceThumbnail post={resource} className="rounded-2xl" />

            <div className="prose prose-neutral mt-10 max-w-none whitespace-pre-wrap text-foreground">
              {resource.content}
            </div>
          </div>
        </section>

        {related?.length ? (
          <section className="border-t border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground">Related</h2>
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {related.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}
