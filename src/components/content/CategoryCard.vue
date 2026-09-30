<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { track } from '@/composables/useAnalytics'
import type { Category } from '@/types'
import SmartImage from './SmartImage.vue'
import CategorySpecs from './CategorySpecs.vue'

/**
 * La categoría es el producto, no la marca: foto grande, para qué sirve,
 * capacidad y precio. El modelo aparece solo como referencia ("o similar").
 */
const props = withDefaults(
  defineProps<{
    category: Category
    eager?: boolean
    featured?: boolean
    /** Unidades libres para las fechas del filtro; null = sin fechas elegidas. */
    available?: number | null
    bookQuery?: Record<string, string>
  }>(),
  {
    eager: false,
    featured: false,
    available: null,
    bookQuery: undefined,
  },
)

const { t, tx } = useI18n()
const name = computed(() => tx(props.category.name))
const detail = computed(() => `/vehiculos/${props.category.slug}`)
const withDates = computed(() => props.available !== null)
const soldOut = computed(() => withDates.value && !props.available)
const availableLabel = computed(() =>
  props.available === 1 ? t('content.fleet.filter.availableOne') : t('content.fleet.filter.available', { n: props.available ?? 0 }),
)
const bookTo = computed(() => ({ path: '/reservar', query: props.bookQuery || { categoria: props.category.slug } }))

function onBook() {
  track('category_select', { category: props.category.slug, from: 'fleet' })
}
</script>

<template>
  <article class="ccard" :class="{ 'ccard--featured': featured }">
    <RouterLink :to="detail" class="ccard__media" tabindex="-1" aria-hidden="true">
      <SmartImage
        :src="category.image"
        :alt="t('content.fleet.imageAlt', { name })"
        :eager="eager"
        ratio="16 / 10"
        sizes="(min-width: 1024px) 560px, 100vw"
      />
      <span v-if="!withDates && category.availableUnits === 0" class="ccard__flag chip">{{
        t('content.fleet.onRequest')
      }}</span>
    </RouterLink>
    <div class="ccard__body">
      <div class="ccard__head">
        <h3 class="ccard__name">
          <RouterLink :to="detail" class="ccard__link">{{ name }}</RouterLink>
        </h3>
        <p class="ccard__price">
          <small>{{ t('common.units.from') }}</small>
          <strong>{{ money(category.pricePerDay) }}</strong>
          <small>{{ t('common.units.perDay') }}</small>
        </p>
      </div>
      <p v-if="tx(category.tagline)" class="ccard__tagline">{{ tx(category.tagline) }}</p>
      <CategorySpecs :category="category" />
      <p v-if="category.exampleModels" class="ccard__models">{{ category.exampleModels }}</p>
      <p v-if="withDates" class="ccard__avail" :class="{ 'ccard__avail--none': soldOut }" role="status">
        <i :class="soldOut ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'" aria-hidden="true"></i>
        {{ soldOut ? t('content.fleet.filter.none') : availableLabel }}
      </p>
      <div class="ccard__actions">
        <RouterLink v-if="!soldOut" :to="bookTo" class="btn btn--primary" @click="onBook">
          {{ t('content.fleet.book') }}
        </RouterLink>
        <RouterLink
          :to="{ path: '/ayudame-a-elegir', query: { categoria: category.slug } }"
          class="btn"
          :class="soldOut ? 'btn--whatsapp' : 'btn--ghost'"
        >
          {{ t('common.actions.helpMeChoose') }}
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.ccard {
  position: relative;
  @include card;
  border-radius: $radius-lg;
  overflow: hidden;
  @include flex(column, stretch, flex-start);
  box-shadow: $shadow-sm;
  transition:
    transform 0.4s $ease,
    box-shadow 0.4s $ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px);
      box-shadow: $shadow-md;
    }

    &:hover :deep(.smart-img__img) {
      transform: scale(1.04);
    }
  }

  &__media {
    position: relative;
    display: block;
  }

  &--featured {
    @include from('md') {
      flex-direction: row;

      .ccard__media {
        flex: 1 1 55%;
        min-width: 0;
      }

      .ccard__body {
        flex: 1 1 45%;
        padding: 2rem;
      }
    }
  }

  &__flag {
    position: absolute;
    top: 0.85rem;
    left: 0.85rem;
    background: rgba($surface, 0.92);
  }

  &__body {
    flex: 1;
    @include flex(column, stretch, flex-start, 0.75rem);
    padding: 1.2rem 1.2rem 1.3rem;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.75rem);
  }

  &__name {
    @include display($text-xl);
    color: $ink;
  }

  &__link {
    // Toda la tarjeta es clicable sin anidar enlaces.
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    &:focus-visible {
      outline: none;

      &::after {
        outline: 2px solid $blue;
        outline-offset: -2px;
        border-radius: $radius-lg;
      }
    }
  }

  &__price {
    flex: none;
    text-align: right;
    line-height: 1.1;
    color: $ink;

    small {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 600;
    }

    strong {
      display: block;
      font-family: $font-display;
      font-size: $text-xl;
      font-weight: 800;
      color: $navy;
    }
  }

  &__tagline {
    color: $ink-soft;
  }

  &__models {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__avail {
    position: relative;
    z-index: 1;
    align-self: flex-start;
    @include flex(row, center, flex-start, 0.4rem);
    padding: 0.3rem 0.75rem;
    border-radius: $radius-pill;
    background: $success-bg;
    color: $success;
    font-size: $text-sm;
    font-weight: 700;

    &--none {
      background: $danger-bg;
      color: $danger;
    }
  }

  &__actions {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding-top: 0.4rem;
    @include flex(row, stretch, flex-start, 0.6rem);
    flex-wrap: wrap;

    .btn {
      flex: 1 1 160px;
      white-space: nowrap;
    }
  }
}
</style>
