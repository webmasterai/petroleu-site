import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'
import { isEditorialPlaceholderText } from '../lib/cms/editorialPlaceholders'

const EMPTY = {
  eyebrow: '',
  title: '',
  subtitle: '',
  cta: '',
  ctaUrl: '',
  imageAlt: '',
  imageUrl: '',
  raw: null,
  loaded: false,
}

/**
 * CMS-driven section chrome (eyebrow / title / subtitle / cta).
 * Never paint englishFallback while the request is in flight — that caused
 * reload flashes of stale marketing copy before CMS arrived.
 * Fallback is only used when the request errors (and never for Afghanistan).
 * Editorial translation placeholders never render publicly.
 */
export function useSectionHeading(key, englishFallback = {}, options = {}) {
  const { isAfghanistan } = useMarketLocale()
  const page = options.page || 'home'
  const { data, isSuccess, isError, isPending, isFetched } = useCmsQuery(
    ['section-heading', key, page],
    `/section-heading/${key}`,
    {
      config: {
        params: { page },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      },
    },
  )

  if (isPending || !isFetched) {
    return { ...EMPTY }
  }

  if (isSuccess && data) {
    const title = String(data.title || data.heading || '')
    const subtitle = String(data.description || data.subheading || '')
    const eyebrow = String(data.badge || data.eyebrow || data.link_label || '')
    const isPlaceholder =
      Boolean(data.translation_required) ||
      isEditorialPlaceholderText(title) ||
      isEditorialPlaceholderText(subtitle) ||
      isEditorialPlaceholderText(eyebrow)

    if (!isPlaceholder && (title || subtitle || eyebrow)) {
      return {
        eyebrow: isEditorialPlaceholderText(eyebrow) ? '' : eyebrow,
        title,
        subtitle,
        cta: data.link_label || data.cta_text || '',
        ctaUrl: data.link_url || data.cta_link || '',
        imageAlt: data.image_alt || '',
        imageUrl: data.image_url || data.dashboard_image_url || '',
        raw: data,
        loaded: true,
      }
    }

    if (isAfghanistan) {
      return { ...EMPTY, loaded: true }
    }
    if (englishFallback.title || englishFallback.subtitle || englishFallback.eyebrow) {
      return {
        eyebrow: englishFallback.eyebrow || '',
        title: englishFallback.title || '',
        subtitle: englishFallback.subtitle || '',
        cta: englishFallback.cta || '',
        ctaUrl: englishFallback.ctaUrl || '',
        imageAlt: englishFallback.imageAlt || '',
        imageUrl: englishFallback.imageUrl || '',
        raw: null,
        loaded: true,
      }
    }
    return { ...EMPTY, loaded: true }
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
    imageUrl: englishFallback.imageUrl || '',
    raw: null,
    loaded: true,
  }
}
