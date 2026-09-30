<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '@/layout/TheHeader.vue'
import TheFooter from '@/layout/TheFooter.vue'
import TheTabBar from '@/layout/TheTabBar.vue'
import ToastList from '@/components/ui/ToastList.vue'
import { useCatalogStore } from '@/stores/catalog'
import { publicService } from '@/services/public.service'
import { refineLocaleByCountry } from '@/i18n'

const route = useRoute()
const catalog = useCatalogStore()

// layout "admin" y "bare" traen su propio marco; "focus" (wizards) oculta
// footer y barra inferior para que nada compita con la decisión.
const layout = computed(() => (route.meta.layout as string) || 'public')
const isFocus = computed(() => Boolean(route.meta.focus))

onMounted(() => {
  catalog.load()
  publicService
    .geo()
    .then((g) => g.country && refineLocaleByCountry(g.country))
    .catch(() => {})
})
</script>

<template>
  <div class="app" :class="[`app--${layout}`, { 'app--focus': isFocus }]">
    <TheHeader v-if="layout === 'public'" :minimal="isFocus" />
    <main class="app__main">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.meta.layout === 'admin' ? 'admin' : r.path" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter v-if="layout === 'public' && !isFocus" />
    <TheTabBar v-if="layout === 'public' && !isFocus" />
    <ToastList />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  // Mientras llega el chunk de la vista, el main vacío dejaba el footer
  // arriba del todo y al cargar saltaba abajo (CLS ≈ 1 en el home móvil).
  &--public:not(.app--focus) &__main {
    min-height: 100vh;
    min-height: 100svh;
  }

  // El header es fijo y no reserva espacio: los wizards no tienen hero que lo
  // compense, así que el layout les deja el hueco.
  &--focus &__main {
    padding-top: var(--header-h);
  }
}
</style>
