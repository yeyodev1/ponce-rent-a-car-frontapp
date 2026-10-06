import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { booking, effectiveReturnLocation, localDays } from './useBookingState'
import { contractRequired } from './useContract'

/**
 * El paso vive en la URL (?paso=3): así el botón "atrás" del teléfono vuelve
 * al paso anterior en vez de sacar al cliente de la reserva.
 */

export const STEP_KEYS = [
  'category',
  'dates',
  'mileage',
  'coverage',
  'extras',
  'driver',
  'documents',
  'review',
  'contract',
  'payment',
] as const
export type StepKey = (typeof STEP_KEYS)[number]
export const TOTAL_STEPS = STEP_KEYS.length

export const direction = ref<'next' | 'prev'>('next')

/** Paso más lejano al que se puede entrar con lo que ya hay: evita saltos por URL. */
export const maxReachable = computed(() => {
  if (!booking.categorySlug) return 1
  const datesOk =
    booking.pickupDate &&
    booking.pickupTime &&
    booking.returnDate &&
    booking.returnTime &&
    booking.pickupLocation &&
    effectiveReturnLocation.value &&
    localDays.value > 0
  if (!datesOk) return 2
  if (!booking.coverage) return 4
  if (!booking.reservation) return 6
  if (!booking.documents.license || !booking.documents.identity) return 7
  // Con el contrato obligatorio, el pago solo se abre tras aceptarlo.
  if (contractRequired.value && !booking.contractSigned) return 9
  return 10
})

export function useBookingSteps() {
  const route = useRoute()
  const router = useRouter()

  const step = computed(() => {
    const n = Number(route.query.paso)
    return Number.isInteger(n) && n >= 1 && n <= TOTAL_STEPS ? n : 1
  })
  const key = computed<StepKey>(() => STEP_KEYS[step.value - 1] ?? 'category')

  watch(step, (now, before) => {
    direction.value = now >= before ? 'next' : 'prev'
  })

  function go(n: number, replace = false) {
    const target = Math.min(Math.max(1, n), TOTAL_STEPS)
    direction.value = target >= step.value ? 'next' : 'prev'
    const location = { path: '/reservar', query: { ...route.query, paso: String(target) } }
    return replace ? router.replace(location) : router.push(location)
  }

  function back() {
    // Si el paso anterior está en el historial, se usa: el "atrás" del sistema queda coherente.
    const prev = (window.history.state?.back as string | undefined) || ''
    if (step.value > 1 && prev.startsWith('/reservar')) return router.back()
    if (step.value > 1) return go(step.value - 1, true)
    return prev ? router.back() : router.push('/')
  }

  /** Si la URL pide un paso al que aún no se llega, se corrige sin dejar rastro en el historial. */
  function clamp() {
    if (step.value > maxReachable.value) go(maxReachable.value, true)
  }

  return { step, key, go, back, clamp }
}
