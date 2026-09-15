import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, marketingPagesSeo, OG_IMAGE_PATH } from '../../config/siteSeo'
import { resolveMarketLocale } from '../../context/MarketLocaleContext'

function upsertMetaName(name, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertMetaProperty(property, content) {
  if (!content) return
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

/**
 * Updates document title and core SEO / social meta for SPA routes.
 * Crawlers that execute JS (Google) see these; static index.html is the fallback.
 */
export function MarketingSeo({
  title: titleProp,
  description: descriptionProp,
  keywords: keywordsProp,
  path: pathProp,
  noindex = false,
}) {
  const location = useLocation()
  const marketLocale = resolveMarketLocale(location.pathname)
  const normalized =
    (pathProp ?? location.pathname).replace(/\/+$/, '') || '/'
  const cfg = marketingPagesSeo[normalized] || marketingPagesSeo['/']
  const title = titleProp || cfg.title
  const description = descriptionProp || cfg.description
  const keywords = keywordsProp || cfg.keywords
  const canonical = absoluteUrl(normalized === '/' ? '/' : normalized)
  const ogImage = absoluteUrl(OG_IMAGE_PATH)
  const ogLocale = (marketLocale.locale || 'en-PK').replace('-', '_')
  const effectiveNoindex = noindex

  useEffect(() => {
    document.title = title
    upsertMetaName('description', description)
    upsertMetaName('keywords', keywords)
    upsertMetaName(
      'robots',
      effectiveNoindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    upsertCanonical(canonical)

    upsertMetaProperty('og:type', 'website')
    upsertMetaProperty('og:url', canonical)
    upsertMetaProperty('og:title', title)
    upsertMetaProperty('og:description', description)
    upsertMetaProperty('og:image', ogImage)
    upsertMetaProperty('og:locale', ogLocale)

    upsertMetaName('twitter:card', 'summary_large_image')
    upsertMetaName('twitter:title', title)
    upsertMetaName('twitter:description', description)
    upsertMetaName('twitter:image', ogImage)

    // hreflang alternates for AF foundation + PK default
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
  }, [title, description, keywords, canonical, ogImage, ogLocale, effectiveNoindex, marketLocale.isAfghanistan, normalized])

  return null
}
