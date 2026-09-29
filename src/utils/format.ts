import { useI18n } from '@/i18n'

const intlLocale = () => (useI18n().locale.value === 'en' ? 'en-US' : 'es-EC')

/** Centavos → "$320" o "$32.50". El API siempre manda centavos. */
export function money(cents: number, alwaysDecimals = false): string {
  const value = (cents || 0) / 100
  const decimals = alwaysDecimals || !Number.isInteger(value) ? 2 : 0
  return new Intl.NumberFormat(intlLocale(), {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Compatibilidad con el scaffold: recibe dólares, no centavos. */
export function formatMoney(value: number): string {
  return money(Math.round(value * 100), true)
}

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(intlLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Guayaquil',
    ...opts,
  }).format(d)
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, { hour: '2-digit', minute: '2-digit', year: undefined })
}

/** "2026-10-05" de hoy + n días en hora de Guayaquil (UTC-5 fijo). */
export function ymdInGuayaquil(offsetDays = 0): string {
  const now = new Date(Date.now() - 5 * 3600 * 1000 + offsetDays * 86400 * 1000)
  return now.toISOString().slice(0, 10)
}

/** Une fecha y hora locales de Guayaquil en ISO con offset: "2026-10-05T10:00:00-05:00". */
export function toGuayaquilIso(ymd: string, hhmm: string): string {
  return `${ymd}T${hhmm}:00-05:00`
}
