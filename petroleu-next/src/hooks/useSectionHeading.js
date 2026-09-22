import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'

const EMPTY = {
  eyebrow: '',
  title: '',
  subtitle: '',
  cta: '',
  ctaUrl: '',
  imageAlt: '',
  raw: null,
  loaded: false,
}

/**
 * CMS-driven section chrome (eyebrow / title / subtitle / cta).
 * Never paint englishFallback while the request is in flight — that caused
 * reload flashes of stale marketing copy before CMS arrived.
 * Fallback is only used when the request errors (and never for Afghanistan).
 */
export function useSectionHeading(key, englishFallback = {}) {
  const { isAfghanistan } = useMarketLocale()
  const { data, isSuccess, isError, isPending, isFetched } = useCmsQuery(
    ['section-heading', key],
    `/section-heading/${key}`,
    {
      config: { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } },
    },
  )

  if (isPending || !isFetched) {
    return EMPTY
  }

  if (isSuccess && data) {
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

  // Successful empty / null heading → render nothing (CMS SoT)
  if (isSuccess && !data) {
    return { ...EMPTY, loaded: true }
  }

  if (isAfghanistan || !isError) {
    return { ...EMPTY, loaded: true }
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
