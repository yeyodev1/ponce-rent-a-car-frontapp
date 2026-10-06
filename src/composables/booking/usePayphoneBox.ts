import { nextTick, ref } from 'vue'
import { publicService } from '@/services/public.service'
import { track } from '@/composables/useAnalytics'
import type { CheckoutConfig } from '@/types'
import { contractNeeded, isContractRequiredError } from './useContract'

/**
 * Cajita de Pagos de Payphone (v2.0). Los recursos se cargan una sola vez y
 * solo cuando el cliente decide pagar: no pesan en el resto del sitio.
 * El formulario vence a los 10 min; entonces se pide un intento nuevo
 * (otro clientTransactionId) en vez de reutilizar el vencido.
 */

const CSS = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css'
const JS = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js'
const TTL_MS = 10 * 60 * 1000
export const PAY_INTENT_KEY = 'ponce_pay_intent'

let loader: Promise<void> | null = null

// env.d.ts es un módulo (importa vue-router), así que su `declare class` no llega
// al ámbito global: se toma de window, que es donde el script de Payphone lo deja.
type BoxCtor = new (config: Record<string, unknown>) => { render(containerId: string): void }
function boxCtor(): BoxCtor {
  const ctor = (window as unknown as { PPaymentButtonBox?: BoxCtor }).PPaymentButtonBox
  if (!ctor) throw new Error('payphone')
  return ctor
}

export function loadPayphone(): Promise<void> {
  if (loader) return loader
  loader = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = JS
    script.onload = () => resolve()
    script.onerror = () => {
      script.remove()
      loader = null
      reject(new Error('payphone'))
    }
    document.head.appendChild(script)
  })
  return loader
}

export type BoxStatus = 'idle' | 'loading' | 'ready' | 'error' | 'expired'

export function usePayphoneBox(containerId = 'pp-button') {
  const status = ref<BoxStatus>('idle')
  const error = ref('')
  const config = ref<CheckoutConfig | null>(null)
  const expiresAt = ref<string | null>(null)

  async function start(code: string, token: string, mode: 'deposit' | 'full', lang: 'es' | 'en') {
    status.value = 'loading'
    error.value = ''
    try {
      const [cfg] = await Promise.all([publicService.checkout(code, token, mode), loadPayphone()])
      config.value = cfg
      sessionStorage.setItem(
        PAY_INTENT_KEY,
        JSON.stringify({ code, token, mode, amount: cfg.amount, clientTransactionId: cfg.clientTransactionId }),
      )
      status.value = 'ready'
      await nextTick()
      const el = document.getElementById(containerId)
      if (el) el.innerHTML = ''
      const Box = boxCtor()
      new Box({ ...cfg, lang, defaultMethod: 'card', timeZone: -5 }).render(containerId)
      expiresAt.value = new Date(Date.now() + TTL_MS).toISOString()
      track('payment_start', { mode, value: cfg.amount / 100, currency: 'USD', reservation: code })
    } catch (e) {
      status.value = 'error'
      error.value = (e as { message?: string }).message || ''
      // Contrato obligatorio sin aceptar: la vista lleva al cliente al paso Contrato.
      if (isContractRequiredError(e)) contractNeeded.value = true
    }
  }

  function expire() {
    status.value = 'expired'
    expiresAt.value = null
    const el = document.getElementById(containerId)
    if (el) el.innerHTML = ''
  }

  return { status, error, config, expiresAt, start, expire }
}
