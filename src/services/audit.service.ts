import APIBase from './httpBase'
import type { Paginated } from '@/types'
import type { ListParams } from '@/types/admin'
import type { AuditActor, AuditEntry } from '@/types/contract'

function query(params: ListParams): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v))
  const s = qs.toString()
  return s ? `?${s}` : ''
}

/** Registro de accesos y cambios del panel (solo admin). */
class AuditService extends APIBase {
  async list(params: ListParams) {
    return (await this.get<Paginated<AuditEntry>>(`admin/audit${query(params)}`)).data
  }
  async actors() {
    return (await this.get<AuditActor[]>('admin/audit/actors')).data
  }
  /** El CSV respeta los mismos filtros de la tabla. */
  async exportCsv(params: ListParams) {
    const { page: _p, limit: _l, ...filters } = params
    void [_p, _l]
    const { data } = await this.get<Blob>(`admin/audit/export.csv${query(filters)}`, this.getHeaders(), {
      responseType: 'blob',
      timeout: 60000,
    })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponces-auditoria-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
}

export const auditService = new AuditService()
