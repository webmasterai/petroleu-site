import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MessageCircle, Sparkles, BarChart3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

export function HeroSection() {
  const { data: cms } = useQuery({
    queryKey: ['cms', 'hero', 'home'],
    queryFn: () => safeCmsGet('/hero/home'),
    staleTime: 60_000,
  })

  const fallback = websiteContent.hero

  /**
   * The CMS hero schema uses `heading/subheading/cta_text/cta_link/cta2_text/cta2_link/image_url`
   * while our React UI was originally written against the static fallback shape
   * (`title/description/primary_button/secondary_button/dashboard_image_url`).
   * Read both shapes and prefer CMS when present, otherwise fall back.
   */
  const badge = cms?.badge ?? fallback.badge
  const title = cms?.heading ?? cms?.title ?? fallback.title
  const titleHighlight = cms?.title_highlight ?? cms?.titleHighlight ?? fallback.titleHighlight
  const description = cms?.subheading ?? cms?.description ?? fallback.description
  const secondaryButton = cms?.cta2_text ?? cms?.secondary_button ?? fallback.secondaryButton
  const dashboardImageUrl =
    cms?.image_url ?? cms?.dashboard_image_url ?? cms?.dashboardImageUrl ?? fallback.dashboardImageUrl
  const dashboardUrl = cms?.dashboard_url ?? cms?.dashboardUrl ?? fallback.dashboardUrl
  const features = (cms?.features && Array.isArray(cms.features)) ? cms.features : fallback.features
  const whatsappUrl = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 py-20 lg:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <MBadge className="gap-1 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              {badge}
            </MBadge>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}{' '}
              <span className="text-primary">{titleHighlight}</span>
            </h1>

            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MButton size="lg" variant="whatsapp" className="gap-2 w-full sm:w-auto">
                  <MessageCircle className="h-5 w-5" />
                  See it in Action
                </MButton>
              </a>
              <Link to="/pricing">
                <MButton variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  {secondaryButton}
                  <ArrowRight className="h-5 w-5" />
                </MButton>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-primary/80" />
                <div className="ml-3 flex-1 truncate rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {dashboardUrl}
                </div>
              </div>

              {/* Dashboard image */}
              <div className="overflow-hidden rounded-lg bg-muted/30">
                {dashboardImageUrl ? (
                  <img
                    src={dashboardImageUrl}
                    alt="Petroleu petrol pump management dashboard preview"
                    className="w-full h-auto object-contain"
                    loading="eager"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-muted to-muted/50" />
                )}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                  <p className="text-sm font-semibold text-foreground">PKR 2.8M</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 hidden rounded-xl border border-border bg-card p-3 shadow-lg sm:block">
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
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
