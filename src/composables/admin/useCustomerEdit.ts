import { computed, reactive, ref, type Ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { licenseCopy } from '@/config/admin'
import { cleanLicense, isValidLicense } from './useLicense'
import type { ApiError } from '@/types'
import type { CustomerDetail, CustomerPatch } from '@/types/admin'

export interface CustomerForm {
  name: string
  email: string
  phone: string
  licenseNumber: string
  licenseExpiresAt: string
  licenseCountry: string
  notes: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Edición del cliente por el personal (contacto, licencia y notas) en un drawer. */
export function useCustomerEdit(customer: Ref<CustomerDetail | null>) {
  const toast = useToastStore()
  const open = ref(false)
  const saving = ref(false)
  const form = reactive<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiresAt: '',
    licenseCountry: '',
    notes: '',
  })

  function start() {
    const c = customer.value
    if (!c) return
    Object.assign(form, {
      name: c.name,
      email: c.email,
      phone: c.phone,
      licenseNumber: c.licenseNumber || '',
      licenseExpiresAt: c.licenseExpiresAt || '',
      licenseCountry: c.licenseCountry || c.country || 'EC',
      notes: c.notes || '',
    })
    open.value = true
  }

  const errors = computed(() => {
    const e: Partial<Record<keyof CustomerForm, string>> = {}
    if (form.name.trim().length < 3) e.name = 'Escribe el nombre completo'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Correo no válido'
    if (!form.phone) e.phone = 'Teléfono no válido'
    if (form.licenseNumber.trim() && !isValidLicense(form.licenseNumber))
      e.licenseNumber = 'Entre 4 y 20 letras o números'
    return e
  })
  const valid = computed(() => Object.keys(errors.value).length === 0)

  async function save() {
    const c = customer.value
    if (!c || !valid.value) return
    saving.value = true
    const body: CustomerPatch = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      licenseNumber: form.licenseNumber.trim() ? cleanLicense(form.licenseNumber) : '',
      licenseExpiresAt: form.licenseExpiresAt,
      licenseCountry: form.licenseCountry,
      notes: form.notes,
    }
    try {
      customer.value = await adminService.updateCustomer(c._id, body)
      toast.success(licenseCopy.saved)
      open.value = false
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { open, saving, form, errors, valid, start, save }
}
