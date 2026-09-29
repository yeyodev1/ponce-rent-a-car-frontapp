<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import { phoneLink, site, whatsappLink } from '@/config/site'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { useMobileMenu } from '@/composables/useMobileMenu'
import { track } from '@/composables/useAnalytics'
import LangSwitch from './LangSwitch.vue'
import { navLinks } from './navLinks'

/**
 * Menú a pantalla completa (móvil y también el "resto" en escritorio).
 * Se monta por debajo del header para que la X de la hamburguesa siga a mano.
 */
const { t } = useI18n()
const menu = useMobileMenu()
const panel = ref<HTMLElement | null>(null)

useBodyScroll(menu.open)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menu.close()
}

watch(menu.open, async (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', onKey)
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
  } else {
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="menu">
      <div
        v-if="menu.open.value"
        id="mobile-menu"
        ref="panel"
        class="menu"
        role="dialog"
        aria-modal="true"
        :aria-label="t('common.nav.menu')"
      >
        <nav class="menu__inner">
          <ul class="menu__list">
            <li v-for="(link, i) in navLinks" :key="link.key" class="menu__item" :style="{ '--i': i }">
              <RouterLink :to="link.to" class="menu__link" @click="menu.close">
                <span class="menu__icon"><i :class="link.icon"></i></span>
                <span class="menu__label">{{ t(`common.nav.${link.key}`) }}</span>
                <i class="fa-solid fa-arrow-right menu__arrow"></i>
              </RouterLink>
            </li>
          </ul>

          <div class="menu__foot menu__item" :style="{ '--i': navLinks.length }">
            <a :href="phoneLink" class="btn btn--ghost-light btn--block" @click="track('call_click', { from: 'menu' })">
              <i class="fa-solid fa-phone"></i>
              {{ site.phoneDisplay }}
            </a>
            <a
              :href="whatsappLink()"
              target="_blank"
              rel="noopener"
              class="btn btn--whatsapp btn--block"
              @click="track('whatsapp_open', { from: 'menu' })"
            >
              <i class="fa-brands fa-whatsapp"></i>
              {{ t('common.actions.whatsapp') }}
            </a>
            <div class="menu__lang">
              <span>{{ t('common.lang.label') }}</span>
              <LangSwitch />
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.menu {
  position: fixed;
  inset: 0;
  z-index: 55;
  padding-top: var(--header-h);
  background:
    radial-gradient(120% 60% at 100% 0%, rgba($blue, 0.35), transparent 60%),
    radial-gradient(90% 50% at 0% 100%, rgba($accent, 0.12), transparent 60%),
    $navy;
  color: $on-dark;
  overflow-y: auto;
  overscroll-behavior: contain;

  &__inner {
    @include container(640px);
    @include flex(column, stretch, flex-start, 1.5rem);
    padding-block: 1rem calc(2rem + var(--tabbar-h) + env(safe-area-inset-bottom));
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start);
  }

  &__link {
    @include flex(row, center, flex-start, 0.9rem);
    min-height: 56px;
    padding: 0.35rem 0.25rem;
    border-bottom: 1px solid rgba($on-dark, 0.08);
    font-family: $font-display;
    font-size: 1.22rem;
    font-weight: 700;
    font-stretch: 110%;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
    @include focus-ring($accent);

    &.router-link-active {
      color: $accent;
    }

    &:active .menu__arrow {
      transform: translateX(4px);
    }
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba($on-dark, 0.07);
    color: $accent;
    font-size: 0.95rem;
  }

  &__label {
    flex: 1;
  }

  &__arrow {
    font-size: 0.85rem;
    opacity: 0.5;
    transition: transform 0.25s $ease;
  }

  &__foot {
    @include flex(column, stretch, flex-start, 0.7rem);
  }

  &__lang {
    @include flex(row, center, space-between);
    margin-top: 0.5rem;
    font-size: $text-sm;
    color: $on-dark-soft;
  }

  // Los enlaces entran escalonados, uno tras otro
  &__item {
    transition:
      opacity 0.45s $ease,
      transform 0.5s $ease;
    transition-delay: calc(80ms + var(--i, 0) * 35ms);
  }
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.45s $ease;
}

.menu-leave-active {
  transition-duration: 0.2s;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.menu-enter-from .menu__item {
  opacity: 0;
  transform: translateY(16px);
}

.menu-leave-active .menu__item {
  transition-delay: 0ms;
}
</style>
