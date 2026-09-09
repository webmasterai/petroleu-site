import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Bell,
  Eye,
  Calendar,
  Filter,
  Download,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MButton, MBadge } from '../../components/marketing/ui'

const modules = [
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    description:
      'Track daily, weekly, and monthly sales by nozzle, product, and station with rich drill-down.',
  },
  {
    icon: TrendingUp,
    title: 'Profit & Margin',
    description: 'Monitor gross margins, fuel buying vs selling rates, and seasonal profitability trends.',
  },
  {
    icon: PieChart,
    title: 'Product Mix',
    description: 'Compare petrol, diesel, HOBC and additional product contributions in real time.',
  },
  {
    icon: Activity,
    title: 'Operational Pulse',
    description: 'Live nozzle uptime, shift performance, and dispenser variance — all in one feed.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified for low stock, abnormal dipping, and pricing anomalies the moment they happen.',
  },
  {
    icon: Eye,
    title: 'Variance Detection',
    description: 'AI-powered theft and leak detection across nozzles and tanks with daily snapshots.',
  },
]

const visuals = [
  { icon: BarChart3, title: 'Bar Charts', desc: 'Compare sales periods' },
  { icon: TrendingUp, title: 'Line Charts', desc: 'Spot trends over time' },
  { icon: PieChart, title: 'Pie Charts', desc: 'Visualize product mix' },
  { icon: Activity, title: 'Live Tickers', desc: 'Real-time pulse' },
]

const sampleAlerts = [
  {
    type: 'critical',
    title: 'Low Diesel Stock',
    description: 'Tank 2 is at 12% — reorder recommended',
  },
  {
    type: 'warning',
    title: 'Variance Detected',
    description: 'Nozzle 4 shows 0.8% dispense vs reading variance',
  },
  {
    type: 'info',
    title: 'Daily Sales Goal Hit',
    description: 'Today sales crossed 95% of monthly average',
  },
]

const alertStyles = {
  critical: {
    border: 'border-destructive/50',
    bg: 'bg-destructive/5',
    icon: 'text-destructive',
    Icon: AlertTriangle,
  },
  warning: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/5',
    icon: 'text-yellow-600 dark:text-yellow-400',
    Icon: AlertTriangle,
  },
  info: {
    border: 'border-primary/50',
    bg: 'bg-primary/5',
    icon: 'text-primary',
    Icon: CheckCircle2,
  },
}

export default function AnalyticsMarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/analytics" />
      <MarketingPageJsonLd path="/analytics" />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-6 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Best Analytics & Insights
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Real-Time Insights for Smarter Decisions
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Powerful dashboards, instant variance detection, and shift-aware reports that turn raw pump
              data into clear daily action.
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
                  Request a Demo
                </MButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Live Preview</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Your fuel station, on a single screen
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
                Charts, KPIs, and live tank levels — designed for the way you actually run a station.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-2 border-b border-border bg-muted/80 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <div className="mx-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  Dashboard › Analytics
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-3">
                {[
                  { label: "Today's Sales", value: 'PKR 142,500', delta: '+12.4%' },
                  { label: 'Liters Dispensed', value: '8,420 L', delta: '+5.1%' },
                  { label: 'Active Nozzles', value: '8 / 8', delta: '100%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="mt-1 text-xs font-medium text-primary">{kpi.delta} vs yesterday</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 p-6 pt-0 md:grid-cols-2">
                <div className="flex h-48 items-end gap-2 rounded-xl border border-border bg-background p-4">
                  {[60, 90, 70, 110, 80, 130, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/80"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-background p-4">
                  <div className="relative h-32 w-32 rounded-full bg-gradient-conic from-primary via-accent to-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Modules</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Built for petrol pump operations
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => {
                const Icon = m.icon
                return (
                  <div
                    key={m.title}
                    className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{m.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Visuals</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                See your numbers, your way
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {visuals.map((v) => {
                const Icon = v.icon
                return (
                  <div
                    key={v.title}
                    className="rounded-2xl border border-border bg-card p-6 text-center"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{v.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Smart Alerts</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Never miss what matters
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {sampleAlerts.map((a) => {
                const s = alertStyles[a.type]
                const Icon = s.Icon
                return (
                  <div
                    key={a.title}
                    className={`flex items-start gap-3 rounded-xl border ${s.border} ${s.bg} p-4`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${s.icon}`} />
                    <div>
                      <p className="font-semibold text-foreground">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <CtaSection
          heading="Turn data into daily decisions"
          subheading="Start your free trial and see your fuel station with new clarity."
          primaryButton="Start Free Trial"
          primaryHref="/contact"
          secondaryButton="Talk to Sales"
          secondaryHref="/contact"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
