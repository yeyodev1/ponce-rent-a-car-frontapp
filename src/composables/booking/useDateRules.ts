import { ymdInGuayaquil } from '@/utils/format'
import type { PublicConfig } from '@/types'
import { booking } from './useBookingState'

/**
 * Reglas de fechas de la Ruta B, en hora de Guayaquil (UTC-5 fijo).
 * El backend vuelve a validar todo; esto solo evita ofrecer horas imposibles.
 */

export const OPEN_HOUR = 6
export const CLOSE_HOUR = 22
const SLOT = 30

export function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function diffDays(from: string, to: string): number {
  return Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000)
}

function toHhmm(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Primera hora ofrecible hoy (ahora + aviso mínimo, redondeada al próximo bloque). null = hoy ya no. */
export function firstSlotToday(minHoursNotice: number): string | null {
  const now = new Date(Date.now() - 5 * 3600 * 1000)
  // +1 min: a las 9:30:40 con 3 h de aviso, las 12:30 ya no cumplen.
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes() + minHoursNotice * 60 + 1
  const rounded = Math.max(OPEN_HOUR * 60, Math.ceil(minutes / SLOT) * SLOT)
  return rounded > CLOSE_HOUR * 60 ? null : toHhmm(rounded)
}

/** minTime del selector de hora de retiro: solo aplica si el retiro es hoy. */
export function pickupMinTime(cfg: PublicConfig | null): string {
  if (booking.pickupDate !== ymdInGuayaquil(0)) return ''
  return firstSlotToday(cfg?.booking.minHoursNotice ?? 3) ?? '23:59'
}

/** La devolución el mismo día que el retiro tiene que ser al menos un bloque después. */
export function returnMinTime(): string {
  if (!booking.returnDate || booking.returnDate !== booking.pickupDate || !booking.pickupTime) return ''
  return toHhmm(Math.min(CLOSE_HOUR * 60, toMinutes(booking.pickupTime) + SLOT))
}

/** Rellena lo que falta con valores sensatos para que el precio aparezca de inmediato. */
export function ensureDateDefaults(cfg: PublicConfig | null) {
  const today = ymdInGuayaquil(0)
  const first = firstSlotToday(cfg?.booking.minHoursNotice ?? 3)
  // Un retiro fuera de la ventana (enlace viejo, fecha tecleada en /vehiculos)
  // no tiene chip marcado ni cotiza: se mueve al primer día válido. La
  // duración la conserva shiftPickup, que StepDates corre al cambiar el retiro.
  const last = addDays(today, cfg?.booking.maxDaysAhead ?? 5)
  const p = booking.pickupDate
  if (!p || p < today || p > last || (p === today && !first)) {
    booking.pickupDate = first ? today : addDays(today, 1)
  }
  const min = pickupMinTime(cfg)
  if (!booking.pickupTime || (min && booking.pickupTime < min)) {
    booking.pickupTime = min && min !== '23:59' ? (min > '10:00' ? min : '10:00') : '10:00'
  }
  if (!booking.returnDate || booking.returnDate <= booking.pickupDate) {
    booking.returnDate = addDays(booking.pickupDate, 3)
  }
  if (!booking.returnTime) booking.returnTime = booking.pickupTime
}

/** Al mover el retiro se conserva la duración elegida: la devolución se corre igual. */
export function shiftPickup(nextYmd: string, prevYmd: string, cfg: PublicConfig | null) {
  if (booking.returnDate && prevYmd) {
    const span = Math.max(1, diffDays(prevYmd, booking.returnDate))
    booking.returnDate = addDays(nextYmd, span)
  }
  const min = pickupMinTime(cfg)
  if (min && booking.pickupTime < min && min !== '23:59') booking.pickupTime = min
}
