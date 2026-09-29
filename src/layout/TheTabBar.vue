<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import { useMobileMenu } from '@/composables/useMobileMenu'

/**
 * Barra inferior tipo app, solo en móvil. Publica su alto en --tabbar-h para
 * que las vistas (y los pies fijos de los wizards) no queden tapados.
 */
const { t } = useI18n()
const menu = useMobileMenu()
const bar = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null

const home = { key: 'home', to: '/', icon: 'fa-solid fa-house' }
const left = { key: 'vehicles', to: '/vehiculos', icon: 'fa-solid fa-car-side' }
const right = { key: 'promotions', to: '/promociones', icon: 'fa-solid fa-tag' }

function publishHeight() {
  const el = bar.value
  // offsetHeight es 0 cuando la barra está oculta (≥ md)
  const h = el ? el.offsetHeight : 0
  document.documentElement.style.setProperty('--tabbar-h', `${h}px`)
}

onMounted(() => {
  publishHeight()
  if ('ResizeObserver' in window && bar.value) {
    observer = new ResizeObserver(publishHeight)
    observer.observe(bar.value)
  }
  window.addEventListener('resize', publishHeight, { passive: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('resize', publishHeight)
  document.documentElement.style.setProperty('--tabbar-h', '0px')
})
</script>

<template>
  <nav ref="bar" class="tabbar" :aria-label="t('common.nav.menu')">
    <RouterLink :to="home.to" class="tabbar__item" exact-active-class="tabbar__item--on" @click="menu.close">
      <i :class="home.icon"></i>
      <span>{{ t(`common.nav.${home.key}`) }}</span>
    </RouterLink>
    <RouterLink :to="left.to" class="tabbar__item" active-class="tabbar__item--on" @click="menu.close">
      <i :class="left.icon"></i>
      <span>{{ t(`common.nav.${left.key}`) }}</span>
    </RouterLink>

    <RouterLink to="/reservar" class="tabbar__item tabbar__book" @click="menu.close">
      <span class="tabbar__fab"><i class="fa-solid fa-calendar-check"></i></span>
      <span>{{ t('home.layout.book') }}</span>
    </RouterLink>

    <RouterLink :to="right.to" class="tabbar__item" active-class="tabbar__item--on" @click="menu.close">
      <i :class="right.icon"></i>
      <span>{{ t(`common.nav.${right.key}`) }}</span>
    </RouterLink>
    <button
      type="button"
      class="tabbar__item"
      :class="{ 'tabbar__item--on': menu.open.value }"
      :aria-expanded="menu.open.value"
      aria-controls="mobile-menu"
      @click="menu.toggle"
    >
      <i :class="menu.open.value ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
      <span>{{ t('common.nav.more') }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.tabbar {
  position: fixed;
  inset: auto 0 0;
  z-index: 58;
  @include flex(row, flex-end, space-around);
  padding: 0.35rem 0.25rem calc(0.35rem + env(safe-area-inset-bottom));
  background: rgba($surface, 0.9);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border-top: 1px solid rgba($navy, 0.08);
  box-shadow: 0 -10px 30px rgba($navy, 0.08);

  @include from('md') {
    display: none;
  }

  &__item {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    min-height: 52px;
    @include flex(column, center, center, 0.2rem);
    font-size: 0.66rem;
    font-weight: 700;
    color: $ink-muted;
    border-radius: $radius-sm;
    transition: color 0.2s ease;
    @include focus-ring($blue);

    i {
      font-size: 1.15rem;
      transition: transform 0.35s $ease-spring;
    }

    span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:active i {
      transform: scale(0.86);
    }

    &--on {
      color: $navy;

      i {
        color: $blue;
        transform: translateY(-1px);
      }
    }
  }

  // Botón central: amarillo, elevado, la acción estrella
  &__book {
    color: $navy;
  }

  &__fab {
    @include flex(row, center, center);
    width: 54px;
    height: 54px;
    margin-top: -26px;
    border-radius: 50%;
    background: $accent;
    color: $navy;
    border: 4px solid $surface;
    box-shadow: $shadow-glow;
    transition: transform 0.35s $ease-spring;

    i {
      font-size: 1.2rem;
    }
  }

  &__book:active &__fab {
    transform: scale(0.9);
  }

  &__book:active i {
    transform: none;
  }
}
</style>
