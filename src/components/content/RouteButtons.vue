<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import { useI18n } from '@/i18n'
import { track } from '@/composables/useAnalytics'

/** Las dos rutas del sitio como botones de portada (Ruta A verde, Ruta B azul). */
const props = withDefaults(
  defineProps<{ source: string; helpQuery?: LocationQueryRaw; bookQuery?: LocationQueryRaw }>(),
  { helpQuery: () => ({}), bookQuery: () => ({}) },
)
const { t } = useI18n()
</script>

<template>
  <RouterLink
    :to="{ path: '/ayudame-a-elegir', query: helpQuery }"
    class="btn btn--whatsapp btn--lg"
  >
    <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> {{ t('common.actions.helpMeChoose') }}
  </RouterLink>
  <RouterLink
    :to="{ path: '/reservar', query: bookQuery }"
    class="btn btn--blue btn--lg"
    @click="track('route_b_start', { source: props.source })"
  >
    <i class="fa-solid fa-car-side" aria-hidden="true"></i> {{ t('common.actions.bookOnline') }}
  </RouterLink>
</template>
