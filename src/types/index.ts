/** Forma con la que httpBase rechaza cualquier error del API. */
export interface ApiError {
  status: number
  message: string
  data?: unknown
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

/** Lo que devuelve el backapp en /auth/login y /auth/me. */
export interface SessionUser {
  id: string
  email: string
  name: string
  phone: string
  /** employee = operación diaria; admin = además elimina, gestiona personal y tarifas. */
  accountType: 'customer' | 'employee' | 'admin' | string
}

// ─── Contrato del API (ver backapp/docs/API.md) ─────────────────────────
// Montos SIEMPRE en centavos enteros.

export interface I18nText {
  es: string
  en: string
}

export type LocationCode = 'airport' | 'office' | 'hotel' | 'other'
export type DurationBucket = '1' | '2-3' | '4-7' | '8-15' | '16-30' | '30+'
export type PassengersBucket = '1-2' | '3-5' | '6+'
export type LeadChannel = 'whatsapp' | 'call' | 'callback' | 'form'
export type LeadSource =
  | 'route_a'
  | 'whatsapp_ad'
  | 'whatsapp_direct'
  | 'corporate'
  | 'partner'
  | 'hotel'
  | 'contact'
  | 'renaissance'
  | 'booking_abandoned'
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'reserved' | 'delivered' | 'closed' | 'lost'

export interface Attribution {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  fbclid: string
  gclid: string
  referrer: string
  landingPage: string
}

export interface LocationOption {
  code: LocationCode
  label: I18nText
  fee: number
}

export interface PublicConfig {
  business: {
    name: string
    phone: string
    whatsapp: string
    email: string
    address: string
    mapsUrl: string
    hours: I18nText
    instagram?: string
    facebook?: string
    tiktok?: string
  }
  booking: {
    maxDaysAhead: number
    minHoursNotice: number
    depositMode: 'fixed' | 'percent' | 'none'
    depositValue: number
    guaranteeAmount: number
    mileage: { limitedKmPerDay: number; extraKmPrice: number; unlimitedPricePerDay: number }
    locations: LocationOption[]
  }
  payphoneEnabled: boolean
  whatsappCloudEnabled: boolean
}

export interface SeoFields {
  title: I18nText
  description: I18nText
  ogImage: string
}

export interface Category {
  _id: string
  slug: string
  name: I18nText
  tagline: I18nText
  description: I18nText
  passengers: number
  luggage: number
  transmission: 'automatic' | 'manual'
  airConditioning: boolean
  pricePerDay: number
  image: string
  gallery: string[]
  exampleModels: string
  features: I18nText[]
  order: number
  isActive: boolean
  availableUnits?: number
  seo?: SeoFields
  /** Solo en /public/categories/:slug: unidades reales, dato secundario (se vende la categoría). */
  units?: CategoryUnit[]
}

export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric'

export interface CategoryUnit {
  brand: string
  model: string
  year: number
  transmission: 'automatic' | 'manual'
  fuel: FuelType
  seats: number
  color: string
  image: string
}

export interface Coverage {
  _id: string
  code: string
  name: I18nText
  description: I18nText
  includes: I18nText[]
  excludes: I18nText[]
  pricePerDay: number
  isDefault: boolean
  isActive?: boolean
  order: number
}

export interface Extra {
  _id: string
  code: string
  name: I18nText
  description: I18nText
  icon: string
  price: number
  pricing: 'per_day' | 'per_rental'
  maxQuantity: number
  isActive: boolean
  order?: number
}

export interface Promotion {
  _id: string
  slug: string
  title: I18nText
  body: I18nText
  conditions: I18nText
  badge: I18nText
  ctaLabel: I18nText
  ctaUrl: string
  image: string
  categorySlug: string
  startsAt: string | null
  endsAt: string | null
  isActive?: boolean
  order?: number
}

export interface Hotel {
  _id: string
  slug: string
  name: string
  zone: string
  description: I18nText
  benefit: I18nText
  promotion: I18nText
  image: string
  website: string
  phone: string
  isActive?: boolean
  order: number
}

export interface GuideSection {
  heading: I18nText
  body: I18nText
}

export interface Guide {
  _id: string
  slug: string
  title: I18nText
  excerpt: I18nText
  cover: string
  destination: string
  distanceKm: number
  driveTime: string
  readingMinutes: number
  publishedAt: string | null
  sections?: GuideSection[]
  seo?: SeoFields
  isPublished?: boolean
}

export type FaqTopic =
  | 'guarantee'
  | 'mileage'
  | 'license'
  | 'age'
  | 'fuel'
  | 'coverage'
  | 'damage'
  | 'cancellation'
  | 'airport'
  | 'payments'
  | 'return'
  | 'driver'

export interface Faq {
  _id: string
  topic: FaqTopic
  question: I18nText
  answer: I18nText
  order: number
  isActive?: boolean
}

export interface SeoPage {
  key: string
  title: I18nText
  description: I18nText
  h1: I18nText
  intro: I18nText
  canonical: string
  ogImage: string
}

// ─── Leads ──────────────────────────────────────────────────────────────
export interface LeadInput {
  leadId?: string | null
  source: LeadSource
  language: 'es' | 'en'
  startDate?: string
  startTime?: string
  duration?: DurationBucket
  location?: LocationCode
  passengers?: PassengersBucket
  channel?: LeadChannel
  name?: string
  phone?: string
  email?: string
  company?: string
  vehicles?: number
  comments?: string
  categorySlug?: string
  attribution?: Partial<Attribution>
  /** Mismo id que el Pixel: el backend lo reenvía a Conversions API para deduplicar. */
  eventId?: string
}

export interface LeadCreated {
  _id: string
  code: string
  status: LeadStatus
  tags: string[]
  whatsappUrl: string
  phoneUrl: string
}

export interface PartnerInput {
  name: string
  whatsapp: string
  city: string
  vehicleType: string
  brand: string
  model: string
  year: number
  photos: string[]
  language: 'es' | 'en'
}

// ─── Reserva (Ruta B) ───────────────────────────────────────────────────
export type MileageOption = 'limited' | 'unlimited'

export interface QuoteInput {
  categorySlug: string
  pickupAt: string
  returnAt: string
  pickupLocation: LocationCode
  returnLocation: LocationCode
  mileage: MileageOption
  coverage: string
  extras: { code: string; quantity: number }[]
  promoCode?: string
}

export interface PriceLine {
  key: string
  label: I18nText
  amount: number
}

export interface Quote {
  days: number
  available: boolean
  availableUnits: number
  lines: PriceLine[]
  total: number
  deposit: number
  guaranteeAmount: number
  mileageInfo: { includedKm: number | null; extraKmPrice: number }
  errors: string[]
}

export interface DriverInput {
  name: string
  documentType: 'cedula' | 'passport'
  documentNumber: string
  email: string
  phone: string
  country: string
  birthDate?: string
}

export type ReservationStatus =
  | 'pending_documents'
  | 'pending_payment'
  | 'confirmed'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'expired'

export type VerificationStatus = 'pending' | 'verified' | 'needs_info' | 'rejected'

export interface ReservationPricing {
  days: number
  lines: PriceLine[]
  total: number
  deposit: number
  guaranteeAmount: number
  includedKm: number | null
  extraKmPrice: number
}

export interface ReservationCreated {
  _id: string
  code: string
  status: ReservationStatus
  accessToken: string
  holdExpiresAt: string | null
  pricing: ReservationPricing
}

export interface PublicReservation {
  code: string
  status: ReservationStatus
  verification: VerificationStatus
  category: { slug: string; name: I18nText; image: string }
  pickupAt: string
  returnAt: string
  pickupLocation: LocationCode
  returnLocation: LocationCode
  mileage: MileageOption
  coverage: string
  extras: { code: string; quantity: number }[]
  pricing: ReservationPricing
  amountPaid: number
  balance: number
  guaranteeAmount: number
  driver: { name: string; email: string }
  documents: { license: boolean; identity: boolean }
  holdExpiresAt: string | null
  contract: { status: string; fileUrl: string }
}

export interface CheckoutConfig {
  token: string
  storeId: string
  clientTransactionId: string
  amount: number
  amountWithoutTax: number
  currency: 'USD'
  reference: string
  email: string
  phoneNumber: string
  documentId: string
}

export interface PaymentConfirmation {
  status: 'approved' | 'canceled' | 'error'
  reservationCode: string
  accessToken: string
  message: string
}
