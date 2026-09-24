import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app')

const marketing = {
  features: 'FeaturesMarketingPage',
  pricing: 'PricingMarketingPage',
  about: 'AboutMarketingPage',
  contact: 'ContactMarketingPage',
  blog: 'BlogMarketingPage',
  faq: 'FaqMarketingPage',
  developers: 'DevelopersMarketingPage',
  analytics: 'AnalyticsMarketingPage',
  industries: 'IndustriesMarketingPage',
  'get-started': 'GetStartedPage',
  'privacy-policy': 'PrivacyPolicyPage',
  privacy: 'PrivacyPolicyPage',
  docs: 'DocsMarketingPage',
  'docs/api': 'DocsApiMarketingPage',
  'product/reports': 'ReportsMarketingPage',
}

function pageClient(importName) {
  return `'use client'\n\nimport Page from '@/legacy-pages/marketing/${importName}'\n\nexport default function RoutePage() {\n  return <Page />\n}\n`
}

for (const [route, name] of Object.entries(marketing)) {
  const dir = path.join(root, route)
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'page.tsx'), pageClient(name))
  for (const prefix of ['af', 'af/ps', 'af/en']) {
    const d = path.join(root, prefix, route)
    mkdirSync(d, { recursive: true })
    writeFileSync(path.join(d, 'page.tsx'), pageClient(name))
  }
}

// AF index pages
for (const prefix of ['af', 'af/ps', 'af/en']) {
  const d = path.join(root, prefix)
  mkdirSync(d, { recursive: true })
  writeFileSync(path.join(d, 'page.tsx'), pageClient('HomePage'))
}

// blog slug
const blogSlug = `'use client'\n\nimport Page from '@/legacy-pages/marketing/BlogDetailPage'\n\nexport default function RoutePage() {\n  return <Page />\n}\n`
for (const p of ['blog/[slug]', 'af/blog/[slug]', 'af/ps/blog/[slug]', 'af/en/blog/[slug]']) {
  mkdirSync(path.join(root, p), { recursive: true })
  writeFileSync(path.join(root, p, 'page.tsx'), blogSlug)
}

// City landings (/petrol-pump-software-{city}) are handled by app/[slug]/page.tsx
// via isCityLandingSlug — do NOT create petrol-pump-software-[city] (broken App Router matcher).

const adminMap = {
  '': 'AdminDashboardPage',
  pricing: 'AdminPricingPlansPage',
  sections: 'AdminSectionsPage',
  pages: 'AdminPagesPage',
  navigation: 'AdminNavigationPage',
  markets: 'AdminMarketsPage',
  locales: 'AdminLocalesPage',
  media: 'AdminMediaPage',
  blog: 'AdminBlogPage',
  seo: 'AdminSeoPage',
  settings: 'AdminSettingsPage',
  inquiries: 'AdminInquiriesPage',
  users: 'AdminUsersPage',
  profile: 'AdminProfilePage',
}

for (const [route, name] of Object.entries(adminMap)) {
  const dir = path.join(root, 'admin', route)
  mkdirSync(dir, { recursive: true })
  const content = `'use client'\n\nimport Page from '@/legacy-pages/admin/${name}'\nimport AdminLayout from '@/legacy-pages/admin/AdminLayout'\n\nexport default function RoutePage() {\n  return (\n    <AdminLayout>\n      <Page />\n    </AdminLayout>\n  )\n}\n`
  writeFileSync(path.join(dir, 'page.tsx'), content)
}

mkdirSync(path.join(root, 'admin', 'login'), { recursive: true })
writeFileSync(
  path.join(root, 'admin', 'login', 'page.tsx'),
  `'use client'\n\nimport Page from '@/legacy-pages/admin/AdminLoginPage'\n\nexport default function RoutePage() {\n  return <Page />\n}\n`,
)

console.log('App routes written')
