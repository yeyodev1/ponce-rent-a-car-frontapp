<script setup lang="ts">
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { track } from '@/composables/useAnalytics'
import type { PublicVehicle } from '@/types/contract'

/**
 * Cabecera de la ficha de unidad. La categoría manda (es lo que se reserva y
 * su precio); marca, modelo y año son el protagonista secundario.
 */
const props = defineProps<{ vehicle: PublicVehicle; unitName: string; categoryName: string }>()
const { t, tx } = useI18n()

function onBook() {
  track('category_select', { category: props.vehicle.category.slug, from: 'unit_page', unit: props.vehicle.slug })
}
</script>

<template>
  <div class="usum">
    <p class="usum__eyebrow">{{ t('content.category.eyebrow') }}</p>
    <p class="usum__cat">{{ categoryName }}</p>
    <h1 class="usum__title">
      <span class="usum__ref">{{ t('content.unit.orSimilar') }}</span>
      <span class="usum__unit">{{ unitName }}</span>
    </h1>
    <p v-if="tx(vehicle.category.tagline)" class="usum__tagline">{{ tx(vehicle.category.tagline) }}</p>

    <div class="usum__row">
      <p class="usum__price">
        <small>{{ t('content.unit.from') }}</small>
        <strong>{{ money(vehicle.category.pricePerDay) }}</strong>
        <small>{{ t('content.unit.perDay') }}</small>
      </p>
      <span class="chip" :class="vehicle.available ? 'chip--success' : 'chip--warning'">
        <i :class="vehicle.available ? 'fa-solid fa-circle-check' : 'fa-solid fa-calendar-days'" aria-hidden="true"></i>
        {{ vehicle.available ? t('content.unit.availableNow') : t('content.unit.onRequest') }}
      </span>
    </div>
    <p class="usum__fine">{{ t('content.unit.priceNote') }}</p>

    <p class="usum__note">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      {{ t('content.unit.note', { name: categoryName }) }}
    </p>

    <div class="usum__actions">
      <RouterLink
        :to="{ path: '/reservar', query: { categoria: vehicle.category.slug } }"
        class="btn btn--primary btn--lg btn--block"
        @click="onBook"
      >
        {{ t('content.unit.book') }}
      </RouterLink>
      <RouterLink :to="`/vehiculos/${vehicle.category.slug}`" class="btn btn--ghost btn--block">
        <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
        {{ t('content.unit.seeCategory', { name: categoryName }) }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.usum {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__eyebrow {
    @include eyebrow;
  }

  &__cat {
    @include display($display-md);
    color: $ink;
  }

  // La categoría manda; la unidad concreta va en segundo plano (pero es el H1 para buscadores).
  &__title {
    @include flex(column, flex-start, flex-start, 0.15rem);
    padding: 0.6rem 0.8rem;
    border-left: 3px solid $accent;
    background: $surface;
    border-radius: 0 $radius-sm $radius-sm 0;
  }

  &__unit {
    font-family: $font-principal;
    font-size: $text-xl;
    font-weight: 800;
    letter-spacing: 0;
    color: $ink;
  }

  &__ref {
    font-family: $font-principal;
    font-size: $text-sm;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $blue;
  }

  &__tagline {
    font-size: $text-lg;
    color: $ink-soft;
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

  &__fine {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__note {
    @include flex(row, flex-start, flex-start, 0.5rem);
    padding: 0.8rem 0.9rem;
    border-radius: $radius-md;
    background: $blue-soft;
    font-size: $text-sm;
    color: $ink;

    i {
      color: $blue;
      margin-top: 0.2rem;
    }
  }

  &__actions {
    margin-top: 0.5rem;
    @include flex(column, stretch, flex-start, 0.6rem);
  }
}
</style>
