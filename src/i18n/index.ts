import { computed, ref } from 'vue'
import type { I18nText } from '@/types'
import common from './messages/common'
import home from './messages/home'
import routeA from './messages/routeA'
import booking from './messages/booking'
import content from './messages/content'

export type Locale = 'es' | 'en'
type Dict = { [key: string]: string | Dict }

const STORAGE_KEY = 'ponce_lang'

// Cada namespace exporta { es, en }. Se accede con t('home.hero.title').
const messages: Record<Locale, Dict> = {
  es: { common: common.es, home: home.es, routeA: routeA.es, booking: booking.es, content: content.es },
  en: { common: common.en, home: home.en, routeA: routeA.en, booking: booking.en, content: content.en },
}

function readStored(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'es' || v === 'en' ? v : null
  } catch {
    return null
  }
}

/**
 * Orden acordado con el cliente: 1) idioma elegido antes, 2) navigator.language,
 * 3) IP solo como señal secundaria (ver refineLocaleByCountry), 4) selector manual.
 * El idioma indica preferencia lingüística, no nacionalidad.
 */
function detect(): Locale {
  const stored = readStored()
  if (stored) return stored
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const l of langs) {
    const code = (l || '').slice(0, 2).toLowerCase()
    if (code === 'es') return 'es'
    if (code === 'en') return 'en'
  }
  return 'es'
}

const locale = ref<Locale>(detect())
document.documentElement.lang = locale.value

function lookup(dict: Dict, path: string): string | undefined {
  let node: string | Dict | undefined = dict
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

export function setLocale(next: Locale, persist = true) {
  locale.value = next
  document.documentElement.lang = next
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* modo privado */
    }
  }
}

/**
 * Señal secundaria: solo se usa si el visitante nunca eligió idioma y su
 * navegador no dice ni español ni inglés.
 */
export function refineLocaleByCountry(country: string) {
  if (readStored()) return
  const langs = (navigator.languages || [navigator.language]).map((l) => l.slice(0, 2))
  if (langs.includes('es') || langs.includes('en')) return
  const spanish = ['EC', 'CO', 'PE', 'MX', 'AR', 'CL', 'ES', 'VE', 'BO', 'UY', 'PY', 'CR', 'PA', 'GT', 'DO']
  setLocale(spanish.includes(country.toUpperCase()) ? 'es' : 'en', false)
}

/** Interpola {nombre} en el texto. */
function format(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`))
}

export function t(path: string, params?: Record<string, string | number>): string {
  const text = lookup(messages[locale.value], path) ?? lookup(messages.es, path) ?? path
  return format(text, params)
}

/** Texto bilingüe que llega del API. Cae al español si falta el inglés. */
export function tx(value?: I18nText | null): string {
  if (!value) return ''
  return value[locale.value] || value.es || value.en || ''
}

export function useI18n() {
  return {
    locale: computed(() => locale.value),
    isEnglish: computed(() => locale.value === 'en'),
    t,
    tx,
    setLocale,
  }
}
