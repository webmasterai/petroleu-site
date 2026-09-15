import { ArrowRight, Printer, Send, Download, Fuel } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useDemoBlock } from '../../hooks/useDemoBlock'
import { useUiCopy } from '../../hooks/useUiCopy'

export function InvoiceSection() {
  const { isAfghanistan } = useMarketLocale()
  const { copy, mp } = useUiCopy()
  const heading = useSectionHeading('invoice', {
    eyebrow: 'Best Generated Instantly',
    title: 'Professional Fuel Invoices',
    subtitle:
      'Create detailed fuel invoices with vehicle numbers, odometer readings, and fuel quantities. Send directly to customers via WhatsApp.',
    cta: 'View Pricing',
  })
  const { data: cmsDemo, loaded } = useDemoBlock('invoice')

  const inv = cmsDemo
    ? {
        stationName: cmsDemo.stationName || '',
        stationAddress: cmsDemo.stationAddress || '',
        invoiceNumber: cmsDemo.invoiceNumber || '',
        date: cmsDemo.date || '',
        customerName: cmsDemo.customerName || '',
        customerAccount: cmsDemo.customerAccount || '',
        amountDue: cmsDemo.amountDue || '',
        rows: cmsDemo.rows || [],
        subtotal: cmsDemo.subtotal || '',
        previousBalance: cmsDemo.previousBalance || '',
        total: cmsDemo.total || '',
        labels: cmsDemo.labels || {},
      }
    : isAfghanistan
      ? null
      : websiteContent.invoiceDemo

  if (isAfghanistan && (!loaded || !inv || !heading.title)) return null
  if (!inv) return null

  const labels = inv.labels || {}
  const viewPricing = heading.cta || copy.view_pricing || 'View Pricing'
  const startCta = copy.start_trial || (isAfghanistan ? null : 'Start Creating Invoices')

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
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
              <p className="mt-4 text-pretty text-lg text-muted-foreground">{heading.subtitle}</p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-4">
              {startCta ? (
                <Link to={mp('/get-started')}>
                  <MButton className="gap-2">
                    {startCta}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </MButton>
                </Link>
              ) : null}
              {viewPricing ? (
                <Link to={mp('/pricing')}>
                  <MButton variant="outline" className="gap-2">
                    {viewPricing}
                  </MButton>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Fuel className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{inv.stationName}</p>
                  {inv.stationAddress ? (
                    <p className="text-xs text-muted-foreground">{inv.stationAddress}</p>
                  ) : null}
                </div>
                <div className="text-end">
                  <MBadge>{labels.badge || 'FUEL INVOICE'}</MBadge>
                  <p className="mt-2 text-sm text-muted-foreground">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {labels.date || 'Date'}: {inv.date}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {labels.customer || 'Customer'}
                  </p>
                  <p className="mt-1 font-medium text-foreground">{inv.customerName}</p>
                  <p className="text-muted-foreground">{inv.customerAccount}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {labels.amountDue || 'Amount Due'}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-primary">{inv.amountDue}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-start font-medium text-muted-foreground">
                        {labels.vehicle || 'Vehicle'}
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                        {labels.fuel || 'Fuel'}
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                        {labels.qty || 'Qty (L)'}
                      </th>
                      <th className="px-3 py-2 text-end font-medium text-muted-foreground">
                        {labels.amount || 'Amount'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(inv.rows || []).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-foreground">{r.vehicle}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{r.fuel}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{r.qty}</td>
                        <td className="px-3 py-2 text-end text-foreground">{r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-48 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{labels.subtotal || 'Subtotal'}</span>
                    <span className="text-foreground">{inv.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {labels.previousBalance || 'Previous Balance'}
                    </span>
                    <span className="text-foreground">{inv.previousBalance}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-semibold">
                    <span className="text-foreground">{labels.total || 'Total'}</span>
                    <span className="text-primary">{inv.total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-t border-border pt-4">
                <MButton size="sm" variant="outline" className="flex-1 gap-1" type="button">
                  <Printer className="h-4 w-4" />
                  {labels.print || 'Print'}
                </MButton>
                <MButton size="sm" variant="outline" className="flex-1 gap-1" type="button">
                  <Download className="h-4 w-4" />
                  {labels.pdf || 'PDF'}
                </MButton>
                <MButton size="sm" variant="secondary" className="flex-1 gap-1" type="button">
                  <Send className="h-4 w-4" />
                  {labels.whatsapp || 'WhatsApp'}
                </MButton>
              </div>
            </div>

            <div className="absolute -bottom-4 -end-4 -z-10 h-full w-full rounded-2xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvoiceSection
