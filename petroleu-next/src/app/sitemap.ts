import type { MetadataRoute } from 'next'
import { findAll } from '@/lib/storage/jsonStore'
import { SITE_ORIGIN } from '@/config/siteSeo'

/**
 * Always use the public marketing origin for sitemap URLs.
 * Never emit Coolify/temp hostnames even if NEXT_PUBLIC_SITE_URL is mis-set.
 */
const site = SITE_ORIGIN.replace(/\/+$/, '')

/** Paths that must never appear in the public sitemap. */
const BLOCKED_PATHS = new Set([
  '/admin',
  '/login',
  '/register',
  '/dashboard',
  '/onboard',
  '/services', // draft / empty frontend_path="/" in CMS
])

function normalizePath(raw?: string | null, fallbackSlug?: string): string | null {
  let path = (raw || (fallbackSlug ? `/${fallbackSlug}` : '')).trim()
  if (!path) return null
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/+$/, '') || '/'
  if (BLOCKED_PATHS.has(path)) return null
  if (path.startsWith('/admin')) return null
  // Reject absolute foreign hosts accidentally stored in frontend_path
  if (/^https?:\/\//i.test(raw || '')) {
    try {
      const u = new URL(raw!)
      if (u.hostname !== 'petroleu.com' && u.hostname !== 'www.petroleu.com') return null
      path = u.pathname.replace(/\/+$/, '') || '/'
    } catch {
      return null
    }
  }
  return path
}

function toEntry(path: string, lastModified?: string | Date | null): MetadataRoute.Sitemap[number] {
  return {
    url: path === '/' ? `${site}/` : `${site}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seen = new Set<string>()
  const out: MetadataRoute.Sitemap = []

  const push = (path: string | null, lastMod?: string | Date | null) => {
    if (!path) return
    const entry = toEntry(path, lastMod)
    if (seen.has(entry.url)) return
    seen.add(entry.url)
    out.push(entry)
  }

  // Core PK marketing routes (always present)
  const corePaths = [
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
    '/product/reports',
    '/get-started',
    '/privacy-policy',
    '/privacy',
  ]
  for (const p of corePaths) push(p)

  // AF foundation indexes (public)
  for (const p of ['/af', '/af/ps', '/af/en', '/af/features', '/af/pricing', '/af/about', '/af/contact', '/af/blog', '/af/faq']) {
    push(p)
  }

  // CMS SEO noindex paths (skip these if present)
  const seoRows = await findAll<{
    path?: string
    status?: string
    noindex?: boolean
    market_code?: string
  }>('seo')
  const noindexPaths = new Set(
    seoRows
      .filter((r) => r.status === 'published' && r.noindex === true && r.path)
      .map((r) => normalizePath(r.path!)!)
      .filter(Boolean),
  )

  // Published CMS pages (PK + AF) via frontend_path
  const pages = await findAll<{
    slug: string
    market_code: string
    locale_code: string
    frontend_path?: string
    status?: string
    is_enabled?: boolean
    updated_at?: string
    published_at?: string
    title?: string
  }>('pages')

  for (const p of pages) {
    if (p.status !== 'published' || p.is_enabled === false) continue
    if (!p.title || !String(p.title).trim()) continue
    const path = normalizePath(p.frontend_path, p.slug)
    if (!path) continue
    if (noindexPaths.has(path)) continue
    // Prefer locale-specific AF paths already on frontend_path
    push(path, p.updated_at || p.published_at)
  }

  // Published blog posts
  const posts = await findAll<{
    slug: string
    market_code: string
    locale_code: string
    status?: string
    noindex?: boolean
    updated_at?: string
    published_at?: string
  }>('blog-posts')

  for (const post of posts) {
    if (post.status !== 'published') continue
    if (post.noindex) continue
    let prefix = '/blog'
    if (post.market_code === 'af') {
      if (post.locale_code === 'ps-AF') prefix = '/af/ps/blog'
      else if (post.locale_code === 'en-AF') prefix = '/af/en/blog'
      else prefix = '/af/blog'
    }
    const path = `${prefix}/${post.slug}`
    if (noindexPaths.has(path)) continue
    push(path, post.updated_at || post.published_at)
  }

  return out
}
