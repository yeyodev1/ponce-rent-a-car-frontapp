import { adminService } from '@/services/admin.service'
import { compressToFile } from '@/utils/compressImage'

/** Tipos que el API acepta (valida los bytes reales, no la extensión). */
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export const isUploadableImage = (file: File) => file.type.startsWith('image/')

/**
 * Sube una imagen pública del panel. Se reduce en el navegador (≤1600 px,
 * WebP o JPEG): Vercel corta cuerpos de más de 4,5 MB y así además la web
 * pública carga fotos livianas. Si el navegador no puede decodificarla (HEIC
 * en escritorio) se manda el original solo si ya es un formato aceptado.
 */
export async function uploadPublicImage(file: File): Promise<string> {
  let toSend = file
  try {
    toSend = await compressToFile(file)
  } catch {
    if (!ACCEPTED.includes(file.type)) throw { status: 400, message: 'Formato no compatible. Usa JPG, PNG o WebP.' }
  }
  const { url } = await adminService.upload(toSend)
  return url
}
