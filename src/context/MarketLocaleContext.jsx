import { createContext, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const MarketLocaleContext = createContext({
  market: 'pk',
  locale: 'en-PK',
  dir: 'ltr',
  isAfghanistan: false,
  routePrefix: '',
})

export function resolveMarketLocale(pathname) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/'

  if (path === '/af' || path.startsWith('/af/')) {
    if (path === '/af/ps' || path.startsWith('/af/ps/')) {
      return { market: 'af', locale: 'ps-AF', dir: 'rtl', isAfghanistan: true, routePrefix: '/af/ps' }
    }
    if (path === '/af/en' || path.startsWith('/af/en/')) {
      return { market: 'af', locale: 'en-AF', dir: 'ltr', isAfghanistan: true, routePrefix: '/af/en' }
    }
    return { market: 'af', locale: 'fa-AF', dir: 'rtl', isAfghanistan: true, routePrefix: '/af' }
  }

  return { market: 'pk', locale: 'en-PK', dir: 'ltr', isAfghanistan: false, routePrefix: '' }
}

export function MarketLocaleProvider({ children }) {
  const location = useLocation()
  const value = useMemo(() => resolveMarketLocale(location.pathname), [location.pathname])

  return (
    <MarketLocaleContext.Provider value={value}>{children}</MarketLocaleContext.Provider>
  )
}

export function useMarketLocale() {
  return useContext(MarketLocaleContext)
}
