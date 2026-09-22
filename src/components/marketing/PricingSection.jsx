import { useState } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'
import { useCmsList } from '../../hooks/useCmsList'
import { PETROLEU_PRICING_PLANS, formatPlanPrice, planShowsPeriod } from '../../content/petroleuPricingPlans'

function PricingPlanCard({ plan, isYearly, whatsappUrl, labels }) {
  const cardClass = plan.popular
    ? 'relative h-full rounded-2xl border bg-card p-8 border-primary shadow-xl ring-2 ring-primary'
    : 'relative h-full rounded-2xl border border-border bg-card p-8'

  const buttonVariant = plan.popular ? 'default' : 'secondary'
  const contactSales = plan.cta_text || labels.contact_sales || 'Contact Sales'
  const mostPopular = plan.badge || labels.most_popular || 'Most Popular'
  const ctaHref = plan.cta_link || null

  return (
    <div className={cardClass}>
      {plan.popular && mostPopular ? (
        <MBadge className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
          {mostPopular}
        </MBadge>
      ) : null}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        {plan.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
        ) : null}

        <div className="mt-6">
          <span className="text-4xl font-bold text-foreground">{formatPlanPrice(plan.price)}</span>
          {planShowsPeriod(plan.price) && (
            <span className="text-muted-foreground">
              {plan.price_suffix || `/${isYearly ? 'year' : 'month'}`}
            </span>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {whatsappUrl && !ctaHref ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
            <MessageCircle className="h-4 w-4" />
            {contactSales}
          </MButton>
        </a>
      ) : ctaHref?.startsWith('http') ? (
        <a href={ctaHref} target="_blank" rel="noopener noreferrer">
          <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
            <MessageCircle className="h-4 w-4" />
            {contactSales}
          </MButton>
        </a>
      ) : (
        <Link to={ctaHref || labels.contactPath || '/contact'}>
          <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
            <MessageCircle className="h-4 w-4" />
            {contactSales}
          </MButton>
        </Link>
      )}
    </div>
  )
}

function normalizeFeatures(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((f) => {
      if (typeof f === 'string') return f
      if (f?.is_included === false) return null
      return f?.feature_text || f?.text || f?.label || ''
    })
    .filter(Boolean)
}

function mapPlans(rows, yearlyMode) {
  return rows.map((p) => ({
    id: p.id,
    name: p.name || p.title || p.heading || '',
    price: yearlyMode
      ? p.price_yearly || p.priceYearly || p.yearly_price || p.price
      : p.price ?? p.monthly_price ?? p.amount ?? '',
    price_suffix: p.price_suffix || p.priceSuffix || '',
    description: p.description || p.subheading || '',
    features: normalizeFeatures(p.features),
    popular: !!(p.is_popular ?? p.popular),
    badge: p.badge || (p.is_popular || p.popular ? 'Most Popular' : ''),
    cta_text: p.cta_text || p.link_label || p.primary_button || '',
    cta_link: p.cta_link || p.link_url || '',
  }))
}

export function PricingSection({ hideHeading = false, staticOnly = false }) {
  const [isYearly, setIsYearly] = useState(false)
  const { market } = useMarketLocale()
  const { copy, mp, whatsappUrl: afWhatsapp } = useUiCopy()
  const heading = useSectionHeading('pricing', {
    eyebrow: 'Best Pricing',
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that fits your fuel station. All plans include a 14-day free trial.',
  })

  // CMS success (including []) wins. Never restore hardcoded plans after delete.
  // Error/loading → empty (no Starter/Lite invent). staticOnly keeps design reference only.
  const { items: cmsRows, fromCms } = useCmsList(['pricing-plans'], '/pricing', {
    enabled: !staticOnly,
    fallback: [],
  })

  const monthly = staticOnly
    ? PETROLEU_PRICING_PLANS.monthly
    : fromCms
      ? mapPlans(cmsRows, false)
      : []

  const yearly = staticOnly
    ? PETROLEU_PRICING_PLANS.yearly
    : fromCms
      ? mapPlans(cmsRows, true)
      : []

  const plans = isYearly ? yearly : monthly
  if (!staticOnly && plans.length === 0) return null

  const whatsappUrl =
    market === 'af'
      ? afWhatsapp
      : `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  const labels = {
    contact_sales: copy.contact_sales || 'Contact Sales',
    most_popular: copy.most_popular || 'Most Popular',
    contactPath: mp('/contact'),
  }

  const monthlyLabel = copy.monthly || 'Monthly'
  const yearlyLabel = copy.yearly || 'Yearly'
  const saveLabel = copy.save_2_months || 'Save 2 Months'
  const pricingNote =
    copy.pricing_note ||
    (market === 'af' ? null : 'All prices are in Pakistani Rupees (PKR). Need a custom plan?')
  const contactUs = copy.contact_us || 'Contact us'

  const row1 = plans.slice(0, 3)
  const row2 = plans.slice(3)

  return (
    <section id="pricing" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!hideHeading && (
          <div className="text-center">
            {heading.eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">{heading.eyebrow}</p>
            ) : null}
            {heading.title ? (
              <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                {heading.title}
              </h2>
            ) : null}
            {heading.subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
                {heading.subtitle}
              </p>
            ) : null}
          </div>
        )}

        <div className={`flex items-center justify-center gap-4 ${hideHeading ? 'mb-8' : 'mt-8'}`}>
          <span
            className={`text-sm ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            {monthlyLabel}
          </span>
          <button
            type="button"
            onClick={() => setIsYearly(!isYearly)}
            className={`relative h-6 w-12 rounded-full transition-colors ${
              isYearly ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label={yearlyLabel}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isYearly ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'
              }`}
            />
          </button>
          <span
            className={`text-sm ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            {yearlyLabel}
          </span>
          {isYearly && saveLabel ? (
            <MBadge variant="secondary" className="bg-primary/20 text-primary">
              {saveLabel}
            </MBadge>
          ) : null}
        </div>

        {/* Row 1: up to 3 equal cards */}
        <div className="mt-12 mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {row1.map((plan, index) => (
            <PricingPlanCard
              key={plan.id || `${plan.name}-${index}`}
              plan={plan}
              isYearly={isYearly}
              whatsappUrl={whatsappUrl}
              labels={labels}
            />
          ))}
        </div>

        {/* Row 2: remaining cards — same card width, start-aligned (4th plan) */}
        {row2.length > 0 ? (
          <div className="mt-8 mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {row2.map((plan, index) => (
              <PricingPlanCard
                key={plan.id || `${plan.name}-r2-${index}`}
                plan={plan}
                isYearly={isYearly}
                whatsappUrl={whatsappUrl}
                labels={labels}
              />
            ))}
          </div>
        ) : null}

        {pricingNote ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {pricingNote}{' '}
            <Link to={mp('/contact')} className="ms-1 font-medium text-primary hover:underline">
              {contactUs}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}

export default PricingSection
