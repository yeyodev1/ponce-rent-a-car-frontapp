import { ref } from 'vue'
import { publicService } from '@/services/public.service'
import { track } from '@/composables/useAnalytics'
import { PAY_INTENT_KEY } from './usePayphoneBox'
import { booking, resetBooking } from './useBookingState'

/**
 * Confirmación del pago al volver de Payphone. Se dispara apenas carga la
 * página: si no se confirma en 5 minutos, Payphone reversa el cobro.
 * El backend es idempotente, así que recargar esta página no cobra dos veces.
 */

interface PayIntent {
  code: string
  token: string
  mode: 'deposit' | 'full'
  amount: number
  clientTransactionId: string
}

export type ConfirmPhase = 'confirming' | 'approved' | 'canceled' | 'error' | 'missing'

function readIntent(): PayIntent | null {
  try {
    return JSON.parse(sessionStorage.getItem(PAY_INTENT_KEY) || 'null')
  } catch {
    return null
  }
}

/** El evento de compra se manda una sola vez por transacción, aunque recarguen. */
function trackOnce(txId: string, intent: PayIntent | null, code: string) {
  const flag = `ponce_paid_${txId}`
  try {
    if (sessionStorage.getItem(flag)) return
    sessionStorage.setItem(flag, '1')
  } catch {
    /* sin storage se prefiere un evento de más a perderlo */
  }
  const event = intent?.mode === 'full' ? 'full_payment' : 'deposit_payment'
  track(event, { value: (intent?.amount || 0) / 100, currency: 'USD', reservation: code, transaction_id: txId })
}

export function usePaymentConfirm() {
  const phase = ref<ConfirmPhase>('confirming')
  const message = ref('')
  const code = ref('')
  const token = ref('')

  async function confirm(id: string, txId: string) {
    const intent = readIntent()
    code.value = intent?.code || ''
    token.value = intent?.token || ''
    if (!id || !txId) {
      phase.value = 'missing'
      return
    }
    phase.value = 'confirming'
    try {
      const out = await publicService.confirmPayment(id, txId)
      code.value = out.reservationCode || code.value
      token.value = out.accessToken || token.value
      message.value = out.message || ''
      if (out.status === 'approved') {
        trackOnce(txId, intent, code.value)
        if (booking.reservation?.code === code.value) resetBooking()
        phase.value = 'approved'
      } else {
        phase.value = out.status === 'canceled' ? 'canceled' : 'error'
      }
    } catch (e) {
      message.value = (e as { message?: string }).message || ''
      phase.value = 'error'
    }
  }

  /** Reintento: si el asistente aún tiene esta reserva, vuelve al paso de pago; si no, a la reserva. */
  function retryTarget() {
    if (booking.reservation && booking.reservation.code === code.value) return { path: '/reservar', query: { paso: '10' } }
    if (code.value && token.value) return { path: `/reserva/${code.value}`, query: { t: token.value } }
    return { path: '/reservar' }
  }

  return { phase, message, code, token, confirm, retryTarget }
}
