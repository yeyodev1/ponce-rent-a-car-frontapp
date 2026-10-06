import { computed, ref } from 'vue'
import { opsService } from '@/services/ops.service'
import { useToastStore } from '@/stores/toast'
import { guaranteeCopy as t } from '@/config/admin/ops'
import type { ApiError } from '@/types'
import type { AdminReservation } from '@/types/admin'
import type { Guarantee, GuaranteeAction, GuaranteeInput, GuaranteeMethod } from '@/types/ops'

/** Garantía física de una reserva: retener, liberar o cobrar (solo admin). */
export function useGuarantee(getReservation: () => AdminReservation, onSaved: () => void) {
  const toast = useToastStore()
  const mode = ref<GuaranteeAction | null>(null)
  const saving = ref(false)
  const error = ref('')
  const local = ref<Guarantee | null>(null)

  const guarantee = computed<Guarantee>(() => {
    const r = getReservation() as AdminReservation & { guarantee?: Partial<Guarantee> }
    const g = local.value || r.guarantee || {}
    return {
      status: g.status || 'pending',
      // Reservas anteriores a v1.3 no traen el monto: se muestra el de la tarifa congelada.
      amount: g.amount || r.pricing?.guaranteeAmount || 0,
      method: g.method || '',
      reference: g.reference || '',
      chargedAmount: g.chargedAmount || 0,
      chargeReason: g.chargeReason || '',
      heldAt: g.heldAt || null,
      settledAt: g.settledAt || null,
      notes: g.notes || '',
      updatedBy: g.updatedBy || null,
    }
  })

  const form = ref({
    amount: 0,
    method: 'datafast' as GuaranteeMethod,
    reference: '',
    chargedAmount: 0,
    chargeReason: '',
    notes: '',
  })

  function openMode(next: GuaranteeAction) {
    error.value = ''
    const g = guarantee.value
    form.value = {
      amount: g.amount,
      method: 'datafast',
      reference: '',
      chargedAmount: g.amount,
      chargeReason: '',
      notes: g.notes,
    }
    mode.value = next
  }

  async function send(body: GuaranteeInput) {
    saving.value = true
    try {
      const res = await opsService.guarantee(getReservation()._id, body)
      local.value = res.guarantee
      mode.value = null
      toast.success(t.saved)
      onSaved()
    } catch (e) {
      toast.error((e as ApiError).message)
    } finally {
      saving.value = false
    }
  }

  function submit() {
    error.value = ''
    const f = form.value
    if (mode.value === 'hold') {
      if (!f.amount || f.amount <= 0) return void (error.value = t.invalidAmount)
      return send({
        action: 'hold',
        amount: f.amount,
        method: f.method,
        reference: f.reference.trim(),
        notes: f.notes.trim(),
      })
    }
    if (mode.value === 'charge') {
      if (!f.chargedAmount || f.chargedAmount <= 0) return void (error.value = t.invalidAmount)
      if (f.chargedAmount > guarantee.value.amount) return void (error.value = t.tooMuch)
      if (!f.chargeReason.trim()) return void (error.value = t.reasonRequired)
      return send({
        action: 'charge',
        chargedAmount: f.chargedAmount,
        chargeReason: f.chargeReason.trim(),
        notes: f.notes.trim(),
      })
    }
  }

  const release = () => send({ action: 'release' })

  return { guarantee, mode, form, saving, error, openMode, submit, release }
}
