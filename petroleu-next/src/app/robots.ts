import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/config/siteSeo'

/**
 * Sole robots.txt source of truth (app/robots.ts).
 * Do NOT add public/robots.txt — it would shadow this route the same way
 * public/sitemap.xml shadowed app/sitemap.ts.
 */
const site = SITE_ORIGIN.replace(/\/+$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/about',
          '/contact',
          '/blog',
          '/faq',
          '/developers',
          '/docs',
          '/docs/api',
          '/analytics',
          '/industries',
          '/product/reports',
          '/get-started',
          '/privacy',
          '/privacy-policy',
          '/openapi.json',
          '/llms.txt',
          '/sitemap.xml',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/login',
          '/register',
          '/onboard',
          '/api/v1/',
          '/api/cms/admin/',
        ],
      },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
