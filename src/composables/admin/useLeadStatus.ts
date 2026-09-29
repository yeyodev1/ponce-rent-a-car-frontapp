import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { leadStatuses } from '@/config/admin'
import type { ApiError, LeadStatus } from '@/types'
import type { Lead } from '@/types/admin'

/**
 * Mover un lead de estado con guardado optimista: la tarjeta cambia de
 * columna al instante y vuelve atrás si el API rechaza el cambio.
 */
export function useLeadStatus(apply: (id: string, patch: Partial<Lead>) => void) {
  const toast = useToastStore()

  async function move(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return
    const prev = lead.status
    apply(lead._id, { status })
    try {
      await adminService.patchLead(lead._id, { status })
      toast.success(`${lead.code} → ${leadStatuses[status]?.label || status}`)
    } catch (e) {
      apply(lead._id, { status: prev })
      toast.error((e as ApiError).message)
    }
  }

  return { move }
}
