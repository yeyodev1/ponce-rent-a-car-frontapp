import { computed, ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import { useSeo } from '@/composables/useSeo'
import { useI18n } from '@/i18n'
import type { SeoPage } from '@/types'

type Schema = Record<string, unknown> | Record<string, unknown>[]

interface PageSeoOptions {
  /** Clave de /public/seo/:key. Vacía = solo textos locales (fichas, guías). */
  key: () => string
  /** Prefijo i18n con title, description, h1 e intro de respaldo. */
  fallback: () => string
  image?: () => string
  schema?: () => Schema | undefined
  /** Texto propio de la página (p. ej. el nombre de la categoría) que manda sobre el fallback. */
  override?: () => Partial<Record<'title' | 'description' | 'h1' | 'intro', string>>
  noindex?: () => boolean
}

const cache = new Map<string, SeoPage | null>()

/**
 * Textos SEO editables desde el panel con respaldo en i18n: si el API falla o
 * el campo viene vacío la página sigue teniendo título, H1 y descripción.
 */
export function usePageSeo(opts: PageSeoOptions) {
  const { t, tx } = useI18n()
  const page = ref<SeoPage | null>(null)

  watch(
    opts.key,
    async (key) => {
      if (!key) return (page.value = null)
      if (cache.has(key)) return (page.value = cache.get(key) || null)
      try {
        const value = await publicService.seo(key)
        cache.set(key, value)
        if (opts.key() === key) page.value = value
      } catch {
        cache.set(key, null)
      }
    },
    { immediate: true },
  )

  const pick = (field: 'title' | 'description' | 'h1' | 'intro') => {
    const own = opts.override?.()[field]
    if (own) return own
    const remote = page.value ? tx(page.value[field]) : ''
    return remote || t(`${opts.fallback()}.${field}`)
  }

  const title = computed(() => pick('title'))
  const description = computed(() => pick('description'))
  const h1 = computed(() => pick('h1'))
  const intro = computed(() => pick('intro'))

  useSeo(() => {
    const canonical = page.value?.canonical || ''
    return {
      title: title.value,
      description: description.value,
      canonicalPath: canonical.startsWith('/') ? canonical : undefined,
      image: page.value?.ogImage || opts.image?.() || undefined,
      schema: opts.schema?.(),
      noindex: opts.noindex?.(),
    }
  })

  return { page, title, description, h1, intro }
}
