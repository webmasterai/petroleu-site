/**
 * JSON-LD: Organization + SoftwareApplication + WebSite (+ optional WebPage + FAQ).
 * Helps brand and product discovery (Google rich results / knowledge panel signals).
 */
import { SITE_ORIGIN, absoluteUrl, marketingPagesSeo, OG_IMAGE_PATH } from '../../config/siteSeo'
import { websiteContent } from '../../content/websiteContent'

export function MarketingJsonLd({
  siteName = 'Petroleu',
  description,
  url = SITE_ORIGIN,
  /** Extra profile URLs (e.g. Google Business) — verified links only */
  sameAs = [],
}) {
  const orgId = `${url.replace(/\/$/, '')}#organization`
  const websiteId = `${url.replace(/\/$/, '')}#website`
  const appId = `${url.replace(/\/$/, '')}#software`
  const logoUrl = `${url.replace(/\/$/, '')}/icons/icon-512.png`
  const baseUrl = url.replace(/\/$/, '')
  const brand = websiteContent.brand
  const verifiedSameAs = sameAs.filter(Boolean)

  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: baseUrl || url,
      name: siteName,
      inLanguage: 'en-PK',
      publisher: { '@id': orgId },
      description:
        description ||
        'Official site for Petroleu — petrol pump and fuel station management software in Pakistan.',
    },
    {
      '@type': 'Organization',
      '@id': orgId,
      name: siteName,
      url: baseUrl || url,
      logo: { '@type': 'ImageObject', url: logoUrl },
      description:
        description || 'Fuel station management software for petrol pumps in Pakistan.',
      email: brand.salesEmail,
      telephone: brand.phoneTel,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: brand.salesEmail,
          telephone: brand.phoneTel,
          areaServed: 'PK',
          availableLanguage: ['English', 'Urdu'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: brand.supportEmail,
          telephone: brand.phoneTel,
          areaServed: 'PK',
          availableLanguage: ['English', 'Urdu'],
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: brand.addressPk,
        addressLocality: 'Karachi',
        addressRegion: 'Sindh',
        addressCountry: 'PK',
      },
      ...(verifiedSameAs.length ? { sameAs: verifiedSameAs } : {}),
    },
    {
      '@type': 'SoftwareApplication',
      '@id': appId,
      name: `${siteName} — Fuel Station Management`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Windows, Linux',
      description:
        description ||
        'Petrol pump management with nozzle readings, tank dipping, credit billing, shift closing, accounts, and financial reports.',
      provider: { '@id': orgId },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/pricing`,
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock',
      },
    },
  ]

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

/** Lightweight JSON-LD for inner marketing routes (uses `marketingPagesSeo`). */
export function MarketingPageJsonLd({ path }) {
  const normalized = (path || '/').replace(/\/+$/, '') || '/'
  const cfg = marketingPagesSeo[normalized]
  if (!cfg) return null
  const pageUrl = absoluteUrl(normalized === '/' ? '/' : normalized)
  const siteOrigin = SITE_ORIGIN.replace(/\/$/, '')

  const breadcrumb =
    normalized !== '/'
      ? {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: siteOrigin,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: cfg.title.split('—')[0].trim(),
              item: pageUrl,
            },
          ],
        }
      : null

  const graph = [
    {
      '@type': 'WebPage',
      name: cfg.title,
      description: cfg.description,
      url: pageUrl,
      inLanguage: 'en-PK',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Petroleu',
        url: siteOrigin,
      },
    },
    ...(breadcrumb ? [breadcrumb] : []),
  ]

  const payload = { '@context': 'https://schema.org', '@graph': graph }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

/** FAQ JSON-LD for Google rich results — pass `faqs` array of {question, answer}. */
export function MarketingFaqJsonLd({ faqs = [] }) {
  if (!faqs.length) return null
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

/** BlogPosting JSON-LD for published CMS / resource articles. */
export function MarketingBlogPostingJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'Petroleu',
}) {
  if (!title || !url) return null
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description || undefined,
    mainEntityOfPage: absoluteUrl(url),
    image: image ? absoluteUrl(image) : absoluteUrl(OG_IMAGE_PATH),
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_ORIGIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Petroleu',
      url: SITE_ORIGIN,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/icons/icon-512.png'),
      },
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

