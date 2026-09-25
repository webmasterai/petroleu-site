import {
  BarChart3,
  CreditCard,
  Clock,
  Users,
  Globe,
  Shield,
  Fuel,
  Database,
  Settings,
  Bell,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { FeaturesSection } from '../../components/marketing/FeaturesSection'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MBadge } from '../../components/marketing/ui'
import { withBestPrefix } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useCmsList } from '../../hooks/useCmsList'

const iconMap = {
  BarChart3,
  CreditCard,
  Clock,
  Users,
  Globe,
  Shield,
  Fuel,
  Database,
  Settings,
  Bell,
  TrendingUp,
  Sparkles,
}

/**
 * /features — CMS source of truth for page_slug=features
 * (hero, feature:card, feature:detailed, feature:benefit_bar, cta)
 */
export default function FeaturesMarketingPage() {
  const { data: heroData } = useCmsQuery(['hero', 'features'], '/hero/features')
  const { items: coreFeatures } = useCmsList(['features', 'features', 'card'], '/features', {
    fallback: [],
    config: { params: { page: 'features', type: 'card' } },
  })
  const { items: detailedFeatures } = useCmsList(
    ['features', 'features', 'detailed'],
    '/features',
    {
      fallback: [],
      config: { params: { page: 'features', type: 'detailed' } },
    },
  )
  const { items: benefitBar } = useCmsList(
    ['features', 'features', 'benefit_bar'],
    '/features',
    {
      fallback: [],
      config: { params: { page: 'features', type: 'benefit_bar' } },
    },
  )
  const { data: ctaData } = useCmsQuery(['cta', 'features'], '/cta/features')
  const { data: featuresHeading } = useCmsQuery(
    ['section-heading', 'features', 'page-features'],
    '/section-heading/features',
    {
      config: { params: { page: 'features' } },
      retry: 0,
    },
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/features" />
      <MarketingPageJsonLd path="/features" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {(heroData?.badge || heroData?.data?.badge) && (
              <MBadge variant="secondary" className="mb-4">
                {withBestPrefix(heroData.badge || heroData.data?.badge)}
              </MBadge>
            )}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {heroData?.heading || heroData?.title || 'Powerful Features'}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heroData?.subheading ||
                heroData?.description ||
                'Everything you need to run a modern fuel station — built for clarity, control, and growth.'}
            </p>
          </div>
        </section>

        <FeaturesSection
          pageSlug="features"
          allowHardcodedFallback={false}
          titleOverride={
            featuresHeading?.title || featuresHeading?.heading || 'Core capabilities'
          }
          subtitleOverride={
            featuresHeading?.description ||
            featuresHeading?.subheading ||
            'Each module works on its own and even better together'
          }
        />

        {detailedFeatures.length > 0 && (
          <section className="bg-muted/30 py-20">
            <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
              {detailedFeatures.map((item, i) => (
                <div
                  key={item.id || item.title || i}
                  className={`grid items-center gap-10 lg:grid-cols-2 ${
                    i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
                  }`}
                >
                  <div>
                    <h3 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-lg">
                    {item.image_url || item.image ? (
                      <img
                        src={item.image_url || item.image}
                        alt={item.title}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Sparkles className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {benefitBar.length > 0 && (
          <section className="bg-primary py-12">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
              {benefitBar.map((item) => {
                const Icon = iconMap[item.icon] || TrendingUp
                return (
                  <div
                    key={item.id || item.title}
                    className="flex items-center gap-2 text-primary-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <CtaSection
          heading={ctaData?.heading || ctaData?.title}
          subheading={ctaData?.subheading || ctaData?.description}
          primaryButton={ctaData?.btn1_text || ctaData?.link_label || ctaData?.primaryButton}
          primaryHref={ctaData?.btn1_link || ctaData?.link_url || '/contact'}
          secondaryButton={ctaData?.btn2_text || ctaData?.secondaryButton}
          secondaryHref={ctaData?.btn2_link || ctaData?.secondaryUrl || '/contact'}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
