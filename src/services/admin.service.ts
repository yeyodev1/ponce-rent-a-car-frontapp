import APIBase from './httpBase'
import type { Paginated, PublicConfig, SeoPage } from '@/types'
import type {
  AdminReservation,
  AvailabilityRow,
  CustomerDetail,
  CustomerPatch,
  Dashboard,
  ExportEntity,
  Lead,
  ListParams,
  Payment,
  PaymentMethod,
  Settings,
  StaffInput,
  StaffMember,
  Vehicle,
  VehicleStatus,
  WalkInInput,
} from '@/types/admin'

function query(params: ListParams = {}): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

/** Algunas colecciones chicas llegan como arreglo; el panel siempre trabaja paginado. */
function toPaginated<T>(data: Paginated<T> | T[]): Paginated<T> {
  if (Array.isArray(data)) return { items: data, total: data.length, page: 1, pages: 1 }
  return {
    items: data.items || [],
    total: data.total ?? data.items?.length ?? 0,
    page: data.page || 1,
    pages: data.pages || 1,
  }
}

type Raw = Record<string, unknown>

/** El detalle puede venir plano o envuelto ({ reservation, payments, documents }). */
function unwrap<T>(data: Raw, key: string): T & Raw {
  const inner = data[key]
  if (inner && typeof inner === 'object' && !Array.isArray(inner) && '_id' in (inner as Raw)) {
    return { ...data, ...(inner as Raw) } as T & Raw
  }
  return data as T & Raw
}

class AdminService extends APIBase {
  // ─── CRUD genérico ─────────────────────────────────────────────────────
  async list<T>(resource: string, params: ListParams = {}) {
    const { data } = await this.get<Paginated<T> | T[]>(`admin/${resource}${query(params)}`)
    return toPaginated(data)
  }
  async one<T>(resource: string, id: string) {
    return (await this.get<T>(`admin/${resource}/${id}`)).data
  }
  async create<T>(resource: string, body: unknown) {
    return (await this.post<T>(`admin/${resource}`, body)).data
  }
  async update<T>(resource: string, id: string, body: unknown) {
    return (await this.put<T>(`admin/${resource}/${id}`, body)).data
  }
  async remove(resource: string, id: string) {
    await this.delete(`admin/${resource}/${id}`)
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────
  async dashboard() {
    return (await this.get<Dashboard>('admin/dashboard')).data
  }

  // ─── Leads ─────────────────────────────────────────────────────────────
  async lead(id: string) {
    const { data } = await this.get<Raw>(`admin/leads/${id}`)
    return unwrap<Lead>(data, 'lead') as Lead
  }
  async patchLead(id: string, body: Partial<Lead>) {
    return (await this.patch<Lead>(`admin/leads/${id}`, body)).data
  }
  async addLeadNote(id: string, text: string) {
    const { data } = await this.post<Raw>(`admin/leads/${id}/notes`, { text })
    return unwrap<Lead>(data, 'lead') as Lead
  }

  // ─── Reservas ──────────────────────────────────────────────────────────
  async reservation(id: string): Promise<AdminReservation> {
    const { data } = await this.get<Raw>(`admin/reservations/${id}`)
    const r = unwrap<AdminReservation>(data, 'reservation')
    // "documents" del modelo es { license, identity }; la meta de archivos puede venir como arreglo.
    const files = Array.isArray(r.documents) ? r.documents : (r.documentFiles as AdminReservation['documentFiles'])
    const flags = Array.isArray(r.documents)
      ? {
          license: r.documents.some((d: { kind: string }) => d.kind === 'license'),
          identity: r.documents.some((d: { kind: string }) => d.kind === 'identity'),
        }
      : r.documents
    return { ...r, documents: flags, documentFiles: files || [], payments: (r.payments as AdminReservation['payments']) || [] }
  }
  async patchReservation(id: string, body: Record<string, unknown>) {
    return (await this.patch<AdminReservation>(`admin/reservations/${id}`, body)).data
  }
  /** Reserva presencial: el servidor cotiza, congela el precio y devuelve el accessToken. */
  async createReservation(body: WalkInInput) {
    const { data } = await this.post<Raw>('admin/reservations', body)
    return unwrap<AdminReservation>(data, 'reservation') as AdminReservation
  }
  async addPayment(id: string, body: { amount: number; method: PaymentMethod; note?: string }) {
    return (await this.post<Payment>(`admin/reservations/${id}/payments`, body)).data
  }
  async refundPayment(paymentId: string) {
    return (await this.post<Payment>(`admin/payments/${paymentId}/refund`, {})).data
  }
  async reservationDocument(id: string, kind: string) {
    const { data } = await this.get<Blob>(`admin/reservations/${id}/documents/${kind}`, this.getHeaders(), {
      responseType: 'blob',
    })
    return data
  }

  // ─── Personal (solo admin) ─────────────────────────────────────────────
  async staff(params: ListParams = {}) {
    return this.list<StaffMember>('staff', params)
  }
  async createStaff(body: StaffInput) {
    return (await this.post<StaffMember>('admin/staff', body)).data
  }
  async updateStaff(id: string, body: Partial<StaffInput>) {
    return (await this.put<StaffMember>(`admin/staff/${id}`, body)).data
  }
  async setStaffActive(id: string, isActive: boolean) {
    return (await this.patch<StaffMember>(`admin/staff/${id}/active`, { isActive })).data
  }
  async deleteStaff(id: string) {
    await this.delete<void>(`admin/staff/${id}`)
  }

  // ─── Clientes ──────────────────────────────────────────────────────────
  async customer(id: string): Promise<CustomerDetail> {
    const { data } = await this.get<Raw>(`admin/customers/${id}`)
    const c = unwrap<CustomerDetail>(data, 'customer')
    return { ...c, reservations: c.reservations || [], leads: c.leads || [] }
  }
  async updateCustomer(id: string, body: CustomerPatch): Promise<CustomerDetail> {
    const { data } = await this.patch<Raw>(`admin/customers/${id}`, body)
    const c = unwrap<CustomerDetail>(data, 'customer')
    return { ...c, reservations: c.reservations || [], leads: c.leads || [] }
  }

  // ─── Flota ─────────────────────────────────────────────────────────────
  async setVehicleStatus(id: string, status: VehicleStatus) {
    return (await this.patch<Vehicle>(`admin/vehicles/${id}/status`, { status })).data
  }
  async availability(from: string, to: string) {
    return (await this.get<AvailabilityRow[]>(`admin/availability${query({ from, to })}`)).data
  }

  // ─── Configuración ─────────────────────────────────────────────────────
  async settings() {
    return (await this.get<Settings>('admin/settings')).data
  }
  async saveSettings(body: Partial<Settings>) {
    return (await this.put<Settings>('admin/settings', body)).data
  }
  async publicConfig() {
    return (await this.get<PublicConfig>('public/config')).data
  }

  // ─── Contenido ─────────────────────────────────────────────────────────
  async saveSeo(key: string, body: Partial<SeoPage>) {
    return (await this.put<SeoPage>(`admin/seo/${key}`, body)).data
  }
  async patchPartner(id: string, body: Record<string, unknown>) {
    return (await this.patch<unknown>(`admin/partners/${id}`, body)).data
  }

  // ─── Archivos ──────────────────────────────────────────────────────────
  async upload(file: File) {
    const form = new FormData()
    form.append('file', file)
    return (await this.post<{ url: string; publicId: string }>('admin/uploads', form, undefined, { timeout: 60000 }))
      .data
  }

  /** Descarga el CSV con el Bearer (un <a href> directo no lo mandaría). */
  async exportCsv(entity: ExportEntity) {
    const { data } = await this.get<Blob>(`admin/export/${entity}.csv`, this.getHeaders(), {
      responseType: 'blob',
      timeout: 60000,
    })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponces-${entity}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
}

export const adminService = new AdminService()
