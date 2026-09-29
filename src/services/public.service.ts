import APIBase from './httpBase'
import type {
  Category,
  CheckoutConfig,
  Coverage,
  Extra,
  Faq,
  Guide,
  Hotel,
  LeadCreated,
  LeadInput,
  PartnerInput,
  PaymentConfirmation,
  Promotion,
  PublicConfig,
  PublicReservation,
  Quote,
  QuoteInput,
  DriverInput,
  ReservationCreated,
  SeoPage,
  Attribution,
} from '@/types'

/** Todo lo que el sitio público le pide al API. Sin sesión. */
class PublicService extends APIBase {
  async config() {
    return (await this.get<PublicConfig>('public/config')).data
  }
  async geo() {
    return (await this.get<{ country: string }>('public/geo')).data
  }
  async categories() {
    return (await this.get<Category[]>('public/categories')).data
  }
  async category(slug: string) {
    return (await this.get<Category>(`public/categories/${slug}`)).data
  }
  async coverages() {
    return (await this.get<Coverage[]>('public/coverages')).data
  }
  async extras() {
    return (await this.get<Extra[]>('public/extras')).data
  }
  async promotions() {
    return (await this.get<Promotion[]>('public/promotions')).data
  }
  async hotels() {
    return (await this.get<Hotel[]>('public/hotels')).data
  }
  async guides() {
    return (await this.get<Guide[]>('public/guides')).data
  }
  async guide(slug: string) {
    return (await this.get<Guide>(`public/guides/${slug}`)).data
  }
  async faqs(topic = '') {
    return (await this.get<Faq[]>(`public/faqs${topic ? `?topic=${topic}` : ''}`)).data
  }
  async seo(key: string) {
    return (await this.get<SeoPage>(`public/seo/${key}`)).data
  }

  async saveLead(input: LeadInput) {
    return (await this.post<LeadCreated>('public/leads', input)).data
  }
  async partner(input: PartnerInput) {
    return (await this.post<{ _id: string; code: string }>('public/partners', input)).data
  }
  async renaissance(input: { name: string; email: string; phone: string; language: 'es' | 'en' }) {
    return (await this.post<{ ok: true }>('public/renaissance', input)).data
  }

  async quote(input: QuoteInput) {
    return (await this.post<Quote>('public/quote', input)).data
  }
  async createReservation(
    input: QuoteInput & {
      driver: DriverInput
      language: 'es' | 'en'
      leadId?: string | null
      attribution?: Partial<Attribution>
    },
  ) {
    return (await this.post<ReservationCreated>('public/reservations', input)).data
  }
  async reservation(code: string, token: string) {
    return (await this.get<PublicReservation>(`public/reservations/${code}?t=${token}`)).data
  }
  async uploadDocument(code: string, token: string, kind: 'license' | 'identity', dataUrl: string) {
    return (
      await this.post<{ documents: { license: boolean; identity: boolean }; status: string }>(
        `public/reservations/${code}/documents?t=${token}`,
        { kind, dataUrl },
        undefined,
        { timeout: 60000 },
      )
    ).data
  }
  async checkout(code: string, token: string, mode: 'deposit' | 'full') {
    return (await this.post<CheckoutConfig>(`public/reservations/${code}/checkout?t=${token}`, { mode })).data
  }
  async confirmPayment(id: string, clientTransactionId: string) {
    return (
      await this.post<PaymentConfirmation>('public/payments/confirm', { id, clientTransactionId }, undefined, {
        timeout: 30000,
      })
    ).data
  }
}

export const publicService = new PublicService()
