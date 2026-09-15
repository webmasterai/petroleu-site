import { Link, useLocation } from 'react-router-dom'
import {
  MessageCircle,
  ArrowRight,
  Gauge,
  Droplets,
  Users,
  FileText,
  Wallet,
  Smartphone,
  CheckCircle2,
  Fuel,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingFaqJsonLd } from '../../components/marketing/MarketingJsonLd'
import {
  MAccordion,
  MAccordionItem,
  MAccordionTrigger,
  MAccordionContent,
  MBadge,
  MButton,
} from '../../components/marketing/ui'
import {
  getCityFromPathname,
  getCityPath,
  getCityFaqs,
  CITY_LANDING_PAGES,
  CITY_FEATURE_CARDS,
  CITY_WHY_CHOOSE,
  CITY_FUEL_PRODUCTS,
} from '../../content/cityLandingContent'
import { websiteContent } from '../../content/websiteContent'

const FEATURE_ICONS = [Gauge, Droplets, Users, FileText, Wallet, Smartphone]

function CityNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">City page not found</h1>
          <p className="mt-3 text-muted-foreground">
            This petrol pump software city page does not exist. Browse available cities from the FAQ
            page.
          </p>
          <Link
            to="/faq"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View FAQ &amp; Cities
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function CityLandingPage() {
  const { pathname } = useLocation()
  const city = getCityFromPathname(pathname)

  if (!city) {
    return <CityNotFound />
  }

  const faqs = getCityFaqs(city)
  const path = getCityPath(city.slug)
  const pageTitle = `Petrol Pump Software in ${city.name} | Petroleu`
  const pageDescription = `Petroleu is petrol pump management software in ${city.name} for nozzle readings, tank dipping, credit customers, daily closing, accounts, reports, and mobile monitoring.`

  const nearbyCities = city.nearbySlugs
    .map((slug) => CITY_LANDING_PAGES.find((c) => c.slug === slug))
    .filter(Boolean)

  const otherCities = CITY_LANDING_PAGES.filter(
    (c) => c.slug !== city.slug && !city.nearbySlugs.includes(c.slug),
  ).slice(0, 8)

  const whatsappUrl = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo title={pageTitle} description={pageDescription} path={path} />
      <MarketingFaqJsonLd faqs={faqs} />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-4">
              {city.province}
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Petrol Pump Software in {city.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Manage nozzle readings, tank dipping, credit customers, daily closing, reports, and
              mobile monitoring for your fuel station in {city.name}.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MButton size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </MButton>
              </a>
              <Link to="/contact">
                <MButton size="lg" variant="outline" className="gap-2">
                  Book a Demo
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Petrol Pump Management Software for Fuel Stations in {city.name}
            </h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {city.intro}
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              What Petroleu Helps You Manage in {city.name}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CITY_FEATURE_CARDS.map((card, i) => {
                const Icon = FEATURE_ICONS[i] || Fuel
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Why Fuel Station Owners in {city.name} Choose Petroleu
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {CITY_WHY_CHOOSE.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              FAQs About Petrol Pump Software in {city.name}
            </h2>
            <div className="mt-8 rounded-2xl border border-border bg-card px-6 shadow-sm">
              <MAccordion>
                {faqs.map((faq, i) => (
                  <MAccordionItem key={faq.question} value={`city-faq-${i}`}>
                    <MAccordionTrigger>{faq.question}</MAccordionTrigger>
                    <MAccordionContent>{faq.answer}</MAccordionContent>
                  </MAccordionItem>
                ))}
              </MAccordion>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              Manage All Fuel Products at Your {city.name} Station
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CITY_FUEL_PRODUCTS.map((product) => (
                <div
                  key={product.name}
                  className="rounded-xl border border-border bg-card p-5 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-primary">
                    <Fuel className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Petroleu is Also Available in Other Cities
            </h2>
            {nearbyCities.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-muted-foreground">Nearby areas</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {nearbyCities.map((c) => (
                    <Link
                      key={c.slug}
                      to={getCityPath(c.slug)}
                      className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/10"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  to={getCityPath(c.slug)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <Link
              to="/faq"
              className="mt-6 inline-block text-sm font-medium text-primary hover:text-orange-600"
            >
              View all FAQs →
            </Link>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary py-20">
          <div className="absolute inset-0">
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Modernize Your {city.name} Petrol Pump?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
              Talk to our team and see how Petroleu can help manage your fuel station operations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MButton
                  size="lg"
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </MButton>
              </a>
              <Link to="/contact">
                <MButton
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
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
