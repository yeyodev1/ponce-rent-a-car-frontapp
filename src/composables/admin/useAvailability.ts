import { computed, ref, watch } from 'vue'
import { adminService } from '@/services/admin.service'
import { ymdInGuayaquil } from '@/utils/format'
import type { ApiError } from '@/types'
import type { AvailabilityRow, BusySlot } from '@/types/admin'

const DAY = 86400000
export const DAYS = 14

/** Medianoche de Guayaquil (UTC-5 fijo) de un "YYYY-MM-DD", en milisegundos. */
const midnight = (ymd: string) => new Date(`${ymd}T00:00:00-05:00`).getTime()

/**
 * Calendario por unidad: una ventana de 14 días y, por cada reserva, su
 * posición (left/width en %) dentro de la tira.
 */
export function useAvailability() {
  const offset = ref(0)
  const rows = ref<AvailabilityRow[]>([])
  const loading = ref(true)
  const error = ref<ApiError | null>(null)

  const start = computed(() => midnight(ymdInGuayaquil(offset.value)))
  const end = computed(() => start.value + DAYS * DAY)

  const days = computed(() =>
    Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(start.value + i * DAY + 12 * 3600000)
      const fmt = (o: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('es-EC', { timeZone: 'America/Guayaquil', ...o }).format(d)
      return {
        key: i,
        weekday: fmt({ weekday: 'short' }).replace('.', ''),
        day: fmt({ day: 'numeric' }),
        month: fmt({ month: 'short' }).replace('.', ''),
        today: offset.value + i === 0,
        weekend: ['sáb', 'dom'].includes(fmt({ weekday: 'short' }).replace('.', '')),
      }
    }),
  )

  async function load() {
    loading.value = true
    error.value = null
    try {
      rows.value = await adminService.availability(new Date(start.value).toISOString(), new Date(end.value).toISOString())
    } catch (e) {
      error.value = e as ApiError
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  function place(slot: BusySlot) {
    const from = Math.max(new Date(slot.from).getTime(), start.value)
    const to = Math.min(new Date(slot.to).getTime(), end.value)
    const span = end.value - start.value
    return {
      left: ((from - start.value) / span) * 100,
      width: Math.max(((to - from) / span) * 100, 1.5),
      cutStart: new Date(slot.from).getTime() < start.value,
      cutEnd: new Date(slot.to).getTime() > end.value,
    }
  }

  const visible = (slot: BusySlot) => new Date(slot.to).getTime() > start.value && new Date(slot.from).getTime() < end.value

  watch(offset, load)
  load()

  return { offset, rows, loading, error, days, load, place, visible }
}
