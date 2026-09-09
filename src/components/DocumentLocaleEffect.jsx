import { useEffect } from 'react'
import { useMarketLocale } from '../context/MarketLocaleContext'

/** Applies lang/dir and Naskh font class for Dari/Pashto foundations. */
export function DocumentLocaleEffect() {
  const { locale, dir, isAfghanistan } = useMarketLocale()

  useEffect(() => {
    const html = document.documentElement
    html.lang = locale
    html.dir = dir
    html.classList.toggle('font-naskh', dir === 'rtl')
    html.classList.toggle('market-af', isAfghanistan)
    return () => {
      html.classList.remove('font-naskh', 'market-af')
    }
  }, [locale, dir, isAfghanistan])

  return null
}
