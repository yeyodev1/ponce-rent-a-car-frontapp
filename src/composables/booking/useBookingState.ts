import { computed, reactive, watch } from 'vue'
import { toGuayaquilIso } from '@/utils/format'
import type {
  LocationCode,
  MileageOption,
  PublicReservation,
  QuoteInput,
  ReservationPricing,
  ReservationStatus,
} from '@/types'

/**
 * Estado de la Ruta B. Vive a nivel de módulo (compartido por todos los pasos)
 * y se copia a sessionStorage: si el teléfono recarga la pestaña en medio de
 * la reserva, el cliente sigue donde iba y no vuelve a escribir nada.
 */

const KEY = 'ponce_booking_v1'

export interface DriverDraft {
  name: string
  documentType: 'cedula' | 'passport'
  documentNumber: string
  email: string
  phonePrefix: string
  phone: string
  country: string
  /** Licencia: vigente hasta la devolución. El país de emisión arranca igual al de residencia. */
  licenseNumber: string
  licenseExpiresAt: string
  licenseCountry: string
}

export interface BookingReservation {
  code: string
  token: string
  status: ReservationStatus
  holdExpiresAt: string | null
  pricing: ReservationPricing
  /** Opciones con las que se creó: si cambian, hay que crear otra. */
  signature: string
}

export interface BookingState {
  categorySlug: string
  pickupDate: string
  pickupTime: string
  returnDate: string
  returnTime: string
  pickupLocation: LocationCode | ''
  sameReturn: boolean
  returnLocation: LocationCode | ''
  pickupAddress: string
  mileage: MileageOption
  coverage: string
  extras: Record<string, number>
  driver: DriverDraft
  reservation: BookingReservation | null
  documents: { license: boolean; identity: boolean }
  /** Contrato aceptado en línea (paso Contrato). El checkout lo exige si así está configurado. */
  contractSigned: boolean
  payMode: 'deposit' | 'full'
}

function blankDriver(): DriverDraft {
  return {
    name: '',
    documentType: 'cedula',
    documentNumber: '',
    email: '',
    phonePrefix: '+593',
    phone: '',
    country: 'EC',
    licenseNumber: '',
    licenseExpiresAt: '',
    licenseCountry: 'EC',
  }
}

function blank(): BookingState {
  return {
    categorySlug: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    pickupLocation: '',
    sameReturn: true,
    returnLocation: '',
    pickupAddress: '',
    mileage: 'limited',
    coverage: '',
    extras: {},
    driver: blankDriver(),
    reservation: null,
    documents: { license: false, identity: false },
    contractSigned: false,
    payMode: 'deposit',
  }
}

function load(): BookingState {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return blank()
    const saved = JSON.parse(raw) as Partial<BookingState>
    return { ...blank(), ...saved, driver: { ...blankDriver(), ...(saved.driver || {}) } }
  } catch {
    return blank()
  }
}

export const booking = reactive<BookingState>(load())

watch(
  booking,
  (value) => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      /* modo privado: la reserva sigue, solo no sobrevive a una recarga */
    }
  },
  { deep: true },
)

export const pickupAt = computed(() =>
  booking.pickupDate && booking.pickupTime ? toGuayaquilIso(booking.pickupDate, booking.pickupTime) : '',
)
export const returnAt = computed(() =>
  booking.returnDate && booking.returnTime ? toGuayaquilIso(booking.returnDate, booking.returnTime) : '',
)
export const effectiveReturnLocation = computed<LocationCode | ''>(() =>
  booking.sameReturn ? booking.pickupLocation : booking.returnLocation,
)

/** Días como los cuenta el backend: ceil(horas / 24), mínimo 1. Solo para mostrar. */
export const localDays = computed(() => {
  if (!pickupAt.value || !returnAt.value) return 0
  const ms = new Date(returnAt.value).getTime() - new Date(pickupAt.value).getTime()
  if (ms <= 0) return 0
  return Math.max(1, Math.ceil(ms / 86400000))
})

export const quoteInput = computed<QuoteInput | null>(() => {
  const ret = effectiveReturnLocation.value
  if (!booking.categorySlug || !pickupAt.value || !returnAt.value || !booking.pickupLocation || !ret) return null
  return {
    categorySlug: booking.categorySlug,
    pickupAt: pickupAt.value,
    returnAt: returnAt.value,
    pickupLocation: booking.pickupLocation,
    returnLocation: ret,
    mileage: booking.mileage,
    coverage: booking.coverage,
    extras: Object.entries(booking.extras)
      .filter(([, q]) => q > 0)
      .map(([code, quantity]) => ({ code, quantity })),
  }
})

export const needsAddress = computed(() => booking.pickupLocation === 'hotel' || booking.pickupLocation === 'other')

/** PhoneInput ya entrega E.164 (+593991234567): se manda tal cual. */
export function driverPhone(): string {
  return booking.driver.phone
}

/** Firma de lo que define el precio y al conductor: si cambia, la reserva ya no sirve. */
export function currentSignature(): string {
  return JSON.stringify({ q: quoteInput.value, d: booking.driver.documentNumber, a: booking.pickupAddress })
}

export function clearReservation() {
  booking.reservation = null
  booking.documents = { license: false, identity: false }
  booking.contractSigned = false
}

/** Tras un pago aprobado se empieza de cero, pero sin volver a pedir los datos del conductor. */
export function resetBooking() {
  const driver = { ...booking.driver }
  Object.assign(booking, blank(), { driver })
}

function ymdOf(iso: string) {
  const d = new Date(new Date(iso).getTime() - 5 * 3600 * 1000)
  return { ymd: d.toISOString().slice(0, 10), hhmm: d.toISOString().slice(11, 16) }
}

/**
 * Llega desde /reserva/:code (p. ej. "continuar al pago"): se reconstruye el
 * estado del asistente a partir de la reserva guardada.
 */
export function adoptReservation(res: PublicReservation, token: string) {
  const p = ymdOf(res.pickupAt)
  const r = ymdOf(res.returnAt)
  Object.assign(booking, {
    categorySlug: res.category.slug,
    pickupDate: p.ymd,
    pickupTime: p.hhmm,
    returnDate: r.ymd,
    returnTime: r.hhmm,
    pickupLocation: res.pickupLocation,
    sameReturn: res.pickupLocation === res.returnLocation,
    returnLocation: res.returnLocation,
    mileage: res.mileage,
    coverage: res.coverage,
    extras: Object.fromEntries(res.extras.map((e) => [e.code, e.quantity])),
    documents: { ...res.documents },
    contractSigned: res.contract?.status === 'signed',
  })
  booking.reservation = {
    code: res.code,
    token,
    status: res.status,
    holdExpiresAt: res.holdExpiresAt,
    pricing: res.pricing,
    signature: currentSignature(),
  }
}
