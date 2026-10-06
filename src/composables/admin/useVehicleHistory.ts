import { ref } from 'vue'
import { opsService } from '@/services/ops.service'
import { useToastStore } from '@/stores/toast'
import { vehicleHistoryCopy as t } from '@/config/admin/ops'
import { ymdInGuayaquil } from '@/utils/format'
import type { ApiError } from '@/types'
import type { TimelineItem, VehicleHistory, VehicleLogInput } from '@/types/ops'

const blankLog = (km = 0): VehicleLogInput => ({
  type: 'maintenance',
  date: ymdInGuayaquil(),
  mileageKm: km || null,
  cost: 0,
  description: '',
})

/** Historial de una unidad: línea de tiempo, estadísticas y bitácora. */
export function useVehicleHistory(id: string) {
  const toast = useToastStore()
  const history = ref<VehicleHistory | null>(null)
  const loading = ref(true)
  const error = ref<ApiError | null>(null)
  const formOpen = ref(false)
  const saving = ref(false)
  const formError = ref('')
  const form = ref<VehicleLogInput>(blankLog())
  const toDelete = ref<TimelineItem | null>(null)

  async function load(silent = false) {
    if (!silent) loading.value = true
    error.value = null
    try {
      history.value = await opsService.vehicleHistory(id)
      const v = history.value.vehicle
      document.title = `${v.brand} ${v.model} ${v.plate} — Ponce's`
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  function openForm() {
    form.value = blankLog(history.value?.vehicle.mileageKm || 0)
    formError.value = ''
    formOpen.value = true
  }

  async function save() {
    formError.value = ''
    if (!form.value.description.trim()) {
      formError.value = t.descRequired
      return
    }
    saving.value = true
    try {
      await opsService.addLog(id, { ...form.value, description: form.value.description.trim() })
      formOpen.value = false
      toast.success(t.saved)
      await load(true)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  async function confirmDelete() {
    const item = toDelete.value
    toDelete.value = null
    if (!item) return
    try {
      await opsService.deleteLog(id, item.id)
      toast.success(t.deleted)
      await load(true)
    } catch (e) {
      toast.error((e as ApiError).message)
    }
  }

  load()

  return {
    history,
    loading,
    error,
    formOpen,
    saving,
    formError,
    form,
    toDelete,
    load,
    openForm,
    save,
    confirmDelete,
  }
}
