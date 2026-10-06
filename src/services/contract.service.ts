import APIBase, { resolveApiBaseUrl } from './httpBase'
import type {
  ContractAcceptInput,
  ContractTemplate,
  ContractVariable,
  ContractView,
} from '@/types/contract'

/** Guarda un Blob como archivo: el PDF del panel necesita el Bearer, un <a href> no lo manda. */
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Contrato: el cliente lo lee y acepta con el token de su reserva; el panel gestiona plantillas. */
class ContractService extends APIBase {
  // ─── Público (sin sesión, con ?t=) ───
  async publicContract(code: string, token: string) {
    return (await this.get<ContractView>(`public/reservations/${code}/contract?t=${token}`)).data
  }
  async accept(code: string, token: string, input: ContractAcceptInput) {
    return (await this.post<ContractView>(`public/reservations/${code}/contract/accept?t=${token}`, input)).data
  }
  /** El PDF público no necesita Bearer: un enlace directo funciona igual en móvil. */
  pdfUrl(code: string, token: string) {
    return `${resolveApiBaseUrl()}/public/reservations/${encodeURIComponent(code)}/contract.pdf?t=${token}`
  }

  // ─── Panel ───
  async reservationContract(id: string) {
    return (await this.get<ContractView>(`admin/reservations/${id}/contract`)).data
  }
  async downloadReservationPdf(id: string, code: string) {
    const { data } = await this.get<Blob>(`admin/reservations/${id}/contract.pdf`, this.getHeaders(), {
      responseType: 'blob',
      timeout: 30000,
    })
    saveBlob(data, `contrato-${code}.pdf`)
  }
  async templates() {
    return (await this.get<ContractTemplate[]>('admin/contract-templates')).data
  }
  async variables() {
    return (await this.get<ContractVariable[]>('admin/contract-templates/variables')).data
  }
  async createTemplate(input: Pick<ContractTemplate, 'title' | 'body'>) {
    return (await this.post<ContractTemplate>('admin/contract-templates', input)).data
  }
  async preview(input: { body: string; title?: string; reservationId?: string; language: 'es' | 'en' }) {
    return (await this.post<{ text: string; title: string }>('admin/contract-templates/preview', input)).data
  }
}

export const contractService = new ContractService()
