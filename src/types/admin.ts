import type {
  Attribution,
  Category,
  DurationBucket,
  I18nText,
  LeadChannel,
  LeadSource,
  LeadStatus,
  LocationOption,
  PassengersBucket,
  PriceLine,
  ReservationStatus,
  VerificationStatus,
} from '@/types'

// Tipos del panel. Reflejan los modelos del backapp (src/models/*.ts).
// Montos siempre en centavos.

/** Una referencia de Mongo puede llegar como id o poblada. */
export type Ref<T> = string | (T & { _id: string }) | null

export function refId(ref: Ref<unknown> | undefined): string {
  if (!ref) return ''
  if (typeof ref === 'string') return ref
  return (ref as { _id: string })._id
}

export function refObj<T>(ref: Ref<T> | undefined): (T & { _id: string }) | null {
  return ref && typeof ref === 'object' ? ref : null
}

export interface ListParams {
  page?: number
  limit?: number
  q?: string
  status?: string
  [key: string]: string | number | undefined
}

// ─── CRM ────────────────────────────────────────────────────────────────
export type LeadPriority = 'save' | 'comfort' | 'space' | 'specific' | 'none'

export interface LeadNote {
  _id?: string
  text: string
  author: string
  at: string
}

export interface Lead {
  _id: string
  code: string
  status: LeadStatus
  source: LeadSource
  channel: LeadChannel | ''
  language: 'es' | 'en'
  tags: string[]
  name: string
  phone: string
  whatsapp: string
  email: string
  company: string
  vehicles: number
  comments: string
  startDate: string
  startTime: string
  duration: DurationBucket | ''
  location: string
  passengers: PassengersBucket | ''
  priority: LeadPriority | ''
  specificVehicle: string
  categorySlug: string
  attribution?: Partial<Attribution>
  needsHuman: boolean
  flowCompletedAt: string | null
  whatsappOpenedAt: string | null
  notes: LeadNote[]
  reservation: Ref<{ code: string; status: ReservationStatus }>
  customer: Ref<{ name: string }>
  assignedTo: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  _id: string
  name: string
  documentType: 'cedula' | 'passport'
  documentNumber: string
  email: string
  phone: string
  country: string
  birthDate: string
  language: 'es' | 'en'
  verification: VerificationStatus
  isClubMember: boolean
  totalRentals: number
  notes: string
  createdAt: string
}

export interface CustomerDetail extends Customer {
  reservations: AdminReservation[]
  leads: Lead[]
}

// ─── Reservas y pagos ───────────────────────────────────────────────────
export type VehicleStatus = 'available' | 'prereserved' | 'reserved' | 'rented' | 'maintenance' | 'blocked'
export type PaymentStatus = 'pending' | 'approved' | 'canceled' | 'error'

export interface Vehicle {
  _id: string
  category: Ref<Pick<Category, 'slug' | 'name'>>
  brand: string
  model: string
  year: number
  plate: string
  color: string
  transmission: 'automatic' | 'manual'
  images: string[]
  status: VehicleStatus
  owner: string
  notes: string
  isActive: boolean
}

export interface Payment {
  _id: string
  reservation: Ref<{ code: string }>
  reservationCode: string
  provider: 'payphone' | 'manual' | 'datafast'
  mode: 'deposit' | 'full' | 'balance'
  amount: number
  currency: 'USD'
  clientTransactionId: string
  transactionId: string
  status: PaymentStatus
  approvedAt: string | null
  createdAt: string
}

export interface DocumentMeta {
  _id?: string
  kind: 'license' | 'identity'
  contentType: string
  size: number
  createdAt?: string
}

export interface AdminReservation {
  _id: string
  code: string
  status: ReservationStatus
  verification: VerificationStatus
  verificationNote: string
  category?: Ref<{ slug: string }>
  categorySlug: string
  categoryName: I18nText
  vehicle: Ref<Pick<Vehicle, 'brand' | 'model' | 'plate' | 'color'>>
  customer: Ref<Pick<Customer, 'name' | 'email' | 'phone' | 'documentNumber'>>
  lead: Ref<{ code: string }>
  pickupAt: string
  returnAt: string
  pickupLocation: string
  returnLocation: string
  pickupAddress: string
  mileage: 'limited' | 'unlimited'
  coverage: string
  extras: { code: string; quantity: number }[]
  pricing: {
    days: number
    lines: PriceLine[]
    total: number
    deposit: number
    guaranteeAmount: number
    includedKm: number | null
    extraKmPrice: number
  }
  amountPaid: number
  balance: number
  paymentMode: 'deposit' | 'full' | ''
  holdExpiresAt: string | null
  documents: { license: boolean; identity: boolean }
  contract?: { status: string; fileUrl: string }
  language: 'es' | 'en'
  attribution?: Partial<Attribution>
  notes: string
  createdAt: string
  // Resumen del dashboard (campos planos)
  customerName?: string
  total?: number
  // Solo en el detalle
  payments?: Payment[]
  documentFiles?: DocumentMeta[]
}

// ─── Flota ──────────────────────────────────────────────────────────────
export interface BusySlot {
  from: string
  to: string
  reservationCode: string
  status: ReservationStatus | string
}

export interface AvailabilityRow {
  vehicle: Vehicle
  busy: BusySlot[]
}

// ─── Dashboard ──────────────────────────────────────────────────────────
export interface Dashboard {
  kpis: {
    leadsMonth: number
    leadsPrevMonth: number
    reservationsMonth: number
    reservationsPrevMonth: number
    revenueMonth: number
    revenuePrevMonth: number
    conversionRate: number
  }
  leadsByStatus: Partial<Record<LeadStatus, number>>
  leadsBySource: { source: LeadSource; count: number }[]
  reservationsByMonth: { month: string; count: number; revenue: number }[]
  latestReservations: AdminReservation[]
  latestLeads: Lead[]
  fleet: Partial<Record<VehicleStatus, number>>
}

// ─── Configuración ──────────────────────────────────────────────────────
export interface Settings {
  business: {
    name: string
    phone: string
    whatsapp: string
    email: string
    address: string
    mapsUrl: string
    hours: I18nText
    instagram: string
    facebook: string
    tiktok: string
  }
  booking: {
    maxDaysAhead: number
    minHoursNotice: number
    holdMinutes: number
    depositMode: 'fixed' | 'percent' | 'none'
    depositValue: number
    guaranteeAmount: number
    mileage: { limitedKmPerDay: number; extraKmPrice: number; unlimitedPricePerDay: number }
    locations: LocationOption[]
  }
  integrations: { webhookUrl: string }
}

// ─── Socios y club ──────────────────────────────────────────────────────
export type PartnerStatus = 'new' | 'reviewing' | 'approved' | 'rejected'

export interface Partner {
  _id: string
  code: string
  name: string
  whatsapp: string
  city: string
  vehicleType: string
  brand: string
  model: string
  year: number
  photos: string[]
  language: 'es' | 'en'
  status: PartnerStatus
  notes: string
  createdAt: string
}

export interface ClubMember {
  _id: string
  name: string
  email: string
  phone: string
  language: 'es' | 'en'
  level: 'explorer' | 'traveler' | 'renaissance'
  rentals: number
  createdAt: string
}

export type ExportEntity = 'leads' | 'customers' | 'reservations' | 'payments'

export interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Oculta la columna en la tarjeta móvil (ya aparece en el encabezado). */
  mobileHidden?: boolean
}
