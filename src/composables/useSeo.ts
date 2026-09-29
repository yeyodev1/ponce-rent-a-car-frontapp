import { watchEffect } from 'vue'
import { site } from '@/config/site'
import { useI18n } from '@/i18n'

interface SeoInput {
  title: string
  description?: string
  canonicalPath?: string
  image?: string
  /** JSON-LD (schema.org) para esta página. */
  schema?: Record<string, unknown> | Record<string, unknown>[]
  noindex?: boolean
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Título, descripción, canonical, Open Graph y schema por página. Se re-evalúa
 * al cambiar de idioma. Los textos editables llegan de /public/seo/:key.
 */
export function useSeo(input: () => SeoInput) {
  const { locale } = useI18n()
  watchEffect(() => {
    const seo = input()
    // Los títulos del API ya pueden traer la marca: no se repite.
    const title = !seo.title ? site.name : seo.title.includes(site.shortName) ? seo.title : `${seo.title} | ${site.name}`
    document.title = title
    const desc = seo.description || ''
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:locale', locale.value === 'en' ? 'en_US' : 'es_EC')
    if (seo.image) setMeta('property', 'og:image', seo.image)
    const url = `${site.url}${seo.canonicalPath ?? window.location.pathname}`
    setMeta('property', 'og:url', url)
    setLink('canonical', url)
    setMeta('name', 'robots', seo.noindex ? 'noindex,nofollow' : 'index,follow')

    let script = document.getElementById('ld-json') as HTMLScriptElement | null
    if (seo.schema) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = 'ld-json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(seo.schema)
    } else if (script) {
      script.remove()
    }
  })
}

/** Schema base del negocio (AutoRental) para home y landings. */
export function businessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: site.name,
    url: site.url,
    telephone: site.phone,
    areaServed: 'Guayaquil, Ecuador',
    address: { '@type': 'PostalAddress', addressLocality: 'Guayaquil', addressCountry: 'EC' },
    sameAs: Object.values(site.social),
  }
}
