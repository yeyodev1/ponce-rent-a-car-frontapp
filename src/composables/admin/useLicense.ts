import { ymdInGuayaquil } from '@/utils/format'
import { countryOptions } from '@/composables/booking/countries'

export type LicenseState = 'none' | 'expired' | 'beforeReturn' | 'valid'

const LICENSE_RE = /^[A-Z0-9]{4,20}$/

/** Misma limpieza que el API: sin espacios, puntos ni guiones, en mayúsculas. */
export const cleanLicense = (v: string) => v.replace(/[\s.-]/g, '').toUpperCase()
export const isValidLicense = (v: string) => LICENSE_RE.test(cleanLicense(v))

/** Fecha de un ISO en Guayaquil (UTC-5 fijo), como la compara el backend. */
export function ymdOfIso(iso: string): string {
  return new Date(new Date(iso).getTime() - 5 * 3600 * 1000).toISOString().slice(0, 10)
}

/** Vigencia frente a hoy y, si se da, frente al día de devolución. */
export function licenseState(expiresAt?: string, returnAt?: string): LicenseState {
  if (!expiresAt) return 'none'
  if (expiresAt < ymdInGuayaquil()) return 'expired'
  if (returnAt && expiresAt < ymdOfIso(returnAt)) return 'beforeReturn'
  return 'valid'
}

let names: Intl.DisplayNames | null = null
export function countryName(code?: string): string {
  if (!code) return ''
  try {
    names ??= new Intl.DisplayNames(['es'], { type: 'region' })
    return names.of(code) || code
  } catch {
    return code
  }
}

/** Opciones del select de país en español (frecuentes arriba). */
export const adminCountries = () => countryOptions('es')

/** Problema de la licencia al crear una reserva (misma regla que el API): '' si está bien. */
export function licenseIssue(number: string, expiresAt: string, returnYmd: string): '' | 'invalid' | 'expired' {
  if (!isValidLicense(number) || !expiresAt) return 'invalid'
  if (returnYmd && expiresAt < returnYmd) return 'expired'
  return ''
}
