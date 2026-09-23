import { useCmsList } from '../../hooks/useCmsList'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useSectionHeading } from '../../hooks/useSectionHeading'

/**
 * Home (and About) stats + trusted brands strip.
 * Source of truth: CMS home `stat`, `heading:logos`, and `logo` sections.
 * Never initialize from hardcoded marketing defaults — wait for CMS, then render.
 * Tolerates older production shapes (brand-name logos without image_url, partial fields).
 */
export function StatsSection() {
  const {
    items: cmsStats,
    fromCms,
    isPending: statsPending,
    isFetched: statsFetched,
  } = useCmsList(['stats'], '/stats', {
    fallback: [],
    config: { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } },
  })
  const logosHeading = useSectionHeading('logos', {})
  const {
    data: logosData,
    isSuccess: logosOk,
    isPending: logosPending,
    isFetched: logosFetched,
  } = useCmsQuery(['trusted-logos'], '/logos', {
    config: { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } },
  })

  // Do not paint partial/stale marketing chrome while CMS is still loading
  if (statsPending || logosPending || !logosHeading.loaded || !statsFetched || !logosFetched) {
    return null
  }

  const stats = fromCms && Array.isArray(cmsStats)
    ? cmsStats.map((s) => ({
        id: s?.id,
        value: s?.value ?? s?.title ?? s?.stat_value ?? '',
        label: s?.label ?? s?.description ?? s?.stat_label ?? '',
      }))
    : []

  const logoRows = logosOk && Array.isArray(logosData) ? logosData : []
  // Prefer a row that actually has an image (prod may return brand chips with null image_url)
  const primaryLogo =
    logoRows.find((r) => r && (r.image_url || r.imageUrl || r.dashboard_image_url)) ||
    logoRows[0] ||
    (logosData && !Array.isArray(logosData) ? logosData : null)
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

  // Canonical CMS set is 4 stats: 2 cols mobile, 4 evenly spaced on desktop
  const gridClass =
    stats.length >= 7
      ? 'grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-7'
      : stats.length >= 5
        ? 'grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5'
        : 'grid grid-cols-2 gap-8 sm:grid-cols-4'

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {stats.length > 0 ? (
          <div className={gridClass}>
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
                  loading="eager"
                  decoding="async"
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
