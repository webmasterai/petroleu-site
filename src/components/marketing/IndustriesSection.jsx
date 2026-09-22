import {
  Fuel,
  Droplets,
  Truck,
  Factory,
  Building2,
  Plane,
  Ship,
  Tractor,
} from 'lucide-react'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useCmsList } from '../../hooks/useCmsList'

const ICON_MAP = {
  Fuel,
  Droplets,
  Truck,
  Factory,
  Building2,
  Plane,
  Ship,
  Tractor,
}

export function IndustriesSection({ variant = 'home' } = {}) {
  // CMS only — disabled/removed cards are not restored from hardcoded defaults
  const { items, fromCms } = useCmsList(['industries', variant], '/industries', { fallback: [] })
  const heading = useSectionHeading('industries', {
    eyebrow: 'Best Industries',
    title: 'Built for Fuel Businesses',
    subtitle: 'Tailored features for different fuel station types',
  })

  const industries = fromCms
    ? items.map((it) => ({
        id: it.id,
        icon: it.icon,
        title: it.title || it.heading || it.name || '',
        description: it.description || it.subheading || it.content || '',
        colorClass: it.color_class || it.colorClass || 'bg-primary/10 text-primary',
      }))
    : []

  // Home shows max 3 cards in one row
  const limited = variant === 'home' ? industries.slice(0, 3) : industries

  if (limited.length === 0) return null

  return (
    <section id="industries" className="bg-background py-20">
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
          {limited.map((industry, index) => {
            const Icon = ICON_MAP[industry.icon] || Fuel
            return (
              <div
                key={industry.id || `${industry.title}-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${industry.colorClass}`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{industry.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{industry.description}</p>
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default IndustriesSection
