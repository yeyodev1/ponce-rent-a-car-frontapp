<script setup lang="ts">
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import type { Category } from '@/types'

/** Tarjeta de categoría: foto, capacidad y "Desde $X/día". Lleva a la Ruta B ya filtrada. */
defineProps<{ category: Category }>()
const { t, tx } = useI18n()
</script>

<template>
  <RouterLink :to="{ path: '/reservar', query: { categoria: category.slug } }" class="cat">
    <div class="cat__media">
      <img v-if="category.image" :src="category.image" :alt="tx(category.name)" loading="lazy" decoding="async" />
      <div v-else class="cat__fallback" aria-hidden="true"><i class="fa-solid fa-car-side"></i></div>
    </div>
    <div class="cat__body">
      <h3 class="cat__name">{{ tx(category.name) }}</h3>
      <p v-if="tx(category.tagline)" class="cat__tagline">{{ tx(category.tagline) }}</p>
      <ul class="cat__meta">
        <li><i class="fa-solid fa-user-group"></i>{{ t('home.categories.passengers', { n: category.passengers }) }}</li>
        <li v-if="category.luggage">
          <i class="fa-solid fa-suitcase-rolling"></i>{{ t('home.categories.luggage', { n: category.luggage }) }}
        </li>
      </ul>
      <div class="cat__foot">
        <p class="cat__price">
          <small>{{ t('common.units.from') }}</small>
          <strong>{{ money(category.pricePerDay) }}</strong><small>{{ t('common.units.perDay') }}</small>
        </p>
        <span class="cat__go" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.cat {
  @include flex(column, stretch, flex-start);
  height: 100%;
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: transform 0.35s $ease;
  @include focus-ring($blue);

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px);
    }

    &:hover .cat__media img {
      transform: scale(1.06);
    }

    &:hover .cat__go {
      background: $accent;
      color: $navy;
    }
  }

  &__media {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: $sand;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s $ease;
    }
  }

  &__fallback {
    width: 100%;
    height: 100%;
    @include flex(row, center, center);
    background:
      radial-gradient(80% 90% at 20% 0%, rgba($blue, 0.55), transparent 60%),
      linear-gradient(135deg, $navy-2, $navy);
    color: rgba($on-dark, 0.85);
    font-size: 2.6rem;
  }

  &__body {
    flex: 1;
    @include flex(column, stretch, flex-start, 0.45rem);
    padding: 1rem 1.1rem 1.1rem;
  }

  &__name {
    font-size: 1.25rem;
    color: $ink;
  }

  &__tagline {
    font-size: $text-sm;
    color: $ink-soft;
    line-height: 1.4;
  }

  &__meta {
    list-style: none;
    @include flex(row, center, flex-start, 0.4rem 0.9rem);
    flex-wrap: wrap;
    font-size: 0.78rem;
    font-weight: 600;
    color: $ink-muted;

    li {
      @include flex(row, center, flex-start, 0.35rem);
    }

    i {
      color: $blue;
    }
  }

  &__foot {
    margin-top: auto;
    padding-top: 0.6rem;
    @include flex(row, center, space-between, 0.5rem);
  }

  &__price {
    @include flex(row, baseline, flex-start, 0.25rem);
    color: $ink;

    small {
      font-size: 0.75rem;
      font-weight: 600;
      color: $ink-muted;
    }

    strong {
      font-family: $font-display;
      font-size: 1.45rem;
      font-weight: 900;
      font-stretch: 110%;
      letter-spacing: -0.02em;
    }
  }

  &__go {
    @include flex(row, center, center);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: $sand;
    color: $ink;
    transition:
      background-color 0.25s ease,
      color 0.25s ease;
  }
}
</style>
