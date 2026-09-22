import {
  ArrowRight,
  TrendingUp,
  Droplets,
  Fuel,
  Gauge,
  Users,
  Calendar,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'
import { useCmsList } from '../../hooks/useCmsList'

const ICON_MAP = {
  TrendingUp,
  Droplets,
  Fuel,
  Gauge,
  Users,
  Calendar,
}

export function AnalyticsSection() {
  const { market } = useMarketLocale()
  const { copy, mp } = useUiCopy()
  const { items, fromCms, isError } = useCmsList(['analytics-cards'], '/analytics-cards', {
    fallback: market === 'pk' ? websiteContent.analyticsCards : [],
  })
  const heading = useSectionHeading('analytics', {
    eyebrow: 'Best Advanced Analytics',
    title: 'Data-Driven Station Insights',
    subtitle:
      'Transform your fuel station data into actionable insights with comprehensive analytics and visual reporting.',
  })

  const cards =
    fromCms || isError
      ? items.map((c) => ({
          icon: c.icon,
          title: c.title,
          value: c.value,
          subtitle: c.subtitle,
          colorClass: c.color_class || c.colorClass || 'bg-primary/10 text-primary',
          description: c.description,
        }))
      : []

  if (cards.length === 0) return null

  const unlock = copy.unlock_insights
  const explore = copy.explore_analytics

  return (
    <section className="bg-background py-20">
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = ICON_MAP[card.icon] || TrendingUp
            const heights = [30, 45, 60, 40, 70, 55, 80, 65, 90, 75, 85, 100]
            return (
              <div
                key={`${card.title}-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-end gap-0.5 h-12">
                  {heights.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/30 transition-all group-hover:bg-primary/50"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{card.description}</p>
              </div>
            )
          })}
        </div>

        {(unlock || explore) && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {unlock ? <p className="text-muted-foreground">{unlock}</p> : null}
            {explore ? (
              <Link to={mp('/analytics')}>
                <MButton className="gap-2">
                  {explore}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </MButton>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

export default AnalyticsSection
