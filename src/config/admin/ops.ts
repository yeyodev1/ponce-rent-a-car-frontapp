import { paymentStatuses, type StatusDef } from '@/config/admin'
import type {
  ChecklistKey,
  DamageSeverity,
  DamageZone,
  GuaranteeMethod,
  VehicleLogType,
} from '@/types/ops'

// ─── Actas ──────────────────────────────────────────────────────────────
export const handoverCopy = {
  title: 'Entrega y devolución',
  delivery: 'Acta de entrega',
  return: 'Acta de devolución',
  startDelivery: 'Hacer acta de entrega',
  startReturn: 'Hacer acta de devolución',
  needsVehicle: 'Asigna una unidad para poder hacer el acta de entrega.',
  waiting: 'El acta de entrega se hace cuando la reserva está confirmada.',
  closed: 'Esta reserva no tuvo entrega.',
  view: 'Ver acta',
  fix: 'Corregir',
  steps: ['Kilometraje', 'Combustible', 'Fotos', 'Daños', 'Checklist', 'Cierre'],
  next: 'Siguiente',
  back: 'Atrás',
  saveDelivery: 'Guardar y entregar',
  saveReturn: 'Guardar y cerrar',
  saveFix: 'Guardar corrección',
  saving: 'Guardando…',
  savedDelivery: 'Acta guardada: la reserva está en curso',
  savedReturn: 'Acta guardada: la reserva quedó completada',
  savedFix: 'Acta corregida',
  km: 'Kilometraje del tablero',
  kmHint: (km: string) => `Odómetro registrado de la unidad: ${km} km`,
  kmAtDelivery: (km: string) => `En la entrega: ${km} km`,
  kmBelow: 'El kilometraje no puede ser menor al de la entrega.',
  fuel: 'Nivel de combustible',
  fuelAtDelivery: (f: string) => `En la entrega: ${f}`,
  photos: 'Fotos de la unidad',
  takePhoto: 'Tomar foto',
  pickPhotos: 'Galería',
  uploading: 'Subiendo…',
  photoLabel: 'Etiqueta',
  removePhoto: 'Quitar foto',
  noPhotos: 'Toma al menos las 4 caras del auto y el tablero.',
  damages: 'Daños',
  damagesHint: 'Toca la zona del auto donde está el daño.',
  deliveryDamages: 'Daños anotados en la entrega',
  noDamages: 'Sin daños anotados.',
  addDamage: 'Agregar daño',
  damageDesc: 'Descripción',
  damageDescPh: 'Rayón de 10 cm, abolladura…',
  severity: 'Severidad',
  damagePhoto: 'Foto del daño',
  markNew: 'Es un daño nuevo',
  newBadge: 'Nuevo',
  checklist: 'Checklist',
  notes: 'Observaciones',
  notesPh: 'Algo que el cliente o el siguiente turno deba saber',
  agreed: 'El cliente revisó el acta',
  agreedPh: 'Nombre de quien revisó',
  agreedHint: 'Escribe el nombre del cliente que revisó el estado de la unidad contigo.',
  comparison: 'Comparación con la entrega',
  kmDriven: 'Km recorridos',
  included: 'Incluidos',
  unlimited: 'Ilimitado',
  extraKm: 'Km extra',
  extraCharge: 'Cargo estimado por km extra',
  fuelDiff: 'Combustible',
  fuelSame: 'Igual que en la entrega',
  fuelLess: (n: number) => `Faltan ${n}/8 de tanque`,
  fuelMore: (n: number) => `${n}/8 más que en la entrega`,
  newDamages: 'Daños nuevos',
  goGuarantee: 'Hay daños nuevos: revisa la garantía antes de liberarla.',
  by: 'Hecha por',
  agreedBy: 'Revisó',
  gallery: 'Fotos',
  close: 'Cerrar',
}

export const fuelLabel = (octavos: number) =>
  octavos === 8 ? 'Lleno' : octavos === 0 ? 'Vacío' : `${octavos}/8`

export const photoLabels = ['Frente', 'Atrás', 'Lado izq.', 'Lado der.', 'Tablero', 'Interior']

export const damageZones: Record<DamageZone, string> = {
  front: 'Frente',
  rear: 'Atrás',
  left: 'Lado izquierdo',
  right: 'Lado derecho',
  roof: 'Techo',
  windshield: 'Parabrisas',
  wheels: 'Llantas / aros',
  interior: 'Interior',
  trunk: 'Maletero',
  other: 'Otro',
}

export const damageSeverities: Record<DamageSeverity, StatusDef> = {
  minor: { label: 'Leve', tone: 'accent' },
  moderate: { label: 'Moderado', tone: 'warning' },
  severe: { label: 'Grave', tone: 'danger' },
}

export const checklistItems: Record<ChecklistKey, { label: string; icon: string }> = {
  spareTire: { label: 'Llanta de emergencia', icon: 'fa-solid fa-circle-dot' },
  jack: { label: 'Gata y llave de ruedas', icon: 'fa-solid fa-wrench' },
  documents: { label: 'Matrícula y documentos', icon: 'fa-regular fa-id-card' },
  cleanInterior: { label: 'Limpieza interior', icon: 'fa-solid fa-couch' },
  cleanExterior: { label: 'Limpieza exterior', icon: 'fa-solid fa-spray-can-sparkles' },
  accessories: { label: 'Accesorios (silla, GPS…)', icon: 'fa-solid fa-baby-carriage' },
}

// ─── Garantía ───────────────────────────────────────────────────────────
export const guaranteeCopy = {
  title: 'Garantía',
  reminder:
    'La garantía no se cobra en línea: se retiene con Datafast (voucher), efectivo o transferencia en el local.',
  amount: 'Monto',
  method: 'Método',
  reference: 'Referencia o voucher',
  referencePh: 'N.º de voucher Datafast, comprobante…',
  notes: 'Nota (opcional)',
  hold: 'Registrar retención',
  release: 'Liberar',
  charge: 'Cobrar',
  chargedAmount: 'Monto a cobrar',
  chargeReason: 'Motivo del cobro',
  chargeReasonPh: 'Daño en parachoques, km extra, combustible…',
  reasonRequired: 'Escribe el motivo del cobro.',
  invalidAmount: 'Escribe un monto mayor a cero.',
  tooMuch: 'No puedes cobrar más que lo retenido.',
  releaseTitle: '¿Liberar la garantía?',
  releaseMsg: 'Confirma que devolviste el voucher o el dinero al cliente.',
  heldAt: 'Retenida el',
  settledAt: 'Cerrada el',
  charged: 'Cobrado',
  saved: 'Garantía actualizada',
  onlyAdmin: 'Solo un administrador puede cobrar la garantía.',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
}

export const guaranteeStatuses: Record<string, StatusDef> = {
  pending: { label: 'Pendiente', tone: 'accent', icon: 'fa-solid fa-hourglass-half' },
  held: { label: 'Retenida', tone: 'blue', icon: 'fa-solid fa-lock' },
  released: { label: 'Liberada', tone: 'success', icon: 'fa-solid fa-lock-open' },
  charged: { label: 'Cobrada', tone: 'danger', icon: 'fa-solid fa-hand-holding-dollar' },
  partially_charged: {
    label: 'Cobrada parcial',
    tone: 'warning',
    icon: 'fa-solid fa-hand-holding-dollar',
  },
}

export const guaranteeMethods: Record<GuaranteeMethod, { label: string; icon: string }> = {
  datafast: { label: 'Datafast', icon: 'fa-regular fa-credit-card' },
  cash: { label: 'Efectivo', icon: 'fa-solid fa-money-bill-wave' },
  transfer: { label: 'Transferencia', icon: 'fa-solid fa-building-columns' },
}

// ─── Anulación de pagos ─────────────────────────────────────────────────
export const voidCopy = {
  action: 'Anular',
  title: (amount: string) => `¿Anular el pago de ${amount}?`,
  message:
    'Úsalo solo si el pago se registró por error y no entró dinero. Si hubo dinero y se devolvió, es un reembolso.',
  reason: 'Motivo (obligatorio)',
  reasonPh: 'Registrado dos veces, monto equivocado…',
  reasonRequired: 'Escribe el motivo de la anulación.',
  done: 'Pago anulado',
  voidedAt: (date: string, by: string) => `Anulado el ${date}${by ? ` por ${by}` : ''}`,
  staffWindow: 'Puedes anular hasta 24 h después del registro; luego solo un administrador.',
}

/** Estados de pago del panel + "Anulado" (v1.3). */
export const paymentStatusesV13: Record<string, StatusDef> = {
  ...paymentStatuses,
  voided: { label: 'Anulado', tone: 'neutral' },
}

// ─── Historial de la unidad ─────────────────────────────────────────────
export const vehicleHistoryCopy = {
  back: 'Flota',
  history: 'Historial',
  km: 'Km actuales',
  rentals: 'Rentas',
  kmDriven: 'Km recorridos',
  revenue: 'Ingresos',
  maintenance: 'Gasto en taller',
  timeline: 'Línea de tiempo',
  empty: 'Todavía no hay movimientos para esta unidad.',
  addLog: 'Agregar a la bitácora',
  logType: 'Tipo',
  logDate: 'Fecha',
  logKm: 'Km (opcional)',
  logCost: 'Costo (opcional)',
  logDesc: 'Descripción',
  logDescPh: 'Cambio de aceite y filtros, alineación…',
  descRequired: 'Escribe una descripción.',
  saved: 'Agregado a la bitácora',
  deleted: 'Registro eliminado',
  deleteTitle: '¿Eliminar este registro de la bitácora?',
  deleteMsg: 'Las actas y reservas no se tocan.',
  openReservation: 'Ver reserva',
  save: 'Guardar',
  cancel: 'Cancelar',
}

export const logTypes: Record<
  Exclude<VehicleLogType, 'status_change'>,
  { label: string; icon: string }
> = {
  maintenance: { label: 'Mantenimiento', icon: 'fa-solid fa-oil-can' },
  repair: { label: 'Reparación', icon: 'fa-solid fa-screwdriver-wrench' },
  damage: { label: 'Daño', icon: 'fa-solid fa-car-burst' },
  note: { label: 'Nota', icon: 'fa-regular fa-note-sticky' },
}
