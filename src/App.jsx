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
import { CITY_LANDING_PAGES, getCityPath } from './content/cityLandingContent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
            <Route
              key={city.slug}
              path={getCityPath(city.slug)}
              element={<CityLandingPage />}
            />
          ))}
          <Route path="/analytics" element={<AnalyticsMarketingPage />} />
          <Route path="/industries" element={<IndustriesMarketingPage />} />
          <Route path="/product/reports" element={<ReportsMarketingPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/docs" element={<DocsMarketingPage />} />
          <Route path="/docs/api" element={<DocsApiMarketingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
