import { useCmsQuery } from './useCmsQuery'
import { useMarketLocale } from '../context/MarketLocaleContext'
import { marketPath } from '../utils/marketPath'

/**
 * Locale-aware UI chrome labels from CMS settings (AF) or English defaults (PK).
 */
export function useUiCopy() {
  const { market, routePrefix, isAfghanistan, locale } = useMarketLocale()
  const { data } = useCmsQuery(['settings', 'ui-copy'], '/settings')
  // safeCmsGet returns null on failure — default `= {}` only covers undefined
  const settings = data && typeof data === 'object' && !Array.isArray(data) ? data : {}

  const defaults = {
    see_demo: 'See it in Action',
    view_pricing: 'View Pricing',
    resources: 'Resources',
    product: 'Product',
    company: 'Company',
    legal: 'Legal',
    login: 'Login',
    start_trial: 'Start Free Trial',
    phone_label: 'Phone',
    email_label: 'Email',
    privacy_policy: 'Privacy Policy',
    admin_login: 'Admin Login',
    monthly: 'Monthly',
    yearly: 'Yearly',
    contact_sales: 'Contact Sales',
    most_popular: 'Most Popular',
    pricing_note: 'All prices are in Pakistani Rupees (PKR). Need a custom plan?',
    mobile_platforms: 'Available on both Android and iOS',
    ready_to_start: 'Ready to start?',
    step: 'STEP',
    about_us: 'About Us',
    get_started: 'Get Started',
    save_2_months: 'Save 2 Months',
    explore_analytics: 'Explore Analytics',
    unlock_insights: 'Unlock powerful station insights today',
    contact_us: 'Contact us',
  }

  const af = (key, settingKey) =>
    settings[settingKey] || (isAfghanistan ? null : defaults[key])

  const copy = {
    see_demo: af('see_demo', 'ui_see_demo'),
    view_pricing: af('view_pricing', 'ui_view_pricing'),
    resources: af('resources', 'ui_resources'),
    product: af('product', 'ui_product'),
    company: af('company', 'ui_company'),
    legal: af('legal', 'ui_legal'),
    login: af('login', 'ui_login'),
    start_trial: af('start_trial', 'ui_start_trial'),
    phone_label: af('phone_label', 'ui_phone_label'),
    email_label: af('email_label', 'ui_email_label'),
    privacy_policy: af('privacy_policy', 'ui_privacy_policy'),
    admin_login: af('admin_login', 'ui_admin_login'),
    monthly: af('monthly', 'ui_monthly'),
    yearly: af('yearly', 'ui_yearly'),
    contact_sales: af('contact_sales', 'ui_contact_sales'),
    most_popular: af('most_popular', 'ui_most_popular'),
    pricing_note: af('pricing_note', 'ui_pricing_note'),
    mobile_platforms: af('mobile_platforms', 'ui_mobile_platforms'),
    ready_to_start: af('ready_to_start', 'ui_ready_to_start'),
    step: af('step', 'ui_step'),
    about_us: af('about_us', 'ui_about_us'),
    get_started: af('get_started', 'ui_get_started'),
    save_2_months: af('save_2_months', 'ui_save_2_months'),
    explore_analytics: af('explore_analytics', 'ui_explore_analytics'),
    unlock_insights: af('unlock_insights', 'ui_unlock_insights'),
    contact_us: af('contact_us', 'ui_contact_us'),
  }

  const whatsapp =
    settings.whatsapp || settings.whatsapp_number || settings.phone_tel || null
  const whatsappMessage = settings.whatsapp_message || ''
  const whatsappUrl = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/[^\d]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null

  return {
    market,
    locale,
    routePrefix,
    isAfghanistan,
    settings,
    copy,
    whatsappUrl,
    mp: (path) => marketPath(path, routePrefix),
  }
}
