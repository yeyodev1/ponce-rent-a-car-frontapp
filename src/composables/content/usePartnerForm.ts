import { ref } from 'vue'
import { t, useI18n } from '@/i18n'
import { publicService } from '@/services/public.service'
import { getAttribution, track } from '@/composables/useAnalytics'
import { compressImage } from '@/utils/compressImage'
import { rules, useForm } from './useForm'

export const MAX_PHOTOS = 5
export const VEHICLE_TYPES = ['sedan', 'hatchback', 'suv', 'pickup', 'van', 'other'] as const

/** Socio sobre Ruedas: datos del propietario + hasta 5 fotos comprimidas en el navegador. */
export function usePartnerForm() {
  const { locale } = useI18n()
  const photos = ref<string[]>([])
  const processing = ref(false)
  const photoError = ref('')
  const code = ref('')
  const maxYear = new Date().getFullYear() + 1

  const f = useForm(
    { name: '', whatsapp: '', city: 'Guayaquil', vehicleType: '', brand: '', model: '', year: '' },
    {
      name: rules.required,
      whatsapp: rules.e164,
      city: rules.required,
      vehicleType: rules.required,
      brand: rules.required,
      model: rules.required,
      year: (v) => {
        const n = Number(v)
        return Number.isInteger(n) && n >= 1990 && n <= maxYear
          ? ''
          : t('content.partner.yearError', { max: maxYear })
      },
    },
    'partner-form',
  )

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    photoError.value = ''
    const room = MAX_PHOTOS - photos.value.length
    const list = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (list.length > room) photoError.value = t('content.partner.photosMax', { n: MAX_PHOTOS })
    processing.value = true
    try {
      for (const file of list.slice(0, room)) photos.value.push(await compressImage(file))
    } catch {
      photoError.value = t('content.partner.photosError')
    } finally {
      processing.value = false
    }
  }

  function removePhoto(i: number) {
    photos.value.splice(i, 1)
    photoError.value = ''
  }

  function onSubmit() {
    return f.submit(async () => {
      const res = await publicService.partner({
        name: f.form.name.trim(),
        whatsapp: f.form.whatsapp,
        city: f.form.city.trim(),
        vehicleType: f.form.vehicleType,
        brand: f.form.brand.trim(),
        model: f.form.model.trim(),
        year: Number(f.form.year),
        photos: photos.value,
        language: locale.value,
      })
      code.value = res.code
      track('lead_form_submit', {
        source: 'partner',
        photos: photos.value.length,
        attribution: getAttribution().utmSource || '',
      })
    })
  }

  function resetAll() {
    f.reset()
    photos.value = []
  }

  return {
    ...f,
    photos,
    processing,
    photoError,
    code,
    addPhotos,
    removePhoto,
    onSubmit,
    resetAll,
    maxYear,
  }
}
