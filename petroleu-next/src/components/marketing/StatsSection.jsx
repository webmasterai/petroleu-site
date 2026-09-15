import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'

export function StatsSection() {
  const { market, isAfghanistan } = useMarketLocale()
  const { data } = useCmsQuery(['stats'], '/stats')

  const stats = Array.isArray(data) && data.length
    ? data.map((s) => ({
        value: s.value ?? s.title,
        label: s.label ?? s.description,
      }))
    : market === 'af'
      ? []
      : websiteContent.stats

  const { data: logosData } = useCmsQuery(['trusted-logos'], '/logos')

  const trustedLogosImage = isAfghanistan
    ? logosData?.image_url ||
      logosData?.imageUrl ||
      (Array.isArray(logosData) && logosData[0]?.image_url) ||
      null
    : logosData?.image_url ||
      logosData?.imageUrl ||
      (Array.isArray(logosData) && logosData[0]?.image_url) ||
      websiteContent.trustedLogosImage

  if (isAfghanistan && stats.length === 0 && !trustedLogosImage) return null

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={`${stat.label}-${i}`} className="text-center">
                <p className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {trustedLogosImage ? (
          <div className={stats.length ? 'mt-12' : ''}>
            {!isAfghanistan ? (
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trusted by Pakistan&apos;s leading fuel networks
              </p>
            ) : null}
            <div className="mt-6 flex justify-center items-center px-4 sm:px-0">
              <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
                <img
                  src={trustedLogosImage}
                  alt="Petroleu"
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
