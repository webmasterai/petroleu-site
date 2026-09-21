import { Link } from 'react-router-dom'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { marketPath } from '../../utils/marketPath'
import { MButton } from './ui'

/**
 * Section keys already rendered by dedicated Home/page components.
 * Anything else (especially `content`) is shown here so CMS "Add section" appears live.
 */
const HANDLED_KEYS = new Set([
  'hero',
  'logo',
  'stat',
  'how-it-works',
  'industry',
  'industry-card',
  'mobile-feature',
  'analytics-card',
  'why-choose',
  'supported-brand',
  'testimonial',
  'faq',
  'plan',
  'cta',
  'team',
  'mission-value',
  'mission',
  'company-story',
  'page-card',
])

function isHandledKey(key) {
  if (!key) return true
  if (HANDLED_KEYS.has(key)) return true
  if (key.startsWith('feature:')) return true
  if (key.startsWith('heading:')) return true
  if (key.startsWith('demo:')) return true
  return false
}

function resolveHref(url, routePrefix) {
  if (!url) return null
  if (/^(https?:|mailto:|tel:)/i.test(url)) return { external: true, href: url }
  const path = url.startsWith('/') ? url : `/${url}`
  return { external: false, href: marketPath(path, routePrefix) }
}

export function CmsContentBlock({ block }) {
  const { routePrefix } = useMarketLocale()
  if (!block) return null

  const title = block.title || block.heading || ''
  const description = block.description || block.subheading || ''
  const content = block.content || ''
  const imageUrl = block.image_url || block.dashboard_image_url
  const link = resolveHref(block.link_url || block.cta_link, routePrefix)
  const linkLabel = block.link_label || block.cta_text || ''

  if (!title && !description && !content && !imageUrl) return null

  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          {title ? (
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-pretty text-lg text-muted-foreground">{description}</p>
          ) : null}
          {content ? (
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {content}
            </div>
          ) : null}
          {link && linkLabel ? (
            <div className="mt-8">
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <MButton size="lg">{linkLabel}</MButton>
                </a>
              ) : (
                <Link to={link.href}>
                  <MButton size="lg">{linkLabel}</MButton>
                </Link>
              )}
            </div>
          ) : null}
        </div>
        {imageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
            <img
              src={imageUrl}
              alt={block.image_alt || title || 'Section image'}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Extra CMS blocks for a page that are not covered by hardcoded section components. */
export function CmsFlexibleSections({ pageSlug = 'home', onlyUnhandled = true }) {
  const { data } = useCmsQuery(['page-sections', pageSlug], `/page-sections/${pageSlug}`)
  const sections = Array.isArray(data) ? data : []

  const blocks = onlyUnhandled
    ? sections.filter((s) => !isHandledKey(s.section_key))
    : sections.filter((s) => s.section_key === 'content' || String(s.section_key || '').startsWith('content'))

  if (!blocks.length) return null

  return (
    <>
      {blocks.map((block) => (
        <CmsContentBlock key={block.id || `${block.section_key}-${block.sort_order}`} block={block} />
      ))}
    </>
  )
}
