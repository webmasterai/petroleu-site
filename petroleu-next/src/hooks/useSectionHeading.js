import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'

/**
 * CMS-driven section chrome (eyebrow / title / subtitle / cta).
 * Afghanistan never falls back to hardcoded English.
 */
export function useSectionHeading(key, englishFallback = {}) {
  const { isAfghanistan } = useMarketLocale()
  const { data } = useCmsQuery(['section-heading', key], `/section-heading/${key}`)

  if (data) {
    return {
      eyebrow: data.badge || data.eyebrow || data.link_label || '',
      title: data.title || data.heading || '',
      subtitle: data.description || data.subheading || '',
      cta: data.link_label || data.cta_text || '',
      ctaUrl: data.link_url || data.cta_link || '',
      imageAlt: data.image_alt || '',
      raw: data,
      loaded: true,
    }
  }

  if (isAfghanistan) {
    return {
      eyebrow: '',
      title: '',
      subtitle: '',
      cta: '',
      ctaUrl: '',
      imageAlt: '',
      raw: null,
      loaded: true,
    }
  }

  return {
    eyebrow: englishFallback.eyebrow || '',
    title: englishFallback.title || '',
    subtitle: englishFallback.subtitle || '',
    cta: englishFallback.cta || '',
    ctaUrl: englishFallback.ctaUrl || '',
    imageAlt: englishFallback.imageAlt || '',
    raw: null,
    loaded: true,
  }
}
