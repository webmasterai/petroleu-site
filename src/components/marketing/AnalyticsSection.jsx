import { useQuery } from '@tanstack/react-query'
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
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

const ICON_MAP = {
  TrendingUp,
  Droplets,
  Fuel,
  Gauge,
  Users,
  Calendar,
}

export function AnalyticsSection() {
  const { data } = useQuery({
    queryKey: ['cms', 'analytics-cards'],
    queryFn: () => safeCmsGet('/analytics-cards'),
    staleTime: 60_000,
  })

  const cards =
    Array.isArray(data) && data.length
      ? data.map((c) => ({
          icon: c.icon,
          title: c.title,
          value: c.value,
          subtitle: c.subtitle,
          colorClass: c.color_class || c.colorClass || 'bg-primary/10 text-primary',
          description: c.description,
        }))
      : websiteContent.analyticsCards

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Best Advanced Analytics
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Data-Driven Station Insights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Transform your fuel station data into actionable insights with comprehensive analytics
            and visual reporting.
          </p>
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

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <p className="text-muted-foreground">Unlock powerful station insights today</p>
          <Link to="/analytics">
            <MButton className="gap-2">
              Explore Analytics
              <ArrowRight className="h-4 w-4" />
            </MButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsSection
