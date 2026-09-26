import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { BlogCard } from '../../components/marketing/BlogCard'
import { MBadge } from '../../components/marketing/ui'
import { getPublishedResources } from '../../content/resources'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { mapCmsBlogPost } from '../../utils/cmsContent'

export default function BlogMarketingPage() {
  const { market, locale, isAfghanistan } = useMarketLocale()
  const { data, isLoading } = useCmsQuery(['blog'], '/blog')
  const cmsPosts = Array.isArray(data)
    ? data
        .map(mapCmsBlogPost)
        .filter((p) => p && p.showOnResources !== false)
        .slice(0, 6)
    : []
  const allResources =
    cmsPosts.length > 0
      ? cmsPosts
      : market === 'af'
        ? []
        : getPublishedResources().slice(0, 6)

  const emptyMessage = (() => {
    if (locale === 'fa-AF') return 'هنوز مطلب وبلاگ برای دری منتشر نشده است.'
    if (locale === 'ps-AF') return 'تر اوسه د پښتو لپاره بلاګ مطالب خپاره شوي نه دي.'
    if (isAfghanistan) return 'Afghanistan blog content is not published yet.'
    return 'No published resources available.'
  })()

  const heading = (() => {
    if (locale === 'fa-AF') {
      return {
        badge: 'ویدیو و راهنما',
        title: 'منابع Petroleu',
        subtitle: 'ویدیو، راهنما و منابع اتوماسیون برای مالکان پمپ تیل.',
      }
    }
    if (locale === 'ps-AF') {
      return {
        badge: 'ویډیوګانې او لارښودونه',
        title: 'د Petroleu سرچینې',
        subtitle: 'د سون توکو پمپ خاوندانو لپاره ویډیوګانې، لارښودونه او اتوماتیک سرچینې.',
      }
    }
    return {
      badge: 'Videos & Guides',
      title: 'Petroleu Resources',
      subtitle: 'Videos, guides, and automation resources for petrol pump owners.',
    }
  })()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/blog"
        title="Resources — Petroleu | Videos & Petrol Pump Software Guides"
        description="Petroleu resources: product videos, automation guides, ATG monitoring, AI reporting, WhatsApp invoices, and fuel station management tips."
        keywords="Petroleu resources, petrol pump software, dispenser integration, ATG monitoring, fuel station automation, daily closing report"
      />
      <MarketingPageJsonLd path="/blog" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <MBadge variant="secondary" className="mb-4">
              {heading.badge}
            </MBadge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {heading.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heading.subtitle}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {isLoading && !allResources.length ? (
              <p className="text-center text-muted-foreground">Loading resources…</p>
            ) : null}
            {!isLoading && !allResources.length ? (
              <p className="text-center text-muted-foreground">{emptyMessage}</p>
            ) : null}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {allResources.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
