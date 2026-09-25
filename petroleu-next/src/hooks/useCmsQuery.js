import { useQuery } from '@tanstack/react-query'
import { cmsGet } from '../services/cmsApi'
import { useMarketLocale } from '../context/MarketLocaleContext'

/** CMS query scoped to current market/locale. Never mixes markets in the query key. */
export function useCmsQuery(keyParts, path, options = {}) {
  const marketLocale = useMarketLocale()
  const {
    enabled = true,
    staleTime = 0,
    refetchOnWindowFocus = true,
    config = {},
    ...rest
  } = options

  const paramsKey =
    config?.params && typeof config.params === 'object'
      ? JSON.stringify(config.params)
      : ''

  return useQuery({
    queryKey: ['cms', marketLocale.market, marketLocale.locale, ...keyParts, paramsKey],
    queryFn: async () => {
      // Throw on failure so React Query keeps previous data instead of caching null
      // (safeCmsGet returned null and wiped menus after reload).
      return cmsGet(path, config, marketLocale)
    },
    enabled,
    staleTime,
    refetchOnWindowFocus,
    retry: 1,
    ...rest,
  })
}

export function useCmsMarketLocale() {
  return useMarketLocale()
}
