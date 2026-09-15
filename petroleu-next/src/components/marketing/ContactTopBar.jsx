import { Phone, Mail } from 'lucide-react'
import { websiteContent } from '../../content/websiteContent'
import { useCmsQuery } from '../../hooks/useCmsQuery'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useUiCopy } from '../../hooks/useUiCopy'

const linkClass =
  'inline-flex items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-primary-foreground whitespace-nowrap'

export function ContactTopBar() {
  const { market } = useMarketLocale()
  const { copy } = useUiCopy()
  const { data: settings } = useCmsQuery(['settings', 'topbar'], '/settings')
  const { data: announcements } = useCmsQuery(['nav', 'announcement'], '/navigation', {
    config: { params: { location: 'announcement' } },
  })

  const brand = websiteContent.brand
  // AF must not inherit PK contact details
  const phone =
    settings?.phone || (market === 'af' ? null : brand.phone)
  let phoneTel = null
  if (settings?.phone_tel) phoneTel = settings.phone_tel
  else if (settings?.whatsapp) phoneTel = `+${String(settings.whatsapp).replace(/^\+/, '')}`
  else if (market !== 'af') phoneTel = brand.phoneTel
  const email =
    settings?.sales_email || settings?.contact_email || (market === 'af' ? null : brand.salesEmail)
  const announcement =
    (Array.isArray(announcements) && announcements[0]?.label) ||
    settings?.announcement_text ||
    (market === 'af' ? null : 'Petroleu — Modern Petrol Pump Software')

  const phoneLabel = copy.phone_label
  const emailLabel = copy.email_label

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-4 sm:h-9">
        {announcement ? (
          <p className="hidden truncate text-[11px] font-medium text-primary-foreground/90 md:block sm:text-xs">
            {announcement}
          </p>
        ) : (
          <span className="hidden md:block" />
        )}

        <div className="flex w-full items-center justify-end gap-3 sm:gap-5 md:w-auto">
          {phone && phoneTel && phoneLabel ? (
            <a href={`tel:${phoneTel}`} className={linkClass} dir="ltr">
              <Phone className="h-3 w-3 shrink-0 text-primary-foreground" aria-hidden />
              <span className="text-[11px] sm:text-xs">
                {phoneLabel}: <span className="font-medium">{phone}</span>
              </span>
            </a>
          ) : null}

          {email && emailLabel ? (
            <a href={`mailto:${email}`} className={`${linkClass} hidden md:inline-flex`} dir="ltr">
              <Mail className="h-3 w-3 shrink-0 text-primary-foreground" aria-hidden />
              <span className="text-[11px] sm:text-xs">
                {emailLabel}: <span className="font-medium">{email}</span>
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
