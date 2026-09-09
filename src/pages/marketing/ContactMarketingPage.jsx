import { useQueries } from '@tanstack/react-query'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { ContactForm } from '../../components/marketing/ContactForm'
import { FaqSection } from '../../components/marketing/FaqSection'
import { MBadge } from '../../components/marketing/ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent, withBestPrefix } from '../../content/websiteContent'

export default function ContactMarketingPage() {
  const q = useQueries({
    queries: [
      { queryKey: ['cms', 'hero', 'contact'], queryFn: () => safeCmsGet('/hero/contact') },
      { queryKey: ['cms', 'settings'], queryFn: () => safeCmsGet('/settings') },
      {
        queryKey: ['cms', 'faq', 'contact'],
        queryFn: () => safeCmsGet('/faqs', { params: { page: 'contact' } }),
      },
    ],
  })
  const [heroQ, settingsQ, faqQ] = q
  const heroData = heroQ.data
  const settingsMap = settingsQ.data && typeof settingsQ.data === 'object' ? settingsQ.data : {}
  const primaryEmail = websiteContent.footer.email
  const phone = websiteContent.footer.phone
  const phoneTel = websiteContent.brand.phoneTel
  const address = settingsMap.address || settingsMap.contact_address || websiteContent.footer.address
  const businessHours = settingsMap.business_hours || 'Mon-Fri: 9am - 6pm'
  const faqs = Array.isArray(faqQ.data) ? faqQ.data : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/contact" />
      <MarketingPageJsonLd path="/contact" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {heroData?.badge && (
              <MBadge variant="secondary" className="mb-4">
                {withBestPrefix(heroData.badge)}
              </MBadge>
            )}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {heroData?.heading || "Let's Talk"}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heroData?.subheading ||
                "We'd love to hear from you. Send us a message and our team will get back within one business day."}
            </p>
          </div>
        </section>

        <section className="bg-background py-16">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Contact details</h2>
              <p className="text-sm text-muted-foreground">
                Pick whichever channel works best for you — we&apos;re here to help.
              </p>

              <div className="space-y-4">
                {primaryEmail && (
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${primaryEmail}`}
                        className="text-sm font-medium text-foreground hover:text-primary"
                      >
                        {primaryEmail}
                      </a>
                    </div>
                  </div>
                )}
                {phone && (
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                      <a href={`tel:${phoneTel}`} className="text-sm font-medium text-foreground hover:text-primary">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                      <span className="text-sm font-medium text-foreground">{address}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Hours</p>
                    <span className="text-sm font-medium text-foreground">{businessHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </div>
        </section>

        {faqs.length > 0 && (
          <FaqSection
            heading="Common questions"
            subheading="Quick answers to questions we get often"
            items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
