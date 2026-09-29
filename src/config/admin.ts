/**
 * Copy, etiquetas y colores del panel administrativo. Solo español: el panel
 * lo usa el equipo de Ponce's, no el visitante.
 */

/** Tono visual de un estado. StatusBadge lo traduce a colores. */
export type Tone = 'neutral' | 'info' | 'blue' | 'accent' | 'success' | 'warning' | 'danger' | 'navy'

export interface StatusDef {
  label: string
  tone: Tone
  icon?: string
}

export const brand = {
  wordmark: "PONCE'S",
  sub: 'RENT A CAR',
  panel: 'Panel administrativo',
}

export const leadStatuses: Record<string, StatusDef> = {
  new: { label: 'Nuevo', tone: 'blue', icon: 'fa-solid fa-star' },
  contacted: { label: 'Contactado', tone: 'info', icon: 'fa-solid fa-comments' },
  quoted: { label: 'Cotizado', tone: 'accent', icon: 'fa-solid fa-file-invoice-dollar' },
  reserved: { label: 'Reservado', tone: 'navy', icon: 'fa-solid fa-calendar-check' },
  delivered: { label: 'Entregado', tone: 'success', icon: 'fa-solid fa-key' },
  closed: { label: 'Finalizado', tone: 'neutral', icon: 'fa-solid fa-flag-checkered' },
  lost: { label: 'Perdido', tone: 'danger', icon: 'fa-solid fa-circle-xmark' },
}

export const leadStatusOrder = ['new', 'contacted', 'quoted', 'reserved', 'delivered', 'closed', 'lost']

export const leadSources: Record<string, string> = {
  route_a: 'Ayúdame a elegir',
  whatsapp_ad: 'Anuncio de WhatsApp',
  whatsapp_direct: 'WhatsApp directo',
  corporate: 'Empresas',
  partner: 'Socio sobre Ruedas',
  hotel: 'Hotel aliado',
  contact: 'Contacto',
  renaissance: 'Renaissance',
  booking_abandoned: 'Reserva abandonada',
}

export const leadTags: Record<string, StatusDef> = {
  long_term: { label: 'Larga duración', tone: 'accent' },
  corporate: { label: 'Corporativo', tone: 'navy' },
}

export const leadChannels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  call: 'Llamada',
  callback: 'Pidió que lo llamen',
  form: 'Formulario',
  '': 'Sin definir',
}

export const leadPriorities: Record<string, string> = {
  save: 'Ahorrar',
  comfort: 'Comodidad',
  space: 'Espacio',
  specific: 'Vehículo específico',
  none: 'Sin preferencia',
  '': 'Sin definir',
}

export const durations: Record<string, string> = {
  '1': '1 día',
  '2-3': '2 a 3 días',
  '4-7': '4 a 7 días aprox.',
  '8-15': '8 a 15 días',
  '16-30': '16 a 30 días',
  '30+': 'Más de 30 días',
}

export const passengers: Record<string, string> = {
  '1-2': '1 a 2 personas',
  '3-5': '3 a 5 personas',
  '6+': '6 o más personas',
}

export const locations: Record<string, string> = {
  airport: 'Aeropuerto de Guayaquil',
  office: 'Nuestra ubicación',
  hotel: 'Hotel o domicilio',
  other: 'Otro lugar',
}

export const languages: Record<string, string> = { es: 'Español', en: 'Inglés' }

export const reservationStatuses: Record<string, StatusDef> = {
  pending_documents: { label: 'Faltan documentos', tone: 'warning' },
  pending_payment: { label: 'Pendiente de pago', tone: 'accent' },
  confirmed: { label: 'Confirmada', tone: 'blue' },
  delivered: { label: 'Entregada', tone: 'success' },
  completed: { label: 'Finalizada', tone: 'neutral' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
  expired: { label: 'Expirada', tone: 'neutral' },
}

/** Transiciones que el panel ofrece desde cada estado, con su advertencia. */
export const reservationActions: Record<string, { to: string; label: string; icon: string; confirm: string; danger?: boolean }[]> = {
  pending_documents: [
    { to: 'cancelled', label: 'Cancelar', icon: 'fa-solid fa-ban', confirm: 'La unidad se libera y el cliente ya no podrá continuar la reserva.', danger: true },
  ],
  pending_payment: [
    { to: 'confirmed', label: 'Confirmar manualmente', icon: 'fa-solid fa-check', confirm: 'Úsalo si el cliente pagó por otro medio. La unidad queda reservada.' },
    { to: 'cancelled', label: 'Cancelar', icon: 'fa-solid fa-ban', confirm: 'La unidad se libera y el cliente ya no podrá continuar la reserva.', danger: true },
  ],
  confirmed: [
    { to: 'delivered', label: 'Entregar vehículo', icon: 'fa-solid fa-key', confirm: 'La unidad pasa a "Rentada" hasta que se finalice la reserva.' },
    { to: 'cancelled', label: 'Cancelar', icon: 'fa-solid fa-ban', confirm: 'La unidad se libera. Si hubo pago, gestiona la devolución aparte.', danger: true },
  ],
  delivered: [
    { to: 'completed', label: 'Finalizar', icon: 'fa-solid fa-flag-checkered', confirm: 'El vehículo vuelve a quedar disponible y la reserva se cierra.' },
  ],
}

export const verificationStatuses: Record<string, StatusDef> = {
  pending: { label: 'Por revisar', tone: 'neutral', icon: 'fa-solid fa-hourglass-half' },
  verified: { label: 'Verificado', tone: 'success', icon: 'fa-solid fa-circle-check' },
  needs_info: { label: 'Requiere información', tone: 'warning', icon: 'fa-solid fa-circle-info' },
  rejected: { label: 'Rechazado', tone: 'danger', icon: 'fa-solid fa-user-xmark' },
}

export const vehicleStatuses: Record<string, StatusDef> = {
  available: { label: 'Disponible', tone: 'success' },
  prereserved: { label: 'Pre-reservada', tone: 'accent' },
  reserved: { label: 'Reservada', tone: 'blue' },
  rented: { label: 'Rentada', tone: 'navy' },
  maintenance: { label: 'Mantenimiento', tone: 'warning' },
  blocked: { label: 'Bloqueada', tone: 'danger' },
}

export const paymentStatuses: Record<string, StatusDef> = {
  pending: { label: 'Pendiente', tone: 'accent' },
  approved: { label: 'Aprobado', tone: 'success' },
  canceled: { label: 'Cancelado', tone: 'neutral' },
  error: { label: 'Error', tone: 'danger' },
}

export const paymentModes: Record<string, string> = {
  deposit: 'Separación',
  full: 'Pago total',
  balance: 'Saldo',
  '': '—',
}

export const paymentProviders: Record<string, string> = {
  payphone: 'Payphone',
  manual: 'Manual',
  datafast: 'Datafast',
}

export const partnerStatuses: Record<string, StatusDef> = {
  new: { label: 'Nueva', tone: 'blue' },
  reviewing: { label: 'En revisión', tone: 'accent' },
  approved: { label: 'Aprobada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
}

export const clubLevels: Record<string, string> = {
  explorer: 'Explorer',
  traveler: 'Traveler',
  renaissance: 'Renaissance',
}

export const activeStatuses: Record<string, StatusDef> = {
  true: { label: 'Activo', tone: 'success' },
  false: { label: 'Inactivo', tone: 'neutral' },
}

export const faqTopics: Record<string, string> = {
  guarantee: 'Garantía',
  mileage: 'Kilometraje',
  license: 'Licencia',
  age: 'Edad',
  fuel: 'Combustible',
  coverage: 'Coberturas',
  damage: 'Daños',
  cancellation: 'Cancelación',
  airport: 'Aeropuerto',
  payments: 'Pagos',
  return: 'Devolución',
  driver: 'Conductor',
}

export const seoKeys: Record<string, string> = {
  home: 'Inicio',
  fleet: 'Vehículos',
  airport: 'Aeropuerto',
  business: 'Empresas',
  promotions: 'Promociones',
  hotels: 'Hoteles aliados',
  guides: 'Guías de viaje',
  faq: 'Preguntas frecuentes',
  partner: 'Socio sobre Ruedas',
  renaissance: 'Renaissance',
  contact: 'Contacto',
  'landing-guayaquil': 'Landing: autos Guayaquil',
  'landing-suv': 'Landing: SUV',
  'landing-trucks': 'Landing: camionetas',
  'landing-long-term': 'Landing: larga duración',
}

export const documentKinds: Record<string, string> = {
  license: 'Licencia de conducir',
  identity: 'Cédula o pasaporte',
}

// ─── Navegación ─────────────────────────────────────────────────────────
export interface MenuItem {
  to: string
  label: string
  icon: string
}

export const menu: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Operación',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
      { to: '/admin/leads', label: 'Leads', icon: 'fa-solid fa-inbox' },
      { to: '/admin/reservas', label: 'Reservas', icon: 'fa-solid fa-calendar-check' },
      { to: '/admin/clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
      { to: '/admin/pagos', label: 'Pagos', icon: 'fa-solid fa-credit-card' },
    ],
  },
  {
    title: 'Flota y tarifas',
    items: [
      { to: '/admin/flota', label: 'Flota', icon: 'fa-solid fa-car-side' },
      { to: '/admin/disponibilidad', label: 'Disponibilidad', icon: 'fa-solid fa-calendar-days' },
      { to: '/admin/tarifas', label: 'Tarifas y reglas', icon: 'fa-solid fa-tags' },
    ],
  },
  {
    title: 'Sitio web',
    items: [
      { to: '/admin/contenido', label: 'Contenido', icon: 'fa-solid fa-pen-ruler' },
      { to: '/admin/socios', label: 'Socios sobre Ruedas', icon: 'fa-solid fa-handshake' },
      { to: '/admin/renaissance', label: 'Renaissance', icon: 'fa-solid fa-crown' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/admin/configuracion', label: 'Configuración', icon: 'fa-solid fa-sliders' },
      { to: '/admin/integraciones', label: 'Integraciones', icon: 'fa-solid fa-plug' },
    ],
  },
]

/** Accesos de la barra inferior en el celular; el resto vive en "Más". */
export const bottomNav: MenuItem[] = [
  { to: '/admin', label: 'Inicio', icon: 'fa-solid fa-gauge-high' },
  { to: '/admin/leads', label: 'Leads', icon: 'fa-solid fa-inbox' },
  { to: '/admin/reservas', label: 'Reservas', icon: 'fa-solid fa-calendar-check' },
  { to: '/admin/flota', label: 'Flota', icon: 'fa-solid fa-car-side' },
]

export const copy = {
  save: 'Guardar',
  saving: 'Guardando…',
  saved: 'Cambios guardados',
  created: 'Creado correctamente',
  deleted: 'Eliminado',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  add: 'Agregar',
  new: 'Nuevo',
  search: 'Buscar…',
  empty: 'Todavía no hay nada por aquí',
  loadError: 'No se pudo cargar la información',
  retry: 'Reintentar',
  confirmDelete: '¿Eliminar este registro?',
  confirmDeleteMsg: 'Esta acción no se puede deshacer.',
  logout: 'Cerrar sesión',
  more: 'Más',
  all: 'Todos',
  unavailable: 'Esta sección aún no está disponible en el servidor. Vuelve a intentarlo en unos minutos.',
  whatsappGreeting: (name: string, code: string) =>
    `Hola${name ? ` ${name.split(' ')[0]}` : ''}, te escribimos de Ponce's Rent a Car por tu solicitud ${code}.`,
}

/**
 * Colores por tono (espejo de los tokens de colorVariables.module.scss) para
 * lo que se pinta con estilos en línea: barras, columnas del tablero, gráficos.
 */
export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: '#3d4a66', bg: '#eaeef7' },
  info: { fg: '#2f6fe0', bg: 'rgba(47, 111, 224, 0.12)' },
  blue: { fg: '#1542c9', bg: '#e8efff' },
  accent: { fg: '#8a6700', bg: '#fff6d6' },
  success: { fg: '#16a36a', bg: 'rgba(22, 163, 106, 0.12)' },
  warning: { fg: '#d97706', bg: 'rgba(227, 155, 0, 0.14)' },
  danger: { fg: '#d93446', bg: 'rgba(217, 52, 70, 0.12)' },
  navy: { fg: '#06173a', bg: 'rgba(6, 23, 58, 0.08)' },
}

export const loginCopy = {
  eyebrow: 'Panel administrativo',
  title: 'Bienvenido de vuelta',
  subtitle: 'Leads, reservas, flota y contenido en un solo lugar.',
  email: 'Correo',
  password: 'Contraseña',
  submit: 'Ingresar al panel',
  loading: 'Ingresando…',
  show: 'Mostrar contraseña',
  hide: 'Ocultar contraseña',
  notAdmin: 'Tu cuenta no tiene acceso al panel administrativo.',
  back: 'Volver al sitio',
  hello: (name: string) => `Hola, ${name}`,
}
