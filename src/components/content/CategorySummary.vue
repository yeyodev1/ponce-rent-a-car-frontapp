<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { track } from '@/composables/useAnalytics'
import type { Category } from '@/types'

/** Cabecera de la ficha: nombre (H1), para qué sirve, precio y disponibilidad. */
const props = defineProps<{ category: Category; name: string }>()
const { t, tx } = useI18n()

const availability = computed(() => {
  const n = props.category.availableUnits
  if (n === undefined) return null
  if (n === 0)
    return { tone: 'warning', icon: 'fa-solid fa-clock', label: t('content.category.onRequest') }
  if (n <= 2)
    return { tone: 'accent', icon: 'fa-solid fa-fire', label: t('content.category.fewLeft', { n }) }
  return {
    tone: 'success',
    icon: 'fa-solid fa-circle-check',
    label: t('content.category.available', { n }),
  }
})

function onBook() {
  track('category_select', { category: props.category.slug, from: 'category_page' })
}
</script>

<template>
  <div class="summary">
    <p class="summary__eyebrow">{{ t('content.category.eyebrow') }}</p>
    <h1 class="summary__name">{{ name }}</h1>
    <p v-if="tx(category.tagline)" class="summary__tagline">{{ tx(category.tagline) }}</p>
    <p v-if="category.exampleModels" class="summary__models">
      <i class="fa-solid fa-car" aria-hidden="true"></i> {{ category.exampleModels }}
    </p>

    <div class="summary__row">
      <p class="summary__price">
        <small>{{ t('common.units.from') }}</small>
        <strong>{{ money(category.pricePerDay) }}</strong>
        <small>{{ t('common.units.perDay') }}</small>
      </p>
      <span v-if="availability" class="chip" :class="`chip--${availability.tone}`">
        <i :class="availability.icon" aria-hidden="true"></i> {{ availability.label }}
      </span>
    </div>

    <div class="summary__actions">
      <RouterLink
        :to="{ path: '/reservar', query: { categoria: category.slug } }"
        class="btn btn--primary btn--lg btn--block"
        @click="onBook"
      >
        {{ t('content.category.bookThis') }}
      </RouterLink>
      <RouterLink
        :to="{ path: '/ayudame-a-elegir', query: { categoria: category.slug } }"
        class="btn btn--ghost btn--block"
      >
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        {{ t('common.actions.helpMeChoose') }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.summary {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__eyebrow {
    @include eyebrow;
  }

  &__name {
    @include display($display-md);
    color: $ink;
  }

  &__tagline {
    font-size: $text-lg;
    color: $ink-soft;
  }

  &__models {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__row {
    margin-top: 0.5rem;
    @include flex(row, center, space-between, 0.75rem);
    flex-wrap: wrap;
  }

  &__price {
    @include flex(row, baseline, flex-start, 0.35rem);
    color: $ink-muted;
    font-weight: 600;

    strong {
      font-family: $font-display;
      font-size: $display-sm;
      font-weight: 800;
      color: $navy;
    }
  }

  &__actions {
    margin-top: 0.75rem;
    @include flex(column, stretch, flex-start, 0.6rem);
  }
}
</style>
