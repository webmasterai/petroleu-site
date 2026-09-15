import { MBadge } from './ui'
import { FeatureMiniMockup, getFeatureMockupType } from './FeatureMiniMockup'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'

export function FeaturesSection({ titleOverride, subtitleOverride } = {}) {
  const { market } = useMarketLocale()
  const { data } = useCmsQuery(['features'], '/features')
  const heading = useSectionHeading('features', {
    eyebrow: 'Best Features',
    title: 'Everything You Need to Run Your Pump',
    subtitle: 'Core features for petrol pump daily operations — from nozzle readings to daily closing.',
  })

  const features = Array.isArray(data) && data.length
    ? data
    : market === 'af'
      ? []
      : websiteContent.features

  if (market === 'af' && features.length === 0) return null

  const title = titleOverride || heading.title
  const subtitle = subtitleOverride || heading.subtitle
  if (market === 'af' && !title) return null

  return (
    <section id="features" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{heading.eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            return (
              <div
                key={feature.id || feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <FeatureMiniMockup
                    type={getFeatureMockupType(feature.title, index)}
                    title={feature.title}
                    index={index}
                  />
                  {feature.badge && (
                    <MBadge variant="secondary" className="text-xs">
                      {feature.badge}
                    </MBadge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
