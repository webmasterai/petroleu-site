import { ArrowRight, Printer, Send, Download, Fuel } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'

export function InvoiceSection() {
  const inv = websiteContent.invoiceDemo

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Best Generated Instantly
            </p>
            <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Professional Fuel Invoices
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Create detailed fuel invoices with vehicle numbers, odometer readings, and fuel
              quantities. Send directly to customers via WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/get-started">
                <MButton className="gap-2">
                  Start Creating Invoices
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
              <Link to="/pricing">
                <MButton variant="outline" className="gap-2">
                  View Pricing
                </MButton>
              </Link>
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
                  <p className="text-xs text-muted-foreground">{inv.stationAddress}</p>
                </div>
                <div className="text-right">
                  <MBadge>FUEL INVOICE</MBadge>
                  <p className="mt-2 text-sm text-muted-foreground">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Date: {inv.date}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Customer</p>
                  <p className="mt-1 font-medium text-foreground">{inv.customerName}</p>
                  <p className="text-muted-foreground">{inv.customerAccount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Amount Due</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{inv.amountDue}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Vehicle</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Fuel</th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Qty (L)</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inv.rows.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-foreground">{r.vehicle}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{r.fuel}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{r.qty}</td>
                        <td className="px-3 py-2 text-right text-foreground">{r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-48 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{inv.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previous Balance</span>
                    <span className="text-foreground">{inv.previousBalance}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{inv.total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 border-t border-border pt-4">
                <MButton size="sm" variant="outline" className="flex-1 gap-1">
                  <Printer className="h-4 w-4" />
                  Print
                </MButton>
                <MButton size="sm" variant="outline" className="flex-1 gap-1">
                  <Download className="h-4 w-4" />
                  PDF
                </MButton>
                <MButton size="sm" variant="secondary" className="flex-1 gap-1">
                  <Send className="h-4 w-4" />
                  WhatsApp
                </MButton>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvoiceSection
