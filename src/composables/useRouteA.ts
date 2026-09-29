import { computed, reactive, ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import { resolveApiBaseUrl } from '@/services/httpBase'
import { getAttribution, track } from '@/composables/useAnalytics'
import { phoneLink, whatsappLink } from '@/config/site'
import { t, useI18n } from '@/i18n'
import { formatDate } from '@/utils/format'
import type { ApiError, DurationBucket, LeadChannel, LeadInput, LocationCode, PassengersBucket } from '@/types'

/**
 * Ruta A — "Ayúdame a elegir". Tres preguntas y la elección de canal.
 *
 * El estado vive a nivel de módulo (sobrevive al ir y volver entre pasos) y se
 * copia en sessionStorage: si el visitante recarga o vuelve de WhatsApp, sus
 * respuestas siguen ahí. El lead se guarda ANTES de abrir cualquier canal, para
 * que el asesor lo encuentre con el código aunque la persona no escriba nada.
 */

const { locale } = useI18n()
const STORAGE_KEY = 'ponce_route_a'
export const ROUTE_A_TOTAL = 4

interface Answers {
  startDate: string
  startTime: string
  duration: DurationBucket | ''
  location: LocationCode | ''
  passengers: PassengersBucket | ''
  categorySlug: string
  promo: string
}

interface LeadState {
  leadId: string
  code: string
  whatsappUrl: string
  phoneUrl: string
  eventId: string
  channel: LeadChannel | ''
  callbackDone: boolean
}

const emptyAnswers = (): Answers => ({
  startDate: '',
  startTime: '',
  duration: '',
  location: '',
  passengers: '',
  categorySlug: '',
  promo: '',
})

const emptyLead = (): LeadState => ({
  leadId: '',
  code: '',
  whatsappUrl: '',
  phoneUrl: '',
  eventId: '',
  channel: '',
  callbackDone: false,
})

function restore(): { answers: Answers; lead: LeadState } {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
    return { answers: { ...emptyAnswers(), ...raw.answers }, lead: { ...emptyLead(), ...raw.lead } }
  } catch {
    return { answers: emptyAnswers(), lead: emptyLead() }
  }
}

const initial = restore()
const answers = reactive<Answers>(initial.answers)
const lead = reactive<LeadState>(initial.lead)
const saving = ref(false)
const saveError = ref('')

watch(
  [answers, lead],
  () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, lead }))
    } catch {
      /* modo privado: se pierde la persistencia, no el flujo */
    }
  },
  { deep: true },
)

const whenDone = computed(() => Boolean(answers.startDate && answers.startTime && answers.duration))

/** Paso más avanzado al que se puede entrar con lo que ya se respondió. */
const maxStep = computed(() => {
  if (!whenDone.value) return 1
  if (!answers.location) return 2
  if (!answers.passengers || !lead.leadId) return 3
  return 4
})

function payload(extra: Partial<LeadInput> = {}): LeadInput {
  return {
    leadId: lead.leadId || null,
    source: 'route_a',
    language: locale.value,
    startDate: answers.startDate || undefined,
    startTime: answers.startTime || undefined,
    duration: answers.duration || undefined,
    location: answers.location || undefined,
    passengers: answers.passengers || undefined,
    categorySlug: answers.categorySlug || undefined,
    comments: answers.promo ? `Promo: ${answers.promo}` : undefined,
    attribution: getAttribution(),
    ...extra,
  }
}

/** Mensaje armado en el front: solo si el API no respondió (último recurso). */
function buildMessage(): string {
  const parts = [t('routeA.message.intro')]
  if (lead.code) parts.push(t('routeA.message.code', { code: lead.code }))
  if (answers.startDate) {
    const date = formatDate(`${answers.startDate}T12:00:00-05:00`, { weekday: 'short' })
    parts.push(t('routeA.message.date', { date, time: answers.startTime }))
  }
  if (answers.duration) parts.push(t('routeA.message.duration', { duration: t(`common.durations.${answers.duration}`) }))
  if (answers.location) parts.push(t('routeA.message.location', { location: t(`common.locations.${answers.location}`) }))
  if (answers.passengers) {
    parts.push(t('routeA.message.passengers', { passengers: t(`common.passengers.${answers.passengers}`) }))
  }
  if (answers.categorySlug) parts.push(t('routeA.message.category', { category: answers.categorySlug }))
  return parts.join(' ')
}

/** Guarda (o actualiza) el lead con las tres respuestas. */
async function complete(): Promise<boolean> {
  if (saving.value) return false
  saving.value = true
  saveError.value = ''
  // Un solo eventId por lead: GA4/Pixel y Conversions API deduplican con él.
  if (!lead.eventId) {
    lead.eventId = track('route_a_complete', {
      duration: answers.duration,
      location: answers.location,
      passengers: answers.passengers,
    })
  }
  try {
    const body: LeadInput & { eventId: string } = { ...payload(), eventId: lead.eventId }
    const res = await publicService.saveLead(body)
    lead.leadId = res._id
    lead.code = res.code
    lead.whatsappUrl = res.whatsappUrl
    lead.phoneUrl = res.phoneUrl
    return true
  } catch (e) {
    saveError.value = (e as ApiError).message || t('common.errors.generic')
    return false
  } finally {
    saving.value = false
  }
}

/**
 * Marca el canal en el lead sin bloquear la salida. keepalive deja que la
 * petición termine aunque el navegador ya esté abriendo WhatsApp.
 */
function markChannel(channel: LeadChannel) {
  lead.channel = channel
  if (!lead.leadId) return
  try {
    fetch(`${resolveApiBaseUrl()}/public/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload({ channel })),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* sin fetch: el lead ya está guardado, solo se pierde el canal */
  }
}

function isTouchDevice() {
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return iOS || window.matchMedia('(pointer: coarse)').matches
}

function openUrl(url: string) {
  // En móvil (sobre todo iOS) un popup se bloquea: se navega directo y el
  // sistema abre la app de WhatsApp.
  if (isTouchDevice()) {
    window.location.href = url
    return
  }
  const win = window.open(url, '_blank')
  if (win) win.opener = null
  else window.location.href = url
}

function openWhatsapp() {
  markChannel('whatsapp')
  track('whatsapp_open', { from: 'route_a', code: lead.code })
  openUrl(lead.whatsappUrl || whatsappLink(buildMessage()))
}

function callNow() {
  markChannel('call')
  track('call_click', { from: 'route_a', code: lead.code })
  window.location.href = lead.phoneUrl || phoneLink
}

/** Último recurso cuando el lead no se pudo guardar. */
function fallbackWhatsapp() {
  track('whatsapp_open', { from: 'route_a_fallback' })
  openUrl(whatsappLink(buildMessage()))
}

async function requestCallback(name: string, phone: string): Promise<string> {
  try {
    await publicService.saveLead(payload({ channel: 'callback', name, phone }))
    lead.channel = 'callback'
    lead.callbackDone = true
    track('callback_request', { from: 'route_a', code: lead.code })
    return ''
  } catch (e) {
    return (e as ApiError).message || t('common.errors.generic')
  }
}

function setEntry(categorySlug: string, promo: string) {
  if (categorySlug) answers.categorySlug = categorySlug
  if (promo) answers.promo = promo
}

function reset() {
  Object.assign(answers, emptyAnswers())
  Object.assign(lead, emptyLead())
  saveError.value = ''
}

export function useRouteA() {
  return {
    answers,
    lead,
    saving,
    saveError,
    whenDone,
    maxStep,
    complete,
    openWhatsapp,
    callNow,
    fallbackWhatsapp,
    requestCallback,
    buildMessage,
    setEntry,
    reset,
  }
}
