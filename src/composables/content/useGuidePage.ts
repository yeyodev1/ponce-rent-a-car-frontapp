import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicService } from '@/services/public.service'
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import type { Guide } from '@/types'

/** Guía por slug con su schema Article; los cuerpos se parten en párrafos por línea en blanco. */
export function useGuidePage() {
  const route = useRoute()
  const { tx, locale } = useI18n()
  const slug = computed(() => String(route.params.slug || ''))
  const guide = ref<Guide | null>(null)
  const loading = ref(true)
  const notFound = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    notFound.value = false
    error.value = ''
    try {
      guide.value = await publicService.guide(slug.value)
    } catch (e) {
      const err = e as { status?: number; message?: string }
      if (err.status === 404) notFound.value = true
      else error.value = err.message || 'Error'
    } finally {
      loading.value = false
    }
  }
  watch(slug, load, { immediate: true })

  const title = computed(() => (guide.value ? tx(guide.value.title) : ''))
  const sections = computed(() =>
    (guide.value?.sections || [])
      .map((s, i) => ({
        id: `seccion-${i + 1}`,
        heading: tx(s.heading),
        paragraphs: tx(s.body)
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      }))
      .filter((s) => s.heading || s.paragraphs.length),
  )

  const schema = computed(() => {
    const g = guide.value
    if (!g) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title.value,
      description: tx(g.excerpt),
      image: g.cover ? [g.cover] : undefined,
      datePublished: g.publishedAt || undefined,
      inLanguage: locale.value,
      mainEntityOfPage: `${site.url}/guias-de-viaje/${g.slug}`,
      author: { '@type': 'Organization', name: site.name, url: site.url },
      publisher: { '@type': 'Organization', name: site.name, url: site.url },
    }
  })

  return { slug, guide, title, sections, loading, notFound, error, reload: load, schema }
}
