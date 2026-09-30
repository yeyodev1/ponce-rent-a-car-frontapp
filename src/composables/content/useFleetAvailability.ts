import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import { toGuayaquilIso, ymdInGuayaquil } from '@/utils/format'
import { track } from '@/composables/useAnalytics'

/**
 * Filtro de /vehiculos: fechas opcionales y categoría. Con fechas se pide
 * /public/categories?from&to y cada tarjeta muestra la disponibilidad real;
 * "Reservar" lleva esas fechas a la Ruta B. Se puede abrir ya filtrado con
 * ?retiro=&devolucion=&categoria= (no se reescribe la URL al tocar: cada
 * cambio contaría como una página vista).
 */

const PICK_HOUR = '10:00'
const YMD = /^\d{4}-\d{2}-\d{2}$/

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function useFleetAvailability() {
  const route = useRoute()
  const catalog = useCatalogStore()

  const q = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
  const pickup = ref(YMD.test(q('retiro')) ? q('retiro') : '')
  const dropoff = ref(YMD.test(q('devolucion')) ? q('devolucion') : '')
  const category = ref(q('categoria'))

  const today = ymdInGuayaquil(0)
  const maxDays = computed(() => catalog.config?.booking.maxDaysAhead ?? 5)
  const pickupMax = computed(() => addDays(today, maxDays.value))
  const returnMin = computed(() => (pickup.value ? addDays(pickup.value, 1) : addDays(today, 1)))

  const invalid = computed(() => Boolean(pickup.value && dropoff.value && dropoff.value <= pickup.value))
  const hasDates = computed(() => Boolean(pickup.value && dropoff.value && !invalid.value))

  const availability = ref<Record<string, number> | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  let seq = 0

  async function check() {
    if (!hasDates.value) {
      availability.value = null
      failed.value = false
      return
    }
    const mine = ++seq
    loading.value = true
    failed.value = false
    try {
      const list = await publicService.categories({
        from: toGuayaquilIso(pickup.value, PICK_HOUR),
        to: toGuayaquilIso(dropoff.value, PICK_HOUR),
      })
      if (mine !== seq) return
      availability.value = Object.fromEntries(list.map((c) => [c.slug, c.availableUnits ?? 0]))
      track('fleet_availability', { from: pickup.value, to: dropoff.value })
    } catch {
      if (mine !== seq) return
      availability.value = null
      failed.value = true
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  // Al elegir el retiro se sugiere una devolución a 3 días si falta o quedó antes.
  watch(pickup, (p) => {
    if (p && (!dropoff.value || dropoff.value <= p)) dropoff.value = addDays(p, 3)
  })

  watch([pickup, dropoff], check, { immediate: true })

  function clear() {
    pickup.value = ''
    dropoff.value = ''
  }

  /** Query para /reservar: la categoría y, si hay, las fechas elegidas. */
  function bookQuery(slug: string): Record<string, string> {
    return hasDates.value ? { categoria: slug, retiro: pickup.value, devolucion: dropoff.value } : { categoria: slug }
  }

  return {
    pickup,
    dropoff,
    category,
    today,
    maxDays,
    pickupMax,
    returnMin,
    invalid,
    hasDates,
    availability,
    loading,
    failed,
    retry: check,
    clear,
    bookQuery,
  }
}
