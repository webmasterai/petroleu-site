import {
  BarChart3,
  MessageSquare,
  FileText,
  Activity,
  TrendingUp,
  Fuel,
  Wallet,
  Droplets,
  Gauge,
} from 'lucide-react'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'
import { useCmsList } from '../../hooks/useCmsList'

const ICON_MAP = {
  Gauge,
  MessageSquare,
  BarChart3,
  Activity,
  Fuel,
  Wallet,
  Droplets,
  FileText,
  TrendingUp,
}

export function MobileSection() {
  const { copy } = useUiCopy()
  // CMS only — disabled/removed cards are not restored from hardcoded defaults
  const { items, fromCms } = useCmsList(['mobile-features'], '/mobile-features', {
    fallback: [],
  })
  const heading = useSectionHeading('mobile', {
    eyebrow: 'Mobile App',
    title: 'Mobile Owner Dashboard',
    subtitle:
      'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
  })

  const features = fromCms
    ? items.map((feature) => ({
        id: feature.id,
        icon: feature.icon,
        title: feature.title || feature.heading || '',
        description: feature.description || feature.subheading || feature.content || '',
      }))
    : []

  if (features.length === 0) return null

  const platforms = copy.mobile_platforms || 'Available on both Android and iOS'

  return (
    <section id="mobile" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {heading.eyebrow}
            </p>
          ) : null}
          {heading.title ? (
            <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              {heading.title}
            </h2>
          ) : null}
          {heading.subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heading.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = ICON_MAP[feature.icon] || Gauge
              return (
                <div
                  key={feature.id || `${feature.title}-${index}`}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>

          <div className="relative mx-auto w-full">
            <div className="flex justify-center">
              <img
                src="/images/petroleu-mobile-real-mockup.png"
                alt={heading.imageAlt || 'Petroleu mobile app dashboard mockup'}
                width={560}
                height={840}
                className="w-full max-w-[400px] md:max-w-[480px] lg:max-w-[560px] max-h-[680px] h-auto object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            {platforms ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">{platforms}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MobileSection
