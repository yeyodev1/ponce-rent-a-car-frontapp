<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import { publicService } from '@/services/public.service'
import { businessSchema, useSeo } from '@/composables/useSeo'
import type { SeoPage } from '@/types'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeCategories from '@/components/home/HomeCategories.vue'
import HomeSteps from '@/components/home/HomeSteps.vue'
import HomeAirport from '@/components/home/HomeAirport.vue'
import HomeSections from '@/components/home/HomeSections.vue'
import HomeTrust from '@/components/home/HomeTrust.vue'
import HomeFinalCta from '@/components/home/HomeFinalCta.vue'

const { t, tx } = useI18n()

// SEO editable desde el panel; si el API no responde, el copy del i18n.
const seoPage = ref<SeoPage | null>(null)
publicService
  .seo('home')
  .then((page) => (seoPage.value = page))
  .catch(() => {})

// useSeo ya agrega la marca al final: se quita si el título editable la trae.
const stripBrand = (title: string) => title.replace(/\s*[|—–-]\s*Ponce.s Rent a Car\s*$/i, '')

useSeo(() => ({
  title: stripBrand(tx(seoPage.value?.title)) || t('home.seo.title'),
  description: tx(seoPage.value?.description) || t('home.seo.description'),
  canonicalPath: '/',
  image: seoPage.value?.ogImage || undefined,
  schema: businessSchema(),
}))
</script>

<template>
  <div class="home">
    <HomeHero />
    <HomeCategories />
    <HomeSteps />
    <HomeAirport />
    <HomeSections />
    <HomeTrust />
    <HomeFinalCta />
  </div>
</template>

<style scoped lang="scss">
.home {
  overflow-x: clip;
}
</style>
