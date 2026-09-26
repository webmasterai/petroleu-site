/**
 * Logical Home page sections for CMS → Sections.
 * Child CMS rows (feature:card, faq, etc.) are edited inside these parents — never listed as table rows.
 */
export const HOME_PAGE_SLUGS = ['home', 'home-mid', 'home-bottom']

/** FAQ marketing page (+ layout chrome). */
export const EXTRA_SECTION_PAGE_SLUGS = ['faq', 'layout']

/** Site chrome (header / footer) — editable under Sections, not Home page body. */
export const LAYOUT_PAGE_SLUGS = ['layout']

/** Display order matches HomePage.jsx render order. */
export const HOME_MAIN_SECTIONS = [
  {
    id: 'hero',
    label: 'Hero',
    type: 'hero',
    order: 1,
    pageSlugs: ['home'],
    primaryKey: 'hero',
    itemKeys: [],
  },
  {
    id: 'stats',
    label: 'Business Stats',
    type: 'stats',
    order: 2,
    pageSlugs: ['home'],
    headingKey: 'heading:logos',
    // `logo` = trusted brands strip image shown on Home under the stats
    itemKeys: ['logo', 'stat'],
  },
  {
    id: 'features',
    label: 'Features',
    type: 'features',
    order: 3,
    pageSlugs: ['home'],
    headingKey: 'heading:features',
    itemKeys: ['feature:card'],
  },
  {
    id: 'getting-started',
    label: 'Getting Started',
    type: 'steps',
    order: 4,
    pageSlugs: ['home'],
    headingKey: 'heading:getting-started',
    itemKeys: ['how-it-works'],
  },
  {
    id: 'invoice',
    label: 'Sales / Invoices',
    type: 'demo',
    order: 5,
    pageSlugs: ['home'],
    headingKey: 'heading:invoice',
    primaryKey: 'demo:invoice',
    itemKeys: [],
  },
  {
    id: 'reports',
    label: 'Reports',
    type: 'demo',
    order: 6,
    pageSlugs: ['home'],
    headingKey: 'heading:reports',
    primaryKey: 'demo:reports',
    itemKeys: [],
  },
  {
    id: 'industries',
    label: 'Industries',
    type: 'industries',
    order: 7,
    pageSlugs: ['home'],
    headingKey: 'heading:industries',
    itemKeys: ['industry'],
  },
  {
    id: 'mobile',
    label: 'Mobile Dashboard',
    type: 'mobile',
    order: 8,
    pageSlugs: ['home'],
    headingKey: 'heading:mobile',
    itemKeys: ['mobile-feature'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    type: 'analytics',
    order: 9,
    pageSlugs: ['home'],
    headingKey: 'heading:analytics',
    itemKeys: ['analytics-card'],
  },
  {
    id: 'why-choose',
    label: 'Why Petroleu',
    type: 'why',
    order: 10,
    pageSlugs: ['home'],
    headingKey: 'heading:why-choose',
    itemKeys: ['why-choose', 'supported-brand'],
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    type: 'testimonials',
    order: 11,
    pageSlugs: ['home'],
    headingKey: 'heading:testimonials',
    itemKeys: ['testimonial'],
  },
  {
    id: 'blog',
    label: 'Latest Resources',
    type: 'blog',
    order: 12,
    pageSlugs: ['home'],
    headingKey: 'heading:blog',
    itemKeys: [],
  },
  {
    id: 'cta-mid',
    label: 'CTA (mid)',
    type: 'cta',
    order: 13,
    pageSlugs: ['home-mid'],
    primaryKey: 'cta',
    itemKeys: [],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    type: 'pricing',
    order: 14,
    pageSlugs: ['home'],
    headingKey: 'heading:pricing',
    itemKeys: [],
  },
  {
    id: 'faq',
    label: 'FAQ (Home)',
    type: 'faq',
    order: 15,
    pageSlugs: ['home'],
    headingKey: 'heading:faq',
    itemKeys: ['faq'],
  },
  {
    id: 'faq-page',
    label: 'FAQ Page',
    type: 'faq',
    order: 15.5,
    pageSlugs: ['faq'],
    itemKeys: ['faq'],
  },
  {
    id: 'cta-bottom',
    label: 'CTA',
    type: 'cta',
    order: 16,
    pageSlugs: ['home-bottom'],
    primaryKey: 'cta',
    itemKeys: [],
  },
]

/** Header + Footer chrome — shown at top of Sections list. */
export const LAYOUT_SECTIONS = [
  {
    id: 'site-header',
    label: 'Header',
    type: 'header',
    order: 0,
    pageSlugs: ['layout'],
    primaryKey: 'header',
    itemKeys: [],
    group: 'layout',
  },
  {
    id: 'site-footer',
    label: 'Footer',
    type: 'footer',
    order: 0.5,
    pageSlugs: ['layout'],
    primaryKey: 'footer',
    itemKeys: [],
    group: 'layout',
  },
]

/** All editable section defs for CMS → Sections table. */
export const ALL_MAIN_SECTIONS = [...LAYOUT_SECTIONS, ...HOME_MAIN_SECTIONS]

export function isHomePageSlug(slug) {
  return HOME_PAGE_SLUGS.includes(String(slug || ''))
}

export function isLayoutPageSlug(slug) {
  return LAYOUT_PAGE_SLUGS.includes(String(slug || ''))
}

export function isCityPageSlug(slug) {
  return String(slug || '').startsWith('petrol-pump-software-')
}

/** Keys that belong to a logical section (for filtering raw rows). */
export function keysForSectionDef(def) {
  const keys = new Set()
  if (def.primaryKey) keys.add(def.primaryKey)
  if (def.headingKey) keys.add(def.headingKey)
  for (const k of def.itemKeys || []) keys.add(k)
  return keys
}

export function findSectionDef(sectionId) {
  return ALL_MAIN_SECTIONS.find((s) => s.id === sectionId) || null
}
