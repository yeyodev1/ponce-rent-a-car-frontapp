import { computed, effectScope, ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import { t } from '@/i18n'
import type { Quote } from '@/types'
import { quoteInput } from './useBookingState'

/**
 * Cotización en vivo. El total definitivo SIEMPRE lo calcula el backend: el
 * front solo pide, espera 250 ms a que el cliente deje de tocar y descarta
 * respuestas que llegan tarde (la última opción elegida es la que manda).
 */

/** El backend puede mandar códigos además del mensaje en español. */
export type QuoteWithCodes = Quote & { errorCodes?: string[] }

const KNOWN_CODES = ['too_far', 'too_soon', 'return_before_pickup', 'unavailable']

export const quote = ref<QuoteWithCodes | null>(null)
export const quoteLoading = ref(false)
export const quoteFailed = ref(false)

let seq = 0
let timer: ReturnType<typeof setTimeout> | undefined
let lastKey = ''

async function run(force = false) {
  const input = quoteInput.value
  if (!input) {
    quote.value = null
    quoteLoading.value = false
    lastKey = ''
    return
  }
  const key = JSON.stringify(input)
  if (key === lastKey && !force && quote.value) return
  lastKey = key
  const mine = ++seq
  quoteLoading.value = true
  try {
    const result = (await publicService.quote(input)) as QuoteWithCodes
    if (mine !== seq) return
    quote.value = result
    quoteFailed.value = false
  } catch {
    if (mine !== seq) return
    quoteFailed.value = true
    lastKey = ''
  } finally {
    if (mine === seq) quoteLoading.value = false
  }
}

export function refreshQuote() {
  clearTimeout(timer)
  run(true)
}

let started = false

/** Un único observador para toda la app, aunque varios componentes lo pidan. */
export function startQuoteWatcher() {
  if (started) return
  started = true
  effectScope(true).run(() => {
    watch(
      quoteInput,
      () => {
        clearTimeout(timer)
        if (quoteInput.value) quoteLoading.value = true
        timer = setTimeout(() => run(), 250)
      },
      { immediate: true, deep: true },
    )
  })
}

/** Códigos de error de la cotización, traducidos. Si no hay códigos, el mensaje del backend. */
export const quoteErrors = computed(() => {
  const q = quote.value
  if (!q) return [] as { code: string; text: string }[]
  const codes = (q.errorCodes || []).filter((c) => KNOWN_CODES.includes(c))
  if (codes.length) return codes.map((code) => ({ code, text: t(`booking.errors.${code}`) }))
  if (!q.errors?.length && !q.available) return [{ code: 'unavailable', text: t('booking.errors.unavailable') }]
  return (q.errors || []).map((text) => ({ code: guessCode(text), text }))
})

// Mientras el backend no mande códigos, se deduce del mensaje para ofrecer la salida correcta.
function guessCode(text: string): string {
  const s = text.toLowerCase()
  if (s.includes('máximo') || s.includes('supera')) return 'too_far'
  if (s.includes('anticipación') || s.includes('horas')) return 'too_soon'
  if (s.includes('devolución')) return 'return_before_pickup'
  if (s.includes('disponib') || s.includes('unidad')) return 'unavailable'
  return 'other'
}

export const quoteOk = computed(() => Boolean(quote.value && quote.value.available && !quoteErrors.value.length))
