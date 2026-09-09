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
import { websiteContent } from '../../content/websiteContent'

export default function HomePage() {
  const sameAs = [websiteContent.brand.googleReviewUrl].filter(Boolean)
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/" />
      <MarketingJsonLd
        description="Cloud-based petrol pump management software with nozzle readings, tank dipping, customer credit, employee payroll & comprehensive financial reports."
        sameAs={sameAs}
        siteName={websiteContent.brand.name}
        url={websiteContent.brand.siteUrl}
      />
      <MarketingFaqJsonLd faqs={websiteContent.faq} />
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
        <PricingSection staticOnly />
        <FaqSection staticOnly />
        <CtaSection slug="home-bottom" />
      </main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  )
}
