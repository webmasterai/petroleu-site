import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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
  ChevronRight,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { FeaturesSection } from '../../components/marketing/FeaturesSection'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MBadge } from '../../components/marketing/ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { withBestPrefix } from '../../content/websiteContent'

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

export default function FeaturesMarketingPage() {
  const q = useQueries({
    queries: [
      { queryKey: ['cms', 'hero', 'features'], queryFn: () => safeCmsGet('/hero/features') },
      {
        queryKey: ['cms', 'feat', 'card'],
        queryFn: () => safeCmsGet('/features', { params: { page: 'features', type: 'card' } }),
      },
      {
        queryKey: ['cms', 'feat', 'detailed'],
        queryFn: () => safeCmsGet('/features', { params: { page: 'features', type: 'detailed' } }),
      },
      {
        queryKey: ['cms', 'feat', 'benefit'],
        queryFn: () => safeCmsGet('/features', { params: { page: 'features', type: 'benefit_bar' } }),
      },
      { queryKey: ['cms', 'cta', 'features'], queryFn: () => safeCmsGet('/cta/features') },
    ],
  })
  const [heroQ, coreQ, detQ, barQ, ctaQ] = q
  const heroData = heroQ.data
  const coreFeaturesData = Array.isArray(coreQ.data) ? coreQ.data : []
  const detailedFeaturesData = Array.isArray(detQ.data) ? detQ.data : []
  const benefitBarData = Array.isArray(barQ.data) ? barQ.data : []
  const ctaData = ctaQ.data

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/features" />
      <MarketingPageJsonLd path="/features" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {heroData?.badge && (
              <MBadge variant="secondary" className="mb-4">
                {withBestPrefix(heroData.badge)}
              </MBadge>
            )}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {heroData?.heading || 'Powerful Features'}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heroData?.subheading ||
                'Everything you need to run a modern fuel station — built for clarity, control, and growth.'}
            </p>
          </div>
        </section>

        <FeaturesSection
          heading="Core capabilities"
          subheading="Each module works on its own and even better together"
          items={coreFeaturesData.map((f) => ({
            id: f.id,
            icon: f.icon,
            title: f.title,
            description: f.description,
            badge: f.badge,
          }))}
        />

        {detailedFeaturesData.length > 0 && (
          <section className="bg-muted/30 py-20">
            <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
              {detailedFeaturesData.map((item, i) => (
                <div
                  key={item.id}
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
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full rounded-lg" />
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

        {benefitBarData.length > 0 && (
          <section className="bg-primary py-12">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6 lg:px-8">
              {benefitBarData.map((item) => {
                const Icon = iconMap[item.icon] || TrendingUp
                return (
                  <div
                    key={item.id}
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
          heading={ctaData?.heading}
          subheading={ctaData?.subheading}
          primaryButton={ctaData?.btn1_text}
          primaryHref={ctaData?.btn1_link || '/contact'}
          secondaryButton={ctaData?.btn2_text}
          secondaryHref={ctaData?.btn2_link || '/contact'}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
