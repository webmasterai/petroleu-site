import { Link } from 'react-router-dom'
import { BlogCard } from './BlogCard'
import { MButton } from './ui'
import { getHomepageResources } from '../../content/resources'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { mapCmsBlogPost } from '../../utils/cmsContent'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'

export function BlogPreviewSection() {
  const { market } = useMarketLocale()
  const { mp } = useUiCopy()
  const { data } = useCmsQuery(['blog', 'homepage'], '/blog', {
    config: { params: { homepage: 1 } },
  })
  const heading = useSectionHeading('blog', {
    eyebrow: 'Blog',
    title: 'Latest From Petroleu',
    subtitle:
      'Watch product videos and read practical guides about petrol pump software, automation, reporting, and fuel station management.',
    cta: 'View All Resources',
  })

  const cmsPosts = Array.isArray(data) ? data.map(mapCmsBlogPost).filter(Boolean) : []
  const homepageResources =
    cmsPosts.length > 0 ? cmsPosts : market === 'af' ? [] : getHomepageResources()

  if (!homepageResources.length) return null

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{heading.eyebrow}</p>
          ) : null}
          {heading.title ? (
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              {heading.title}
            </h2>
          ) : null}
          {heading.subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heading.subtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {homepageResources.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {heading.cta ? (
          <div className="mt-12 text-center">
            <Link to={mp('/blog')}>
              <MButton>{heading.cta}</MButton>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
