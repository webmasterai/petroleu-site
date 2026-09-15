import {
  UserPlus,
  Settings,
  Rocket,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton } from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useUiCopy } from '../../hooks/useUiCopy'

const ICON_MAP = {
  UserPlus,
  Settings,
  Rocket,
}

export function GettingStartedSection() {
  const { market } = useMarketLocale()
  const { copy, mp } = useUiCopy()
  const { data } = useCmsQuery(['how-it-works'], '/how-it-works')
  const heading = useSectionHeading('getting-started', {
    eyebrow: 'Best Getting Started',
    title: 'Up & Running in Under 30 Minutes',
    subtitle: 'Three simple steps to digitize your fuel station — no IT team required.',
    cta: 'Start Free Trial',
  })

  const pkSteps = websiteContent.gettingStarted
  const steps =
    Array.isArray(data) && data.length
      ? data.map((s, i) => ({
          number: s.number || String(i + 1).padStart(2, '0'),
          icon: s.icon || (market === 'af' ? undefined : pkSteps[i]?.icon),
          title: s.title,
          description: s.description,
        }))
      : market === 'af'
        ? []
        : pkSteps

  if (market === 'af' && steps.length === 0) return null

  const stepLabel = copy.step || 'STEP'
  const ready = copy.ready_to_start || 'Ready to start?'
  const cta = heading.cta || copy.start_trial || 'Start Free Trial'
  const ctaTo = heading.ctaUrl ? mp(heading.ctaUrl.replace(/^\/(af(\/ps|\/en)?)?/, '') || '/get-started') : mp('/get-started')

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {heading.eyebrow}
            </p>
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

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = ICON_MAP[step.icon] || UserPlus
            return (
              <div
                key={step.number || idx}
                className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="absolute -top-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold tracking-widest text-primary-foreground">
                  {stepLabel} {step.number}
                </div>

                <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {(ready || cta) && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {ready ? <p className="text-muted-foreground">{ready}</p> : null}
            {cta ? (
              <Link to={ctaTo}>
                <MButton className="gap-2">
                  {cta}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </MButton>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

export default GettingStartedSection
