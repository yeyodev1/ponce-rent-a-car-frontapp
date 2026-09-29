<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import BrandLogo from '@/components/brand/BrandLogo.vue'
import LangSwitch from './LangSwitch.vue'
import TheMobileMenu from './TheMobileMenu.vue'
import { desktopKeys, linkByKey } from './navLinks'
import { useMobileMenu } from '@/composables/useMobileMenu'

/**
 * Header fijo y superpuesto: no reserva espacio. Cada página arranca con un hero
 * que ya suma --header-h a su padding (o el layout lo compensa en los wizards).
 * Sobre el hero del home arranca transparente y se vuelve sólido (navy con blur)
 * al hacer scroll. En los wizards (minimal) solo deja logo,
 * idioma y un botón para salir: nada compite con la decisión del paso.
 */
const props = withDefaults(defineProps<{ minimal?: boolean }>(), { minimal: false })

const { t } = useI18n()
const route = useRoute()
const menu = useMobileMenu()

const scrolled = ref(false)
const overHero = computed(() => route.name === 'Home' && !props.minimal)
const solid = computed(() => !overHero.value || scrolled.value || menu.open.value)
const links = computed(() => desktopKeys.map(linkByKey))

function onScroll() {
  scrolled.value = window.scrollY > 16
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Navegar siempre cierra el menú
watch(() => route.fullPath, () => menu.close())
</script>

<template>
  <header class="header" :class="{ 'header--solid': solid, 'header--minimal': minimal }">
    <div class="header__inner">
      <RouterLink to="/" class="header__brand" :aria-label="t('common.nav.home')">
        <BrandLogo variant="light" />
      </RouterLink>

      <nav v-if="!minimal" class="header__nav" :aria-label="t('common.nav.menu')">
        <RouterLink v-for="link in links" :key="link.key" :to="link.to" class="header__link">
          {{ t(`common.nav.${link.key}`) }}
        </RouterLink>
      </nav>

      <div class="header__actions">
        <LangSwitch />
        <template v-if="!minimal">
          <RouterLink to="/reservar" class="btn btn--primary btn--sm header__cta">
            {{ t('common.nav.bookNow') }}
          </RouterLink>
          <button
            type="button"
            class="header__icon header__burger"
            :class="{ 'header__burger--open': menu.open.value }"
            :aria-label="menu.open.value ? t('common.nav.close') : t('common.nav.menu')"
            :aria-expanded="menu.open.value"
            aria-controls="mobile-menu"
            @click="menu.toggle"
          >
            <span></span><span></span><span></span>
          </button>
        </template>
        <RouterLink v-else to="/" class="header__icon" :aria-label="t('common.nav.close')">
          <i class="fa-solid fa-xmark"></i>
        </RouterLink>
      </div>
    </div>
  </header>
  <TheMobileMenu v-if="!minimal" />
</template>

<style scoped lang="scss">
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  height: var(--header-h);
  color: $on-dark;

  // Fondo en una capa aparte: se anima solo su opacidad (60fps)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba($navy, 0.86);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border-bottom: 1px solid rgba($on-dark, 0.08);
    opacity: 0;
    transition: opacity 0.35s $ease;
  }

  // Sobre el hero: un velo suave arriba para que el logo siempre se lea
  &::after {
    content: '';
    position: absolute;
    inset: 0 0 -24px;
    z-index: -1;
    background: linear-gradient(to bottom, rgba($navy, 0.55), rgba($navy, 0));
    pointer-events: none;
    transition: opacity 0.35s $ease;
  }

  &--solid::before {
    opacity: 1;
  }

  &--solid::after {
    opacity: 0;
  }

  &__inner {
    position: relative;
    @include container(1280px);
    height: 100%;
    @include flex(row, center, space-between, 1rem);
  }

  &__brand {
    flex: 0 0 auto;
    height: 34px;
    border-radius: 6px;
    transition: transform 0.3s $ease;
    @include focus-ring($accent);

    &:active {
      transform: scale(0.96);
    }

    @include from('md') {
      height: 38px;
    }
  }

  &__nav {
    display: none;

    @include from('lg') {
      @include flex(row, center, center, 0.15rem);
      flex: 1;
    }
  }

  &__link {
    position: relative;
    padding: 0.55rem 0.7rem;
    font-size: 0.86rem;
    font-weight: 600;
    color: $on-dark-soft;
    white-space: nowrap;
    border-radius: $radius-sm;
    transition: color 0.2s ease;
    @include focus-ring($accent);

    &::after {
      content: '';
      position: absolute;
      left: 0.7rem;
      right: 0.7rem;
      bottom: 0.25rem;
      height: 2px;
      border-radius: 2px;
      background: $accent;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.35s $ease;
    }

    &:hover,
    &.router-link-active {
      color: $on-dark;
    }

    &:hover::after,
    &.router-link-active::after {
      transform: scaleX(1);
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.6rem);
    flex: 0 0 auto;
  }

  &__cta {
    display: none;

    @include from('md') {
      display: inline-flex;
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: $on-dark;
    font-size: 1.15rem;
    background: rgba($on-dark, 0.08);
    border: 1px solid rgba($on-dark, 0.14);
    transition:
      transform 0.25s $ease,
      background-color 0.25s ease;
    @include focus-ring($accent);

    &:active {
      transform: scale(0.92);
    }

    @media (hover: hover) {
      &:hover {
        background: rgba($on-dark, 0.16);
      }
    }
  }

  // Hamburguesa que se convierte en X
  &__burger {
    @include flex(column, center, center, 4px);

    span {
      display: block;
      width: 18px;
      height: 2px;
      border-radius: 2px;
      background: currentColor;
      transition:
        transform 0.35s $ease,
        opacity 0.2s ease;
    }

    &--open span:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }

    &--open span:nth-child(2) {
      opacity: 0;
    }

    &--open span:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }
  }
}
</style>
