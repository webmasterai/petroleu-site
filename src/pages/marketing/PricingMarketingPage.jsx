import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { PricingSection } from '../../components/marketing/PricingSection'
import {
  MAccordion,
  MAccordionItem,
  MAccordionTrigger,
  MAccordionContent,
  MBadge,
  MButton,
} from '../../components/marketing/ui'
import { PRICING_FAQS } from '../../content/pricingFaqs'
import { websiteContent } from '../../content/websiteContent'

export default function PricingMarketingPage() {
  const whatsappUrl = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/pricing" />
      <MarketingPageJsonLd path="/pricing" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-4">
              Best Pricing
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Affordable Petrol Pump Software Pricing Plans
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Choose the right Petroleu plan for nozzle sales, tank stock, credit billing, reports,
              automation, and mobile monitoring.
            </p>
          </div>
        </section>

        <PricingSection hideHeading staticOnly pricingPageLayout />

        <section className="bg-background py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Pricing Questions
              </h2>
            </div>

            <div className="mt-12 rounded-2xl border border-border bg-card px-6">
              <MAccordion>
                {PRICING_FAQS.map((faq, i) => (
                  <MAccordionItem key={faq.question} value={`pricing-faq-${i}`}>
                    <MAccordionTrigger>{faq.question}</MAccordionTrigger>
                    <MAccordionContent>{faq.answer}</MAccordionContent>
                  </MAccordionItem>
                ))}
              </MAccordion>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="bg-transparent text-3xl font-bold text-white sm:text-4xl">
              Need Help Choosing the Right Plan?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Talk to our team and choose the best Petroleu package for your fuel station.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="sm:w-auto">
                <MButton variant="whatsapp" className="h-10 w-full gap-2 px-4 text-sm font-medium sm:w-auto">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </MButton>
              </a>
              <Link to="/get-started" className="sm:w-auto">
                <MButton
                  variant="outline"
                  className="h-10 w-full gap-2 border-2 border-white bg-transparent px-4 text-sm font-medium text-white hover:bg-white/10 sm:w-auto"
                >
                  Book a Demo
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
