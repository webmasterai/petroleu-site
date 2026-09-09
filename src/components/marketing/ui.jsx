import { forwardRef, useState, createContext, useContext } from 'react'
import { ChevronDown } from 'lucide-react'

export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

/** WhatsApp brand green — use variant="whatsapp" on MButton (not className override) */
export const WHATSAPP_BUTTON_CLASS = 'bg-[#25D366] text-white hover:bg-[#1ebe5d]'

/* ─── Label ─────────────────────────────────────────────────────────────── */
export const MLabel = ({ className = '', children, ...props }) => (
  <label className={cn('text-sm font-medium text-foreground', className)} {...props}>
    {children}
  </label>
)

/* ─── Input ─────────────────────────────────────────────────────────────── */
export const MInput = forwardRef(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm',
      'text-foreground placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
MInput.displayName = 'MInput'

/* ─── Textarea ──────────────────────────────────────────────────────────── */
export const MTextarea = forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm',
      'text-foreground placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
MTextarea.displayName = 'MTextarea'

/* ─── Button (variants: default | outline | secondary | ghost | destructive) */
export function MButton({
  className = '',
  variant = 'default',
  size = 'md',
  type = 'button',
  children,
  ...props
}) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#1ebe5d]',
    outline: 'border border-border bg-card text-foreground hover:bg-muted',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'bg-transparent text-foreground hover:bg-muted',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
    link: 'bg-transparent text-primary underline-offset-4 hover:underline',
  }
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-10 w-10',
  }
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Badge (variants: default | secondary | outline | destructive) ─────── */
export function MBadge({ className = '', variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-muted text-muted-foreground',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive text-white',
    accent: 'bg-accent text-accent-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* ─── Card primitives ───────────────────────────────────────────────────── */
export function MCard({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function MCardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function MCardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function MCardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}

export function MCardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

export function MCardFooter({ className = '', children, ...props }) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

/* ─── Accordion (single-expand) ─────────────────────────────────────────── */
const AccordionContext = createContext({ openValue: null, setOpenValue: () => {} })

export function MAccordion({ defaultValue = null, className = '', children }) {
  const [openValue, setOpenValue] = useState(defaultValue)
  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div className={cn('divide-y divide-border', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItemContext = createContext(null)

export function MAccordionItem({ value, className = '', children }) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn('py-2', className)}>{children}</div>
    </AccordionItemContext.Provider>
  )
}

export function MAccordionTrigger({ className = '', children }) {
  const value = useContext(AccordionItemContext)
  const { openValue, setOpenValue } = useContext(AccordionContext)
  const isOpen = openValue === value
  return (
    <button
      type="button"
      onClick={() => setOpenValue(isOpen ? null : value)}
      className={cn(
        'flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-foreground transition-colors hover:text-primary',
        className
      )}
      aria-expanded={isOpen}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}

export function MAccordionContent({ className = '', children }) {
  const value = useContext(AccordionItemContext)
  const { openValue } = useContext(AccordionContext)
  if (openValue !== value) return null
  return (
    <div className={cn('pb-4 pt-0 text-sm text-muted-foreground leading-relaxed', className)}>
      {children}
    </div>
  )
}
