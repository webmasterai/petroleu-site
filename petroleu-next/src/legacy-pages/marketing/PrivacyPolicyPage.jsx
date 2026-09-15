import { Loader2 } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { LegalContent } from '../../components/marketing/LegalContent'
import { privacyPolicyContent, privacyPolicyMeta } from '../../content/privacyPolicyContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useUiCopy } from '../../hooks/useUiCopy'

export default function PrivacyPolicyPage() {
  const { market, isAfghanistan } = useMarketLocale()
  const { settings } = useUiCopy()
  const { data, isLoading } = useCmsQuery(['legal-page', 'privacy-policy'], '/legal-pages/privacy-policy')

  const page = data?.content ? data : null
  const pkFallback = market === 'af' ? null : true
  const title = page?.title || (pkFallback ? privacyPolicyMeta.title : '')
  const description = page?.meta_description || (pkFallback ? privacyPolicyMeta.meta_description : '')
  const content = page?.content || (pkFallback ? privacyPolicyContent : '')
  const updatedAt = page?.updated_at
  const eyebrow = isAfghanistan ? (settings.site_name || 'Petroleu') : 'Digital Softs · Petroleu'
  const effectiveLabel = settings.ui_effective_date || (isAfghanistan ? null : 'Effective date')
  const updatedLabel = settings.ui_last_updated || (isAfghanistan ? null : 'Last updated')
  const effectiveDate = page?.effective_date || page?.data?.effective_date || (!isAfghanistan ? privacyPolicyMeta.effective_date : null)
  const appliesNote = settings.ui_privacy_applies || (isAfghanistan ? null : 'This policy applies to the Petroleu website, web app, desktop app, and mobile apps.')

  if (isAfghanistan && !title && !content && !isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingSeo path="/privacy-policy" />
        <SiteHeader />
        <main className="flex-1" />
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/privacy-policy"
        title={title ? `${title} — Petroleu` : 'Petroleu'}
        description={description}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
            {title ? (
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
            ) : null}
            {(effectiveLabel && effectiveDate) || (updatedLabel && updatedAt) ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {effectiveLabel && effectiveDate ? (
                  <>
                    {effectiveLabel}: {effectiveDate}
                  </>
                ) : null}
                {updatedLabel && updatedAt ? (
                  <>
                    {effectiveLabel && effectiveDate ? ' · ' : null}
                    {updatedLabel}:{' '}
                    {new Date(updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </>
                ) : null}
              </p>
            ) : null}
            {appliesNote ? (
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{appliesNote}</p>
            ) : null}
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : content ? (
              <LegalContent content={content} />
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
