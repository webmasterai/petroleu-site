import { ArrowRight, MessageCircle, Sparkles, BarChart3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useUiCopy } from '../../hooks/useUiCopy'
import { pmsAppHref } from '../../config/pmsApp'

export function HeroSection() {
  const { isAfghanistan, mp, copy, whatsappUrl: afWhatsapp } = useUiCopy()
  const { data: cms } = useCmsQuery(['hero', 'home'], '/hero/home')
  const fallback = isAfghanistan ? null : websiteContent.hero

  if (isAfghanistan && !cms) return null

  const pick = (...vals) => {
    for (const v of vals) {
      if (v == null) continue
      const s = String(v).trim()
      if (s) return s
    }
    return ''
  }

  const badge = pick(cms?.badge, fallback?.badge)
  const title = pick(cms?.heading, cms?.title, fallback?.title, isAfghanistan ? '' : 'Petroleu')
  // When CMS answered, do not restore hardcoded titleHighlight (empty = hide)
  const titleHighlight = cms
    ? pick(cms.title_highlight, cms.titleHighlight)
    : pick(fallback?.titleHighlight)
  const description = pick(cms?.subheading, cms?.description, fallback?.description)
  const secondaryButton = pick(
    cms?.cta2_text,
    cms?.secondary_button,
    cms?.secondaryButton,
    fallback?.secondaryButton,
    copy.view_pricing,
  )
  const primaryLabel = pick(
    cms?.cta_text,
    cms?.primary_button,
    cms?.primaryButton,
    cms?.link_label,
    copy.see_demo,
  )
  const dashboardImageUrl = cms
    ? pick(cms?.image_url, cms?.dashboard_image_url, cms?.dashboardImageUrl)
    : pick(fallback?.dashboardImageUrl)
  const dashboardUrl = pick(cms?.dashboard_url, cms?.dashboardUrl, fallback?.dashboardUrl)
  const features = Array.isArray(cms?.features)
    ? cms.features.filter(Boolean)
    : fallback?.features || []

  const pkWhatsapp = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`
  const whatsappUrl = isAfghanistan ? afWhatsapp : pkWhatsapp
  // Prospectus demo account flow lives on the PMS app after the site split.
  const primaryHref = isAfghanistan && whatsappUrl ? whatsappUrl : pmsAppHref('/demo')
  const primaryIsExternal = primaryHref.startsWith('http')

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 py-20 lg:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute start-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 end-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {badge ? (
              <MBadge className="gap-1 px-3 py-1">
                <Sparkles className="h-3 w-3" />
                {badge}
              </MBadge>
            ) : null}

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}{' '}
              {titleHighlight ? <span className="text-primary">{titleHighlight}</span> : null}
            </h1>

            {description ? (
              <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">{description}</p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryLabel && primaryIsExternal ? (
                <a href={primaryHref} target={isAfghanistan ? '_blank' : undefined} rel={isAfghanistan ? 'noopener noreferrer' : undefined}>
                  <MButton size="lg" variant={isAfghanistan ? 'whatsapp' : 'default'} className="gap-2 w-full sm:w-auto">
                    {isAfghanistan ? <MessageCircle className="h-5 w-5" /> : null}
                    {primaryLabel}
                  </MButton>
                </a>
              ) : primaryLabel ? (
                <Link to={mp('/contact')}>
                  <MButton size="lg" className="gap-2 w-full sm:w-auto">
                    {primaryLabel}
                  </MButton>
                </Link>
              ) : null}
              {secondaryButton ? (
                <Link to={mp('/pricing')}>
                  <MButton variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                    {secondaryButton}
                    <ArrowRight className="h-5 w-5 cms-directional-icon" />
                  </MButton>
                </Link>
              ) : null}
            </div>

            {features.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-primary/80" />
                <div className="ms-3 flex-1 truncate rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground" dir="ltr">
                  {dashboardUrl || 'app.petroleu.com'}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-muted/30">
                {dashboardImageUrl ? (
                  <img
                    src={dashboardImageUrl}
                    alt="Petroleu"
                    className="h-auto w-full object-contain"
                    loading="eager"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-muted to-muted/50" />
                )}
              </div>
            </div>

            {!isAfghanistan ? (
              <>
                <div className="absolute -start-4 top-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Today&apos;s Sales</p>
                      <p className="text-sm font-semibold text-foreground">PKR 2.8M</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -end-4 bottom-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reports</p>
                      <p className="text-sm font-semibold text-foreground">20+ Available</p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
