<script setup lang="ts">
import { useRoute } from 'vue-router'
import { bottomNav, copy } from '@/config/admin'

defineProps<{ moreOpen: boolean }>()
const emit = defineEmits<{ more: [] }>()

const route = useRoute()
const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))
const inMore = () => !bottomNav.some((i) => isActive(i.to))
</script>

<template>
  <nav class="bnav" aria-label="Navegación del panel">
    <RouterLink
      v-for="item in bottomNav"
      :key="item.to"
      :to="item.to"
      class="bnav__item"
      :class="{ 'bnav__item--active': isActive(item.to) && !moreOpen }"
    >
      <i :class="item.icon"></i>
      <span>{{ item.label }}</span>
    </RouterLink>
    <button
      class="bnav__item"
      :class="{ 'bnav__item--active': moreOpen || inMore() }"
      type="button"
      @click="emit('more')"
    >
      <i class="fa-solid fa-bars"></i>
      <span>{{ copy.more }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.bnav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  @include flex(row, stretch, space-around);
  background: $navy;
  padding: 0.35rem 0.4rem calc(0.35rem + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 30px rgba($navy, 0.2);

  @include from('lg') {
    display: none;
  }

  &__item {
    flex: 1;
    @include flex(column, center, center, 0.2rem);
    min-height: 54px;
    border-radius: 12px;
    color: rgba($on-dark, 0.55);
    font-size: 0.66rem;
    font-weight: 700;
    position: relative;
    transition: color 0.2s ease;

    i {
      font-size: 1.05rem;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      width: 26px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: $accent;
      transform: scaleX(0);
      transition: transform 0.3s $ease;
    }

    &--active {
      color: $surface;

      i {
        color: $accent;
      }

      &::after {
        transform: scaleX(1);
      }
    }
  }
}
</style>
