import { computed } from 'vue'
import { publicService } from '@/services/public.service'
import { useI18n } from '@/i18n'
import type { Faq, FaqTopic } from '@/types'
import { useRemote } from './useRemote'

export const FAQ_TOPICS: FaqTopic[] = [
  'airport',
  'guarantee',
  'license',
  'age',
  'payments',
  'mileage',
  'fuel',
  'coverage',
  'damage',
  'cancellation',
  'return',
  'driver',
]

/** Todas las FAQs una vez por visita; cada página filtra los temas que le sirven. */
export function useFaqs(topics: () => FaqTopic[] = () => []) {
  const remote = useRemote<Faq[]>('faqs', () => publicService.faqs(), [])

  const faqs = computed(() => {
    const wanted = topics()
    const list = [...remote.data.value].sort((a, b) => a.order - b.order)
    if (!wanted.length) return list
    return list
      .filter((f) => wanted.includes(f.topic))
      .sort((a, b) => wanted.indexOf(a.topic) - wanted.indexOf(b.topic))
  })

  return { ...remote, faqs }
}

/** JSON-LD FAQPage: Google lo usa para mostrar las preguntas en el resultado. */
export function faqSchema(faqs: Faq[]): Record<string, unknown> | undefined {
  const { tx } = useI18n()
  if (!faqs.length) return undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: tx(f.question),
      acceptedAnswer: { '@type': 'Answer', text: tx(f.answer) },
    })),
  }
}
