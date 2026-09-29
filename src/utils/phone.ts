/**
 * Teléfonos siempre en E.164 (+593991234567): la API de WhatsApp lo exige y
 * así los mensajes se automatizan sin limpiar datos a mano. Ecuador por defecto.
 */
export interface DialCountry {
  iso: string
  dial: string
  /** Largo válido del número nacional (sin el 0 inicial). */
  min: number
  max: number
  example: string
}

// Los frecuentes primero; el resto admite cualquier número de 6 a 12 dígitos.
export const DIAL_COUNTRIES: DialCountry[] = [
  { iso: 'EC', dial: '593', min: 9, max: 9, example: '99 123 4567' },
  { iso: 'US', dial: '1', min: 10, max: 10, example: '305 555 0123' },
  { iso: 'CO', dial: '57', min: 10, max: 10, example: '300 123 4567' },
  { iso: 'PE', dial: '51', min: 9, max: 9, example: '912 345 678' },
  { iso: 'ES', dial: '34', min: 9, max: 9, example: '612 34 56 78' },
  { iso: 'MX', dial: '52', min: 10, max: 10, example: '55 1234 5678' },
  { iso: 'CA', dial: '1', min: 10, max: 10, example: '416 555 0123' },
  { iso: 'AR', dial: '54', min: 10, max: 11, example: '11 2345 6789' },
  { iso: 'CL', dial: '56', min: 9, max: 9, example: '9 1234 5678' },
  { iso: 'VE', dial: '58', min: 10, max: 10, example: '412 123 4567' },
  { iso: 'BR', dial: '55', min: 10, max: 11, example: '11 91234 5678' },
  { iso: 'PA', dial: '507', min: 7, max: 8, example: '6123 4567' },
  { iso: 'CR', dial: '506', min: 8, max: 8, example: '8312 3456' },
  { iso: 'GB', dial: '44', min: 10, max: 10, example: '7400 123456' },
  { iso: 'DE', dial: '49', min: 10, max: 11, example: '1512 3456789' },
  { iso: 'FR', dial: '33', min: 9, max: 9, example: '6 12 34 56 78' },
  { iso: 'IT', dial: '39', min: 9, max: 10, example: '312 345 6789' },
]

export const DEFAULT_COUNTRY = DIAL_COUNTRIES[0]!

export function countryByIso(iso: string): DialCountry {
  return DIAL_COUNTRIES.find((c) => c.iso === iso) || DEFAULT_COUNTRY
}

/**
 * Número nacional limpio. Acepta lo que la gente escribe o pega:
 * "0991234567", "099 123 4567", "+593 99 123 4567", "593991234567".
 */
export function nationalDigits(raw: string, country: DialCountry): string {
  let d = raw.replace(/\D/g, '')
  if (raw.trim().startsWith('+') || (d.startsWith(country.dial) && d.length > country.max)) {
    if (d.startsWith(country.dial)) d = d.slice(country.dial.length)
  }
  // El 0 de marcación nacional (Ecuador, Perú, Argentina...) no va en E.164.
  return d.replace(/^0+/, '')
}

export function isValidNational(national: string, country: DialCountry): boolean {
  if (national.length < country.min || national.length > country.max) return false
  // Ecuador: los celulares (los que tienen WhatsApp) empiezan en 9.
  if (country.iso === 'EC') return /^9\d{8}$/.test(national)
  return true
}

export function toE164(national: string, country: DialCountry): string {
  return national ? `+${country.dial}${national}` : ''
}

/** Separa un E.164 guardado para volver a mostrarlo en el campo. */
export function fromE164(value: string): { country: DialCountry; national: string } {
  const d = (value || '').replace(/\D/g, '')
  if (!d) return { country: DEFAULT_COUNTRY, national: '' }
  const byLongestDial = [...DIAL_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  const country = byLongestDial.find((c) => d.startsWith(c.dial)) || DEFAULT_COUNTRY
  return { country, national: d.slice(country.dial.length) }
}

export function isE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value)
}
