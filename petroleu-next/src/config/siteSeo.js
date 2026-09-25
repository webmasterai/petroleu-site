/**
 * Canonical marketing origin — official site is petroleu.com (not petroleu.pk).
 * Used for sitemap, JSON-LD, og:url, and client-side meta updates.
 */
export const SITE_ORIGIN = 'https://petroleu.com'

export const OG_IMAGE_PATH = '/og-image.png'

export function absoluteUrl(path = '') {
  if (!path || path === '/') return SITE_ORIGIN
  if (/^https?:\/\//i.test(path)) {
    try {
      const u = new URL(path)
      // Normalize known Petroleu hosts to canonical origin; keep external CDN as-is
      if (u.hostname === 'petroleu.com' || u.hostname === 'www.petroleu.com') {
        const p = u.pathname.replace(/\/+$/, '') || '/'
        return p === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${p}`
      }
      return path
    } catch {
      return path
    }
  }
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${p}`
}

const kw =
  'Petroleu, petrol pump software Pakistan, fuel station management, PMS, nozzle sales, tank stock, petrol pump accounting, Lahore, CNG POS, petrol station POS'

export const marketingPagesSeo = {
  '/': {
    title: 'Petroleu — Petrol Pump Software Pakistan | Fuel Station Management',
    description:
      'Petroleu: cloud petrol pump management for Pakistan — real-time stock, nozzle sales, dipping, customer credit, payroll & financial reports. Demo & pricing.',
    keywords: `${kw}, petrol pump management software`,
  },
  '/features': {
    title: 'Features — Petroleu Petrol Pump Software | Stock, Sales & Accounting',
    description:
      'Explore Petroleu features: nozzle readings, tank dipping, credit sales, shifts, POS, reports and double-entry accounting built for Pakistani fuel stations.',
    keywords: `${kw}, petrol pump features, fuel inventory software`,
  },
  '/pricing': {
    title: 'Pricing — Petroleu | Petrol Pump Software Plans Pakistan',
    description:
      'Transparent pricing for Petroleu petrol pump software. Plans for independent pumps and growing fuel retail — contact us for a tailored quote.',
    keywords: `${kw}, petrol pump software price Pakistan`,
  },
  '/about': {
    title: 'About — Petroleu | Digital Softs Fuel Station Software',
    description:
      'Learn about Petroleu and Digital Softs — petrol pump and fuel station management software trusted by operators across Pakistan.',
    keywords: `${kw}, Digital Softs, about Petroleu`,
  },
  '/contact': {
    title: 'Contact — Petroleu | Demo, Sales & Support Pakistan',
    description:
      'Contact Petroleu for a demo, onboarding, or support. Lahore office, WhatsApp, and email — petrol pump software for Pakistan.',
    keywords: `${kw}, petrol pump software demo, fuel station support`,
  },
  '/analytics': {
    title: 'Analytics — Petroleu | Sales & Margin Dashboards for Pumps',
    description:
      'Fuel station analytics with Petroleu: margins, product mix, alerts and variance signals for petrol pump owners in Pakistan.',
    keywords: `${kw}, fuel station analytics, pump sales dashboard`,
  },
  '/industries': {
    title: 'Industries — Petroleu | Petrol Pumps, CNG & Fuel Retail',
    description:
      'Petroleu for petrol pumps, highway outlets, and fuel retail — industry-specific workflows and reporting for Pakistan.',
    keywords: `${kw}, CNG station software, highway fuel outlet`,
  },
  '/product/reports': {
    title: 'Reports — Petroleu | Daily, P&L, Stock & Ledger for Pumps',
    description:
      'Financial and operational reports for petrol pumps: daily sales, stock, P&L, trial balance and more with Petroleu.',
    keywords: `${kw}, petrol pump daily report, fuel station P&L`,
  },
  '/get-started': {
    title: 'Get Started — Petroleu | Onboard Your Petrol Pump',
    description:
      'Start with Petroleu: quick setup for your fuel station — tanks, nozzles, shifts and go-live support in Pakistan.',
    keywords: `${kw}, petrol pump onboarding`,
  },
  '/privacy-policy': {
    title: 'Privacy Policy — Petroleu | Digital Softs',
    description:
      'Petroleu Privacy Policy: how Digital Softs collects, uses, and protects account, business, and technical data in our petrol pump management software and apps.',
    keywords: `${kw}, privacy policy, data protection, Google Play`,
  },
  '/faq': {
    title: 'FAQ — Petroleu | Petrol Pump Software Questions',
    description:
      'Frequently asked questions about Petroleu petrol pump management software — pricing, nozzle readings, tank dipping, credit, mobile access, and reports.',
    keywords: `${kw}, petrol pump software FAQ, fuel station software questions`,
  },
  '/developers': {
    title: 'Petroleu Developer Resources | API Notes & Documentation',
    description:
      'Petroleu developer resources — public CMS endpoints, OpenAPI, Markdown content negotiation, operator documentation links, and integration guidance for fuel station software.',
    keywords: `${kw}, Petroleu API, developer documentation, petrol pump software integration`,
  },
  '/docs': {
    title: 'Petroleu Docs | Product & Developer Documentation',
    description:
      'Petroleu documentation index — product overview, public website API notes, OpenAPI, and operator guides for petrol pump and fuel station management software.',
    keywords: `${kw}, Petroleu docs, petrol pump software documentation`,
  },
  '/docs/api': {
    title: 'Petroleu API Docs | Public OpenAPI & CMS Endpoints',
    description:
      'Petroleu API documentation for the official website: public CMS reads, contact forms, health, and the OpenAPI 3.1 specification. Tenant ERP APIs remain private.',
    keywords: `${kw}, Petroleu API documentation, OpenAPI, public CMS`,
  },
  '/blog': {
    title: 'Resources & Blog — Petroleu Petrol Pump Software',
    description:
      'Guides, walkthroughs, and fuel station management articles from Petroleu — stock control, automation, credit billing, and daily closing.',
    keywords: `${kw}, petrol pump blog, fuel station guides`,
  },
  '/privacy': {
    title: 'Privacy Policy — Petroleu | Digital Softs',
    description:
      'Petroleu Privacy Policy: how Digital Softs collects, uses, and protects account, business, and technical data.',
    keywords: `${kw}, privacy policy`,
  },
}
