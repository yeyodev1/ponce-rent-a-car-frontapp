import { computed, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { booking } from './useBookingState'
import { isE164 } from '@/utils/phone'
import { formatDate, toGuayaquilIso } from '@/utils/format'

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
const LICENSE_RE = /^[A-Z0-9]{4,20}$/

/** Igual que el backend: se aceptan espacios y guiones al escribir, se envía compacto. */
export function cleanLicense(value: string): string {
  return value.replace(/[\s.-]/g, '').toUpperCase()
}

/** "···1234": en pantallas de resumen no hace falta mostrar el número completo. */
export function maskLicense(value: string): string {
  const clean = cleanLicense(value)
  return clean.length > 4 ? `···${clean.slice(-4)}` : clean
}

/** YYYY-MM-DD → fecha legible; mediodía en Guayaquil para que no se corra un día. */
export function formatYmd(ymd: string): string {
  return ymd ? formatDate(toGuayaquilIso(ymd, '12:00')) : ''
}

/** Mensaje si la licencia vence antes del día de devolución (misma regla que el API). */
export function licenseExpiryError(expiresAt: string, returnDate: string): string {
  if (!expiresAt || !returnDate || expiresAt >= returnDate) return ''
  return t('booking.driver.errors.licenseExpired', { date: formatYmd(returnDate) })
}

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
  const license = cleanLicense(d.licenseNumber)
  if (!license) e.licenseNumber = t('common.errors.required')
  else if (!LICENSE_RE.test(license)) e.licenseNumber = t('booking.driver.errors.license')
  if (!d.licenseExpiresAt) e.licenseExpiresAt = t('common.errors.required')
  else {
    const expired = licenseExpiryError(d.licenseExpiresAt, booking.returnDate)
    if (expired) e.licenseExpiresAt = expired
  }
  return e
})

export const driverValid = computed(() => Object.keys(driverErrors.value).length === 0)

export function fieldError(name: string): string {
  return touched[name] || submitted.value ? driverErrors.value[name] || '' : ''
}
