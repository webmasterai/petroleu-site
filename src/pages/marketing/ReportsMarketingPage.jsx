import { Link } from 'react-router-dom'
import {
  FileText,
  BarChart3,
  Calculator,
  Users,
  Package,
  Wallet,
  TrendingUp,
  ClipboardList,
  Receipt,
  ArrowRight,
  Download,
  Eye,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MButton, MBadge } from '../../components/marketing/ui'

const categories = [
  {
    icon: BarChart3,
    title: 'Sales Reports',
    description: 'Daily, monthly, and product-wise sales — by station and by attendant.',
    items: ['Daily Sales Summary', 'Sales Bill Report', 'Nozzle-wise Sales', 'Product Mix'],
  },
  {
    icon: Wallet,
    title: 'Financial Reports',
    description: 'Trial balance, P&L, and ledgers across cash, banks, customers and suppliers.',
    items: ['Trial Balance', 'Profit & Loss', 'Account Ledger', 'Cash Book'],
  },
  {
    icon: Package,
    title: 'Inventory Reports',
    description: 'Real-time tank stock, dipping comparisons, and product costing ledgers.',
    items: ['Stock Position', 'Dip Gain/Loss', 'Product Costing', 'Tank Movements'],
  },
  {
    icon: Users,
    title: 'Customer Reports',
    description: 'Credit customer aging, outstanding, and payment history at a glance.',
    items: ['Credit Sale Report', 'Customer Ledger', 'Aging Report', 'Receipts'],
  },
  {
    icon: ClipboardList,
    title: 'Operational Reports',
    description: 'Shift summaries, attendant performance, and pump variance.',
    items: ['Shift Summary', 'Variance Report', 'Attendant Sales', 'Pump Activity'],
  },
  {
    icon: Receipt,
    title: 'Tax & Compliance',
    description: 'Sales tax, withholding, and audit-friendly export packs.',
    items: ['Tax Summary', 'Audit Pack', 'Excise Reports', 'Compliance Logs'],
  },
]

const sampleSalesRows = [
  { date: '2026-04-29', petrol: '4,210', diesel: '3,820', hobc: '320', total: 'PKR 1,485,200' },
  { date: '2026-04-28', petrol: '4,050', diesel: '3,910', hobc: '290', total: 'PKR 1,452,000' },
  { date: '2026-04-27', petrol: '3,980', diesel: '3,740', hobc: '305', total: 'PKR 1,408,750' },
  { date: '2026-04-26', petrol: '4,120', diesel: '3,860', hobc: '315', total: 'PKR 1,471,300' },
]

const featureList = [
  { icon: Eye, title: 'Visual Previews', desc: 'See exactly what your printed report looks like' },
  { icon: Filter, title: 'Smart Filters', desc: 'Slice by station, shift, attendant, or date' },
  { icon: Calendar, title: 'Period Compare', desc: 'Today vs yesterday, MTD, YTD' },
  { icon: Download, title: 'Export Ready', desc: 'PDF, Excel, and printer-friendly formats' },
]

export default function ReportsMarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/product/reports" />
      <MarketingPageJsonLd path="/product/reports" />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-6">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Best 20+ Pre-Built Reports
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Reports that actually answer your questions
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Sales, financials, stock, taxes — every report a fuel station needs, formatted for printing
              and ready to share.
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
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Categories</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Every report your team needs
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <div
                    key={cat.title}
                    className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{cat.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
                    <ul className="mt-4 space-y-2">
                      {cat.items.map((it) => (
                        <li key={it} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {it}
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
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Sample Report</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Daily Sales — at a glance
              </h2>
            </div>

            <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Daily Sales Report</p>
                  <p className="text-xs text-muted-foreground">Last 4 days · All stations</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Petrol (L)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diesel (L)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">HOBC (L)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {sampleSalesRows.map((r) => (
                      <tr key={r.date} className="transition-colors hover:bg-muted/30">
                        <td className="px-6 py-3 text-sm text-foreground">{r.date}</td>
                        <td className="px-6 py-3 text-right text-sm text-foreground tabular-nums">{r.petrol}</td>
                        <td className="px-6 py-3 text-right text-sm text-foreground tabular-nums">{r.diesel}</td>
                        <td className="px-6 py-3 text-right text-sm text-foreground tabular-nums">{r.hobc}</td>
                        <td className="px-6 py-3 text-right text-sm font-semibold text-foreground tabular-nums">{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Reports designed to be used
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureList.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="rounded-2xl border border-border bg-card p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <CtaSection
          heading="Make decisions on real numbers"
          subheading="Get every report your fuel station needs in a single place."
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
