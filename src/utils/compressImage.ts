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
