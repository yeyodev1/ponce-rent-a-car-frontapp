import { ref } from 'vue'
import { opsService } from '@/services/ops.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { voidCopy as t } from '@/config/admin/ops'
import type { ApiError } from '@/types'
import type { Payment } from '@/types/admin'

const STAFF_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Anular un pago manual registrado por error. El empleado puede dentro de las
 * 24 h del registro; después solo el admin (el servidor lo vuelve a validar).
 */
export function usePaymentVoid(onDone: (payment: Payment) => void | Promise<void>) {
  const toast = useToastStore()
  const userStore = useUserStore()
  const target = ref<Payment | null>(null)
  const reason = ref('')
  const error = ref('')
  const saving = ref(false)

  function canVoid(p: Payment): boolean {
    if (p.provider !== 'manual' || p.status !== 'approved') return false
    if (userStore.isAdmin) return true
    return Date.now() - new Date(p.approvedAt || p.createdAt).getTime() < STAFF_WINDOW_MS
  }

  function ask(p: Payment) {
    target.value = p
    reason.value = ''
    error.value = ''
  }

  function cancel() {
    target.value = null
  }

  async function confirm() {
    const p = target.value
    if (!p) return
    if (reason.value.trim().length < 3) {
      error.value = t.reasonRequired
      return
    }
    saving.value = true
    try {
      const saved = await opsService.voidPayment(p._id, reason.value.trim())
      target.value = null
      toast.success(t.done)
      await onDone(saved)
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  return { target, reason, error, saving, canVoid, ask, cancel, confirm }
}
