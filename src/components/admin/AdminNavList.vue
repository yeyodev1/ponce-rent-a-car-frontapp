<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menu } from '@/config/admin'
import { useUserStore } from '@/stores/user'

defineProps<{ collapsed?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const userStore = useUserStore()

// Lo que el rol no puede usar no se muestra (no basta con deshabilitarlo).
const groups = computed(() =>
  menu
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || userStore.isAdmin) }))
    .filter((g) => g.items.length),
)

const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))
</script>

<template>
  <nav class="nav" :class="{ 'nav--collapsed': collapsed }" aria-label="Menú del panel">
    <div v-for="group in groups" :key="group.title" class="nav__group">
      <p class="nav__title">{{ group.title }}</p>
      <RouterLink
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        class="nav__item"
        :class="{ 'nav__item--active': isActive(item.to) }"
        :title="collapsed ? item.label : undefined"
        @click="emit('navigate')"
      >
        <i :class="item.icon" class="nav__icon"></i>
        <span class="nav__label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.nav {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__group {
    @include flex(column, stretch, flex-start, 0.15rem);
  }

  &__title {
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba($on-dark, 0.42);
    padding: 0 0.85rem 0.25rem;
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }

  &__item {
    position: relative;
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.5rem 0.85rem;
    border-radius: 11px;
    font-size: 0.88rem;
    font-weight: 600;
    color: $on-dark-soft;
    white-space: nowrap;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: rgba($on-dark, 0.07);
      color: $on-dark;
    }

    // Barra amarilla a la izquierda del ítem activo.
    &::before {
      content: '';
      position: absolute;
      left: -0.75rem;
      top: 22%;
      bottom: 22%;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: $accent;
      transform: scaleY(0);
      transition: transform 0.3s $ease;
    }

    &--active {
      background: rgba($accent, 0.12);
      color: $surface;

      &::before {
        transform: scaleY(1);
      }

      .nav__icon {
        color: $accent;
      }
    }
  }

  &__icon {
    width: 20px;
    text-align: center;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  &__label {
    transition: opacity 0.2s ease;
  }

  &--collapsed {
    .nav__title,
    .nav__label {
      opacity: 0;
      pointer-events: none;
    }

    .nav__title {
      height: 0.6rem;
      padding: 0;
    }
  }
}

// Laptops de 800 px de alto: sin esto "Sistema" (Personal, Integraciones)
// queda escondido bajo el pie del menú y parece que no existe.
@media (max-height: 860px) {
  .nav {
    gap: 0.5rem;
  }

  .nav__item {
    padding-block: 0.3rem;
  }
}
</style>
