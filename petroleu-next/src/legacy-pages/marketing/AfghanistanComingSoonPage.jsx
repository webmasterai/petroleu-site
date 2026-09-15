import { Link } from 'react-router-dom'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useCmsQuery } from '../../hooks/useCmsQuery'

/**
 * Afghanistan market pages.
 * Uses CMS only for market=af. Never falls back to Pakistan content.
 * Unpublished / missing content shows an explicit unavailable state.
 */
export default function AfghanistanComingSoonPage() {
  const { locale, dir, routePrefix } = useMarketLocale()
  const { data: hero, isLoading } = useCmsQuery(['hero', 'home', 'af'], '/hero/home')
  const { data: settings } = useCmsQuery(['settings', 'af'], '/settings')

  const copy =
    locale === 'ps-AF'
      ? {
          title: 'Petroleu افغانستان',
          body: 'د افغانستان بازار پاڼه چمتو کېږي. مینځپانګه به له CMS څخه خپره شي کله چې مسلکي ژباړه بیاکتنه شي.',
          status: 'ژباړه اړینه ده — نه خپره شوې',
          home: 'پاکستان سایټ',
        }
      : locale === 'en-AF'
        ? {
            title: 'Petroleu Afghanistan',
            body: 'Afghanistan pages are CMS-controlled. Content stays unpublished until professional translation is reviewed. Pakistani market content is never shown here.',
            status: 'Translation required — not published',
            home: 'Pakistan site',
          }
        : {
            title: 'Petroleu افغانستان',
            body: 'صفحات افغانستان از CMS مدیریت می‌شوند. تا تکمیل ترجمهٔ حرفه‌ای دری افغانی، محتوا پیش‌نویس و منتشرنشده می‌ماند. محتوای پاکستان اینجا نمایش داده نمی‌شود.',
            status: 'ترجمه لازم است — منتشر نشده',
            home: 'سایت پاکستان',
          }

  const publishedHero = hero && (hero.title || hero.heading)
  const siteName = settings?.site_name || 'Petroleu Afghanistan'

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 via-white to-stone-50" dir={dir}>
      <MarketingSeo
        path={routePrefix || '/af'}
        title={`${copy.title} | Petroleu`}
        description={copy.body}
        noindex
      />
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800" dir="ltr">
          {siteName}
        </p>
        {isLoading ? (
          <p className="mt-6 text-stone-500">…</p>
        ) : publishedHero ? (
          <>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {hero.heading || hero.title}{' '}
              <span className="text-emerald-800">{hero.title_highlight || ''}</span>
            </h1>
            <p className="mt-6 text-lg text-stone-600">{hero.subheading || hero.description}</p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-6 text-lg text-stone-600">{copy.body}</p>
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {copy.status}
            </p>
          </>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white" to="/af">
            دری
          </Link>
          <Link className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium" to="/af/ps">
            پښتو
          </Link>
          <Link className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium" to="/af/en" dir="ltr">
            English
          </Link>
          <Link className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium" to="/">
            {copy.home}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
