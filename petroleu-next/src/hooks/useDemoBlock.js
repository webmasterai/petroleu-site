import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'

/** CMS demo blocks (invoice / reports). AF never falls back to PK static demos. */
export function useDemoBlock(key) {
  const { isAfghanistan } = useMarketLocale()
  const { data, isLoading } = useCmsQuery(['demo-block', key], `/demo-block/${key}`)

  if (data) {
    return { data, loaded: true, isLoading: false }
  }

  return {
    data: isAfghanistan ? null : null,
    loaded: !isLoading,
    isLoading,
  }
}
