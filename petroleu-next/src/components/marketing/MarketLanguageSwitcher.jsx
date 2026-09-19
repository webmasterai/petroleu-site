import { Link, useLocation } from 'react-router-dom'
import { useMarketLocale } from '../../context/MarketLocaleContext'

/**
 * Floating market/language switcher — keeps equivalent path when possible.
 */
export function MarketLanguageSwitcher() {
  const { pathname } = useLocation()
  const { market, locale, routePrefix, isAfghanistan } = useMarketLocale()

  if (pathname.startsWith('/admin')) return null

  const rest = (() => {
    if (!isAfghanistan) return pathname === '/' ? '' : pathname
    const stripped = pathname
      .replace(/^\/af\/ps/, '')
      .replace(/^\/af\/en/, '')
      .replace(/^\/af/, '')
    return stripped || ''
  })()

  const afHome = `/af${rest}`
  const afPs = `/af/ps${rest}`
  const afEn = `/af/en${rest}`
  const pkHome = rest || '/'

  return (
    <div className="fixed bottom-4 start-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 text-xs shadow-md backdrop-blur">
      <span className="px-1 font-medium text-muted-foreground" dir="ltr">
        Petroleu
      </span>
      <Link
        to={pkHome}
        className={`rounded-full px-2 py-0.5 ${!isAfghanistan ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        dir="ltr"
      >
        PK
      </Link>
      <Link
        to={afHome}
        className={`rounded-full px-2 py-0.5 ${isAfghanistan && locale === 'fa-AF' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
      >
        دری
      </Link>
      <Link
        to={afPs}
        className={`rounded-full px-2 py-0.5 ${isAfghanistan && locale === 'ps-AF' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
      >
        پښتو
      </Link>
      <Link
        to={afEn}
        className={`rounded-full px-2 py-0.5 ${isAfghanistan && locale === 'en-AF' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
        dir="ltr"
      >
        AF EN
      </Link>
      <span className="sr-only">
        {market}/{locale}/{routePrefix}
      </span>
    </div>
  )
}
