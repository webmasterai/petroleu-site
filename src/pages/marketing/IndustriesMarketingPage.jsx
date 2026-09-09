import { Link } from 'react-router-dom'
import {
  Fuel,
  Building2,
  Truck,
  Factory,
  Plane,
  Ship,
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield,
  Zap,
  Users,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MButton, MBadge } from '../../components/marketing/ui'

const industries = [
  {
    icon: Fuel,
    title: 'Petrol Pumps & Fuel Stations',
    description:
      'Daily operations for single or multi-station retail pumps — nozzle, dipping, credit, and reports in one place.',
    features: ['Nozzle reading', 'Tank dipping', 'Credit customers', 'Daily reports'],
  },
  {
    icon: Building2,
    title: 'CNG Stations',
    description:
      'Manage CNG sales, compressor logs, and gas stock movement with the same clarity as fuel.',
    features: ['Gas sales', 'Pressure logs', 'Customer management', 'Variance reports'],
  },
  {
    icon: Truck,
    title: 'Fuel Distributors',
    description:
      'Track wholesale fuel deliveries, supplier accounts, and transport vehicle movements end-to-end.',
    features: ['Bulk sales', 'Supplier ledger', 'Vehicle tracking', 'Tax/Excise records'],
  },
  {
    icon: Factory,
    title: 'Industrial Fueling',
    description:
      'Internal fuel stations for factories and depots that fuel their own fleet — controlled, audited, and clear.',
    features: ['Fleet allocation', 'Cost centers', 'Driver cards', 'Department reports'],
  },
  {
    icon: Plane,
    title: 'Aviation Fueling',
    description:
      'Specialized procedures, handling charges, and per-aircraft logs for aviation refueling operations.',
    features: ['Aircraft logs', 'Compliance', 'Specialty fuels', 'Service records'],
  },
  {
    icon: Ship,
    title: 'Marine Fueling',
    description:
      'Bunker sales for marine vessels with vessel-level tracking and bunkering compliance.',
    features: ['Vessel tracking', 'Bunker delivery', 'Marine pricing', 'Documentation'],
  },
]

const benefits = [
  { icon: Globe, title: 'Industry Standard', desc: 'Built around real-world fuel ops' },
  { icon: Shield, title: 'Compliance Ready', desc: 'Audit-friendly records out of the box' },
  { icon: Zap, title: 'Fast Onboarding', desc: 'Live in days, not months' },
  { icon: Users, title: 'Expert Support', desc: 'Specialists who speak your language' },
]

export default function IndustriesMarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/industries" />
      <MarketingPageJsonLd path="/industries" />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-6">Best Industries We Serve</MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Built for every fuel business
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              From single-pump retailers to multi-site distributors, our platform adapts to the way your
              industry actually works.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <MButton size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
              <Link to="/contact">
                <MButton size="lg" variant="outline">
                  Talk to Sales
                </MButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Industries</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                One platform. Many fuel businesses.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {industries.map((ind) => {
                const Icon = ind.icon
                return (
                  <div
                    key={ind.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{ind.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{ind.description}</p>
                    <ul className="mt-4 space-y-2">
                      {ind.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Why us</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Designed for fuel — not generic retail
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.title} className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <CtaSection
          heading="Don't see your fuel industry?"
          subheading="We work with every kind of fuel operation — let's talk about yours."
          primaryButton="Contact Us"
          primaryHref="/contact"
          secondaryButton="Start Free Trial"
          secondaryHref="/contact"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
