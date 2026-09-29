<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from './AdminSidebar.vue'
import AdminBottomNav from './AdminBottomNav.vue'
import AdminMobileMenu from './AdminMobileMenu.vue'
import AdminWordmark from './AdminWordmark.vue'

const COLLAPSE_KEY = 'ponce_admin_sidebar'

const route = useRoute()
const menuOpen = ref(false)

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

const collapsed = ref(readCollapsed())

watch(collapsed, (v) => {
  try {
    localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0')
  } catch {
    /* modo privado */
  }
})

watch(() => route.path, () => (menuOpen.value = false))

const title = computed(() => (route.meta.title as string) || 'Panel')
</script>

<template>
  <div class="admin">
    <AdminSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />

    <div class="admin__main">
      <header class="admin__mbar">
        <RouterLink to="/admin" aria-label="Inicio del panel"><AdminWordmark compact /></RouterLink>
        <span class="admin__mtitle">{{ title }}</span>
        <a href="/" target="_blank" rel="noopener" class="admin__mlink" aria-label="Ver sitio">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </header>

      <main class="admin__content">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="admin-view" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <AdminBottomNav :more-open="menuOpen" @more="menuOpen = !menuOpen" />
    <AdminMobileMenu :open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<style scoped lang="scss">
.admin {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: $paper;
  color: $ink;

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start);
  }

  &__mbar {
    position: sticky;
    top: 0;
    z-index: 30;
    @include flex(row, center, space-between, 0.75rem);
    padding: 0.6rem 1rem;
    padding-top: calc(0.6rem + env(safe-area-inset-top));
    background: rgba($navy, 0.97);
    backdrop-filter: blur(10px);
    color: $on-dark;

    @include from('lg') {
      display: none;
    }
  }

  &__mtitle {
    flex: 1;
    font-weight: 800;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__mlink {
    @include flex(row, center, center);
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: rgba($on-dark, 0.08);
    font-size: 0.85rem;
  }

  &__content {
    flex: 1;
    width: 100%;
    max-width: 1320px;
    margin-inline: auto;
    padding: 1.1rem 1rem calc(88px + env(safe-area-inset-bottom));

    @include from('md') {
      padding: 1.6rem 1.75rem 96px;
    }

    @include from('lg') {
      padding: 2rem 2.25rem 3rem;
    }
  }
}

.admin-view-enter-active {
  transition:
    opacity 0.3s $ease,
    transform 0.3s $ease;
}

.admin-view-leave-active {
  transition: opacity 0.14s ease;
}

.admin-view-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.admin-view-leave-to {
  opacity: 0;
}
</style>
