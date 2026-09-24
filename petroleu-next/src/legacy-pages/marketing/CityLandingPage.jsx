import { Link, useLocation } from 'react-router-dom'
import {
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
  getCityBySlug,
  getCityPath,
  getCityPageSlug,
  getCitySlugFromPageSlug,
  getCityFaqs,
  getCityBenefits,
  getCityHeroDescription,
  getCitySeoTitle,
  getCitySeoDescription,
  CITY_LANDING_PAGES,
  CITY_FEATURE_CARDS,
  CITY_MODULES,
  CITY_WHY_CHOOSE,
  CITY_DASHBOARD_IMAGE,
  isCityLandingSlug,
} from '../../content/cityLandingContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'

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

function pickSections(sections, key) {
  return (sections || []).filter((s) => s.section_key === key && s.is_enabled !== false)
}

function firstSection(sections, key) {
  return pickSections(sections, key)[0] || null
}

function resolveCity(slugProp, pathname) {
  if (slugProp && isCityLandingSlug(slugProp)) {
    return getCityBySlug(getCitySlugFromPageSlug(slugProp))
  }
  return getCityFromPathname(pathname)
}

function sectionField(section, ...keys) {
  if (!section) return undefined
  for (const key of keys) {
    const direct = section[key]
    if (direct != null && String(direct).trim() !== '') return direct
    const nested = section.data?.[key]
    if (nested != null && String(nested).trim() !== '') return nested
  }
  return undefined
}

function buildViewModel(city, cmsPage, cmsSections) {
  const faqsDefault = getCityFaqs(city)
  const path = getCityPath(city.slug)
  const heroCms = firstSection(cmsSections, 'hero')
  const introCms = firstSection(cmsSections, 'intro') || firstSection(cmsSections, 'content')
  const featuresHeading = firstSection(cmsSections, 'heading:features')
  const featureCards = pickSections(cmsSections, 'feature:card')
  const benefitsHeading = firstSection(cmsSections, 'heading:benefits')
  const benefitItems = pickSections(cmsSections, 'benefit')
  const visual = firstSection(cmsSections, 'visual')
  const modulesHeading = firstSection(cmsSections, 'heading:modules')
  const moduleCards = pickSections(cmsSections, 'module-card')
  const whyHeading = firstSection(cmsSections, 'heading:why')
  const whySection = firstSection(cmsSections, 'why-choose')
  const faqItems = pickSections(cmsSections, 'faq')
  const ctaCms = firstSection(cmsSections, 'cta')

  const heroTitle =
    heroCms?.title || heroCms?.heading || `Petrol Pump Software in ${city.name}`
  const heroDescription =
    heroCms?.description || heroCms?.subheading || getCityHeroDescription(city)
  const primaryLabel =
    sectionField(heroCms, 'link_label', 'primaryButton', 'primary_button', 'cta_text') ||
    'See it in Action'
  const primaryUrl =
    sectionField(heroCms, 'link_url', 'primaryUrl', 'primary_url', 'cta_link') || '/get-started'
  const secondaryLabel =
    sectionField(heroCms, 'secondaryButton', 'secondary_button', 'cta2_text') || 'View Pricing'
  const secondaryUrl =
    sectionField(heroCms, 'secondaryUrl', 'secondary_url') || '/pricing'
  const badge = sectionField(heroCms, 'badge') || city.province

  const introTitle =
    introCms?.title || `Petrol Pump Management Software for Fuel Stations in ${city.name}`
  const introBody = introCms?.description || introCms?.content || city.intro

  const features =
    featureCards.length > 0
      ? featureCards.map((c) => ({
          title: c.title,
          description: c.description || c.content || '',
        }))
      : CITY_FEATURE_CARDS

  const benefits =
    benefitItems.length > 0
      ? benefitItems.map((b) => b.title || b.description).filter(Boolean)
      : getCityBenefits(city)

  const modules =
    moduleCards.length > 0
      ? moduleCards.map((c) => ({
          title: c.title,
          description: c.description || c.content || '',
        }))
      : CITY_MODULES

  const whyItemsRaw = sectionField(whySection, 'items')
  const whyItems =
    Array.isArray(whyItemsRaw) && whyItemsRaw.length
      ? whyItemsRaw
      : CITY_WHY_CHOOSE

  const faqs =
    faqItems.length > 0
      ? faqItems.map((f) => ({
          question: f.title,
          answer: f.description || f.content || '',
        }))
      : faqsDefault

  const seoTitle = getCitySeoTitle(city)
  const seoDescription =
    cmsPage?.description || getCitySeoDescription(city)

  return {
    path,
    seoTitle,
    seoDescription,
    badge,
    heroTitle,
    heroDescription,
    primaryLabel,
    primaryUrl,
    secondaryLabel,
    secondaryUrl,
    introTitle,
    introBody,
    featuresHeading: featuresHeading?.title || `What Petroleu Helps You Manage in ${city.name}`,
    features,
    benefitsHeading:
      benefitsHeading?.title || `Benefits for Petrol Stations in ${city.name}`,
    benefits,
    visualTitle: visual?.title || `Petroleu Dashboard for ${city.name} Fuel Stations`,
    visualDescription:
      visual?.description ||
      `Monitor nozzle sales, tank stock, credit customers, accounts and daily closing from one cloud dashboard — built for operators in ${city.name}.`,
    visualImage: visual?.image_url || CITY_DASHBOARD_IMAGE,
    modulesHeading: modulesHeading?.title || 'Core Modules for Fuel Station Operations',
    modules,
    whyHeading: whyHeading?.title || `Why Choose Petroleu in ${city.name}`,
    whyItems,
    faqsHeading: `FAQs About Petrol Pump Software in ${city.name}`,
    faqs,
    ctaTitle: ctaCms?.title || `Ready to Modernize Your ${city.name} Petrol Pump?`,
    ctaDescription:
      ctaCms?.description ||
      'Talk to our team and see how Petroleu can help manage your fuel station operations.',
    ctaPrimaryLabel:
      sectionField(ctaCms, 'link_label', 'primaryButton', 'cta_text') || 'See it in Action',
    ctaPrimaryUrl:
      sectionField(ctaCms, 'link_url', 'primaryUrl', 'cta_link') || '/get-started',
    ctaSecondaryLabel:
      sectionField(ctaCms, 'secondaryButton', 'secondary_button', 'cta2_text') || 'View Pricing',
    ctaSecondaryUrl: sectionField(ctaCms, 'secondaryUrl', 'secondary_url') || '/pricing',
  }
}

/**
 * Reusable city landing template.
 * Renders CMS sections when published; falls back to approved city content for known cities.
 */
export default function CityLandingPage({ slug: slugProp } = {}) {
  const { pathname } = useLocation()
  const city = resolveCity(slugProp, pathname)
  const pageSlug = city ? getCityPageSlug(city.slug) : slugProp || ''

  const { data, isLoading } = useCmsQuery(['page', pageSlug], `/page/${pageSlug}`, {
    enabled: Boolean(city && pageSlug),
    staleTime: 15_000,
  })

  if (!city) {
    return <CityNotFound />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 px-4 py-20 text-center text-muted-foreground">Loading…</main>
        <SiteFooter />
      </div>
    )
  }

  const cmsPage = data?.page || null
  const cmsSections = Array.isArray(data?.sections) ? data.sections : []
  // Prefer CMS when real page meta or sections exist; otherwise controlled hardcoded fallback.
  const hasCms = Boolean((cmsPage?.id && cmsPage?.title) || cmsSections.length > 0)
  const view = buildViewModel(city, hasCms ? cmsPage : null, hasCms ? cmsSections : [])

  const nearbyCities = city.nearbySlugs
    .map((s) => CITY_LANDING_PAGES.find((c) => c.slug === s))
    .filter(Boolean)

  const otherCities = CITY_LANDING_PAGES.filter(
    (c) => c.slug !== city.slug && !city.nearbySlugs.includes(c.slug),
  ).slice(0, 8)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo title={view.seoTitle} description={view.seoDescription} path={view.path} />
      <MarketingFaqJsonLd faqs={view.faqs} />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {view.badge ? (
              <MBadge variant="secondary" className="mb-4">
                {view.badge}
              </MBadge>
            ) : null}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {view.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {view.heroDescription}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={view.primaryUrl}>
                <MButton size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {view.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
              <Link to={view.secondaryUrl}>
                <MButton size="lg" variant="outline" className="gap-2">
                  {view.secondaryLabel}
                </MButton>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{view.introTitle}</h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {view.introBody}
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              {view.featuresHeading}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {view.features.map((card, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length] || Fuel
                return (
                  <div
                    key={`${card.title}-${i}`}
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
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{view.benefitsHeading}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {view.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{view.visualTitle}</h2>
                <p className="mt-4 text-pretty text-muted-foreground">{view.visualDescription}</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg">
                <img
                  src={view.visualImage}
                  alt={`Petroleu petrol pump software dashboard for ${city.name}`}
                  className="h-auto w-full rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              {view.modulesHeading}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {view.modules.map((mod, i) => (
                <div
                  key={`${mod.title}-${i}`}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-foreground">{mod.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{mod.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{view.whyHeading}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {view.whyItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              {view.faqsHeading}
            </h2>
            <div className="mt-8 rounded-2xl border border-border bg-card px-6 shadow-sm">
              <MAccordion>
                {view.faqs.map((faq, i) => (
                  <MAccordionItem key={faq.question} value={`city-faq-${i}`}>
                    <MAccordionTrigger>{faq.question}</MAccordionTrigger>
                    <MAccordionContent>{faq.answer}</MAccordionContent>
                  </MAccordionItem>
                ))}
              </MAccordion>
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
              {view.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
              {view.ctaDescription}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={view.ctaPrimaryUrl}>
                <MButton
                  size="lg"
                  className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                >
                  {view.ctaPrimaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </MButton>
              </Link>
              <Link to={view.ctaSecondaryUrl}>
                <MButton
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                >
                  {view.ctaSecondaryLabel}
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
