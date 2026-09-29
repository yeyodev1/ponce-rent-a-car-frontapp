import { computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { site, whatsappLink } from '@/config/site'
import { useI18n } from '@/i18n'
import { track } from '@/composables/useAnalytics'

/**
 * Datos de contacto del negocio: manda lo que el dueño editó en el panel y,
 * si el API no respondió, cae a los datos fijos de la marca.
 */
export function useBusiness() {
  const catalog = useCatalogStore()
  const { tx } = useI18n()
  catalog.load()

  const b = computed(() => catalog.config?.business)

  const phone = computed(() => b.value?.phone || site.phone)
  const whatsapp = computed(() => (b.value?.whatsapp || site.whatsapp).replace(/\D/g, ''))
  const phoneDisplay = computed(() =>
    b.value?.phone ? prettyPhone(b.value.phone) : site.phoneDisplay,
  )
  const email = computed(() => b.value?.email || site.email)
  const address = computed(() => b.value?.address || '')
  const mapsUrl = computed(() => b.value?.mapsUrl || '')
  const hours = computed(() => tx(b.value?.hours))
  const social = computed(() => ({
    instagram: b.value?.instagram || site.social.instagram,
    facebook: b.value?.facebook || site.social.facebook,
    tiktok: b.value?.tiktok || site.social.tiktok,
  }))
  const mileage = computed(() => catalog.config?.booking.mileage)
  const guaranteeAmount = computed(() => catalog.config?.booking.guaranteeAmount || 0)

  function waLink(message = '') {
    const text = message ? `?text=${encodeURIComponent(message)}` : ''
    return whatsapp.value ? `https://wa.me/${whatsapp.value}${text}` : whatsappLink(message)
  }

  function onCall(source: string) {
    track('call_click', { source })
  }

  function onWhatsapp(source: string) {
    track('whatsapp_open', { source })
  }

  return {
    phone,
    phoneDisplay,
    whatsapp,
    email,
    address,
    mapsUrl,
    hours,
    social,
    mileage,
    guaranteeAmount,
    waLink,
    onCall,
    onWhatsapp,
  }
}

/** "+593998119853" → "+593 99 811 9853" (formato de celular ecuatoriano). */
function prettyPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.startsWith('593') && d.length === 12)
    return `+593 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
  return raw
}
