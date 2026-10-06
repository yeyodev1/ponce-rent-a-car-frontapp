import APIBase from './httpBase'
import type { Payment } from '@/types/admin'
import type {
  Guarantee,
  GuaranteeInput,
  Inspection,
  InspectionComparison,
  InspectionInput,
  InspectionsResponse,
  VehicleHistory,
  VehicleLogInput,
} from '@/types/ops'

/** Operación diaria del panel (v1.3): actas, garantía, anulaciones e historial de unidades. */
class OpsService extends APIBase {
  async inspections(reservationId: string) {
    return (await this.get<InspectionsResponse>(`admin/reservations/${reservationId}/inspections`))
      .data
  }
  async createInspection(reservationId: string, body: InspectionInput) {
    const { data } = await this.post<{
      inspection: Inspection
      comparison: InspectionComparison | null
    }>(`admin/reservations/${reservationId}/inspections`, body)
    return data
  }
  /** Corrección de un acta (solo admin). */
  async updateInspection(reservationId: string, body: InspectionInput) {
    const { data } = await this.put<{
      inspection: Inspection
      comparison: InspectionComparison | null
    }>(`admin/reservations/${reservationId}/inspections/${body.type}`, body)
    return data
  }

  async guarantee(reservationId: string, body: GuaranteeInput) {
    return (
      await this.patch<{ code: string; guarantee: Guarantee }>(
        `admin/reservations/${reservationId}/guarantee`,
        body,
      )
    ).data
  }

  async voidPayment(paymentId: string, reason: string) {
    return (await this.post<Payment>(`admin/payments/${paymentId}/void`, { reason })).data
  }

  async vehicleHistory(vehicleId: string) {
    return (await this.get<VehicleHistory>(`admin/vehicles/${vehicleId}/history`)).data
  }
  async addLog(vehicleId: string, body: VehicleLogInput) {
    return (await this.post<unknown>(`admin/vehicles/${vehicleId}/logs`, body)).data
  }
  async deleteLog(vehicleId: string, logId: string) {
    await this.delete<void>(`admin/vehicles/${vehicleId}/logs/${logId}`)
  }
}

export const opsService = new OpsService()
