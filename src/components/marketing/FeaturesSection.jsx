import { useQuery } from '@tanstack/react-query'
import { MBadge } from './ui'
import { FeatureMiniMockup, getFeatureMockupType } from './FeatureMiniMockup'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

export function FeaturesSection({ titleOverride, subtitleOverride } = {}) {
  const { data } = useQuery({
    queryKey: ['cms', 'features'],
    queryFn: () => safeCmsGet('/features'),
    staleTime: 60_000,
  })

  const features = Array.isArray(data) && data.length ? data : websiteContent.features

  return (
    <section id="features" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Best Features</p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            {titleOverride || 'Everything You Need to Run Your Pump'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            {subtitleOverride || 'Core features for petrol pump daily operations — from nozzle readings to daily closing.'}
          </p>
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
