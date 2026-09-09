import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton } from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

/**
 * CtaSection
 * - When `slug` is given, fetches /cta-sections/:slug and falls back to static.
 * - When explicit copy props (heading/subheading/primaryButton/...) are given,
 *   it renders directly without CMS fetch (used by /analytics, /reports,
 *   /industries marketing pages).
 */
export function CtaSection({
  slug,
  heading,
  title,
  subheading,
  description,
  primaryButton,
  primaryHref,
  secondaryButton,
  secondaryHref,
} = {}) {
  const explicit = !!(heading || title || subheading || description)

  const { data } = useQuery({
    queryKey: ['cms', 'cta', slug || '__static__'],
    queryFn: () => safeCmsGet(`/cta/${slug || 'home-bottom'}`),
    enabled: !explicit,
    staleTime: 60_000,
  })

  const fallback = websiteContent.cta
  const cta = explicit ? null : data || fallback

  /**
   * The CMS CTA schema uses `heading/subheading/btn1_text/btn1_link/btn2_text/btn2_link`
   * (see cms_cta_sections migration). Read that shape, plus a couple of
   * legacy aliases, plus the static-fallback shape.
   */
  const finalTitle = title || heading || cta?.heading || cta?.title || fallback.title
  const finalDescription =
    description || subheading || cta?.subheading || cta?.description || fallback.description
  const finalPrimary =
    primaryButton ||
    cta?.btn1_text ||
    cta?.primary_button ||
    cta?.primaryButton ||
    fallback.primaryButton
  const finalSecondary =
    secondaryButton ||
    cta?.btn2_text ||
    cta?.secondary_button ||
    cta?.secondaryButton ||
    fallback.secondaryButton

  const whatsappUrl = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`
  const primaryLink = primaryHref || cta?.btn1_link || cta?.primary_link || null
  const secondaryLink = secondaryHref || cta?.btn2_link || cta?.secondary_link || null

  return (
    <section className="relative overflow-hidden bg-primary py-20">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
          {finalTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
          {finalDescription}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {primaryLink ? (
            <Link to={primaryLink}>
              <MButton
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                {finalPrimary}
              </MButton>
            </Link>
          ) : (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MButton
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                {finalPrimary}
              </MButton>
            </a>
          )}

          <Link to={secondaryLink || '/get-started'}>
            <MButton
              size="lg"
              variant="outline"
              className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
            >
              {finalSecondary}
              <ArrowRight className="h-4 w-4" />
            </MButton>
          </Link>
        </div>

        <p className="mt-6 text-sm text-primary-foreground/60">
          No credit card required. 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  )
}

export default CtaSection
