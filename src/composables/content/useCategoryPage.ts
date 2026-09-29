import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import type { Category } from '@/types'

/**
 * Ficha de categoría: pinta al instante con lo que ya trajo el catálogo y
 * luego confirma contra /public/categories/:slug (disponibilidad al día).
 */
export function useCategoryPage() {
  const route = useRoute()
  const catalog = useCatalogStore()
  const { tx } = useI18n()
  catalog.load()

  const slug = computed(() => String(route.params.slug || ''))
  const remote = ref<Category | null>(null)
  const loading = ref(true)
  const notFound = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    notFound.value = false
    error.value = ''
    try {
      remote.value = await publicService.category(slug.value)
    } catch (e) {
      const err = e as { status?: number; message?: string }
      if (err.status === 404) notFound.value = true
      else error.value = err.message || 'Error'
    } finally {
      loading.value = false
    }
  }

  watch(slug, load, { immediate: true })

  const category = computed(() => remote.value || catalog.bySlug(slug.value))
  const name = computed(() => (category.value ? tx(category.value.name) : ''))
  const images = computed(() => {
    const c = category.value
    if (!c) return []
    return [c.image, ...(c.gallery || [])].filter((src, i, arr) => src && arr.indexOf(src) === i)
  })

  const schema = computed(() => {
    const c = category.value
    if (!c) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${tx(c.name)} — ${site.name}`,
      description: tx(c.description) || tx(c.tagline),
      image: images.value,
      category: 'Car rental',
      brand: { '@type': 'Brand', name: site.name },
      offers: {
        '@type': 'Offer',
        price: (c.pricePerDay / 100).toFixed(2),
        priceCurrency: 'USD',
        url: `${site.url}/vehiculos/${c.slug}`,
        availability:
          c.availableUnits === 0
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: (c.pricePerDay / 100).toFixed(2),
          priceCurrency: 'USD',
          unitCode: 'DAY',
        },
      },
    }
  })

  return { slug, category, name, images, loading, notFound, error, reload: load, schema }
}
