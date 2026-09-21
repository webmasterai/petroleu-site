import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { HeroSection } from '../../components/marketing/HeroSection'
import { StatsSection } from '../../components/marketing/StatsSection'
import { FeaturesSection } from '../../components/marketing/FeaturesSection'
import { GettingStartedSection } from '../../components/marketing/GettingStartedSection'
import { InvoiceSection } from '../../components/marketing/InvoiceSection'
import { ReportsSection } from '../../components/marketing/ReportsSection'
import { IndustriesSection } from '../../components/marketing/IndustriesSection'
import { MobileSection } from '../../components/marketing/MobileSection'
import { AnalyticsSection } from '../../components/marketing/AnalyticsSection'
import { WhyChooseSection } from '../../components/marketing/WhyChooseSection'
import { TestimonialsSection } from '../../components/marketing/TestimonialsSection'
import { BlogPreviewSection } from '../../components/marketing/BlogPreviewSection'
import { PricingSection } from '../../components/marketing/PricingSection'
import { FaqSection } from '../../components/marketing/FaqSection'
import { CtaSection } from '../../components/marketing/CtaSection'
import { WhatsAppWidget } from '../../components/marketing/WhatsAppWidget'
import { MarketingJsonLd, MarketingFaqJsonLd } from '../../components/marketing/MarketingJsonLd'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { CmsFlexibleSections } from '../../components/marketing/CmsContentBlocks'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useUiCopy } from '../../hooks/useUiCopy'

export default function HomePage() {
  const { isAfghanistan } = useMarketLocale()
  const { settings } = useUiCopy()
  const { data: faqData } = useCmsQuery(['faqs', 'jsonld'], '/faq')

  const faqs = Array.isArray(faqData) && faqData.length
    ? faqData.map((f) => ({
        question: f.question ?? f.title,
        answer: f.answer ?? f.description ?? f.content,
      }))
    : isAfghanistan
      ? []
      : websiteContent.faq

  const sameAs = isAfghanistan
    ? []
    : [websiteContent.brand.googleReviewUrl].filter(Boolean)

  const description = isAfghanistan
    ? settings.site_tagline ||
      settings.seo_description ||
      'Petrol pump management software for Afghanistan fuel stations.'
    : 'Cloud-based petrol pump management software with nozzle readings, tank dipping, customer credit, employee payroll & comprehensive financial reports.'

  const siteName = isAfghanistan ? settings.site_name || 'Petroleu' : websiteContent.brand.name
  const siteUrl = isAfghanistan
    ? settings.site_url || 'https://petroleu.com/af'
    : websiteContent.brand.siteUrl

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/" />
      <MarketingJsonLd
        description={description}
        sameAs={sameAs}
        siteName={siteName}
        url={siteUrl}
      />
      {faqs.length > 0 ? <MarketingFaqJsonLd faqs={faqs} /> : null}
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <GettingStartedSection />
        <InvoiceSection />
        <ReportsSection />
        <IndustriesSection variant="home" />
        <MobileSection />
        <AnalyticsSection />
        <WhyChooseSection />
        <TestimonialsSection />
        <BlogPreviewSection />
        <CtaSection slug="home-mid" />
        <PricingSection />
        <FaqSection />
        <CmsFlexibleSections pageSlug="home" />
        <CtaSection slug="home-bottom" />
      </main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  )
}
