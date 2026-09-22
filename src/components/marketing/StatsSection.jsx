import { useCmsList } from '../../hooks/useCmsList'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useSectionHeading } from '../../hooks/useSectionHeading'

/**
 * Home (and About) stats + trusted brands strip.
 * Source of truth: CMS home `stat`, `heading:logos`, and `logo` sections.
 * Empty / disabled CMS items are not restored from hardcoded defaults.
 */
export function StatsSection() {
  const { items: cmsStats, fromCms } = useCmsList(['stats'], '/stats', { fallback: [] })
  const logosHeading = useSectionHeading('logos', {})
  const { data: logosData, isSuccess: logosOk } = useCmsQuery(['trusted-logos'], '/logos')

  const stats = fromCms
    ? cmsStats.map((s) => ({
        id: s.id,
        value: s.value ?? s.title ?? s.stat_value ?? '',
        label: s.label ?? s.description ?? s.stat_label ?? '',
      }))
    : []

  const logoRows = logosOk && Array.isArray(logosData) ? logosData : []
  const primaryLogo = logoRows[0] || (logosData && !Array.isArray(logosData) ? logosData : null)
  const trustedLogosImage =
    primaryLogo?.image_url ||
    primaryLogo?.imageUrl ||
    primaryLogo?.dashboard_image_url ||
    null
  const trustedLogosAlt =
    primaryLogo?.image_alt ||
    logosHeading.imageAlt ||
    logosHeading.title ||
    'Trusted brands'

  const trustedHeading = logosHeading.title || ''

  if (stats.length === 0 && !trustedLogosImage) return null

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.id || `${stat.label}-${i}`} className="text-center">
                <p className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {trustedLogosImage ? (
          <div className={stats.length ? 'mt-12' : ''}>
            {trustedHeading ? (
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {trustedHeading}
              </p>
            ) : null}
            <div className={`flex items-center justify-center px-4 sm:px-0 ${trustedHeading ? 'mt-6' : ''}`}>
              <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
                <img
                  src={trustedLogosImage}
                  alt={trustedLogosAlt}
                  className="h-auto w-full object-contain opacity-80"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default StatsSection
