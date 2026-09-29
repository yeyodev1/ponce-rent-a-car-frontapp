import { site } from '@/config/site'
import type { Attribution } from '@/types'

/**
 * GA4 + Meta Pixel desde el lanzamiento. Cada evento lleva un eventId que el
 * backend reenvía a Conversions API para que Meta lo deduplique.
 *
 * Eventos del brief: route_a_start, route_a_complete, whatsapp_open, call_click,
 * callback_request, route_b_start, category_select, mileage_select,
 * coverage_select, extras_select, documents_upload, verification_submit,
 * reservation_created, deposit_payment, full_payment.
 */

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] }
  }
}

const ATTR_KEY = 'ponce_attr'

// Eventos de Meta estándar a los que se mapean los nuestros.
const META_STANDARD: Record<string, string> = {
  route_a_complete: 'Lead',
  whatsapp_open: 'Contact',
  call_click: 'Contact',
  callback_request: 'Lead',
  route_b_start: 'ViewContent',
  reservation_created: 'InitiateCheckout',
  deposit_payment: 'Purchase',
  full_payment: 'Purchase',
}

let loaded = false

export function loadAnalytics() {
  if (loaded) return
  loaded = true

  if (site.analytics.ga4) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${site.analytics.ga4}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', site.analytics.ga4, { send_page_view: false })
  }

  if (site.analytics.metaPixel) {
    /* Snippet oficial del Pixel, reescrito sin minificar. */
    const fbq = function (...args: unknown[]) {
      const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }
      if (f.callMethod) f.callMethod(...args)
      else f.queue.push(args)
    } as Window['fbq'] & { queue: unknown[]; loaded: boolean; version: string; push: unknown }
    fbq!.queue = []
    fbq!.loaded = true
    fbq!.version = '2.0'
    window.fbq = fbq
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(s)
    window.fbq!('init', site.analytics.metaPixel)
  }
}

export function newEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function trackPageView(path: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href })
  window.fbq?.('track', 'PageView')
}

export function track(event: string, params: Record<string, unknown> = {}, eventId = newEventId()) {
  window.gtag?.('event', event, params)
  const standard = META_STANDARD[event]
  if (standard) window.fbq?.('track', standard, params, { eventID: eventId })
  else window.fbq?.('trackCustom', event, params, { eventID: eventId })
  return eventId
}

/**
 * Primer toque: se guarda la campaña con la que llegó el visitante para
 * saber después qué fuente genera reservas, no solo clics.
 */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search)
    const hasCampaign = ['utm_source', 'fbclid', 'gclid'].some((k) => params.get(k))
    if (!hasCampaign && localStorage.getItem(ATTR_KEY)) return
    const attr: Attribution = {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
      utmContent: params.get('utm_content') || '',
      utmTerm: params.get('utm_term') || '',
      fbclid: params.get('fbclid') || '',
      gclid: params.get('gclid') || '',
      referrer: document.referrer || '',
      landingPage: window.location.pathname,
    }
    localStorage.setItem(ATTR_KEY, JSON.stringify(attr))
  } catch {
    /* sin storage: se pierde la atribución, no el lead */
  }
}

export function getAttribution(): Partial<Attribution> {
  try {
    return JSON.parse(localStorage.getItem(ATTR_KEY) || '{}')
  } catch {
    return {}
  }
}
