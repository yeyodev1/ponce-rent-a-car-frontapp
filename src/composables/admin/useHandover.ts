import { computed, ref } from 'vue'
import { opsService } from '@/services/ops.service'
import { useToastStore } from '@/stores/toast'
import { uploadPublicImage } from '@/composables/admin/useImageUpload'
import { handoverCopy as t, photoLabels } from '@/config/admin/ops'
import type { ApiError } from '@/types'
import type { AdminReservation } from '@/types/admin'
import type {
  ChecklistKey,
  DamageZone,
  Inspection,
  InspectionComparison,
  InspectionInput,
  InspectionsResponse,
  InspectionType,
} from '@/types/ops'

const emptyChecklist = (): Record<ChecklistKey, boolean> => ({
  spareTire: false,
  jack: false,
  documents: false,
  cleanInterior: false,
  cleanExterior: false,
  accessories: false,
})

function blankForm(type: InspectionType, km: number, fuel = 8): InspectionInput {
  return {
    type,
    mileageKm: km,
    fuelLevel: fuel,
    photos: [],
    damages: [],
    checklist: emptyChecklist(),
    notes: '',
    customerAgreedName: '',
  }
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/**
 * Actas de entrega y devolución de una reserva: carga lo hecho, arma el
 * formulario por pasos, sube las fotos y guarda (el servidor avanza el estado).
 */
export function useHandover(getReservation: () => AdminReservation, onSaved?: () => void) {
  const toast = useToastStore()
  const data = ref<InspectionsResponse | null>(null)
  const loading = ref(true)
  const open = ref(false)
  const fixing = ref(false)
  const step = ref(0)
  const saving = ref(false)
  const uploading = ref(0)
  const form = ref<InspectionInput>(blankForm('delivery', 0))
  const lastComparison = ref<InspectionComparison | null>(null)

  const id = () => getReservation()._id
  const delivery = computed(() => data.value?.delivery || null)

  async function load() {
    loading.value = true
    try {
      data.value = await opsService.inspections(id())
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      loading.value = false
    }
  }

  function start(type: InspectionType) {
    fixing.value = false
    const km =
      type === 'return' ? delivery.value?.mileageKm || 0 : data.value?.vehicle?.mileageKm || 0
    form.value = blankForm(type, km, type === 'return' ? (delivery.value?.fuelLevel ?? 8) : 8)
    // La devolución arranca con el mismo checklist que se entregó: se desmarca lo que falte.
    if (type === 'return' && delivery.value) form.value.checklist = { ...delivery.value.checklist }
    step.value = 0
    open.value = true
  }

  function startFix(insp: Inspection) {
    fixing.value = true
    const { type, mileageKm, fuelLevel, photos, damages, checklist, notes, customerAgreedName } =
      clone(insp)
    form.value = {
      type,
      mileageKm,
      fuelLevel,
      photos,
      damages,
      checklist: { ...emptyChecklist(), ...checklist },
      notes,
      customerAgreedName,
    }
    step.value = 0
    open.value = true
  }

  /** Etiqueta sugerida: la primera de la lista que todavía no tiene foto. */
  function nextLabel() {
    const used = new Set(form.value.photos.map((p) => p.label))
    return photoLabels.find((l) => !used.has(l)) || ''
  }

  async function addPhotos(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      uploading.value++
      try {
        const url = await uploadPublicImage(file)
        form.value.photos.push({ url, label: nextLabel() })
      } catch (e) {
        toast.error((e as ApiError).message || 'No se pudo subir la foto')
      } finally {
        uploading.value--
      }
    }
  }

  async function uploadOne(file: File): Promise<string> {
    uploading.value++
    try {
      return await uploadPublicImage(file)
    } catch (e) {
      toast.error((e as ApiError).message || 'No se pudo subir la foto')
      return ''
    } finally {
      uploading.value--
    }
  }

  function addDamage(zone: DamageZone) {
    form.value.damages.push({ zone, description: '', severity: 'minor', photo: '', isNew: false })
  }

  /** Vista previa de la comparación mientras se llena la devolución. */
  const preview = computed<InspectionComparison | null>(() => {
    const d = delivery.value
    if (form.value.type !== 'return' || !d) return null
    const p = getReservation().pricing
    const kmDriven = Math.max((form.value.mileageKm || 0) - d.mileageKm, 0)
    const includedKm = p?.includedKm ?? null
    const extraKm = includedKm === null ? 0 : Math.max(kmDriven - includedKm, 0)
    const zones = new Set(d.damages.map((x) => x.zone))
    return {
      kmDriven,
      includedKm,
      extraKm,
      extraKmCharge: extraKm * (p?.extraKmPrice || 0),
      fuelDiff: form.value.fuelLevel - d.fuelLevel,
      newDamages: form.value.damages.filter((x) => x.isNew || !zones.has(x.zone)).length,
    }
  })

  const kmError = computed(() =>
    form.value.type === 'return' &&
    delivery.value &&
    form.value.mileageKm < delivery.value.mileageKm
      ? t.kmBelow
      : '',
  )

  async function submit(): Promise<boolean> {
    if (kmError.value) {
      step.value = 0
      toast.error(kmError.value)
      return false
    }
    saving.value = true
    try {
      const body = clone(form.value)
      const res = fixing.value
        ? await opsService.updateInspection(id(), body)
        : await opsService.createInspection(id(), body)
      lastComparison.value = res.comparison
      toast.success(
        fixing.value ? t.savedFix : body.type === 'delivery' ? t.savedDelivery : t.savedReturn,
      )
      open.value = false
      await load()
      onSaved?.()
      return true
    } catch (e) {
      toast.error((e as ApiError).message)
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    data,
    loading,
    open,
    fixing,
    step,
    saving,
    uploading,
    form,
    delivery,
    preview,
    kmError,
    lastComparison,
    load,
    start,
    startFix,
    addPhotos,
    uploadOne,
    addDamage,
    submit,
  }
}

export type HandoverState = ReturnType<typeof useHandover>
