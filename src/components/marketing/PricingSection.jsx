import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, MessageCircle } from 'lucide-react'
import { MButton, MBadge } from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'
import { PETROLEU_PRICING_PLANS, formatPlanPrice, planShowsPeriod } from '../../content/petroleuPricingPlans'

function PricingPlanCard({ plan, index, isYearly, whatsappUrl }) {
  const cardClass = plan.popular
    ? 'relative rounded-2xl border bg-card p-8 border-primary shadow-xl ring-2 ring-primary'
    : 'relative rounded-2xl border border-border bg-card p-8'

  const buttonVariant = plan.popular ? 'default' : 'secondary'

  return (
    <div key={`${plan.name}-${index}`} className={cardClass}>
      {plan.popular && (
        <MBadge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </MBadge>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        {plan.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
        ) : null}

        <div className="mt-6">
          <span className="text-4xl font-bold text-foreground">{formatPlanPrice(plan.price)}</span>
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
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MButton className="mt-8 w-full gap-2" variant={buttonVariant}>
          <MessageCircle className="h-4 w-4" />
          Contact Sales
        </MButton>
      </a>
    </div>
  )
}

export function PricingSection({ hideHeading = false, staticOnly = false, pricingPageLayout = false }) {
  const [isYearly, setIsYearly] = useState(false)

  const { data } = useQuery({
    queryKey: ['cms', 'pricing-plans'],
    queryFn: () => safeCmsGet('/pricing'),
    enabled: !staticOnly,
    staleTime: 60_000,
  })

  const plansFromCms = staticOnly ? null : Array.isArray(data) && data.length ? data : null

  const normalizeFeatures = (raw) => {
    if (!Array.isArray(raw)) return []
    return raw
      .map((f) => (typeof f === 'string' ? f : f?.feature_text || f?.text || f?.label || ''))
      .filter(Boolean)
  }

  const monthly = plansFromCms
    ? plansFromCms.map((p) => ({
        name: p.name,
        price: p.price,
        description: p.description || '',
        features: normalizeFeatures(p.features),
        popular: !!(p.is_popular ?? p.popular),
      }))
    : staticOnly
      ? PETROLEU_PRICING_PLANS.monthly
      : websiteContent.pricing.monthly

  const yearly = plansFromCms
    ? plansFromCms.map((p) => ({
        name: p.name,
        price: p.price_yearly || p.priceYearly || p.price,
        description: p.description || '',
        features: normalizeFeatures(p.features),
        popular: !!(p.is_popular ?? p.popular),
      }))
    : staticOnly
      ? PETROLEU_PRICING_PLANS.yearly
      : websiteContent.pricing.yearly

  const plans = isYearly ? yearly : monthly
  const whatsappUrl = `https://wa.me/${websiteContent.brand.whatsappNumber}?text=${encodeURIComponent(websiteContent.brand.whatsappMessage)}`

  return (
    <section id="pricing" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!hideHeading && (
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Best Pricing</p>
            <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              Choose the plan that fits your fuel station. All plans include a 14-day free trial.
            </p>
          </div>
        )}

        <div className={`flex items-center justify-center gap-4 ${hideHeading ? 'mb-8' : 'mt-8'}`}>
          <span
            className={`text-sm ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsYearly(!isYearly)}
            className={`relative h-6 w-12 rounded-full transition-colors ${
              isYearly ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label="Toggle yearly pricing"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isYearly ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span
            className={`text-sm ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            Yearly
          </span>
          {isYearly && (
            <MBadge variant="secondary" className="bg-primary/20 text-primary">
              Save 2 Months
            </MBadge>
          )}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingPlanCard
              key={`${plan.name}-${index}`}
              plan={plan}
              index={index}
              isYearly={isYearly}
              whatsappUrl={whatsappUrl}
            />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All prices are in Pakistani Rupees (PKR). Need a custom plan?{' '}
          <a href="/contact" className="ml-1 font-medium text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </section>
  )
}

export default PricingSection
