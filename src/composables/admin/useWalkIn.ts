import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { adminService } from '@/services/admin.service'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import { useToastStore } from '@/stores/toast'
import { walkInCopy as t } from '@/config/admin'
import { toGuayaquilIso, ymdInGuayaquil } from '@/utils/format'
import { refId, type Vehicle, type WalkInInput } from '@/types/admin'
import { cleanLicense, licenseIssue } from './useLicense'
import type { ApiError, LocationCode, MileageOption, Quote } from '@/types'

/**
 * Reserva presencial: el personal arma la reserva en el local, ve la
 * cotización en vivo (mismo motor que la web) y al crearla recibe el enlace
 * seguro para mandárselo al cliente.
 */

const SHARE_KEY = 'ponce_share_'

/** El accessToken solo llega al crear: se guarda en la pestaña para mostrar el enlace en el detalle. */
export function readShareToken(id: string): string {
  try {
    return sessionStorage.getItem(SHARE_KEY + id) || ''
  } catch {
    return ''
  }
}

function saveShareToken(id: string, token: string) {
  try {
    sessionStorage.setItem(SHARE_KEY + id, token)
  } catch {
    /* modo privado: el enlace se ve solo en esta navegación */
  }
}

/** Próxima hora en punto en Guayaquil ("14:00"). */
function nextHour(): string {
  const h = new Date(Date.now() - 5 * 3600 * 1000).getUTCHours() + 1
  return `${String(Math.min(h, 23)).padStart(2, '0')}:00`
}

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function blank() {
  const today = ymdInGuayaquil(0)
  const late = nextHour() >= '22:00'
  // De noche la reserva arranca mañana a las 9; la devolución, un día después del retiro.
  const pickupDate = late ? addDays(today, 1) : today
  const time = late ? '09:00' : nextHour()
  return {
    categorySlug: '',
    vehicleId: '',
    pickupDate,
    pickupTime: time,
    returnDate: addDays(pickupDate, 1),
    returnTime: time,
    pickupLocation: 'office' as LocationCode,
    returnLocation: 'office' as LocationCode,
    // Como en la Ruta B: casi siempre se devuelve donde se entregó.
    sameReturn: true,
    mileage: 'limited' as MileageOption,
    coverage: '',
    extras: {} as Record<string, number>,
    driver: {
      name: '',
      documentType: 'cedula' as 'cedula' | 'passport',
      documentNumber: '',
      email: '',
      phone: '',
      country: 'EC',
      licenseNumber: '',
      licenseExpiresAt: '',
      licenseCountry: 'EC',
    },
    notes: '',
  }
}

export type WalkInForm = ReturnType<typeof blank>

// Ventana en línea (5 días, aviso mínimo): no aplica al personal, así que esos avisos no se muestran.
const WINDOW_HINTS = ['máximo', 'supera', 'anticipación', 'maximum', 'advance']

export function useWalkIn(onCreated?: () => void) {
  const router = useRouter()
  const toast = useToastStore()
  const catalog = useCatalogStore()
  catalog.load()

  const form = reactive(blank())
  const vehicles = ref<Vehicle[]>([])
  const quote = ref<Quote | null>(null)
  const quoting = ref(false)
  const quoteFailed = ref(false)
  const creating = ref(false)
  const tried = ref(false)

  async function loadVehicles() {
    try {
      vehicles.value = (await adminService.list<Vehicle>('vehicles', { limit: 200 })).items
    } catch {
      vehicles.value = []
    }
  }

  const category = computed(() => catalog.categories.find((c) => c.slug === form.categorySlug) || null)
  const units = computed(() =>
    vehicles.value.filter(
      (v) =>
        v.isActive !== false &&
        !['maintenance', 'blocked'].includes(v.status) &&
        category.value &&
        (refId(v.category) === category.value._id ||
          (typeof v.category === 'object' && v.category?.slug === category.value.slug)),
    ),
  )
  watch(
    () => form.categorySlug,
    () => (form.vehicleId = ''),
  )
  // Con "mismo lugar" la devolución sigue a la entrega; al desmarcarlo parte de ella.
  watch(
    () => [form.sameReturn, form.pickupLocation] as const,
    ([same, pickup]) => {
      if (same) form.returnLocation = pickup
    },
  )
  watch(
    () => catalog.coverages,
    (list) => {
      if (!form.coverage && list.length) form.coverage = (list.find((c) => c.isDefault) || list[0]!).code
    },
    { immediate: true },
  )

  const pickupAt = computed(() => (form.pickupDate && form.pickupTime ? toGuayaquilIso(form.pickupDate, form.pickupTime) : ''))
  const returnAt = computed(() => (form.returnDate && form.returnTime ? toGuayaquilIso(form.returnDate, form.returnTime) : ''))

  const dateError = computed(() => {
    if (!pickupAt.value || !returnAt.value) return ''
    // 15 min de tolerancia, igual que el servidor.
    if (new Date(pickupAt.value).getTime() < Date.now() - 15 * 60000) return t.pastDate
    if (new Date(returnAt.value) <= new Date(pickupAt.value)) return t.returnBefore
    return ''
  })

  const extras = computed(() =>
    Object.entries(form.extras)
      .filter(([, q]) => q > 0)
      .map(([code, quantity]) => ({ code, quantity })),
  )

  const quoteInput = computed(() => {
    if (!form.categorySlug || !pickupAt.value || !returnAt.value || dateError.value) return null
    return {
      categorySlug: form.categorySlug,
      pickupAt: pickupAt.value,
      returnAt: returnAt.value,
      pickupLocation: form.pickupLocation,
      returnLocation: form.sameReturn ? form.pickupLocation : form.returnLocation,
      mileage: form.mileage,
      coverage: form.coverage,
      extras: extras.value,
    }
  })

  let seq = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    quoteInput,
    (input) => {
      clearTimeout(timer)
      if (!input) {
        quote.value = null
        quoting.value = false
        return
      }
      quoting.value = true
      timer = setTimeout(async () => {
        const mine = ++seq
        try {
          const q = await publicService.quote(input)
          if (mine !== seq) return
          quote.value = q
          quoteFailed.value = false
        } catch {
          if (mine !== seq) return
          quote.value = null
          quoteFailed.value = true
        } finally {
          if (mine === seq) quoting.value = false
        }
      }, 400)
    },
    { deep: true },
  )

  const quoteWarnings = computed(() =>
    (quote.value?.errors || []).filter((e) => !WINDOW_HINTS.some((w) => e.toLowerCase().includes(w))),
  )

  // La licencia se pide igual que en la web: vigente hasta el día de la devolución.
  const licenseProblem = computed(() =>
    licenseIssue(form.driver.licenseNumber, form.driver.licenseExpiresAt, form.returnDate),
  )
  const driverOk = computed(() => {
    const d = form.driver
    return (
      d.name.trim().length > 1 &&
      d.documentNumber.trim().length > 3 &&
      /\S+@\S+\.\S+/.test(d.email) &&
      Boolean(d.phone) &&
      !licenseProblem.value
    )
  })
  const canSubmit = computed(() => Boolean(quoteInput.value) && driverOk.value && !creating.value)

  async function submit() {
    tried.value = true
    if (!canSubmit.value || !quoteInput.value) {
      toast.error(dateError.value || (licenseProblem.value === 'expired' ? t.licenseExpired : t.missing))
      return
    }
    creating.value = true
    const d = form.driver
    const body: WalkInInput = {
      ...quoteInput.value,
      ...(form.vehicleId ? { vehicleId: form.vehicleId } : {}),
      driver: {
        name: d.name.trim(),
        documentType: d.documentType,
        documentNumber: d.documentNumber.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone,
        country: d.country,
        licenseNumber: cleanLicense(d.licenseNumber),
        licenseExpiresAt: d.licenseExpiresAt,
        licenseCountry: d.licenseCountry || d.country,
      },
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      language: 'es',
    }
    try {
      const created = await adminService.createReservation(body)
      if (created.accessToken) saveShareToken(created._id, created.accessToken)
      toast.success(t.created(created.code))
      Object.assign(form, blank())
      onCreated?.()
      router.push(`/admin/reservas/${created._id}`)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      creating.value = false
    }
  }

  function reset() {
    Object.assign(form, blank())
    tried.value = false
    if (catalog.coverages.length) form.coverage = (catalog.coverages.find((c) => c.isDefault) || catalog.coverages[0]!).code
  }

  return {
    form,
    catalog,
    units,
    loadVehicles,
    quote,
    quoting,
    quoteFailed,
    quoteWarnings,
    dateError,
    driverOk,
    licenseProblem,
    tried,
    creating,
    canSubmit,
    submit,
    reset,
  }
}
