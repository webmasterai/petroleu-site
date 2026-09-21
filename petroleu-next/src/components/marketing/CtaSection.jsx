import { ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useUiCopy } from '../../hooks/useUiCopy'

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
  const { market, isAfghanistan, mp, whatsappUrl: afWhatsapp, copy } = useUiCopy()
  const explicit = !!(heading || title || subheading || description)

  const { data } = useCmsQuery(['cta', slug || '__static__'], `/cta/${slug || 'home-bottom'}`, {
    enabled: !explicit,
  })

  const fallback = market === 'af' ? null : websiteContent.cta
  const cta = explicit ? null : data || fallback

  const finalTitle = title || heading || cta?.heading || cta?.title || fallback?.title || ''
  const finalDescription =
    description || subheading || cta?.subheading || cta?.description || fallback?.description || ''
  const finalPrimary =
    primaryButton ||
    cta?.cta_text ||
    cta?.link_label ||
    cta?.btn1_text ||
    cta?.primary_button ||
    cta?.primaryButton ||
    copy.see_demo ||
    fallback?.primaryButton ||
    ''
  const finalSecondary =
    secondaryButton ||
    cta?.cta2_text ||
    cta?.btn2_text ||
    cta?.secondary_button ||
    cta?.secondaryButton ||
    fallback?.secondaryButton ||
    ''

  const whatsappUrl =
    market === 'af'
      ? afWhatsapp
      : `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  const primaryLink =
    primaryHref || cta?.link_url || cta?.cta_link || cta?.btn1_link || cta?.primary_link || null
  const secondaryLink = secondaryHref || cta?.btn2_link || cta?.secondary_link || null
  const trialNote = isAfghanistan
    ? null
    : 'No credit card required. 14-day free trial. Cancel anytime.'

  if (isAfghanistan && !finalTitle) return null

  const resolveInternal = (path) => {
    if (!path) return mp('/get-started')
    if (path.startsWith('http')) return path
    return mp(path.replace(/^\/(af(\/ps|\/en)?)?/, '') || '/')
  }

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
        {finalDescription ? (
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
            {finalDescription}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {primaryLink ? (
            <Link to={resolveInternal(primaryLink)}>
              <MButton
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                {finalPrimary}
              </MButton>
            </Link>
          ) : whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MButton
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                {finalPrimary || copy.contact_sales}
              </MButton>
            </a>
          ) : finalPrimary ? (
            <Link to={mp('/contact')}>
              <MButton
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                {finalPrimary}
              </MButton>
            </Link>
          ) : null}

          {finalSecondary ? (
            <Link to={resolveInternal(secondaryLink || '/get-started')}>
              <MButton
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                {finalSecondary}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </MButton>
            </Link>
          ) : null}
        </div>

        {trialNote ? (
          <p className="mt-6 text-sm text-primary-foreground/60">{trialNote}</p>
        ) : null}
      </div>
    </section>
  )
}

export default CtaSection
