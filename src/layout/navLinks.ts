/**
 * Mapa de secciones del sitio. Header, menú móvil y footer leen de aquí para
 * que un enlace nuevo aparezca en todos lados a la vez.
 * `key` apunta a common.nav.<key>.
 */
export interface NavLink {
  key: string
  to: string
  icon: string
}

export const navLinks: NavLink[] = [
  { key: 'vehicles', to: '/vehiculos', icon: 'fa-solid fa-car-side' },
  { key: 'airport', to: '/alquiler-autos-aeropuerto-guayaquil', icon: 'fa-solid fa-plane-arrival' },
  { key: 'business', to: '/empresas', icon: 'fa-solid fa-briefcase' },
  { key: 'promotions', to: '/promociones', icon: 'fa-solid fa-tag' },
  { key: 'hotels', to: '/hoteles-aliados', icon: 'fa-solid fa-hotel' },
  { key: 'guides', to: '/guias-de-viaje', icon: 'fa-solid fa-map-location-dot' },
  { key: 'renaissance', to: '/ponces-renaissance', icon: 'fa-solid fa-crown' },
  { key: 'partner', to: '/socio-sobre-ruedas', icon: 'fa-solid fa-handshake' },
  { key: 'faq', to: '/preguntas-frecuentes', icon: 'fa-solid fa-circle-question' },
  { key: 'contact', to: '/contacto', icon: 'fa-solid fa-headset' },
]

/** Las que caben en la barra del header de escritorio. */
export const desktopKeys = ['vehicles', 'airport', 'business', 'promotions', 'hotels', 'guides']

export const linkByKey = (key: string) => navLinks.find((l) => l.key === key)!
