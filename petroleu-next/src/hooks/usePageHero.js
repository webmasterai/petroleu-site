import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'

/** CMS hero for inner marketing pages. AF never falls back to English hardcodes. */
export function usePageHero(page, englishFallback = {}) {
  const { isAfghanistan } = useMarketLocale()
  const { data } = useCmsQuery(['hero', page], `/hero/${page}`)

  if (data) {
    return {
      badge: data.badge || data.eyebrow || '',
      title: data.heading || data.title || '',
      subtitle: data.subheading || data.description || '',
      loaded: true,
    }
  }

  if (isAfghanistan) {
    return { badge: '', title: '', subtitle: '', loaded: true }
  }

  return {
    badge: englishFallback.badge || '',
    title: englishFallback.title || '',
    subtitle: englishFallback.subtitle || '',
    loaded: true,
  }
}
