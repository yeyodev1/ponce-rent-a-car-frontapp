<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import CategoriesTab from '@/components/admin/fleet/CategoriesTab.vue'
import VehiclesTab from '@/components/admin/fleet/VehiclesTab.vue'

const route = useRoute()
const router = useRouter()
const tab = ref(route.query.tab === 'unidades' ? 'unidades' : 'categorias')
watch(tab, (t) => router.replace({ query: { tab: t } }))

const tabs = [
  { value: 'categorias', label: 'Categorías', icon: 'fa-solid fa-layer-group' },
  { value: 'unidades', label: 'Unidades', icon: 'fa-solid fa-car' },
]
</script>

<template>
  <div>
    <PageHeader title="Flota" subtitle="Categorías que se venden en la web y las unidades físicas de cada una.">
      <RouterLink to="/admin/disponibilidad" class="btn btn--ghost btn--sm"><i class="fa-solid fa-calendar-days"></i> Disponibilidad</RouterLink>
    </PageHeader>
    <AdminTabs v-model="tab" :tabs="tabs" />
    <Transition name="fade" mode="out-in">
      <CategoriesTab v-if="tab === 'categorias'" />
      <VehiclesTab v-else />
    </Transition>
  </div>
</template>
