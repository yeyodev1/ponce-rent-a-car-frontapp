/**
 * Datos fijos de la marca. Los textos traducibles viven en src/i18n/messages;
 * lo editable por el dueño (precios, horarios, dirección) llega del API.
 */
export const site = {
  name: "Ponce's Rent a Car",
  shortName: "Ponce's",
  slogan: { es: 'Tu camino, tu elección', en: 'Your road, your choice' },
  url: 'https://poncesrentacar.com',
  email: '',
  // Solo dígitos con código de país
  whatsapp: '593998119853',
  phone: '+593998119853',
  phoneDisplay: '+593 99 811 9853',
  city: 'Guayaquil',
  social: {
    instagram: 'https://www.instagram.com/ponces.rent.car/',
    facebook: 'https://www.facebook.com/profile.php?id=61582730782692',
    tiktok: 'https://www.tiktok.com/@ponces_rentacar',
  },
  analytics: {
    // IDs públicos por diseño (van al navegador). Vacíos = no se cargan.
    ga4: import.meta.env.VITE_GA4_ID || '',
    metaPixel: import.meta.env.VITE_META_PIXEL_ID || '',
  },
} as const

export function whatsappLink(message = ''): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${site.whatsapp}${text}`
}

export const phoneLink = `tel:${site.phone}`
