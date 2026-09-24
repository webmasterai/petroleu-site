import type { MetadataRoute } from 'next'
import { findAll } from '@/lib/storage/jsonStore'

const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://petroleu.com').replace(/\/+$/, '')

const staticPaths = [
  '/',
  '/features',
  '/pricing',
  '/about',
  '/contact',
  '/blog',
  '/faq',
  '/industries',
  '/analytics',
  '/developers',
  '/docs',
  '/docs/api',
  '/get-started',
  '/privacy-policy',
  '/af',
  '/af/ps',
  '/af/en',
  '/af/features',
  '/af/pricing',
  '/af/about',
  '/af/contact',
  '/af/blog',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await findAll<{
    slug: string
    market_code: string
    locale_code: string
    status?: string
    updated_at?: string
  }>('blog-posts')
  const blogEntries = posts
    .filter((p) => p.status === 'published')
    .map((p) => {
      let prefix = '/blog'
      if (p.market_code === 'af') {
        if (p.locale_code === 'ps-AF') prefix = '/af/ps/blog'
        else if (p.locale_code === 'en-AF') prefix = '/af/en/blog'
        else prefix = '/af/blog'
      }
      return {
        url: `${site}${prefix}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      }
    })

  const pages = await findAll<{
    slug: string
    market_code: string
    locale_code: string
    frontend_path?: string
    status?: string
    is_enabled?: boolean
    updated_at?: string
    published_at?: string
  }>('pages')

  const cityEntries = pages
    .filter(
      (p) =>
        p.market_code === 'pk' &&
        p.locale_code === 'en-PK' &&
        p.status === 'published' &&
        p.is_enabled !== false &&
        typeof p.slug === 'string' &&
        p.slug.startsWith('petrol-pump-software-'),
    )
    .map((p) => {
      const path = (p.frontend_path || `/${p.slug}`).replace(/\/+$/, '') || `/${p.slug}`
      return {
        url: `${site}${path.startsWith('/') ? path : `/${path}`}`,
        lastModified: p.updated_at
          ? new Date(p.updated_at)
          : p.published_at
            ? new Date(p.published_at)
            : new Date(),
      }
    })

  const seen = new Set<string>()
  const all = [
    ...staticPaths.map((p) => ({ url: `${site}${p}`, lastModified: new Date() })),
    ...blogEntries,
    ...cityEntries,
  ].filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })

  return all
}
