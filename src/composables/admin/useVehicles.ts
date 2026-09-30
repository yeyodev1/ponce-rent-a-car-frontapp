import { computed, onMounted, ref } from 'vue'
import { useCrud } from './useCrud'
import { emptyVehicle, vehicleToBody, vehicleToForm, type VehicleForm } from './vehicleForm'
import { es } from './helpers'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { vehicleStatuses } from '@/config/admin'
import { refId, type Vehicle, type VehicleStatus } from '@/types/admin'
import type { ApiError, Category } from '@/types'

/** Pestaña de unidades: CRUD, filtros y datos de la categoría (nombre y tarifa diaria). */
export function useVehicles() {
  const toast = useToastStore()
  const crud = useCrud<Vehicle, VehicleForm>('vehicles', {
    empty: emptyVehicle,
    toForm: vehicleToForm,
    toBody: vehicleToBody,
  })
  const { items } = crud

  const categories = ref<Category[]>([])
  onMounted(async () => {
    try {
      categories.value = (await adminService.list<Category>('categories', { limit: 200 })).items
    } catch {
      /* sin categorías el nombre y la tarifa se muestran vacíos */
    }
  })

  function categoryOf(v: Vehicle): Category | null {
    return categories.value.find((x) => x._id === refId(v.category)) || null
  }

  const catName = (v: Vehicle) => {
    const c = categoryOf(v)
    if (c) return es(c.name)
    return typeof v.category === 'object' && v.category ? es(v.category.name) : '—'
  }

  /** La tarifa se define por categoría: la unidad hereda la de la suya. */
  const dailyRate = (v: Vehicle) => categoryOf(v)?.pricePerDay ?? null

  /** Estado visible: una unidad desactivada es "Inactivo" aunque su estado interno sea otro. */
  const visibleStatus = (v: Vehicle): string => (v.isActive === false ? 'blocked' : v.status)

  const statusFilter = ref('')
  const catFilter = ref('')
  const rows = computed(() =>
    items.value.filter(
      (v) =>
        (!statusFilter.value || visibleStatus(v) === statusFilter.value) &&
        (!catFilter.value || refId(v.category) === catFilter.value),
    ),
  )

  async function setStatus(v: Vehicle, status: VehicleStatus) {
    const prev = v.status
    items.value = items.value.map((i) => (i._id === v._id ? { ...i, status } : i))
    try {
      await adminService.setVehicleStatus(v._id, status)
      toast.success(`${v.plate || v.model}: ${vehicleStatuses[status]?.label}`)
    } catch (e) {
      items.value = items.value.map((i) => (i._id === v._id ? { ...i, status: prev } : i))
      toast.error((e as ApiError).message)
    }
  }

  return { crud, categories, catName, dailyRate, visibleStatus, statusFilter, catFilter, rows, setStatus }
}
