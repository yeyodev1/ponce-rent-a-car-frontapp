import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { publicService } from '@/services/public.service'
import { getAttribution, track } from '@/composables/useAnalytics'
import { useToastStore } from '@/stores/toast'
import { t, useI18n } from '@/i18n'
import type { ApiError } from '@/types'
import {
  booking,
  clearReservation,
  currentSignature,
  driverPhone,
  localDays,
  needsAddress,
  quoteInput,
} from './useBookingState'
import { quote, quoteLoading, quoteOk, refreshQuote } from './useQuote'
import { cleanLicense, driverValid, submitted, touched } from './useDriverForm'
import { useBookingSteps } from './useBookingSteps'

/**
 * Qué hace "Continuar" en cada paso y cuándo está habilitado. Los pasos solo
 * pintan; la lógica de avanzar (y de crear la reserva) está acá.
 */

const LEAD_KEYS = ['ponce_lead_id', 'ponce_route_a']

/** El lead de la Ruta A es opcional: si existe, la reserva queda enlazada a él. */
function readLeadId(): string | null {
  try {
    for (const k of LEAD_KEYS) {
      const raw = sessionStorage.getItem(k) || localStorage.getItem(k)
      if (!raw) continue
      if (/^[a-f0-9]{24}$/i.test(raw)) return raw
      const parsed = JSON.parse(raw)
      // La Ruta A guarda { answers, lead: { _id, code } }.
      const id = parsed?.leadId || parsed?.lead?._id
      if (id) return String(id)
    }
  } catch {
    /* sin lead */
  }
  return null
}

export const creating = ref(false)
export const noUnits = ref(false)

export function useBookingFlow() {
  const router = useRouter()
  const toast = useToastStore()
  const { locale } = useI18n()
  const steps = useBookingSteps()

  const priceSettled = computed(() => quoteOk.value && !quoteLoading.value)

  const canContinue = computed(() => {
    switch (steps.key.value) {
      case 'category':
        return Boolean(booking.categorySlug)
      case 'dates':
        return Boolean(quoteInput.value) && localDays.value > 0 && priceSettled.value
      case 'mileage':
      case 'coverage':
      case 'extras':
        return priceSettled.value
      case 'driver':
        return !creating.value
      case 'documents':
        return booking.documents.license && booking.documents.identity
      case 'review':
        return Boolean(booking.reservation)
      default:
        return false
    }
  })

  const continueLabel = computed(() => {
    if (steps.key.value === 'driver') return t('booking.driver.submit')
    if (steps.key.value === 'review') return t('booking.review.submit')
    return t('common.actions.continue')
  })

  async function createReservation() {
    submitted.value = true
    if (!driverValid.value) {
      toast.error(t('booking.driver.fixErrors'))
      return
    }
    const input = quoteInput.value
    if (!input || (!quoteOk.value && !quoteLoading.value)) return steps.go(2)
    const signature = currentSignature()
    if (booking.reservation && booking.reservation.signature === signature) return steps.go(7)

    creating.value = true
    noUnits.value = false
    try {
      const d = booking.driver
      const out = await publicService.createReservation({
        ...input,
        ...(needsAddress.value && booking.pickupAddress ? { pickupAddress: booking.pickupAddress.trim() } : {}),
        driver: {
          name: d.name.trim(),
          documentType: d.documentType,
          documentNumber: d.documentNumber.trim(),
          email: d.email.trim().toLowerCase(),
          phone: driverPhone(),
          country: d.country,
          licenseNumber: cleanLicense(d.licenseNumber),
          licenseExpiresAt: d.licenseExpiresAt,
          licenseCountry: d.licenseCountry || d.country,
        },
        language: locale.value,
        leadId: readLeadId(),
        attribution: getAttribution(),
      })
      clearReservation()
      booking.reservation = {
        code: out.code,
        token: out.accessToken,
        status: out.status,
        holdExpiresAt: out.holdExpiresAt,
        pricing: out.pricing,
        signature,
      }
      track('reservation_created', { value: out.pricing.total / 100, currency: 'USD', reservation: out.code })
      // La API devuelve la existente si ya había una igual: puede que ya tenga documentos.
      if (out.status === 'pending_payment') {
        booking.documents = { license: true, identity: true }
        return steps.go(8)
      }
      return steps.go(7)
    } catch (e) {
      const err = e as ApiError
      if (err.status === 409) {
        noUnits.value = true
        return
      }
      // La licencia no cubre la devolución: se corrige en este mismo paso, no en las fechas.
      if ((err.data as { errorCode?: string } | undefined)?.errorCode === 'license_expired') {
        touched.licenseExpiresAt = true
        toast.error(err.message)
        return
      }
      toast.error(err.message || t('common.errors.generic'))
      // 400 = las fechas dejaron de ser válidas (p. ej. pasó la hora): se vuelve a elegirlas.
      if (err.status === 400) {
        refreshQuote()
        steps.go(2)
      }
    } finally {
      creating.value = false
    }
  }

  async function onContinue() {
    if (!canContinue.value) return
    switch (steps.key.value) {
      case 'driver':
        return createReservation()
      case 'review':
        track('verification_submit', { reservation: booking.reservation?.code })
        return steps.go(9)
      default:
        return steps.go(steps.step.value + 1)
    }
  }

  /** Tras recargar en documentos/pago se trae el estado real de la reserva. */
  async function syncReservation() {
    const res = booking.reservation
    if (!res) return
    try {
      const pub = await publicService.reservation(res.code, res.token)
      res.status = pub.status
      res.holdExpiresAt = pub.holdExpiresAt
      res.pricing = pub.pricing
      booking.documents = { ...pub.documents }
      if (['confirmed', 'delivered', 'completed'].includes(pub.status)) {
        router.replace({ path: `/reserva/${res.code}`, query: { t: res.token } })
      }
    } catch (e) {
      if ([403, 404].includes((e as ApiError).status)) clearReservation()
    }
  }

  /** Apartado vencido o sin unidades: se vuelve a intentar con los mismos datos. */
  function restart(toStep = 6) {
    clearReservation()
    noUnits.value = false
    steps.go(toStep)
  }

  return { ...steps, canContinue, continueLabel, onContinue, syncReservation, restart, quote }
}
