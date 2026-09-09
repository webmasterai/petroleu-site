import { useQuery } from '@tanstack/react-query'
import { Cloud, Globe, Droplets, Shield } from 'lucide-react'
import { MBadge } from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

const ICON_MAP = {
  Cloud,
  Globe,
  Droplets,
  Shield,
}

export function WhyChooseSection() {
  const { data: reasonsData } = useQuery({
    queryKey: ['cms', 'why-choose-reasons'],
    queryFn: () => safeCmsGet('/why-choose-reasons'),
    staleTime: 60_000,
  })

  const { data: brandsData } = useQuery({
    queryKey: ['cms', 'supported-brands'],
    queryFn: () => safeCmsGet('/supported-brands'),
    staleTime: 60_000,
  })

  const reasons =
    Array.isArray(reasonsData) && reasonsData.length
      ? reasonsData
      : websiteContent.whyChoose.reasons
  const brands =
    Array.isArray(brandsData) && brandsData.length
      ? brandsData.map((b) => b.name || b)
      : websiteContent.whyChoose.brands
  const brandName = websiteContent.brand.name

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Why Choose {brandName} for Your Fuel Station?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-lg text-muted-foreground">
            {brandName} is petrol pump management software for fuel stations in Pakistan. It brings
            nozzle readings, tank dipping, credit customers, daily closing, and accounts into one
            system your team can use every shift.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => {
            const Icon = ICON_MAP[reason.icon] || Cloud
            return (
              <div key={`${reason.title}-${index}`} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{reason.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            From nozzle readings and tank dipping to credit customer ledgers and supplier payments,
            {brandName} covers the routines your forecourt team already follows each day.
          </p>

          <p className="mt-4 text-muted-foreground">
            Whether you operate a PSO, Shell, Total, or independent pump, {brandName} fits
            Pakistani fuel station workflows. Stations in Karachi, Lahore, Islamabad, Faisalabad,
            Multan, and across the country use it for shift closing and owner reporting.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {brands.map((industry, index) => (
              <MBadge key={`${industry}-${index}`} variant="secondary" className="px-4 py-1.5">
                {industry}
              </MBadge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseSection
