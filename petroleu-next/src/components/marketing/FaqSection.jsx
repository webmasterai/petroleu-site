import {
  MAccordion,
  MAccordionItem,
  MAccordionTrigger,
  MAccordionContent,
} from './ui'
import { websiteContent } from '../../content/websiteContent'
import { useMarketLocale } from '../../context/MarketLocaleContext'
import { useSectionHeading } from '../../hooks/useSectionHeading'
import { useCmsList } from '../../hooks/useCmsList'

export function FaqSection({ staticOnly = false } = {}) {
  const { market } = useMarketLocale()
  const { items, fromCms, isError } = useCmsList(['faqs'], '/faq', {
    enabled: !staticOnly,
    fallback: market === 'pk' ? websiteContent.faq : [],
  })
  const heading = useSectionHeading('faq', {
    eyebrow: 'Best FAQ',
    title: 'Common Questions',
    subtitle: `Everything you need to know about ${websiteContent.brand.name}`,
  })

  const faqs = staticOnly
    ? websiteContent.faq
    : fromCms
      ? items.map((f) => ({
          id: f.id,
          question: f.question ?? f.title,
          answer: f.answer ?? f.description ?? f.content,
        }))
      : isError
        ? items
        : []

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {heading.eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{heading.eyebrow}</p>
          ) : null}
          {heading.title ? (
            <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              {heading.title}
            </h2>
          ) : null}
          {heading.subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {heading.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card px-6">
          <MAccordion>
            {faqs.map((faq, i) => (
              <MAccordionItem key={faq.id || faq.question || i} value={`item-${i}`}>
                <MAccordionTrigger>{faq.question}</MAccordionTrigger>
                <MAccordionContent>{faq.answer}</MAccordionContent>
              </MAccordionItem>
            ))}
          </MAccordion>
        </div>
      </div>
    </section>
  )
}

export default FaqSection
