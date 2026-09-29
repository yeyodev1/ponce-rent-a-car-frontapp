import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import type { FaqTopic } from '@/types'
import { IMAGES } from './images'

export type LandingKind = 'guayaquil' | 'suv' | 'trucks' | 'long-term'

interface LandingConfig {
  /** Prefijo i18n: content.landing.<i18nKey> */
  i18nKey: string
  image: string
  icon: string
  /** Categorías destacadas (slugs). Vacío = las primeras del catálogo. */
  featured: string[]
  benefits: { key: string; icon: string }[]
  faqTopics: FaqTopic[]
  helpQuery: Record<string, string>
  bookQuery: Record<string, string>
}

const CONFIG: Record<LandingKind, LandingConfig> = {
  guayaquil: {
    i18nKey: 'guayaquil',
    image: IMAGES.city,
    icon: 'fa-solid fa-city',
    featured: [],
    benefits: [
      { key: 'delivery', icon: 'fa-solid fa-plane-arrival' },
      { key: 'fast', icon: 'fa-solid fa-bolt' },
      { key: 'local', icon: 'fa-solid fa-location-dot' },
      { key: 'support', icon: 'fa-brands fa-whatsapp' },
    ],
    faqTopics: ['airport', 'license', 'guarantee', 'payments'],
    helpQuery: {},
    bookQuery: {},
  },
  suv: {
    i18nKey: 'suv',
    image: IMAGES.suv,
    icon: 'fa-solid fa-car-rear',
    featured: ['suv'],
    benefits: [
      { key: 'space', icon: 'fa-solid fa-suitcase-rolling' },
      { key: 'comfort', icon: 'fa-solid fa-couch' },
      { key: 'roads', icon: 'fa-solid fa-mountain-sun' },
      { key: 'family', icon: 'fa-solid fa-people-roof' },
    ],
    faqTopics: ['mileage', 'coverage', 'guarantee'],
    helpQuery: { categoria: 'suv' },
    bookQuery: { categoria: 'suv' },
  },
  trucks: {
    i18nKey: 'trucks',
    image: IMAGES.trucks,
    icon: 'fa-solid fa-truck-pickup',
    featured: ['camioneta'],
    benefits: [
      { key: 'load', icon: 'fa-solid fa-boxes-stacked' },
      { key: 'work', icon: 'fa-solid fa-helmet-safety' },
      { key: 'terrain', icon: 'fa-solid fa-road' },
      { key: 'business', icon: 'fa-solid fa-building' },
    ],
    faqTopics: ['mileage', 'damage', 'coverage'],
    helpQuery: { categoria: 'camioneta' },
    bookQuery: { categoria: 'camioneta' },
  },
  'long-term': {
    i18nKey: 'longTerm',
    image: IMAGES.longTerm,
    icon: 'fa-solid fa-calendar-days',
    featured: [],
    benefits: [
      { key: 'rate', icon: 'fa-solid fa-tags' },
      { key: 'maintenance', icon: 'fa-solid fa-screwdriver-wrench' },
      { key: 'flex', icon: 'fa-solid fa-arrows-rotate' },
      { key: 'advisor', icon: 'fa-solid fa-user-tie' },
    ],
    faqTopics: ['payments', 'mileage', 'guarantee', 'return'],
    helpQuery: { duracion: '30+' },
    bookQuery: {},
  },
}

/** Una vista para las cuatro landings SEO: todo lo que cambia vive en CONFIG. */
export function useLanding() {
  const route = useRoute()
  const { t } = useI18n()
  const kind = computed(() => ((route.meta.landing as LandingKind) || 'guayaquil') as LandingKind)
  const config = computed(() => CONFIG[kind.value] || CONFIG.guayaquil)
  const prefix = computed(() => `content.landing.${config.value.i18nKey}`)
  const tl = (key: string, params?: Record<string, string | number>) =>
    t(`${prefix.value}.${key}`, params)

  const benefits = computed(() =>
    config.value.benefits.map((b) => ({
      icon: b.icon,
      title: tl(`benefits.${b.key}.title`),
      text: tl(`benefits.${b.key}.text`),
    })),
  )

  return { kind, config, prefix, tl, benefits }
}
