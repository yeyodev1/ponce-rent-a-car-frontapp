import { ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'
import type { AdminReservation } from '@/types/admin'

/** Estado y acciones del detalle de una reserva en el panel. */
export function useReservation(id: string) {
  const toast = useToastStore()
  const reservation = ref<AdminReservation | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<ApiError | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      reservation.value = await adminService.reservation(id)
      document.title = `Reserva ${reservation.value.code} — Ponce's`
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambios que el servidor recalcula (estado → unidad, pagos): se aplica la
   * respuesta y, si no trae el detalle completo, se recarga.
   */
  async function patch(body: Record<string, unknown>, success = 'Reserva actualizada') {
    if (!reservation.value) return false
    saving.value = true
    try {
      const saved = await adminService.patchReservation(id, body)
      if (saved && saved.code) {
        reservation.value = {
          ...reservation.value,
          ...saved,
          documents: reservation.value.documents,
          payments: reservation.value.payments,
          documentFiles: reservation.value.documentFiles,
        }
      }
      if (body.status || body.vehicleId) await load()
      toast.success(success)
      return true
    } catch (e) {
      toast.error((e as ApiError).message)
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * Los documentos son privados y exigen el Bearer: se bajan como blob y se
   * abren en una pestaña. La pestaña se abre antes del await para que el
   * navegador no la bloquee como popup.
   */
  async function openDocument(kind: string) {
    const win = window.open('', '_blank')
    try {
      const blob = await adminService.reservationDocument(id, kind)
      const url = URL.createObjectURL(blob)
      if (win) win.location.href = url
      else window.location.href = url
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (e) {
      win?.close()
      toast.error((e as ApiError).message || 'No se pudo abrir el documento')
    }
  }

  load()

  return { reservation, loading, saving, error, load, patch, openDocument }
}
