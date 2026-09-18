import { useQuery } from '@tanstack/react-query'
import { safeCmsGet } from '../services/cmsPublic'
import { useMarketLocale } from '../context/MarketLocaleContext'

/** CMS query scoped to current market/locale. Never mixes markets in the query key. */
export function useCmsQuery(keyParts, path, options = {}) {
  const marketLocale = useMarketLocale()
  const { enabled = true, staleTime = 0, config = {}, ...rest } = options

  return useQuery({
    queryKey: ['cms', marketLocale.market, marketLocale.locale, ...keyParts],
    queryFn: () => safeCmsGet(path, config, marketLocale),
    enabled,
    // Keep CMS-driven marketing fresh after Publish (API also sends Cache-Control: no-store).
    staleTime,
    refetchOnMount: 'always',
    ...rest,
  })
}

export function useCmsMarketLocale() {
  return useMarketLocale()
}
