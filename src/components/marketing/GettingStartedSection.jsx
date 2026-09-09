import { useQuery } from '@tanstack/react-query'
import {
  UserPlus,
  Settings,
  Rocket,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MButton } from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

const ICON_MAP = {
  UserPlus,
  Settings,
  Rocket,
}

export function GettingStartedSection() {
  const { data } = useQuery({
    queryKey: ['cms', 'how-it-works'],
    queryFn: () => safeCmsGet('/how-it-works'),
    staleTime: 60_000,
  })

  const steps =
    Array.isArray(data) && data.length
      ? data.map((s, i) => ({
          number: s.number || String(i + 1).padStart(2, '0'),
          icon: s.icon || websiteContent.gettingStarted[i]?.icon,
          title: s.title,
          description: s.description,
        }))
      : websiteContent.gettingStarted

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Best Getting Started
          </p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Up & Running in Under 30 Minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Three simple steps to digitize your fuel station — no IT team required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = ICON_MAP[step.icon] || UserPlus
            return (
              <div
                key={step.number || idx}
                className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold tracking-widest text-primary-foreground">
                  STEP {step.number}
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

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <p className="text-muted-foreground">Ready to start?</p>
          <Link to="/get-started">
            <MButton className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </MButton>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default GettingStartedSection
