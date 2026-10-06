import type { StaffRef, Vehicle } from './admin'

// ─── Actas de entrega y devolución (§8.A) ───────────────────────────────
export type InspectionType = 'delivery' | 'return'
export type DamageZone =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'roof'
  | 'windshield'
  | 'wheels'
  | 'interior'
  | 'trunk'
  | 'other'
export type DamageSeverity = 'minor' | 'moderate' | 'severe'
export type ChecklistKey =
  'spareTire' | 'jack' | 'documents' | 'cleanInterior' | 'cleanExterior' | 'accessories'

export interface InspectionPhoto {
  url: string
  label: string
}

export interface InspectionDamage {
  zone: DamageZone
  description: string
  severity: DamageSeverity
  photo: string
  isNew?: boolean
}

export interface InspectionInput {
  type: InspectionType
  mileageKm: number
  fuelLevel: number
  photos: InspectionPhoto[]
  damages: InspectionDamage[]
  checklist: Record<ChecklistKey, boolean>
  notes: string
  customerAgreedName: string
}

export interface Inspection extends InspectionInput {
  _id: string
  reservationCode: string
  performedAt: string
  performedBy: StaffRef | null
}

export interface InspectionComparison {
  kmDriven: number
  includedKm: number | null
  extraKm: number
  extraKmCharge: number
  /** Octavos; negativo = el cliente devolvió con menos combustible. */
  fuelDiff: number
  newDamages: number
}

export interface InspectionsResponse {
  delivery: Inspection | null
  return: Inspection | null
  comparison: InspectionComparison | null
  vehicle: Pick<
    Vehicle,
    '_id' | 'brand' | 'model' | 'plate' | 'mileageKm' | 'status' | 'images'
  > | null
}

// ─── Garantía (§8.B) ────────────────────────────────────────────────────
export type GuaranteeStatus = 'pending' | 'held' | 'released' | 'charged' | 'partially_charged'
export type GuaranteeMethod = 'datafast' | 'cash' | 'transfer'
export type GuaranteeAction = 'hold' | 'release' | 'charge'

export interface Guarantee {
  status: GuaranteeStatus
  amount: number
  method: GuaranteeMethod | ''
  reference: string
  chargedAmount: number
  chargeReason: string
  heldAt: string | null
  settledAt: string | null
  notes: string
  updatedBy: StaffRef | null
}

export interface GuaranteeInput {
  action: GuaranteeAction
  amount?: number
  method?: GuaranteeMethod
  reference?: string
  chargedAmount?: number
  chargeReason?: string
  notes?: string
}

/** Campos v1.3 del pago que el tipo base todavía no declara. */
export interface PaymentVoidFields {
  status: string
  voidedAt?: string | null
  voidReason?: string
  voidedBy?: StaffRef | null
}

// ─── Historial de la unidad ─────────────────────────────────────────────
export type VehicleLogType = 'maintenance' | 'repair' | 'damage' | 'note' | 'status_change'

export interface TimelineItem {
  kind: 'reservation' | 'inspection' | 'log'
  id: string
  at: string
  title: string
  detail: string
  reservationCode?: string
  reservationId?: string
  status?: string
  amount?: number
  mileageKm?: number
  fuelLevel?: number
  inspectionType?: InspectionType
  photos?: InspectionPhoto[]
  damages?: InspectionDamage[]
  notes?: string
  logType?: VehicleLogType
  cost?: number
  by?: string
}

export interface VehicleHistory {
  vehicle: Vehicle
  timeline: TimelineItem[]
  stats: {
    rentals: number
    kmDriven: number
    revenue: number
    lastInspectionAt: string | null
    maintenanceCost?: number
  }
}

export interface VehicleLogInput {
  type: Exclude<VehicleLogType, 'status_change'>
  date: string
  mileageKm: number | null
  cost: number
  description: string
}
