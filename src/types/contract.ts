import type { I18nText } from '@/types'

/** Contrato de alquiler (v1.3): plantilla versionada + aceptación electrónica por reserva. */

export interface ContractAcceptance {
  name: string
  documentNumber: string
  ip: string
  userAgent: string
  at: string | null
}

export interface ContractView {
  /** pending = generado con la plantilla activa; signed = aceptado y congelado. */
  status: 'pending' | 'signed'
  version: number | null
  title: string
  text: string
  hash: string | null
  language: 'es' | 'en'
  signedAt: string | null
  acceptance: ContractAcceptance | null
  /** Configuración booking.contractRequired: sin firma no se puede pagar en línea. */
  required: boolean
  /** Solo en el panel. */
  renderedText?: string
}

export interface ContractAcceptInput {
  name: string
  documentNumber: string
  accepted: true
}

export interface ContractTemplate {
  _id: string
  version: number
  title: I18nText
  body: I18nText
  isActive: boolean
  createdBy: { id: string; name: string; email: string } | null
  createdAt: string
}

export interface ContractVariable {
  key: string
  label: string
  group: string
}

/** Códigos estables que devuelve la aceptación para mostrar el error en el idioma del cliente. */
export type ContractErrorCode = 'name_mismatch' | 'document_mismatch' | 'not_accepted' | 'reservation_closed'

// ─── Registro de accesos ────────────────────────────────────────────────

export interface AuditEntry {
  _id: string
  actor: { id: string; name: string; email: string; role: string } | null
  action: string
  entity: string
  entityId: string
  summary: string
  ip: string
  userAgent: string
  success: boolean
  at: string
}

export interface AuditActor {
  id: string
  name: string
  email: string
}

// ─── Página pública por unidad ──────────────────────────────────────────

export interface PublicVehicle {
  slug: string
  brand: string
  model: string
  year: number
  transmission: 'automatic' | 'manual'
  fuel: 'gasoline' | 'diesel' | 'hybrid' | 'electric'
  seats: number
  color: string
  description: string
  images: string[]
  category: {
    slug: string
    name: I18nText
    tagline: I18nText
    pricePerDay: number
    passengers: number
    luggage: number
    airConditioning: boolean
    features: I18nText[]
    image: string
  }
  available: boolean
}
