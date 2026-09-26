import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Search, MessageCircle, ArrowRight } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd, MarketingFaqJsonLd } from '../../components/marketing/MarketingJsonLd'
import {
  MAccordion,
  MAccordionItem,
  MAccordionTrigger,
  MAccordionContent,
  MBadge,
  MButton,
} from '../../components/marketing/ui'
import { FAQ_CATEGORIES } from '../../content/faqPageContent'
import { getCityPath, FAQ_CITIES } from '../../content/cityLandingContent'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { usePageHero } from '../../hooks/usePageHero'
import { useUiCopy } from '../../hooks/useUiCopy'

function matchesSearch(faq, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    String(faq.question || '')
      .toLowerCase()
      .includes(q) ||
    String(faq.answer || '')
      .toLowerCase()
      .includes(q)
  )
}

export default function FaqMarketingPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const { market, isAfghanistan } = useMarketLocale()
  const { mp, whatsappUrl: afWhatsapp, copy } = useUiCopy()
  const hero = usePageHero('faq', {
    badge: 'Best Help Center',
    title: 'Frequently Asked Questions',
    subtitle: 'Answers to common questions about Petroleu petrol pump management software.',
  })
  const { data: cmsFaqs } = useCmsQuery(['faq-page'], '/faq', {
    config: { params: { page: 'faq' } },
  })
  const { data: homeFaqs } = useCmsQuery(['faq-home-fallback'], '/faq', {
    config: { params: { page: 'home' } },
    enabled: isAfghanistan,
  })

  const cmsMapped = Array.isArray(cmsFaqs) && cmsFaqs.length
    ? cmsFaqs
    : Array.isArray(homeFaqs)
      ? homeFaqs
      : []

  const normalizedCms = cmsMapped
    .map((f) => {
      const categoryId = f.category || f.category_id || 'general'
      const categoryLabel =
        f.category_label ||
        FAQ_CATEGORIES.find((c) => c.id === categoryId)?.label ||
        'General'
      return {
        id: f.id,
        question: f.question || f.title,
        answer: f.answer || f.description || f.content,
        category: categoryLabel,
        categoryId: String(categoryId),
        enabled: f.is_enabled !== false,
      }
    })
    .filter((f) => f.question && f.answer && f.enabled !== false)

  const usingCms = normalizedCms.length > 0

  const allFaqs = useMemo(() => {
    if (usingCms) return normalizedCms
    if (market === 'af') return []
    return FAQ_CATEGORIES.flatMap((category) =>
      category.faqs.map((faq) => ({
        ...faq,
        category: category.label,
        categoryId: category.id,
      })),
    )
  }, [normalizedCms, usingCms, market])

  const categories = useMemo(() => {
    if (usingCms) {
      const map = new Map()
      for (const faq of allFaqs) {
        if (!map.has(faq.categoryId)) {
          map.set(faq.categoryId, faq.category || faq.categoryId)
        }
      }
      return [{ id: 'all', label: 'All' }, ...[...map.entries()].map(([id, label]) => ({ id, label }))]
    }
    return [{ id: 'all', label: 'All' }, ...FAQ_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))]
  }, [allFaqs, usingCms])

  const activeCategoryLabel = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.label || 'All',
    [categories, activeCategory],
  )

  const filteredFaqs = useMemo(() => {
    let list = allFaqs
    if (activeCategory !== 'all') {
      list = list.filter((faq) => faq.categoryId === activeCategory)
    }
    return list.filter((faq) => matchesSearch(faq, search))
  }, [search, activeCategory, allFaqs])

  const listHeading = search.trim()
    ? isAfghanistan
      ? null
      : 'Search results'
    : isAfghanistan
      ? null
      : activeCategoryLabel

  const whatsappUrl = isAfghanistan
    ? afWhatsapp
    : `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  // JSON-LD: published FAQs currently visible (search/category filtered view uses filtered list;
  // schema should reflect all published CMS FAQs for the page when not searching)
  const jsonLdFaqs = search.trim() || activeCategory !== 'all' ? filteredFaqs : allFaqs

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/faq" />
      <MarketingPageJsonLd path="/faq" />
      {jsonLdFaqs.length > 0 ? <MarketingFaqJsonLd faqs={jsonLdFaqs} /> : null}
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {hero.badge ? (
              <MBadge variant="secondary" className="mb-4">
                {hero.badge}
              </MBadge>
            ) : null}
            {hero.title ? (
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {hero.title}
              </h1>
            ) : null}
            {hero.subtitle ? (
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
                {hero.subtitle}
              </p>
            ) : null}
          </div>
        </section>

        {!isAfghanistan ? (
          <section className="border-b border-border bg-card/50 py-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search petrol pump software questions..."
                  className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {categories.length > 1 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        activeCategory === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="border-b border-border bg-card/50 py-6">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none"
                />
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
                <p className="text-muted-foreground">No matching questions found.</p>
              </div>
            ) : (
              <div>
                {listHeading ? (
                  <h2 className="mb-4 text-lg font-semibold text-foreground">{listHeading}</h2>
                ) : null}
                <div className="rounded-2xl border border-border bg-card px-6 shadow-sm">
                  <MAccordion>
                    {filteredFaqs.map((faq, i) => (
                      <MAccordionItem
                        key={`${faq.id || faq.categoryId}-${faq.question}-${i}`}
                        value={`${faq.categoryId}-${i}`}
                      >
                        <MAccordionTrigger>{faq.question}</MAccordionTrigger>
                        <MAccordionContent>{faq.answer}</MAccordionContent>
                      </MAccordionItem>
                    ))}
                  </MAccordion>
                </div>
              </div>
            )}
          </div>
        </section>

        {!isAfghanistan ? (
          <section className="border-t border-border bg-muted/30 py-16">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Petrol Pump Software Available Across Pakistan
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Petroleu supports fuel stations in major cities and towns — with cloud-based petrol
                pump management software, local onboarding, and ongoing support.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {FAQ_CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    to={getCityPath(city.slug)}
                    className="cursor-pointer rounded-full border border-orange-200 bg-card px-3 py-1.5 text-sm font-medium text-primary shadow-sm transition-colors hover:border-primary hover:bg-primary/10"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="relative overflow-hidden bg-primary py-20">
          <div className="absolute inset-0">
            <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {!isAfghanistan ? (
              <>
                <h2 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
                  Still Have Questions?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
                  Talk to our team and see how Petroleu can help manage your fuel station.
                </p>
              </>
            ) : null}
            <div
              className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${isAfghanistan ? '' : 'mt-8'}`}
            >
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MButton
                    size="lg"
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {copy.see_demo || (isAfghanistan ? null : 'WhatsApp Us') || 'WhatsApp'}
                  </MButton>
                </a>
              ) : null}
              <Link to={mp('/contact')}>
                <MButton
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
                >
                  {copy.contact_sales || (isAfghanistan ? null : 'Book a Demo') || 'Contact'}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
