import { ArrowRight, Droplets, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'

export function ReportsSection() {
  const { tankDipping, nozzleReadings } = websiteContent.reportsDemo

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Best Business Intelligence
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Complete Station Reports
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Track every liter with tank dipping, nozzle readings, and sales reports that help you
            prevent theft and maximize profit.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Tank Dipping Report */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Tank Dipping Report</h3>
                <p className="text-sm text-muted-foreground">
                  Track fuel stock levels across all tanks with variance detection.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
            </div>

            <MBadge variant="outline" className="mb-4">
              Daily Tank Summary
            </MBadge>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground">TANK</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">OPEN</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">RECV</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">SALES</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">CLOSE</th>
                    <th className="px-2 py-2 text-right font-medium text-foreground">VAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tankDipping.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-2 py-2 font-medium text-foreground">{row.tank}</td>
                      <td className="px-2 py-2 text-right text-muted-foreground">{row.opening}</td>
                      <td className="px-2 py-2 text-right text-primary">{row.received}</td>
                      <td className="px-2 py-2 text-right text-muted-foreground">{row.sales}</td>
                      <td className="px-2 py-2 text-right text-muted-foreground">{row.closing}</td>
                      <td
                        className={`px-2 py-2 text-right font-semibold ${
                          row.variance.startsWith('-') ? 'text-destructive' : 'text-primary'
                        }`}
                      >
                        {row.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nozzle Readings Report */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nozzle Readings</h3>
                <p className="text-sm text-muted-foreground">
                  Track sales from each nozzle with opening and closing readings.
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Gauge className="h-5 w-5 text-accent" />
              </div>
            </div>

            <MBadge variant="outline" className="mb-4">
              Shift-wise Readings
            </MBadge>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-muted-foreground">NOZZLE</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">OPEN</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">CLOSE</th>
                    <th className="px-2 py-2 text-right font-medium text-muted-foreground">SALES (L)</th>
                    <th className="px-2 py-2 text-right font-medium text-foreground">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {nozzleReadings.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-2 py-2 font-medium text-foreground">{row.nozzle}</td>
                      <td className="px-2 py-2 text-right text-muted-foreground">{row.opening}</td>
                      <td className="px-2 py-2 text-right text-muted-foreground">{row.closing}</td>
                      <td className="px-2 py-2 text-right text-primary">{row.sales}</td>
                      <td className="px-2 py-2 text-right font-semibold text-foreground">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <p className="text-muted-foreground">Access all reports anytime, anywhere</p>
          <Link to="/product/reports">
            <MButton className="gap-2">
              View All Reports
              <ArrowRight className="h-4 w-4" />
            </MButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ReportsSection
