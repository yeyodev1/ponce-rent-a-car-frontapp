import { computed, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { booking } from './useBookingState'
import { isE164 } from '@/utils/phone'

/**
 * Validación en línea del conductor. Los errores aparecen al salir de cada
 * campo (no mientras se escribe) o todos juntos si se intenta continuar.
 */

/** Cédula ecuatoriana: provincia 01–24 (o 30), tercer dígito < 6 y dígito verificador módulo 10. */
export function isValidCedula(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false
  const province = Number(value.slice(0, 2))
  if (!((province >= 1 && province <= 24) || province === 30)) return false
  if (Number(value[2]) >= 6) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let n = Number(value[i]) * (i % 2 === 0 ? 2 : 1)
    if (n > 9) n -= 9
    sum += n
  }
  const check = (10 - (sum % 10)) % 10
  return check === Number(value[9])
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const touched = reactive<Record<string, boolean>>({})
export const submitted = ref(false)

export const driverErrors = computed(() => {
  const d = booking.driver
  const e: Record<string, string> = {}
  if (d.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = t('booking.driver.errors.name')
  const doc = d.documentNumber.trim()
  if (!doc) e.documentNumber = t('common.errors.required')
  else if (d.documentType === 'cedula' && d.country === 'EC' && !isValidCedula(doc))
    e.documentNumber = t('booking.driver.errors.cedula')
  else if (doc.length < 5) e.documentNumber = t('booking.driver.errors.docNumber')
  if (!EMAIL_RE.test(d.email.trim())) e.email = t('common.errors.email')
  if (!isE164(d.phone)) e.phone = t('common.errors.phone')
  if (!d.country) e.country = t('common.errors.required')
  return e
})

export const driverValid = computed(() => Object.keys(driverErrors.value).length === 0)

export function fieldError(name: string): string {
  return touched[name] || submitted.value ? driverErrors.value[name] || '' : ''
}
