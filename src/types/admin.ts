import type {
  Attribution,
  Category,
  DriverInput,
  FuelType,
  DurationBucket,
  I18nText,
  LeadChannel,
  LeadSource,
  LeadStatus,
  LocationCode,
  LocationOption,
  MileageOption,
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
  /** Licencia de conducir (YYYY-MM-DD, ISO-2). Vacío = sin registrar. */
  licenseNumber?: string
  licenseExpiresAt?: string
  licenseCountry?: string
  language: 'es' | 'en'
  verification: VerificationStatus
  isClubMember: boolean
  totalRentals: number
  notes: string
  createdAt: string
}

export type CustomerPatch = Partial<
  Pick<Customer, 'name' | 'email' | 'phone' | 'licenseNumber' | 'licenseExpiresAt' | 'licenseCountry' | 'notes'>
>

export interface CustomerDetail extends Customer {
  reservations: AdminReservation[]
  leads: Lead[]
}

// ─── Reservas y pagos ───────────────────────────────────────────────────
export type VehicleStatus = 'available' | 'prereserved' | 'reserved' | 'rented' | 'maintenance' | 'blocked'
export type PaymentStatus = 'pending' | 'approved' | 'canceled' | 'error' | 'refunded' | 'voided'
export type PaymentMethod = 'cash' | 'transfer' | 'card'
/** Lo calcula el servidor comparando lo pagado contra el total; nunca se edita a mano. */
export type ReservationPaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded'
export type StaffRole = 'employee' | 'admin'

/** Quién hizo algo en el panel (pago registrado, reserva presencial). */
export interface StaffRef {
  id: string
  name: string
  email: string
}

export interface Vehicle {
  _id: string
  category: Ref<Pick<Category, 'slug' | 'name'>>
  brand: string
  model: string
  year: number
  plate: string
  color: string
  transmission: 'automatic' | 'manual'
  fuel?: FuelType
  seats?: number
  /** Odómetro actual en km. */
  mileageKm?: number
  description?: string
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
  mode: 'deposit' | 'full' | 'balance' | 'manual'
  method?: PaymentMethod
  registeredBy?: StaffRef | null
  note?: string
  refundedAt?: string | null
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
  customer: Ref<
    Pick<Customer, 'name' | 'email' | 'phone' | 'documentNumber'> &
      Partial<Pick<Customer, 'licenseNumber' | 'licenseExpiresAt' | 'licenseCountry'>>
  >
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
  paymentStatus?: ReservationPaymentStatus
  /** Estados a los que el servidor permite pasar desde el actual (ciclo estricto). */
  allowedTransitions?: string[]
  channel?: 'web' | 'walk_in'
  createdBy?: StaffRef | null
  /** Solo al crear una reserva presencial: para mandarle el enlace al cliente. */
  accessToken?: string
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
  // v1.1
  fleetSummary?: { available: number; total: number }
  reservationCounts?: { pending: number; confirmed: number; inProgress: number }
  revenueMonth?: number
  today?: {
    deliveries: number
    returns: number
    deliveriesList: TodayItem[]
    returnsList: TodayItem[]
  }
}

/** Retiro o devolución del día (Guayaquil). Campos opcionales: el API puede mandarlo resumido. */
export interface TodayItem {
  _id: string
  code: string
  status?: string
  /** Hora del retiro (entregas) o de la devolución (devoluciones). */
  at?: string
  time?: string
  location?: string
  customerPhone?: string
  pickupAt?: string
  returnAt?: string
  pickupLocation?: string
  returnLocation?: string
  customerName?: string
  customer?: Ref<{ name: string; phone?: string }>
  categoryName?: I18nText
  categorySlug?: string
  vehicle?: Ref<Pick<Vehicle, 'brand' | 'model' | 'plate'>>
  vehicleLabel?: string
}

// ─── Personal ───────────────────────────────────────────────────────────
export interface StaffMember {
  id: string
  _id?: string
  name: string
  email: string
  phone: string
  accountType: StaffRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface StaffInput {
  name: string
  email: string
  phone: string
  accountType: StaffRole
  password?: string
}

// ─── Reserva presencial ─────────────────────────────────────────────────
export interface WalkInInput {
  categorySlug: string
  vehicleId?: string
  pickupAt: string
  returnAt: string
  pickupLocation: LocationCode
  returnLocation: LocationCode
  mileage: MileageOption
  coverage: string
  extras: { code: string; quantity: number }[]
  driver: DriverInput
  notes?: string
  language?: 'es' | 'en'
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
