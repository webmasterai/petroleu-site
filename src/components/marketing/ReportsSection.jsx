import { ArrowRight, Droplets, Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useDemoBlock } from '../../hooks/useDemoBlock'
import { useUiCopy } from '../../hooks/useUiCopy'

export function ReportsSection() {
  const { isAfghanistan } = useMarketLocale()
  const { mp } = useUiCopy()
  const heading = useSectionHeading('reports', {
    eyebrow: 'Best Business Intelligence',
    title: 'Complete Station Reports',
    subtitle:
      'Track every liter with tank dipping, nozzle readings, and sales reports that help you prevent theft and maximize profit.',
    cta: 'View All Reports',
  })
  const { data: cmsDemo, loaded } = useDemoBlock('reports')

  const tankDipping = cmsDemo?.tankDipping
    || (isAfghanistan ? null : websiteContent.reportsDemo.tankDipping)
  const nozzleReadings = cmsDemo?.nozzleReadings
    || (isAfghanistan ? null : websiteContent.reportsDemo.nozzleReadings)
  const labels = cmsDemo?.labels || {}

  if (isAfghanistan && (!loaded || !tankDipping || !heading.title)) return null
  if (!tankDipping || !nozzleReadings) return null

  const cta = heading.cta || (isAfghanistan ? null : 'View All Reports')
  const accessNote = labels.accessNote || (isAfghanistan ? null : 'Access all reports anytime, anywhere')

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

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {labels.tankTitle || 'Tank Dipping Report'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {labels.tankSubtitle ||
                    'Track fuel stock levels across all tanks with variance detection.'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
            </div>

            <MBadge variant="outline" className="mb-4">
              {labels.tankBadge || 'Daily Tank Summary'}
            </MBadge>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-start font-medium text-muted-foreground">
                      {labels.tank || 'TANK'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.open || 'OPEN'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.recv || 'RECV'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.sales || 'SALES'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.close || 'CLOSE'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-foreground">
                      {labels.var || 'VAR'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tankDipping.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-2 py-2 font-medium text-foreground">{row.tank}</td>
                      <td className="px-2 py-2 text-end text-muted-foreground">{row.opening}</td>
                      <td className="px-2 py-2 text-end text-primary">{row.received}</td>
                      <td className="px-2 py-2 text-end text-muted-foreground">{row.sales}</td>
                      <td className="px-2 py-2 text-end text-muted-foreground">{row.closing}</td>
                      <td
                        className={`px-2 py-2 text-end font-semibold ${
                          String(row.variance || '').startsWith('-')
                            ? 'text-destructive'
                            : 'text-primary'
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

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {labels.nozzleTitle || 'Nozzle Readings'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {labels.nozzleSubtitle ||
                    'Track sales from each nozzle with opening and closing readings.'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Gauge className="h-5 w-5 text-accent" />
              </div>
            </div>

            <MBadge variant="outline" className="mb-4">
              {labels.nozzleBadge || 'Shift-wise Readings'}
            </MBadge>

            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-start font-medium text-muted-foreground">
                      {labels.nozzle || 'NOZZLE'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.open || 'OPEN'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.close || 'CLOSE'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-muted-foreground">
                      {labels.salesL || 'SALES (L)'}
                    </th>
                    <th className="px-2 py-2 text-end font-medium text-foreground">
                      {labels.amount || 'AMOUNT'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {nozzleReadings.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-2 py-2 font-medium text-foreground">{row.nozzle}</td>
                      <td className="px-2 py-2 text-end text-muted-foreground">{row.opening}</td>
                      <td className="px-2 py-2 text-end text-muted-foreground">{row.closing}</td>
                      <td className="px-2 py-2 text-end text-primary">{row.sales}</td>
                      <td className="px-2 py-2 text-end font-semibold text-foreground">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {(accessNote || cta) && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {accessNote ? <p className="text-muted-foreground">{accessNote}</p> : null}
            {cta ? (
              <Link to={mp(heading.ctaUrl?.replace(/^\/(af(\/ps|\/en)?)?/, '') || '/features')}>
                <MButton className="gap-2">
                  {cta}
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

export default ReportsSection
