/**
 * Comprime una foto en el navegador antes de mandarla como dataURL: una foto
 * de celular pesa 4–8 MB y por datos móviles no llegaría nunca. Se reescala
 * al lado mayor indicado y se exporta como JPEG.
 */
export interface CompressOptions {
  maxSide?: number
  quality?: number
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
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<string> {
  const maxSide = opts.maxSide ?? 1280
  const quality = opts.quality ?? 0.78
  const img = await loadImage(file)
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.round(img.naturalWidth * scale)
  const height = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no permite procesar imágenes')
  // Fondo blanco: los PNG con transparencia quedarían negros en JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Igual que compressImage pero devuelve un File listo para multipart. Prefiere
 * WebP (pesa menos) y cae a JPEG si el navegador no lo sabe codificar: Safari
 * viejo devuelve PNG en silencio al pedir WebP. Vercel corta los cuerpos de
 * más de 4,5 MB, así que las fotos del panel siempre pasan por aquí.
 */
export async function compressToFile(file: File, opts: CompressOptions = {}): Promise<File> {
  const maxSide = opts.maxSide ?? 1600
  const quality = opts.quality ?? 0.82
  const img = await loadImage(file)
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.round(img.naturalWidth * scale)
  const height = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no permite procesar imágenes')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  let blob = await canvasToBlob(canvas, 'image/webp', quality)
  if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  if (!blob) throw new Error('No se pudo procesar la imagen')
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const base = file.name.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], `${base}.${ext}`, { type: blob.type })
}
