<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import PromotionsTab from '@/components/admin/content/PromotionsTab.vue'
import HotelsTab from '@/components/admin/content/HotelsTab.vue'
import GuidesTab from '@/components/admin/content/GuidesTab.vue'
import FaqsTab from '@/components/admin/content/FaqsTab.vue'
import SeoTab from '@/components/admin/content/SeoTab.vue'

const tabs = [
  { value: 'promociones', label: 'Promociones', icon: 'fa-solid fa-percent' },
  { value: 'hoteles', label: 'Hoteles', icon: 'fa-solid fa-hotel' },
  { value: 'guias', label: 'Guías', icon: 'fa-solid fa-map-location-dot' },
  { value: 'faqs', label: 'Preguntas', icon: 'fa-solid fa-circle-question' },
  { value: 'seo', label: 'SEO', icon: 'fa-solid fa-magnifying-glass-chart' },
]

const route = useRoute()
const router = useRouter()
const tab = ref(tabs.some((t) => t.value === route.query.tab) ? String(route.query.tab) : 'promociones')
watch(tab, (t) => router.replace({ query: { tab: t } }))
</script>

<template>
  <div>
    <PageHeader title="Contenido" subtitle="Todo lo que se lee en la web, en español e inglés." />
    <AdminTabs v-model="tab" :tabs="tabs" />
    <Transition name="fade" mode="out-in">
      <PromotionsTab v-if="tab === 'promociones'" />
      <HotelsTab v-else-if="tab === 'hoteles'" />
      <GuidesTab v-else-if="tab === 'guias'" />
      <FaqsTab v-else-if="tab === 'faqs'" />
      <SeoTab v-else />
    </Transition>
  </div>
</template>
