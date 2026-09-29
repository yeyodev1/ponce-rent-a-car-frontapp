import { defineStore } from 'pinia'
import { publicService } from '@/services/public.service'
import type { Category, Coverage, Extra, PublicConfig } from '@/types'

/**
 * Configuración y catálogo se piden una sola vez por visita: el home, la
 * Ruta A y la Ruta B los comparten.
 */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    config: null as PublicConfig | null,
    categories: [] as Category[],
    coverages: [] as Coverage[],
    extras: [] as Extra[],
    loading: false,
    loaded: false,
    error: '',
  }),

  getters: {
    bySlug: (s) => (slug: string) => s.categories.find((c) => c.slug === slug) || null,
    minPrice: (s) => (s.categories.length ? Math.min(...s.categories.map((c) => c.pricePerDay)) : 0),
  },

  actions: {
    async load(force = false) {
      if ((this.loaded || this.loading) && !force) return
      this.loading = true
      this.error = ''
      try {
        const [config, categories, coverages, extras] = await Promise.all([
          publicService.config(),
          publicService.categories(),
          publicService.coverages(),
          publicService.extras(),
        ])
        this.config = config
        this.categories = categories
        this.coverages = coverages
        this.extras = extras
        this.loaded = true
      } catch (e) {
        this.error = (e as { message?: string }).message || 'Error'
      } finally {
        this.loading = false
      }
    },
  },
})
