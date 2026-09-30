import type { I18nText } from '@/types'
import { refObj, type Vehicle } from '@/types/admin'

/** "hace 5 min", "hace 3 h", "hace 2 días". Para listas donde importa la frescura. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  const days = Math.floor(diff / 86400)
  if (days < 30) return `hace ${days} día${days === 1 ? '' : 's'}`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months === 1 ? '' : 'es'}`
}

/** Solo dígitos; los números locales (09…) se pasan a formato internacional de Ecuador. */
export function normalizePhone(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) digits = `593${digits.slice(1)}`
  return digits
}

export function waLink(phone: string, message = ''): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${normalizePhone(phone)}${text}`
}

export function telLink(phone: string): string {
  const d = normalizePhone(phone)
  return d ? `tel:+${d}` : ''
}

export const es = (t: I18nText | undefined | null) => t?.es || t?.en || ''

export function vehicleLabel(v: Vehicle | Partial<Vehicle> | null | undefined): string {
  if (!v) return 'Sin asignar'
  return [v.brand, v.model, v.plate ? `· ${v.plate}` : ''].filter(Boolean).join(' ')
}

export function categoryOf(v: Vehicle): string {
  const c = refObj(v.category)
  return c ? es(c.name) || c.slug : ''
}

/** "5 oct" corto para tarjetas; la fecha de negocio es Guayaquil. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00-05:00` : iso)
  return new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short', timeZone: 'America/Guayaquil' }).format(d)
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil',
  })
    .format(new Date(iso))
    // "09:00 a. m." no debe partirse en dos líneas ("a." arriba, "m." abajo).
    .replace(/\s?([ap])\.\s?m\./g, '\u00a0$1.\u00a0m.')
}

/** Ids de Mongo generados aquí para filas nuevas no hacen falta: el API los crea. */
export const emptyI18n = (): I18nText => ({ es: '', en: '' })
