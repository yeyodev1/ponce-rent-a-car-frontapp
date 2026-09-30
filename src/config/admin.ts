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

/**
 * Estado visible de la reserva. Los dos "pending_*" internos se muestran como
 * Pendiente: para el equipo es lo mismo (falta que el cliente complete o pague).
 */
export const reservationStatuses: Record<string, StatusDef> = {
  pending_documents: { label: 'Pendiente', tone: 'warning', icon: 'fa-solid fa-hourglass-half' },
  pending_payment: { label: 'Pendiente', tone: 'accent', icon: 'fa-solid fa-hourglass-half' },
  confirmed: { label: 'Confirmada', tone: 'blue', icon: 'fa-solid fa-calendar-check' },
  delivered: { label: 'En curso', tone: 'success', icon: 'fa-solid fa-key' },
  completed: { label: 'Completada', tone: 'neutral', icon: 'fa-solid fa-flag-checkered' },
  cancelled: { label: 'Cancelada', tone: 'danger', icon: 'fa-solid fa-ban' },
  expired: { label: 'Expirada', tone: 'neutral', icon: 'fa-regular fa-clock' },
}

/** Pastillas del filtro: aquí sí se distinguen los dos pendientes. */
export const reservationFilters: Record<string, StatusDef> = {
  ...reservationStatuses,
  pending_documents: { label: 'Pendiente · documentos', tone: 'warning' },
  pending_payment: { label: 'Pendiente · pago', tone: 'accent' },
}

/** Pasos del stepper del detalle. Cancelada y Expirada son finales aparte. */
export const reservationSteps: { key: string; label: string; icon: string; statuses: string[] }[] = [
  { key: 'pending', label: 'Pendiente', icon: 'fa-solid fa-hourglass-half', statuses: ['pending_documents', 'pending_payment'] },
  { key: 'confirmed', label: 'Confirmada', icon: 'fa-solid fa-calendar-check', statuses: ['confirmed'] },
  { key: 'delivered', label: 'En curso', icon: 'fa-solid fa-key', statuses: ['delivered'] },
  { key: 'completed', label: 'Completada', icon: 'fa-solid fa-flag-checkered', statuses: ['completed'] },
]

export interface ReservationAction {
  to: string
  label: string
  icon: string
  confirm: string
  success: string
  danger?: boolean
  /** Exige unidad asignada antes de ejecutarse. */
  needsVehicle?: boolean
}

/** Botón de "siguiente acción" por estado destino. El servidor decide cuáles aplican (allowedTransitions). */
export const reservationActions: Record<string, ReservationAction> = {
  confirmed: {
    to: 'confirmed',
    label: 'Confirmar',
    icon: 'fa-solid fa-check',
    confirm: 'La unidad queda reservada para estas fechas.',
    success: 'Reserva confirmada',
  },
  delivered: {
    to: 'delivered',
    label: 'Entregar vehículo',
    icon: 'fa-solid fa-key',
    confirm: 'La reserva pasa a "En curso" y la unidad queda rentada hasta que se complete.',
    success: 'Vehículo entregado: reserva en curso',
    needsVehicle: true,
  },
  completed: {
    to: 'completed',
    label: 'Completar',
    icon: 'fa-solid fa-flag-checkered',
    confirm: 'El vehículo vuelve a quedar disponible y la reserva se cierra.',
    success: 'Reserva completada',
  },
  cancelled: {
    to: 'cancelled',
    label: 'Cancelar reserva',
    icon: 'fa-solid fa-ban',
    confirm: 'La unidad se libera y la reserva no se puede reactivar. Si hubo pagos, gestiona el reembolso aparte.',
    success: 'Reserva cancelada',
    danger: true,
  },
}

/** Transiciones del contrato, por si el API todavía no manda allowedTransitions. */
export const fallbackTransitions: Record<string, string[]> = {
  pending_documents: ['confirmed', 'cancelled'],
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: ['completed'],
}

export const reservationCopy = {
  needsVehicle: 'Asigna una unidad antes de entregar el vehículo.',
  assignFirst: 'Asignar unidad',
  finalState: (label: string) => `La reserva está ${label.toLowerCase()}: no hay más acciones de estado.`,
  newReservation: 'Nueva reserva',
  walkInChannel: 'Presencial',
  webChannel: 'Web',
}

/** Estado de pago de la reserva (lo calcula el servidor). */
export const reservationPaymentStatuses: Record<string, StatusDef> = {
  pending: { label: 'Pendiente', tone: 'warning', icon: 'fa-solid fa-hourglass-half' },
  partial: { label: 'Parcial', tone: 'accent', icon: 'fa-solid fa-circle-half-stroke' },
  paid: { label: 'Pagado', tone: 'success', icon: 'fa-solid fa-circle-check' },
  refunded: { label: 'Reembolsado', tone: 'neutral', icon: 'fa-solid fa-rotate-left' },
}

export const paymentMethods: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
}

export const paymentCopy = {
  title: 'Pagos',
  total: 'Total',
  paid: 'Pagado',
  balance: 'Saldo',
  history: 'Historial de pagos',
  none: 'Todavía no hay pagos registrados.',
  register: 'Registrar pago',
  amount: 'Monto recibido',
  amountHint: (balance: string) => `Saldo pendiente: ${balance}`,
  method: 'Método',
  note: 'Nota (opcional)',
  notePlaceholder: 'N.º de comprobante, quién pagó…',
  submit: 'Registrar pago',
  registered: 'Pago registrado',
  refund: 'Reembolsar',
  refundTitle: (amount: string) => `¿Reembolsar ${amount}?`,
  refundMsg: 'El pago queda marcado como reembolsado y el saldo de la reserva se recalcula. Devuelve el dinero por el mismo medio.',
  refunded: 'Pago reembolsado',
  closed: 'La reserva está cerrada: no se pueden registrar pagos.',
  invalidAmount: 'Escribe un monto mayor a cero.',
  registeredBy: 'Registrado por',
  online: 'En línea',
}

export const verificationStatuses: Record<string, StatusDef> = {
  pending: { label: 'Por revisar', tone: 'neutral', icon: 'fa-solid fa-hourglass-half' },
  verified: { label: 'Verificado', tone: 'success', icon: 'fa-solid fa-circle-check' },
  needs_info: { label: 'Requiere información', tone: 'warning', icon: 'fa-solid fa-circle-info' },
  rejected: { label: 'Rechazado', tone: 'danger', icon: 'fa-solid fa-user-xmark' },
}

export const vehicleStatuses: Record<string, StatusDef> = {
  available: { label: 'Disponible', tone: 'success' },
  prereserved: { label: 'Apartada', tone: 'accent' },
  reserved: { label: 'Reservada', tone: 'blue' },
  rented: { label: 'En renta', tone: 'navy' },
  maintenance: { label: 'En mantenimiento', tone: 'warning' },
  blocked: { label: 'Inactivo', tone: 'danger' },
}

export const fuelTypes: Record<string, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  hybrid: 'Híbrido',
  electric: 'Eléctrico',
}

export const paymentStatuses: Record<string, StatusDef> = {
  pending: { label: 'Pendiente', tone: 'accent' },
  approved: { label: 'Aprobado', tone: 'success' },
  refunded: { label: 'Reembolsado', tone: 'neutral' },
  canceled: { label: 'Cancelado', tone: 'neutral' },
  error: { label: 'Error', tone: 'danger' },
}

export const paymentModes: Record<string, string> = {
  deposit: 'Separación',
  full: 'Pago total',
  balance: 'Saldo',
  manual: 'Registrado en el local',
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
  /** Solo lo ve un administrador (el empleado ni siquiera ve el enlace). */
  adminOnly?: boolean
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
      { to: '/admin/personal', label: 'Personal', icon: 'fa-solid fa-user-shield', adminOnly: true },
      { to: '/admin/configuracion', label: 'Configuración', icon: 'fa-solid fa-sliders' },
      { to: '/admin/integraciones', label: 'Integraciones', icon: 'fa-solid fa-plug', adminOnly: true },
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
  forbidden: 'Solo un administrador puede hacer esto',
  readOnly: 'Solo lectura: los cambios los hace un administrador.',
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
  inactive: 'Tu cuenta está desactivada. Pide a un administrador que la reactive.',
  back: 'Volver al sitio',
  hello: (name: string) => `Hola, ${name}`,
}

// ─── Roles y personal ───────────────────────────────────────────────────
export const roles: Record<string, StatusDef> = {
  admin: { label: 'Administrador', tone: 'accent', icon: 'fa-solid fa-user-shield' },
  employee: { label: 'Empleado', tone: 'info', icon: 'fa-solid fa-user' },
}

export const staffCopy = {
  title: 'Personal',
  subtitle: 'Quién entra al panel y qué puede hacer. Las cuentas no se eliminan: se desactivan.',
  add: 'Nueva persona',
  edit: 'Editar persona',
  new: 'Nueva persona',
  name: 'Nombre completo',
  email: 'Correo (con él inicia sesión)',
  phone: 'Teléfono',
  role: 'Rol',
  roleHelp: {
    employee: 'Operación diaria: reservas, pagos, leads, flota y contenido.',
    admin: 'Todo lo anterior, más eliminar, personal, tarifas, configuración, integraciones, exportar y reembolsar.',
  } as Record<string, string>,
  password: 'Contraseña',
  passwordNew: 'Nueva contraseña (opcional)',
  passwordHint: 'Mínimo 8 caracteres. Compártela por un canal privado.',
  passwordKeep: 'Déjala vacía para no cambiarla.',
  generate: 'Generar',
  copyPassword: 'Copiar',
  copied: 'Contraseña copiada',
  show: 'Mostrar contraseña',
  hide: 'Ocultar contraseña',
  active: 'Activo',
  lastLogin: 'Último acceso',
  never: 'Nunca',
  you: 'Tú',
  selfLocked: 'No puedes desactivar tu propia cuenta.',
  deactivateTitle: (name: string) => `¿Desactivar a ${name}?`,
  deactivateMsg: 'No podrá iniciar sesión y su sesión abierta deja de funcionar. Puedes reactivarla cuando quieras.',
  activateTitle: (name: string) => `¿Reactivar a ${name}?`,
  activateMsg: 'Podrá volver a iniciar sesión con su contraseña.',
  deactivate: 'Desactivar',
  activate: 'Reactivar',
  activated: 'Cuenta reactivada',
  deactivated: 'Cuenta desactivada',
  empty: 'Aún no hay personal registrado',
  invalid: 'Completa nombre, correo válido y una contraseña de al menos 8 caracteres.',
}

// ─── Reserva presencial ─────────────────────────────────────────────────
export const walkInCopy = {
  title: 'Nueva reserva presencial',
  subtitle: 'Para el cliente que está en el local o por teléfono. El precio lo calcula el sistema.',
  vehicle: 'Vehículo',
  category: 'Categoría',
  chooseCategory: 'Elige una categoría',
  unit: 'Unidad (opcional)',
  anyUnit: 'Asignar automáticamente',
  dates: 'Fechas',
  pickupDate: 'Retiro',
  pickupTime: 'Hora de retiro',
  returnDate: 'Devolución',
  returnTime: 'Hora de devolución',
  pickupLocation: 'Lugar de entrega',
  returnLocation: 'Lugar de devolución',
  options: 'Opciones',
  mileage: 'Kilometraje',
  limited: 'Limitado',
  unlimited: 'Ilimitado',
  coverage: 'Cobertura',
  extras: 'Extras',
  driver: 'Conductor',
  driverName: 'Nombre y apellido',
  docType: 'Documento',
  cedula: 'Cédula',
  passport: 'Pasaporte',
  docNumber: 'Número de documento',
  email: 'Correo',
  phone: 'Teléfono / WhatsApp',
  country: 'País',
  notes: 'Notas internas',
  notesPlaceholder: 'Solo las ve el equipo.',
  quote: 'Cotización',
  quoteEmpty: 'Completa categoría, fechas y lugar para ver el precio.',
  quoteLoading: 'Calculando…',
  quoteError: 'No se pudo calcular el precio. Revisa los datos.',
  days: (n: number) => (n === 1 ? '1 día' : `${n} días`),
  available: (n: number) => (n === 1 ? '1 unidad libre' : `${n} unidades libres`),
  unavailable: 'Sin unidades libres para esas fechas',
  total: 'Total',
  submit: 'Crear reserva',
  creating: 'Creando…',
  created: (code: string) => `Reserva ${code} creada`,
  pastDate: 'El retiro no puede ser en el pasado.',
  returnBefore: 'La devolución debe ser después del retiro.',
  missing: 'Completa los campos marcados con *.',
}

export const shareCopy = {
  title: 'Enlace para el cliente',
  text: 'Con este enlace el cliente ve su reserva, sube sus documentos y paga. No necesita cuenta.',
  copy: 'Copiar enlace',
  copied: 'Enlace copiado',
  whatsapp: 'Enviar por WhatsApp',
  message: (name: string, code: string, url: string) =>
    `Hola${name ? ` ${name.split(' ')[0]}` : ''}, te saluda Ponce's Rent a Car. Esta es tu reserva ${code}: ${url}`,
}

// ─── Dashboard ──────────────────────────────────────────────────────────
export const dashboardCopy = {
  available: 'Vehículos disponibles',
  availableHint: 'Unidades activas y libres hoy',
  pending: 'Pendientes',
  confirmed: 'Confirmadas',
  inProgress: 'En curso',
  revenue: 'Ingresos del mes',
  revenueHint: 'Pagos aprobados menos reembolsos',
  today: 'Hoy',
  deliveries: 'Entregas',
  returns: 'Devoluciones',
  noDeliveries: 'No hay entregas programadas para hoy.',
  noReturns: 'No hay devoluciones programadas para hoy.',
  todayUnavailable: 'La agenda del día aparecerá cuando el servidor la envíe.',
}
