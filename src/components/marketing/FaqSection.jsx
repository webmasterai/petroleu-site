import { useQuery } from '@tanstack/react-query'
import {
  MAccordion,
  MAccordionItem,
  MAccordionTrigger,
  MAccordionContent,
} from './ui'
import { safeCmsGet } from '../../services/cmsPublic'
import { websiteContent } from '../../content/websiteContent'

const HOMEPAGE_FAQ_APPEND = websiteContent.faq.slice(-2)

export function FaqSection({ staticOnly = false } = {}) {
  const { data } = useQuery({
    queryKey: ['cms', 'faqs'],
    queryFn: () => safeCmsGet('/faq'),
    enabled: !staticOnly,
    staleTime: 60_000,
  })

  const baseFaqs = staticOnly
    ? websiteContent.faq
    : Array.isArray(data) && data.length
      ? data
      : websiteContent.faq
  const faqs = [...baseFaqs]
  if (!staticOnly) {
    for (const faq of HOMEPAGE_FAQ_APPEND) {
      if (!faqs.some((item) => item.question === faq.question)) {
        faqs.push(faq)
      }
    }
  }
  const brandName = websiteContent.brand.name

  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Best FAQ</p>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Common Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Everything you need to know about {brandName}
          </p>
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
