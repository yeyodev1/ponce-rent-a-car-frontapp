import { ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { copy } from '@/config/admin'
import type { ApiError } from '@/types'
import type { Settings } from '@/types/admin'

const emptySettings = (): Settings => ({
  business: {
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    mapsUrl: '',
    hours: { es: '', en: '' },
    instagram: '',
    facebook: '',
    tiktok: '',
  },
  booking: {
    maxDaysAhead: 5,
    minHoursNotice: 3,
    holdMinutes: 20,
    depositMode: 'fixed',
    depositValue: 0,
    guaranteeAmount: 0,
    mileage: { limitedKmPerDay: 150, extraKmPrice: 0, unlimitedPricePerDay: 0 },
    locations: [],
  },
  integrations: { webhookUrl: '' },
})

/** Une lo que llega del API con los valores por defecto (sin perder llaves anidadas). */
function merge(data: Partial<Settings>): Settings {
  const base = emptySettings()
  return {
    business: { ...base.business, ...data.business, hours: { ...base.business.hours, ...data.business?.hours } },
    booking: {
      ...base.booking,
      ...data.booking,
      mileage: { ...base.booking.mileage, ...data.booking?.mileage },
      locations: data.booking?.locations || [],
    },
    integrations: { ...base.integrations, ...data.integrations },
  }
}

/**
 * Configuración general (/admin/settings). La usan Tarifas, Configuración e
 * Integraciones. Se envía el documento completo: un PUT parcial podría
 * dejar vacías las secciones que esa pantalla no muestra.
 */
export function useSettings() {
  const toast = useToastStore()
  const form = ref<Settings>(emptySettings())
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      form.value = merge(await adminService.settings())
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const saved = await adminService.saveSettings(form.value)
      if (saved && typeof saved === 'object' && saved.booking) form.value = merge(saved)
      toast.success(copy.saved)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  load()

  return { form, loading, saving, error, load, save }
}
