import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { LegalContent } from '../../components/marketing/LegalContent'
import { safeCmsGet } from '../../services/cmsPublic'
import { privacyPolicyContent, privacyPolicyMeta } from '../../content/privacyPolicyContent'

export default function PrivacyPolicyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'legal-page', 'privacy-policy'],
    queryFn: () => safeCmsGet('/legal-pages/privacy-policy'),
    staleTime: 60_000,
  })

  const page = data?.content ? data : null
  const title = page?.title || privacyPolicyMeta.title
  const description = page?.meta_description || privacyPolicyMeta.meta_description
  const content = page?.content || privacyPolicyContent
  const updatedAt = page?.updated_at

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo
        path="/privacy-policy"
        title={`${title} — Petroleu`}
        description={description}
      />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-primary">Digital Softs · Petroleu</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Effective date: {privacyPolicyMeta.effective_date}
              {updatedAt && (
                <>
                  {' · '}
                  Last updated:{' '}
                  {new Date(updatedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </>
              )}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              This policy applies to the Petroleu website, web app, desktop app, and mobile apps.
              Google Play listing URL:{' '}
              <span className="font-medium text-foreground">https://www.petroleu.com/privacy-policy</span>
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <LegalContent content={content} />
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
