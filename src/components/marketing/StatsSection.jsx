import { useQuery } from '@tanstack/react-query'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

export function StatsSection() {
  const { data } = useQuery({
    queryKey: ['cms', 'stats'],
    queryFn: () => safeCmsGet('/stats'),
    staleTime: 60_000,
  })

  const stats = Array.isArray(data) && data.length ? data : websiteContent.stats

  const { data: logosData } = useQuery({
    queryKey: ['cms', 'trusted-logos'],
    queryFn: () => safeCmsGet('/logos'),
    staleTime: 60_000,
  })

  const trustedLogosImage =
    logosData?.image_url ||
    logosData?.imageUrl ||
    (Array.isArray(logosData) && logosData[0]?.image_url) ||
    websiteContent.trustedLogosImage

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={`${stat.label}-${i}`} className="text-center">
              <p className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {trustedLogosImage && (
          <div className="mt-12">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Trusted by Pakistan's leading fuel networks
            </p>
            <div className="mt-6 flex justify-center items-center px-4 sm:px-0">
              <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
                <img
                  src={trustedLogosImage}
                  alt="Trusted oil and gas brands"
                  className="h-auto w-full object-contain opacity-80"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default StatsSection
