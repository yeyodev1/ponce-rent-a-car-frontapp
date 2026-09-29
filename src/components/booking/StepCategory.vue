<script setup lang="ts">
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import { track } from '@/composables/useAnalytics'
import { booking } from '@/composables/booking/useBookingState'
import type { Category } from '@/types'

/** Paso 1: tarjetas grandes con foto. Tocar una elige y avanza. */
const emit = defineEmits<{ picked: [] }>()
const { t, tx } = useI18n()
const catalog = useCatalogStore()

function pick(c: Category) {
  if (c.availableUnits === 0) return
  booking.categorySlug = c.slug
  track('category_select', { category: c.slug, value: c.pricePerDay / 100 })
  // Pausa corta para que se vea la selección antes de pasar de pantalla.
  setTimeout(() => emit('picked'), 260)
}
</script>

<template>
  <div class="cats">
    <template v-if="catalog.loading && !catalog.categories.length">
      <div v-for="i in 3" :key="i" class="cats__ghost">
        <span class="skeleton cats__ghost-img"></span>
        <span class="skeleton cats__ghost-line"></span>
        <span class="skeleton cats__ghost-line cats__ghost-line--short"></span>
      </div>
    </template>

    <div v-else-if="!catalog.categories.length" class="cats__empty">
      <i class="fa-solid fa-car-burst"></i>
      <p>{{ t('booking.category.empty') }}</p>
      <button type="button" class="btn btn--ghost" @click="catalog.load(true)">{{ t('common.actions.retry') }}</button>
    </div>

    <TransitionGroup v-else name="stagger" tag="div" class="cats__list" appear>
      <button
        v-for="(c, i) in catalog.categories"
        :key="c.slug"
        type="button"
        class="card"
        :class="{ 'card--on': booking.categorySlug === c.slug, 'card--off': c.availableUnits === 0 }"
        :style="{ '--i': i }"
        role="radio"
        :aria-checked="booking.categorySlug === c.slug"
        :disabled="c.availableUnits === 0"
        @click="pick(c)"
      >
        <span class="card__media">
          <img v-if="c.image" :src="c.image" :alt="tx(c.name)" loading="lazy" class="card__img" />
          <i v-else class="fa-solid fa-car-side card__fallback"></i>
          <span v-if="c.availableUnits === 0" class="card__flag chip chip--danger">{{ t('booking.category.soldOut') }}</span>
          <span v-else-if="c.availableUnits === 1" class="card__flag chip chip--accent">
            {{ t('booking.category.lastUnits') }}
          </span>
          <span class="card__check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        </span>
        <span class="card__body">
          <span class="card__head">
            <span class="card__name">{{ tx(c.name) }}</span>
            <span class="card__price">
              <small>{{ t('booking.category.from') }}</small>
              <strong>{{ money(c.pricePerDay) }}</strong><small>{{ t('booking.category.perDay') }}</small>
            </span>
          </span>
          <span class="card__tagline">{{ tx(c.tagline) }}</span>
          <span class="card__specs">
            <span><i class="fa-solid fa-user-group"></i>{{ t('booking.category.passengers', { n: c.passengers }) }}</span>
            <span><i class="fa-solid fa-suitcase-rolling"></i>{{ t('booking.category.luggage', { n: c.luggage }) }}</span>
            <span><i class="fa-solid fa-gears"></i>{{ t(`booking.category.${c.transmission}`) }}</span>
          </span>
        </span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.cats {
  &__list {
    @include flex-cards(300px, 1rem);
  }

  &__ghost {
    @include flex(column, stretch, flex-start, 0.6rem);
    margin-bottom: 1rem;

    &-img {
      height: 170px;
      border-radius: $radius-md;
    }

    &-line {
      height: 16px;

      &--short {
        width: 55%;
      }
    }
  }

  &__empty {
    @include flex(column, center, center, 0.8rem);
    text-align: center;
    padding: 2.5rem 1rem;
    color: $ink-soft;

    i {
      font-size: 2rem;
      color: $ink-muted;
    }
  }
}

.card {
  position: relative;
  @include flex(column, stretch, flex-start);
  text-align: left;
  background: $surface;
  border: 1.5px solid $line;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition:
    transform 0.35s $ease-spring,
    box-shadow 0.3s $ease,
    border-color 0.25s ease;

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-3px);
      box-shadow: $shadow-md;
    }

    &:hover .card__img {
      transform: scale(1.04);
    }
  }

  &--on {
    border-color: $blue;
    box-shadow:
      0 0 0 3px rgba($blue, 0.16),
      $shadow-md;
  }

  &--off {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &__media {
    position: relative;
    height: 168px;
    background: radial-gradient(120% 90% at 50% 100%, $sand, $paper 70%);
    @include flex(row, center, center);
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s $ease;
  }

  &__fallback {
    font-size: 3rem;
    color: $line-strong;
  }

  &__flag {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
  }

  &__check {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $blue;
    color: $surface;
    @include flex(row, center, center);
    transform: scale(0);
    transition: transform 0.4s $ease-spring;
  }

  &--on &__check {
    transform: scale(1);
  }

  &__body {
    @include flex(column, stretch, flex-start, 0.35rem);
    padding: 1rem 1.1rem 1.15rem;
  }

  &__head {
    @include flex(row, baseline, space-between, 0.75rem);
  }

  &__name {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 800;
    font-stretch: 110%;
    color: $ink;
  }

  &__price {
    white-space: nowrap;
    color: $ink-soft;

    small {
      font-size: $text-xs;
      font-weight: 600;
    }

    strong {
      font-size: 1.2rem;
      color: $ink;
      margin-left: 0.25rem;
    }
  }

  &__tagline {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__specs {
    @include flex(row, center, flex-start, 0.4rem 1rem);
    flex-wrap: wrap;
    margin-top: 0.35rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $ink-muted;

    i {
      margin-right: 0.35rem;
      color: $blue;
    }
  }
}
</style>
