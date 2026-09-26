import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'
import { isEditorialPlaceholderText } from '../lib/cms/editorialPlaceholders'

/** CMS hero for inner marketing pages. AF never falls back to English hardcodes. */
export function usePageHero(page, englishFallback = {}) {
  const { isAfghanistan } = useMarketLocale()
  const { data } = useCmsQuery(['hero', page], `/hero/${page}`)

  const cmsTitle = data ? String(data.heading || data.title || '') : ''
  const cmsSubtitle = data ? String(data.subheading || data.description || '') : ''
  const cmsIsPlaceholder =
    Boolean(data?.translation_required) ||
    isEditorialPlaceholderText(cmsTitle) ||
    isEditorialPlaceholderText(cmsSubtitle)

  if (data && !cmsIsPlaceholder && cmsTitle) {
    return {
      badge: isEditorialPlaceholderText(data.badge || data.eyebrow)
        ? ''
        : data.badge || data.eyebrow || '',
      title: cmsTitle,
      subtitle: cmsSubtitle,
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
