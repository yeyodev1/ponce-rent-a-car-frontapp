import { computed, reactive, ref } from 'vue'
import { contractService } from '@/services/contract.service'
import { useCatalogStore } from '@/stores/catalog'
import { useToastStore } from '@/stores/toast'
import { t } from '@/i18n'
import { track } from '@/composables/useAnalytics'
import type { ApiError } from '@/types'
import type { ContractErrorCode, ContractView } from '@/types/contract'

/**
 * Contrato de alquiler del lado del cliente: leerlo, aceptarlo y saber si es
 * obligatorio antes de pagar. Lo usan el paso Contrato de la Ruta B y la
 * página /reserva/:code.
 */

/** booking.contractRequired de /public/config; si el API no lo manda, se asume obligatorio. */
export const contractRequired = computed(() => {
  const booking = useCatalogStore().config?.booking as { contractRequired?: boolean } | undefined
  return booking?.contractRequired !== false
})

/** El checkout respondió contract_required: la vista de la reserva lleva al paso Contrato. */
export const contractNeeded = ref(false)

export function isContractRequiredError(e: unknown): boolean {
  return ((e as ApiError)?.data as { errorCode?: string } | undefined)?.errorCode === 'contract_required'
}

export function useContract(getCode: () => string, getToken: () => string) {
  const toast = useToastStore()
  const contract = ref<ContractView | null>(null)
  const loading = ref(false)
  const loadError = ref('')
  const submitting = ref(false)
  const form = reactive({ checked: false, name: '', documentNumber: '' })
  const errors = reactive<{ name: string; documentNumber: string; checked: string }>({
    name: '',
    documentNumber: '',
    checked: '',
  })

  const signed = computed(() => contract.value?.status === 'signed')
  const pdfUrl = computed(() => (getCode() && getToken() ? contractService.pdfUrl(getCode(), getToken()) : ''))

  async function load() {
    if (!getCode() || !getToken()) return
    loading.value = true
    loadError.value = ''
    try {
      contract.value = await contractService.publicContract(getCode(), getToken())
    } catch (e) {
      loadError.value = (e as ApiError).message || t('booking.contract.loadError')
    } finally {
      loading.value = false
    }
  }

  function validate(): boolean {
    errors.name = form.name.trim().length >= 3 ? '' : t('booking.contract.missingName')
    errors.documentNumber = form.documentNumber.trim() ? '' : t('booking.contract.missingDoc')
    errors.checked = form.checked ? '' : t('booking.contract.errors.not_accepted')
    return !errors.name && !errors.documentNumber && !errors.checked
  }

  /** Devuelve true si quedó aceptado. Los errores del API se muestran en el campo que corresponde. */
  async function accept(): Promise<boolean> {
    if (!validate() || submitting.value) return false
    submitting.value = true
    try {
      contract.value = await contractService.accept(getCode(), getToken(), {
        name: form.name.trim(),
        documentNumber: form.documentNumber.trim(),
        accepted: true,
      })
      track('contract_accept', { reservation: getCode(), version: contract.value.version })
      toast.success(t('booking.contract.accepted'))
      return true
    } catch (e) {
      const err = e as ApiError
      const code = (err.data as { errorCode?: ContractErrorCode } | undefined)?.errorCode
      if (code === 'name_mismatch') errors.name = t('booking.contract.errors.name_mismatch')
      else if (code === 'document_mismatch') errors.documentNumber = t('booking.contract.errors.document_mismatch')
      else if (code === 'not_accepted') errors.checked = t('booking.contract.errors.not_accepted')
      else toast.error(code ? t(`booking.contract.errors.${code}`) : err.message || t('common.errors.generic'))
      return false
    } finally {
      submitting.value = false
    }
  }

  return { contract, loading, loadError, submitting, form, errors, signed, pdfUrl, load, accept }
}
