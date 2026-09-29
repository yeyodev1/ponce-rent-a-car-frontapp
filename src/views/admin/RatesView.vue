<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import CoveragesTab from '@/components/admin/rates/CoveragesTab.vue'
import ExtrasTab from '@/components/admin/rates/ExtrasTab.vue'
import BookingRulesTab from '@/components/admin/rates/BookingRulesTab.vue'

const tabs = [
  { value: 'reglas', label: 'Reglas de reserva', icon: 'fa-solid fa-scale-balanced' },
  { value: 'coberturas', label: 'Coberturas', icon: 'fa-solid fa-shield-halved' },
  { value: 'extras', label: 'Extras', icon: 'fa-solid fa-puzzle-piece' },
]

const route = useRoute()
const router = useRouter()
const initial = tabs.some((t) => t.value === route.query.tab) ? String(route.query.tab) : 'reglas'
const tab = ref(initial)
watch(tab, (t) => router.replace({ query: { tab: t } }))
</script>

<template>
  <div>
    <PageHeader title="Tarifas y reglas" subtitle="Precios adicionales y las reglas que aplica la reserva en línea. Los precios por categoría se editan en Flota." />
    <AdminTabs v-model="tab" :tabs="tabs" />
    <Transition name="fade" mode="out-in">
      <BookingRulesTab v-if="tab === 'reglas'" />
      <CoveragesTab v-else-if="tab === 'coberturas'" />
      <ExtrasTab v-else />
    </Transition>
  </div>
</template>
