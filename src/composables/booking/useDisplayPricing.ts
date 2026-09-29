import { computed, type Ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import type { PriceLine } from '@/types'
import { booking } from './useBookingState'
import { quote, quoteFailed, quoteLoading, quoteOk } from './useQuote'

export interface DisplayPricing {
  lines: PriceLine[]
  total: number
  deposit: number
  guarantee: number
  days: number
  /** Precio "desde" de la categoría mientras aún no hay cotización. */
  fromPerDay: number
  state: 'ready' | 'loading' | 'invalid' | 'offline' | 'empty'
}

/**
 * Qué precio se muestra: antes de apartar, la cotización en vivo; ya apartado
 * (documentos, revisión, pago), el snapshot guardado en la reserva, que es el
 * que se cobra.
 */
export function useDisplayPricing(step: Ref<number>) {
  const catalog = useCatalogStore()

  return computed<DisplayPricing>(() => {
    const fromPerDay = catalog.bySlug(booking.categorySlug)?.pricePerDay || catalog.minPrice
    const res = booking.reservation
    if (res && step.value >= 7) {
      const p = res.pricing
      return {
        lines: p.lines,
        total: p.total,
        deposit: p.deposit,
        guarantee: p.guaranteeAmount,
        days: p.days,
        fromPerDay,
        state: 'ready',
      }
    }
    const q = quote.value
    const state: DisplayPricing['state'] = quoteLoading.value
      ? 'loading'
      : quoteFailed.value
        ? 'offline'
        : !q
          ? 'empty'
          : quoteOk.value
            ? 'ready'
            : 'invalid'
    return {
      lines: q?.lines || [],
      total: q?.total || 0,
      deposit: q?.deposit || 0,
      guarantee: q?.guaranteeAmount || catalog.config?.booking.guaranteeAmount || 0,
      days: q?.days || 0,
      fromPerDay,
      state,
    }
  })
}
