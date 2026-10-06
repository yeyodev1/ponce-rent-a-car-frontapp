import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicService } from '@/services/public.service'
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import type { PublicVehicle } from '@/types/contract'

const FUEL_SCHEMA: Record<string, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  electric: 'Electric',
}

/**
 * Ficha pública de una unidad (/vehiculos/:categoria/:unidad). La venta sigue
 * siendo por categoría: la unidad es la referencia concreta de lo que se recibe.
 */
export function useUnitPage() {
  const route = useRoute()
  const router = useRouter()
  const { tx } = useI18n()

  const categorySlug = computed(() => String(route.params.slug || ''))
  const unitSlug = computed(() => String(route.params.unit || ''))
  const vehicle = ref<PublicVehicle | null>(null)
  const loading = ref(true)
  const notFound = ref(false)

  async function load() {
    loading.value = true
    notFound.value = false
    try {
      const v = await publicService.vehicle(unitSlug.value)
      vehicle.value = v
      // Si la unidad cambió de categoría, la URL vieja lleva a la correcta.
      if (v.category.slug !== categorySlug.value) {
        router.replace({ path: `/vehiculos/${v.category.slug}/${v.slug}` })
      }
    } catch {
      vehicle.value = null
      notFound.value = true
    } finally {
      loading.value = false
    }
  }

  watch(unitSlug, load, { immediate: true })

  const unitName = computed(() => {
    const v = vehicle.value
    return v ? [v.brand, v.model, v.year].filter(Boolean).join(' ') : ''
  })
  const categoryName = computed(() => (vehicle.value ? tx(vehicle.value.category.name) : ''))
  const images = computed(() => {
    const v = vehicle.value
    if (!v) return []
    const list = v.images.length ? v.images : [v.category.image]
    return list.filter((src, i, arr) => src && arr.indexOf(src) === i)
  })
  const url = computed(() => (vehicle.value ? `${site.url}/vehiculos/${vehicle.value.category.slug}/${vehicle.value.slug}` : ''))

  const schema = computed(() => {
    const v = vehicle.value
    if (!v) return undefined
    const price = (v.category.pricePerDay / 100).toFixed(2)
    return {
      '@context': 'https://schema.org',
      '@type': ['Product', 'Car'],
      name: unitName.value,
      description: v.description || tx(v.category.tagline),
      image: images.value,
      brand: { '@type': 'Brand', name: v.brand },
      model: v.model,
      vehicleModelDate: String(v.year),
      vehicleTransmission: v.transmission === 'manual' ? 'Manual' : 'Automatic',
      fuelType: FUEL_SCHEMA[v.fuel] || v.fuel,
      seatingCapacity: v.seats,
      color: v.color || undefined,
      category: categoryName.value,
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'USD',
        url: url.value,
        availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
        seller: { '@type': 'AutoRental', name: site.name },
        priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency: 'USD', unitCode: 'DAY' },
      },
    }
  })

  return { categorySlug, vehicle, loading, notFound, unitName, categoryName, images, schema, url }
}
