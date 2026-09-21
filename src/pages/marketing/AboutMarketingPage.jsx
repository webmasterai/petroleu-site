import {
  Target,
  Users,
  Award,
  CheckCircle2,
  Heart,
  Lightbulb,
  Star,
  Compass,
} from 'lucide-react'
import { SiteHeader } from '../../components/marketing/SiteHeader'
import { SiteFooter } from '../../components/marketing/SiteFooter'
import { MarketingSeo } from '../../components/marketing/MarketingSeo'
import { MarketingPageJsonLd } from '../../components/marketing/MarketingJsonLd'
import { StatsSection } from '../../components/marketing/StatsSection'
import { CtaSection } from '../../components/marketing/CtaSection'
import { MBadge } from '../../components/marketing/ui'
import { CmsFlexibleSections } from '../../components/marketing/CmsContentBlocks'
import { withBestPrefix } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'

const iconMap = {
  Target,
  Users,
  Award,
  Heart,
  Lightbulb,
  Star,
  Compass,
}

export default function AboutMarketingPage() {
  const { data: heroData } = useCmsQuery(['hero', 'about'], '/hero/about')
  const { data: statsRaw } = useCmsQuery(['stats'], '/stats')
  const { data: missionRaw } = useCmsQuery(['mission'], '/mission-values')
  const { data: storyPayload } = useCmsQuery(['company-story'], '/company-story')
  const { data: teamRaw } = useCmsQuery(['team'], '/team')
  const { data: ctaData } = useCmsQuery(['cta', 'about'], '/cta/about')

  const statsData = Array.isArray(statsRaw) ? statsRaw : []
  const missionData = Array.isArray(missionRaw) ? missionRaw : []
  const story = storyPayload || {}
  const storyData = Array.isArray(story.story) ? story.story : []
  const achievementsData = Array.isArray(story.achievements) ? story.achievements : []
  const teamData = Array.isArray(teamRaw) ? teamRaw : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingSeo path="/about" />
      <MarketingPageJsonLd path="/about" />
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            {heroData?.badge && (
              <MBadge variant="secondary" className="mb-4">
                {withBestPrefix(heroData.badge)}
              </MBadge>
            )}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {heroData?.heading || 'About Us'}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heroData?.subheading ||
                'Building modern operating systems for fuel stations across the region.'}
            </p>
          </div>
        </section>

        {statsData.length > 0 && (
          <StatsSection
            items={statsData.map((s) => ({
              id: s.id,
              value: s.value || s.stat_value,
              label: s.label || s.stat_label,
            }))}
          />
        )}

        {missionData.length > 0 && (
          <section className="bg-background py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Mission & Values</p>
                <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
                  What drives us
                </h2>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {missionData.map((m) => {
                  const Icon = iconMap[m.icon] || Target
                  return (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {storyData.length > 0 && (
          <section className="bg-muted/30 py-20">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Our Story
              </h2>
              <div className="mt-10 space-y-6">
                {storyData.map((block) => (
                  <p
                    key={block.id}
                    className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted-foreground"
                  >
                    {block.paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {achievementsData.length > 0 && (
          <section className="bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Achievements
              </h2>
              <ul className="mt-10 grid gap-4 md:grid-cols-2">
                {achievementsData.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {teamData.length > 0 && (
          <section className="bg-muted/30 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-balance text-3xl font-bold text-foreground sm:text-4xl">
                Meet the Team
              </h2>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {teamData.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-border bg-card p-6 text-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                        {(member.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">{member.role}</p>
                    {member.bio && <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <CmsFlexibleSections pageSlug="about" />

        <CtaSection
          heading={ctaData?.heading}
          subheading={ctaData?.subheading}
          primaryButton={ctaData?.btn1_text || 'Contact Us'}
          primaryHref={ctaData?.btn1_link || '/contact'}
          secondaryButton={ctaData?.btn2_text}
          secondaryHref={ctaData?.btn2_link || '/contact'}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
