import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const LOCALES_BY_MARKET = {
  pk: [{ value: 'en-PK', label: 'English (en-PK)' }],
  af: [
    { value: 'fa-AF', label: 'Dari (fa-AF)' },
    { value: 'ps-AF', label: 'Pashto (ps-AF)' },
    { value: 'en-AF', label: 'English (en-AF)' },
  ],
  shared: [{ value: 'en', label: 'English (shared)' }],
}

const MARKET_LABELS = {
  pk: 'Pakistan',
  af: 'Afghanistan',
  shared: 'Shared',
}

const LOCALE_SHORT = {
  'en-PK': 'English',
  'fa-AF': 'Dari',
  'ps-AF': 'Pashto',
  'en-AF': 'English',
  en: 'English',
}

function defaultLocaleFor(market) {
  if (market === 'af') return 'fa-AF'
  if (market === 'shared') return 'en'
  return 'en-PK'
}

function isLocaleAllowed(market, locale) {
  return (LOCALES_BY_MARKET[market] || []).some((l) => l.value === locale)
}

function previewPathFor(market, locale) {
  if (market === 'af') {
    if (locale === 'ps-AF') return '/af/ps'
    if (locale === 'en-AF') return '/af/en'
    return '/af'
  }
  return '/'
}

const AdminWorkspaceContext = createContext({
  market: 'pk',
  locale: 'en-PK',
  setMarket: () => {},
  setLocale: () => {},
  showAll: false,
  setShowAll: () => {},
  previewBase: 'http://localhost:5173',
  previewPath: '/',
  workspaceLabel: 'Pakistan / English',
  localeOptions: LOCALES_BY_MARKET.pk,
})

export function AdminWorkspaceProvider({ children }) {
  const [market, setMarketState] = useState(() => localStorage.getItem('cms_ws_market') || 'pk')
  const [locale, setLocaleState] = useState(() => {
    const m = localStorage.getItem('cms_ws_market') || 'pk'
    const l = localStorage.getItem('cms_ws_locale') || defaultLocaleFor(m)
    return isLocaleAllowed(m, l) ? l : defaultLocaleFor(m)
  })
  const [showAll, setShowAllState] = useState(() => localStorage.getItem('cms_ws_show_all') === '1')

  const setMarket = useCallback((m) => {
    const nextLocale = defaultLocaleFor(m)
    localStorage.setItem('cms_ws_market', m)
    localStorage.setItem('cms_ws_locale', nextLocale)
    setMarketState(m)
    setLocaleState(nextLocale)
  }, [])

  const setLocale = useCallback(
    (l) => {
      if (!isLocaleAllowed(market, l)) return
      localStorage.setItem('cms_ws_locale', l)
      setLocaleState(l)
    },
    [market],
  )

  const setShowAll = useCallback((v) => {
    localStorage.setItem('cms_ws_show_all', v ? '1' : '0')
    setShowAllState(Boolean(v))
  }, [])

  const value = useMemo(() => {
    const previewBase = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    const previewPath = previewPathFor(market, locale)
    return {
      market,
      locale,
      setMarket,
      setLocale,
      showAll,
      setShowAll,
      previewBase,
      previewPath,
      workspaceLabel: `${MARKET_LABELS[market] || market} / ${LOCALE_SHORT[locale] || locale}`,
      localeOptions: LOCALES_BY_MARKET[market] || LOCALES_BY_MARKET.pk,
    }
  }, [market, locale, setMarket, setLocale, showAll, setShowAll])

  return (
    <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>
  )
}

export function useAdminWorkspace() {
  return useContext(AdminWorkspaceContext)
}

export function AdminWorkspaceBar({ pagePath = '', sectionAnchor = '' }) {
  const {
    market,
    locale,
    setMarket,
    setLocale,
    showAll,
    setShowAll,
    previewBase,
    previewPath,
    workspaceLabel,
    localeOptions,
  } = useAdminWorkspace()

  let href = `${previewBase}${previewPath}`
  if (pagePath) {
    const rest = pagePath === '/' ? '' : pagePath.startsWith('/') ? pagePath : `/${pagePath}`
    href = `${previewBase}${previewPath === '/' ? rest || '/' : `${previewPath}${rest === '/' ? '' : rest}`}`
  }
  if (sectionAnchor) {
    href += `#${sectionAnchor.replace(/^#/, '')}`
  }

  return (
    <div className="admin-toolbar mb-5">
      <span className="text-sm font-semibold text-foreground">{workspaceLabel}</span>
      <label className="flex min-w-0 items-center gap-2 text-sm">
        <span className="shrink-0 text-muted-foreground">Market</span>
        <select
          className="admin-input min-w-0 flex-1 sm:w-40"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        >
          <option value="pk">Pakistan (pk)</option>
          <option value="af">Afghanistan (af)</option>
          <option value="shared">Shared</option>
        </select>
      </label>
      <label className="flex min-w-0 items-center gap-2 text-sm">
        <span className="shrink-0 text-muted-foreground">Locale</span>
        <select
          className="admin-input min-w-0 flex-1 sm:w-44"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          {localeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        Show all
      </label>
      <a className="admin-btn-primary ms-auto text-xs" href={href} target="_blank" rel="noreferrer">
        Preview ↗
      </a>
    </div>
  )
}
