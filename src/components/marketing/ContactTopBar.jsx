import { Phone, Mail } from 'lucide-react'
import { websiteContent } from '../../content/websiteContent'

const { phone, phoneTel, salesEmail } = websiteContent.brand

const linkClass =
  'inline-flex items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-primary-foreground whitespace-nowrap'

export function ContactTopBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-4 sm:h-9">
        <p className="hidden truncate text-[11px] font-medium text-primary-foreground/90 md:block sm:text-xs">
          Petroleu — Modern Petrol Pump Software
        </p>

        <div className="flex w-full items-center justify-end gap-3 sm:gap-5 md:w-auto">
          <a href={`tel:${phoneTel}`} className={linkClass}>
            <Phone className="h-3 w-3 shrink-0 text-primary-foreground" aria-hidden />
            <span className="text-[11px] sm:text-xs">
              Phone: <span className="font-medium">{phone}</span>
            </span>
          </a>

          <a href={`mailto:${salesEmail}`} className={`${linkClass} hidden md:inline-flex`}>
            <Mail className="h-3 w-3 shrink-0 text-primary-foreground" aria-hidden />
            <span className="text-[11px] sm:text-xs">
              Email: <span className="font-medium">{salesEmail}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
