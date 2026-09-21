import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useMarketLocale } from '../../context/MarketLocaleContext'

const OPTIONS = [
  {
    group: 'Pakistan',
    items: [{ id: 'pk-en', label: 'English', market: 'pk', locale: 'en-PK', prefix: '' }],
  },
  {
    group: 'Afghanistan',
    items: [
      { id: 'af-en', label: 'English', market: 'af', locale: 'en-AF', prefix: '/af/en' },
      { id: 'af-fa', label: 'دری', market: 'af', locale: 'fa-AF', prefix: '/af', dir: 'rtl' },
      { id: 'af-ps', label: 'پښتو', market: 'af', locale: 'ps-AF', prefix: '/af/ps', dir: 'rtl' },
    ],
  },
]

function stripMarketPrefix(pathname) {
  const path = pathname || '/'
  if (path === '/af' || path.startsWith('/af/')) {
    const stripped = path
      .replace(/^\/af\/ps/, '')
      .replace(/^\/af\/en/, '')
      .replace(/^\/af/, '')
    return stripped || ''
  }
  return path === '/' ? '' : path
}

function pathForOption(option, pathname) {
  const rest = stripMarketPrefix(pathname)
  if (!option.prefix) return rest || '/'
  return `${option.prefix}${rest}`
}

function currentOption(locale) {
  for (const group of OPTIONS) {
    for (const item of group.items) {
      if (item.locale === locale) return item
    }
  }
  return OPTIONS[0].items[0]
}

function optionButtonLabel(option) {
  const region = option.market === 'pk' ? 'Pakistan' : 'Afghanistan'
  return `${region} — ${option.label}`
}

/**
 * Footer language & region dropdown. Keeps equivalent path when switching.
 * Opens upward so it is not clipped by footer overflow.
 */
export function FooterLanguageSwitcher() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { locale } = useMarketLocale()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const selected = currentOption(locale)

  useEffect(() => {
    if (!open) return undefined
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(option) {
    setOpen(false)
    if (option.locale === locale) return
    navigate(pathForOption(option, pathname))
  }

  return (
    <div className="relative" ref={rootRef}>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Language &amp; Region</p>
      <button
        type="button"
        className="inline-flex min-w-[220px] max-w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted/60"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate" dir="auto">
          {optionButtonLabel(selected)}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute bottom-full start-0 z-50 mb-2 max-h-72 w-[min(100vw-2rem,280px)] overflow-auto rounded-md border border-border bg-card py-1 text-sm shadow-lg"
        >
          {OPTIONS.map((group) => (
            <div key={group.group} className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </div>
              {group.items.map((item) => {
                const active = item.locale === locale
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    dir={item.dir || 'ltr'}
                    className={[
                      'flex w-full items-center px-3 py-2 text-start transition-colors',
                      active ? 'bg-primary/10 font-medium text-primary' : 'text-foreground hover:bg-muted',
                    ].join(' ')}
                    onClick={() => choose(item)}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default FooterLanguageSwitcher
