<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { track } from '@/composables/useAnalytics'

/**
 * CTA fijo abajo en móvil: el precio y "Reservar" siempre al alcance del
 * pulgar, por encima de la barra de pestañas. En escritorio vive en el aside.
 * Si se pasa `anchor` (el bloque con el CTA propio de la página), la barra
 * solo aparece cuando ese bloque sale de pantalla: nunca tapa al botón que duplica.
 */
const props = defineProps<{
  slug: string
  name: string
  price: number
  anchor?: HTMLElement | null
}>()
const { t } = useI18n()

const visible = ref(true)
let observer: IntersectionObserver | null = null

// Se oculta mientras el ancla o el footer del sitio estén en pantalla: así no
// duplica el CTA visible ni tapa el cierre de la página.
watch(
  () => props.anchor,
  (el) => {
    observer?.disconnect()
    observer = null
    if (!('IntersectionObserver' in window)) return
    const onScreen = new Set<Element>()
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target)
        else onScreen.delete(e.target)
      }
      visible.value = onScreen.size === 0
    })
    const footer = document.querySelector('.footer')
    if (el) observer.observe(el)
    if (footer) observer.observe(footer)
  },
  { immediate: true },
)

onBeforeUnmount(() => observer?.disconnect())

function onBook() {
  track('category_select', { category: props.slug, from: 'category_page' })
}
</script>

<template>
  <Transition name="sticky-book">
    <div v-show="visible" class="sticky-book">
      <div class="sticky-book__price">
        <small>{{ name }} · {{ t('common.units.from') }}</small>
        <strong
          >{{ money(price) }}<span>{{ t('common.units.perDay') }}</span></strong
        >
      </div>
      <RouterLink
        :to="{ path: '/reservar', query: { categoria: slug } }"
        class="btn btn--primary btn--shine"
        @click="onBook"
      >
        {{ t('content.category.bookThis') }}
      </RouterLink>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.sticky-book {
  position: fixed;
  z-index: 40;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(var(--tabbar-h) + 0.75rem + env(safe-area-inset-bottom, 0px));
  @include flex(row, center, space-between, 0.75rem);
  padding: 0.6rem 0.6rem 0.6rem 1.1rem;
  border-radius: $radius-lg;
  background: rgba($navy, 0.94);
  backdrop-filter: blur(14px);
  color: $on-dark;
  box-shadow: $shadow-lg;

  @include from('lg') {
    display: none;
  }

  &__price {
    min-width: 0;
    line-height: 1.15;

    small {
      display: block;
      font-size: $text-xs;
      color: $on-dark-soft;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    strong {
      font-family: $font-display;
      font-size: $text-xl;
      color: $surface;

      span {
        font-size: $text-sm;
        font-weight: 600;
        color: $on-dark-soft;
      }
    }
  }

  .btn {
    flex: none;
  }
}

.sticky-book-enter-active,
.sticky-book-leave-active {
  transition:
    opacity 0.35s $ease,
    transform 0.45s $ease;
}

.sticky-book-enter-from,
.sticky-book-leave-to {
  opacity: 0;
  transform: translateY(120%);
}
</style>
