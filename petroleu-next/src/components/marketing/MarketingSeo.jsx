import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, marketingPagesSeo, OG_IMAGE_PATH, SITE_ORIGIN } from '../../config/siteSeo'
import { resolveMarketLocale } from '../../context/MarketLocaleContext'
import { useCmsQuery } from '../../hooks/useCmsQuery'

function upsertMetaName(name, content) {
  if (content == null || content === '') return
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaProperty(property, content) {
  if (content == null || content === '') return
  let el = document.head.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/** Force canonical host to https://petroleu.com (never Coolify / www / localhost). */
function canonicalizePublicUrl(urlOrPath) {
  const origin = SITE_ORIGIN.replace(/\/+$/, '')
  if (!urlOrPath) return origin
  try {
    if (/^https?:\/\//i.test(urlOrPath)) {
      const u = new URL(urlOrPath)
      const path = u.pathname.replace(/\/+$/, '') || '/'
      return path === '/' ? origin : `${origin}${path}`
    }
  } catch {
    /* fall through */
  }
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`
  const normalized = path.replace(/\/+$/, '') || '/'
  return normalized === '/' ? origin : `${origin}${normalized}`
}

/**
 * Updates document title and core SEO / social meta for SPA routes.
 * Priority: props → CMS seo.json row → static marketingPagesSeo map.
 * Canonical always uses https://petroleu.com.
 */
export function MarketingSeo({
  title: titleProp,
  description: descriptionProp,
  keywords: keywordsProp,
  path: pathProp,
  noindex = false,
  /** When false, skip CMS seo lookup (rare). Default true. */
  useCmsSeo = true,
}) {
  const location = useLocation()
  const marketLocale = resolveMarketLocale(location.pathname)
  const normalized =
    (pathProp ?? location.pathname).replace(/\/+$/, '') || '/'

  const { data: cmsSeo } = useCmsQuery(['seo', normalized], '/seo', {
    enabled: useCmsSeo,
    config: { params: { path: normalized === '/' ? '/' : normalized } },
    staleTime: 60_000,
    retry: 0,
  })

  const cfg = marketingPagesSeo[normalized] || marketingPagesSeo['/']
  const title =
    titleProp ||
    cmsSeo?.title ||
    cmsSeo?.og_title ||
    cfg.title
  const description =
    descriptionProp ||
    cmsSeo?.description ||
    cmsSeo?.og_description ||
    cfg.description
  const keywords = keywordsProp || cmsSeo?.keywords || cfg.keywords
  const canonical = canonicalizePublicUrl(
    cmsSeo?.canonical_url || (normalized === '/' ? '/' : normalized),
  )
  const ogImage = absoluteUrl(cmsSeo?.og_image || OG_IMAGE_PATH)
  const ogLocale = (cmsSeo?.og_locale || marketLocale.locale || 'en-PK').replace('-', '_')
  const effectiveNoindex = noindex || cmsSeo?.noindex === true

  useEffect(() => {
    document.title = title
    upsertMetaName('description', description)
    upsertMetaName('keywords', keywords)
    upsertMetaName(
      'robots',
      effectiveNoindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    upsertCanonical(canonical)

    upsertMetaProperty('og:type', 'website')
    upsertMetaProperty('og:url', canonical)
    upsertMetaProperty('og:title', title)
    upsertMetaProperty('og:description', description)
    upsertMetaProperty('og:image', ogImage)
    upsertMetaProperty('og:locale', ogLocale)
    upsertMetaProperty('og:site_name', 'Petroleu')

    upsertMetaName('twitter:card', 'summary_large_image')
    upsertMetaName('twitter:title', title)
    upsertMetaName('twitter:description', description)
    upsertMetaName('twitter:image', ogImage)

    document.head.querySelectorAll('link[data-cms-hreflang]').forEach((el) => el.remove())
    const alternates = marketLocale.isAfghanistan
      ? [
          { hreflang: 'fa-af', href: absoluteUrl('/af') },
          { hreflang: 'ps-af', href: absoluteUrl('/af/ps') },
          { hreflang: 'en-af', href: absoluteUrl('/af/en') },
          { hreflang: 'x-default', href: absoluteUrl('/') },
        ]
      : [
          { hreflang: 'en-pk', href: absoluteUrl(normalized === '/' ? '/' : normalized) },
          { hreflang: 'x-default', href: absoluteUrl('/') },
        ]
    for (const a of alternates) {
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', a.hreflang)
      link.setAttribute('href', a.href)
      link.setAttribute('data-cms-hreflang', '1')
      document.head.appendChild(link)
    }
  }, [
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogLocale,
    effectiveNoindex,
    marketLocale.isAfghanistan,
    normalized,
  ])

  return null
}
