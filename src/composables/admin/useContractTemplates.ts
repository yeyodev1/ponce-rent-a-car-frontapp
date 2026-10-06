import { computed, reactive, ref } from 'vue'
import { contractService } from '@/services/contract.service'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { contractCopy } from '@/config/admin/contract'
import type { ApiError } from '@/types'
import type { AdminReservation } from '@/types/admin'
import type { ContractTemplate, ContractVariable } from '@/types/contract'

type Lang = 'es' | 'en'

/**
 * Editor de la plantilla del contrato: carga versiones y variables, guarda
 * como versión nueva y arma la vista previa con una reserva real.
 */
export function useContractTemplates() {
  const toast = useToastStore()
  const c = contractCopy.templates

  const templates = ref<ContractTemplate[]>([])
  const variables = ref<ContractVariable[]>([])
  const reservations = ref<AdminReservation[]>([])
  const loading = ref(true)
  const error = ref<ApiError | null>(null)
  const saving = ref(false)
  const lang = ref<Lang>('es')
  const draft = reactive({ title: { es: '', en: '' }, body: { es: '', en: '' } })

  const active = computed(() => templates.value.find((t) => t.isActive) || templates.value[0] || null)
  const dirty = computed(() => {
    const a = active.value
    if (!a) return Boolean(draft.title.es || draft.body.es)
    return (['es', 'en'] as Lang[]).some((l) => a.title[l] !== draft.title[l] || a.body[l] !== draft.body[l])
  })

  function fillDraft() {
    const a = active.value
    draft.title.es = a?.title.es || ''
    draft.title.en = a?.title.en || ''
    draft.body.es = a?.body.es || ''
    draft.body.en = a?.body.en || ''
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const [list, vars] = await Promise.all([contractService.templates(), contractService.variables()])
      templates.value = list
      variables.value = vars
      fillDraft()
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
    // Las reservas para la vista previa no bloquean el editor si fallan.
    adminService
      .list<AdminReservation>('reservations', { limit: 30 })
      .then((r) => (reservations.value = r.items))
      .catch(() => {})
  }

  async function save() {
    if (!dirty.value) {
      toast.info(c.noChanges)
      return false
    }
    saving.value = true
    try {
      const created = await contractService.createTemplate({ title: { ...draft.title }, body: { ...draft.body } })
      templates.value = [created, ...templates.value.map((t) => ({ ...t, isActive: false }))]
      fillDraft()
      toast.success(c.saved(created.version))
      return true
    } catch (e) {
      toast.error((e as ApiError).message)
      return false
    } finally {
      saving.value = false
    }
  }

  // ─── Vista previa ───
  const previewReservation = ref('')
  const previewLang = ref<Lang>('es')
  const preview = ref<{ title: string; text: string } | null>(null)
  const previewing = ref(false)

  async function runPreview() {
    previewing.value = true
    try {
      preview.value = await contractService.preview({
        title: draft.title[previewLang.value] || draft.title.es,
        body: draft.body[previewLang.value] || draft.body.es,
        reservationId: previewReservation.value || undefined,
        language: previewLang.value,
      })
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      previewing.value = false
    }
  }

  return {
    templates,
    variables,
    reservations,
    loading,
    error,
    saving,
    lang,
    draft,
    active,
    dirty,
    load,
    save,
    previewReservation,
    previewLang,
    preview,
    previewing,
    runPreview,
  }
}
