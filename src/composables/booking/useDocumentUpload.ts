import { reactive } from 'vue'
import { publicService } from '@/services/public.service'
import { track } from '@/composables/useAnalytics'
import { t } from '@/i18n'
import { booking } from './useBookingState'

/**
 * Subida de licencia y cédula/pasaporte. Las fotos del teléfono pesan 4–8 MB:
 * se reducen en el navegador (lado mayor 1600 px, JPEG 0.8) antes de enviarlas,
 * así la subida tarda segundos incluso con datos móviles.
 */

export type DocKind = 'license' | 'identity'
type Phase = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

interface DocSlot {
  phase: Phase
  preview: string
  fileName: string
  isPdf: boolean
  error: string
  file: File | null
}

const MAX_BYTES = 8 * 1024 * 1024

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

export async function compressImage(file: File, maxSide = 1600, quality = 0.8): Promise<string> {
  try {
    const img = await loadImage(file)
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    // Fondo blanco: un PNG con transparencia no debe volverse negro en JPEG.
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    // Formatos que el navegador no decodifica (p. ej. HEIC en escritorio): se manda tal cual.
    return readAsDataUrl(file)
  }
}

function slot(): DocSlot {
  return { phase: 'idle', preview: '', fileName: '', isPdf: false, error: '', file: null }
}

export const docs = reactive<Record<DocKind, DocSlot>>({ license: slot(), identity: slot() })

export async function uploadDoc(kind: DocKind, file?: File) {
  const s = docs[kind]
  const res = booking.reservation
  const f = file || s.file
  if (!res || !f) return
  s.file = f
  s.fileName = f.name
  s.isPdf = f.type === 'application/pdf'
  s.error = ''
  s.phase = 'compressing'
  try {
    const dataUrl = s.isPdf ? await readAsDataUrl(f) : await compressImage(f)
    // Un dataURL pesa ~4/3 del archivo; el límite del backend es sobre el archivo.
    if (dataUrl.length * 0.75 > MAX_BYTES) {
      s.phase = 'error'
      s.error = t('booking.documents.tooBig')
      return
    }
    if (!s.isPdf) s.preview = dataUrl
    s.phase = 'uploading'
    const out = await publicService.uploadDocument(res.code, res.token, kind, dataUrl)
    booking.documents = { ...out.documents }
    if (out.status && booking.reservation) booking.reservation.status = out.status as typeof res.status
    s.phase = 'done'
    if (booking.documents.license && booking.documents.identity) track('documents_upload', { reservation: res.code })
  } catch (e) {
    s.phase = 'error'
    s.error = (e as { message?: string }).message || t('booking.documents.error')
  }
}

export function resetDocs() {
  docs.license = slot()
  docs.identity = slot()
}
