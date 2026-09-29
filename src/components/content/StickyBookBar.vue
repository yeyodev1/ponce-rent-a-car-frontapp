<script setup lang="ts">
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { track } from '@/composables/useAnalytics'

/**
 * CTA fijo abajo en móvil: el precio y "Reservar" siempre al alcance del
 * pulgar, por encima de la barra de pestañas. En escritorio vive en el aside.
 */
const props = defineProps<{ slug: string; name: string; price: number }>()
const { t } = useI18n()

function onBook() {
  track('category_select', { category: props.slug, from: 'category_page' })
}
</script>

<template>
  <div class="sticky-book">
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
  animation: sticky-up 0.5s $ease 0.3s both;

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

@keyframes sticky-up {
  from {
    opacity: 0;
    transform: translateY(120%);
  }
}
</style>
