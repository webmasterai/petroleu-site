import { useQuery } from '@tanstack/react-query'
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
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

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
  const { data } = useQuery({
    queryKey: ['cms', 'mobile-features'],
    queryFn: () => safeCmsGet('/mobile-features'),
    staleTime: 60_000,
  })

  const features =
    Array.isArray(data) && data.length ? data : websiteContent.mobileFeatures

  return (
    <section id="mobile" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Best Mobile First
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Manage Your Pump From Anywhere
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Owners can check fuel sales, tank stock, cash/credit status, customer balances, and
            reports from mobile. This is useful for multi-station owners or anyone who cannot stay
            at the station all day.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* Features grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = ICON_MAP[feature.icon] || Gauge
              return (
                <div
                  key={`${feature.title}-${index}`}
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

          {/* Phone mockup */}
          <div className="relative mx-auto w-full">
            <div className="flex justify-center">
              <img
                src="/images/petroleu-mobile-real-mockup.png"
                alt="Petroleu mobile app dashboard mockup"
                width={560}
                height={840}
                className="w-full max-w-[400px] md:max-w-[480px] lg:max-w-[560px] max-h-[680px] h-auto object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Available on both Android and iOS
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MobileSection
