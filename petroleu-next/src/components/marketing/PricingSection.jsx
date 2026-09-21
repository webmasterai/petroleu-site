import { useState } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton, MBadge } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'
import { PETROLEU_PRICING_PLANS, formatPlanPrice, planShowsPeriod } from '../../content/petroleuPricingPlans'

function PricingPlanCard({ plan, index, isYearly, whatsappUrl, labels }) {
  const cardClass = plan.popular
    ? 'relative min-w-0 h-full rounded-2xl border bg-card p-5 sm:p-8 border-primary shadow-xl ring-2 ring-primary'
    : 'relative min-w-0 h-full rounded-2xl border border-border bg-card p-5 sm:p-8'

  const buttonVariant = plan.popular ? 'default' : 'secondary'
  const contactSales = labels.contact_sales || 'Contact Sales'
  const mostPopular = labels.most_popular || 'Most Popular'

  return (
    <div key={`${plan.name}-${index}`} className={cardClass}>
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
          <span className="break-words text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            {formatPlanPrice(plan.price)}
          </span>
          {planShowsPeriod(plan.price) && (
            <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center gap-3">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="min-w-0 text-sm leading-snug text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {whatsappUrl ? (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
            <MessageCircle className="h-4 w-4" />
            {contactSales}
          </MButton>
        </a>
      ) : (
        <Link to={labels.contactPath || '/contact'}>
          <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
            <MessageCircle className="h-4 w-4" />
            {contactSales}
          </MButton>
        </Link>
      )}
    </div>
  )
}

export function PricingSection({ hideHeading = false, staticOnly = false, pricingPageLayout = false }) {
  const [isYearly, setIsYearly] = useState(false)
  const { market } = useMarketLocale()
  const { copy, mp, whatsappUrl: afWhatsapp } = useUiCopy()
  const heading = useSectionHeading('pricing', {
    eyebrow: 'Best Pricing',
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that fits your fuel station. All plans include a 14-day free trial.',
  })

  const { data } = useCmsQuery(['pricing-plans'], '/pricing', { enabled: !staticOnly })

  const plansFromCms = staticOnly ? null : Array.isArray(data) && data.length ? data : null

  const normalizeFeatures = (raw) => {
    if (!Array.isArray(raw)) return []
    return raw
      .map((f) => (typeof f === 'string' ? f : f?.feature_text || f?.text || f?.label || ''))
      .filter(Boolean)
  }

  const monthly = plansFromCms
    ? plansFromCms.map((p) => ({
        name: p.name || p.title || p.heading || '',
        price: p.price ?? p.monthly_price ?? p.amount ?? '',
        description: p.description || p.subheading || '',
        features: normalizeFeatures(p.features),
        popular: !!(p.is_popular ?? p.popular),
      }))
    : staticOnly
      ? PETROLEU_PRICING_PLANS.monthly
      : market === 'af'
        ? []
        : websiteContent.pricing.monthly

  const yearly = plansFromCms
    ? plansFromCms.map((p) => ({
        name: p.name || p.title || p.heading || '',
        price: p.price_yearly || p.priceYearly || p.yearly_price || p.price,
        description: p.description || p.subheading || '',
        features: normalizeFeatures(p.features),
        popular: !!(p.is_popular ?? p.popular),
      }))
    : staticOnly
      ? PETROLEU_PRICING_PLANS.yearly
      : market === 'af'
        ? []
        : websiteContent.pricing.yearly

  const plans = isYearly ? yearly : monthly
  if (market === 'af' && plans.length === 0) return null

  const whatsappUrl =
    market === 'af'
      ? afWhatsapp
      : `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  const labels = {
    contact_sales: copy.contact_sales,
    most_popular: copy.most_popular,
    contactPath: mp('/contact'),
  }

  const monthlyLabel = copy.monthly || 'Monthly'
  const yearlyLabel = copy.yearly || 'Yearly'
  const saveLabel = copy.save_2_months || 'Save 2 Months'
  const pricingNote =
    copy.pricing_note ||
    (market === 'af' ? null : 'All prices are in Pakistani Rupees (PKR). Need a custom plan?')
  const contactUs = copy.contact_us || 'Contact us'

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

        <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${hideHeading ? 'mb-8' : 'mt-8'}`}>
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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <PricingPlanCard
              key={`${plan.name}-${index}`}
              plan={plan}
              index={index}
              isYearly={isYearly}
              whatsappUrl={whatsappUrl}
              labels={labels}
            />
          ))}
        </div>

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
