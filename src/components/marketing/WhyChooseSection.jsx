import { Cloud, Globe, Droplets, Shield } from 'lucide-react'
import { MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useCmsList } from '../../hooks/useCmsList'

const ICON_MAP = {
  Cloud,
  Globe,
  Droplets,
  Shield,
}

export function WhyChooseSection() {
  const { market, isAfghanistan } = useMarketLocale()
  const {
    items: reasons,
    fromCms: reasonsFromCms,
    isError: reasonsErr,
  } = useCmsList(['why-choose-reasons'], '/why-choose-reasons', {
    fallback: market === 'pk' ? websiteContent.whyChoose.reasons : [],
  })
  const {
    items: brandsRaw,
    fromCms: brandsFromCms,
    isError: brandsErr,
  } = useCmsList(['supported-brands'], '/supported-brands', {
    fallback: market === 'pk' ? websiteContent.whyChoose.brands.map((b) => ({ name: b })) : [],
  })
  const heading = useSectionHeading('why-choose', {
    eyebrow: '',
    title: 'Why Choose Petroleu for Your Fuel Station?',
    subtitle:
      'Petroleu is petrol pump management software for fuel stations in Pakistan. It brings nozzle readings, tank dipping, credit customers, daily closing, and accounts into one system your team can use every shift.',
  })

  const list =
    reasonsFromCms || reasonsErr
      ? reasons
      : []
  const brands =
    brandsFromCms || brandsErr
      ? brandsRaw.map((b) => (typeof b === 'string' ? b : b.name || b.title || b))
      : []

  if (list.length === 0) return null

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{heading.eyebrow}</p>
          ) : null}
          {heading.title ? (
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              {heading.title}
            </h2>
          ) : null}
          {heading.subtitle ? (
            <p className="mx-auto mt-4 max-w-3xl text-pretty text-lg text-muted-foreground">
              {heading.subtitle}
            </p>
          ) : null}
        </div>

        <div
          className={`mt-16 grid gap-8 md:grid-cols-2 ${
            isAfghanistan ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          }`}
        >
          {list.map((reason, index) => {
            const Icon = ICON_MAP[reason.icon] || Cloud
            return (
              <div key={`${reason.title}-${index}`} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {reason.title || reason.heading}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {reason.description || reason.subheading || reason.content}
                </p>
              </div>
            )
          })}
        </div>

        {brands.length > 0 ? (
          <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
            {!isAfghanistan ? (
              <>
                <p className="text-muted-foreground">
                  From nozzle readings and tank dipping to credit customer ledgers and supplier payments,
                  Petroleu covers the routines your forecourt team already follows each day.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Whether you operate a PSO, Shell, Total, or independent pump, Petroleu fits Pakistani
                  fuel station workflows. Stations in Karachi, Lahore, Islamabad, Faisalabad, Multan, and
                  across the country use it for shift closing and owner reporting.
                </p>
              </>
            ) : null}
            <div className={`flex flex-wrap items-center justify-center gap-3 ${isAfghanistan ? '' : 'mt-6'}`}>
              {brands.map((industry, index) => (
                <MBadge key={`${industry}-${index}`} variant="secondary" className="px-4 py-1.5">
                  {industry}
                </MBadge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default WhyChooseSection
