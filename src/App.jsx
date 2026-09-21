import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/marketing/HomePage'
import FeaturesMarketingPage from './pages/marketing/FeaturesMarketingPage'
import PricingMarketingPage from './pages/marketing/PricingMarketingPage'
import AboutMarketingPage from './pages/marketing/AboutMarketingPage'
import ContactMarketingPage from './pages/marketing/ContactMarketingPage'
import AnalyticsMarketingPage from './pages/marketing/AnalyticsMarketingPage'
import IndustriesMarketingPage from './pages/marketing/IndustriesMarketingPage'
import ReportsMarketingPage from './pages/marketing/ReportsMarketingPage'
import GetStartedPage from './pages/marketing/GetStartedPage'
import PrivacyPolicyPage from './pages/marketing/PrivacyPolicyPage'
import BlogMarketingPage from './pages/marketing/BlogMarketingPage'
import BlogDetailPage from './pages/marketing/BlogDetailPage'
import FaqMarketingPage from './pages/marketing/FaqMarketingPage'
import DevelopersMarketingPage from './pages/marketing/DevelopersMarketingPage'
import DocsMarketingPage from './pages/marketing/DocsMarketingPage'
import DocsApiMarketingPage from './pages/marketing/DocsApiMarketingPage'
import NotFoundPage from './pages/marketing/NotFoundPage'
import CityLandingPage from './pages/marketing/CityLandingPage'
import CmsMarketingPage from './pages/marketing/CmsMarketingPage'
import { CITY_LANDING_PAGES, getCityPath } from './content/cityLandingContent'
import { MarketLocaleProvider } from './context/MarketLocaleContext'
import { DocumentLocaleEffect } from './components/DocumentLocaleEffect'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminSectionsPage from './pages/admin/AdminSectionsPage'
import AdminPagesPage from './pages/admin/AdminPagesPage'
import AdminNavigationPage from './pages/admin/AdminNavigationPage'
import AdminMarketsPage from './pages/admin/AdminMarketsPage'
import AdminLocalesPage from './pages/admin/AdminLocalesPage'
import AdminMediaPage from './pages/admin/AdminMediaPage'
import AdminBlogPage from './pages/admin/AdminBlogPage'
import AdminSeoPage from './pages/admin/AdminSeoPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
})

/** Same Petroleu marketing pages under Pakistan and Afghanistan prefixes. */
function marketingPageRoutes() {
  return (
    <>
      <Route index element={<HomePage />} />
      <Route path="features" element={<FeaturesMarketingPage />} />
      <Route path="pricing" element={<PricingMarketingPage />} />
      <Route path="about" element={<AboutMarketingPage />} />
      <Route path="contact" element={<ContactMarketingPage />} />
      <Route path="blog" element={<BlogMarketingPage />} />
      <Route path="blog/:slug" element={<BlogDetailPage />} />
      <Route path="faq" element={<FaqMarketingPage />} />
      <Route path="developers" element={<DevelopersMarketingPage />} />
      <Route path="analytics" element={<AnalyticsMarketingPage />} />
      <Route path="industries" element={<IndustriesMarketingPage />} />
      <Route path="product/reports" element={<ReportsMarketingPage />} />
      <Route path="get-started" element={<GetStartedPage />} />
      <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="privacy" element={<PrivacyPolicyPage />} />
      <Route path="docs" element={<DocsMarketingPage />} />
      <Route path="docs/api" element={<DocsApiMarketingPage />} />
      <Route path=":slug" element={<CmsMarketingPage />} />
    </>
  )
}

function MarketingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/features" element={<FeaturesMarketingPage />} />
      <Route path="/pricing" element={<PricingMarketingPage />} />
      <Route path="/about" element={<AboutMarketingPage />} />
      <Route path="/contact" element={<ContactMarketingPage />} />
      <Route path="/blog" element={<BlogMarketingPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/faq" element={<FaqMarketingPage />} />
      <Route path="/developers" element={<DevelopersMarketingPage />} />
      {CITY_LANDING_PAGES.map((city) => (
        <Route key={city.slug} path={getCityPath(city.slug)} element={<CityLandingPage />} />
      ))}
      <Route path="/analytics" element={<AnalyticsMarketingPage />} />
      <Route path="/industries" element={<IndustriesMarketingPage />} />
      <Route path="/product/reports" element={<ReportsMarketingPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/docs" element={<DocsMarketingPage />} />
      <Route path="/docs/api" element={<DocsApiMarketingPage />} />

      {/* Afghanistan — same components & design; market/locale from path */}
      <Route path="/af">{marketingPageRoutes()}</Route>
      <Route path="/af/ps">{marketingPageRoutes()}</Route>
      <Route path="/af/en">{marketingPageRoutes()}</Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="sections" element={<AdminSectionsPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route path="navigation" element={<AdminNavigationPage />} />
        <Route path="markets" element={<AdminMarketsPage />} />
        <Route path="locales" element={<AdminLocalesPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="seo" element={<AdminSeoPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="inquiries" element={<AdminInquiriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="password" element={<AdminProfilePage />} />
      </Route>

      {/* CMS pages created in admin (single-segment paths) */}
      <Route path="/:slug" element={<CmsMarketingPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MarketLocaleProvider>
          <DocumentLocaleEffect />
          <MarketingRoutes />
          <Toaster position="top-right" />
        </MarketLocaleProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
