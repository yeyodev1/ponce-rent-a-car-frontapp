<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money, formatDateTime } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import { booking, pickupAt, returnAt, effectiveReturnLocation } from '@/composables/booking/useBookingState'
import type { DisplayPricing } from '@/composables/booking/useDisplayPricing'
import PriceBreakdown from './PriceBreakdown.vue'

/** Resumen fijo a la derecha en escritorio: lo elegido hasta ahora y el total vivo. */
const props = defineProps<{ pricing: DisplayPricing }>()
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const category = computed(() => catalog.bySlug(booking.categorySlug))
const locationLabel = (code: string) =>
  tx(catalog.config?.booking.locations.find((l) => l.code === code)?.label) || (code ? t(`common.locations.${code}`) : '')
const rows = computed(() =>
  [
    pickupAt.value && { icon: 'fa-solid fa-arrow-right-from-bracket', text: formatDateTime(pickupAt.value) },
    returnAt.value && { icon: 'fa-solid fa-arrow-right-to-bracket', text: formatDateTime(returnAt.value) },
    booking.pickupLocation && { icon: 'fa-solid fa-location-dot', text: locationLabel(booking.pickupLocation) },
    !booking.sameReturn &&
      effectiveReturnLocation.value && { icon: 'fa-solid fa-flag-checkered', text: locationLabel(effectiveReturnLocation.value) },
  ].filter(Boolean) as { icon: string; text: string }[],
)
const hasTotal = computed(() => props.pricing.total > 0 && props.pricing.state !== 'invalid')
</script>

<template>
  <div class="summary">
    <div v-if="category" class="summary__car">
      <img v-if="category.image" :src="category.image" :alt="tx(category.name)" class="summary__img" />
      <div>
        <p class="summary__eyebrow">{{ booking.reservation?.code || t('booking.review.vehicle') }}</p>
        <h2 class="summary__name">{{ tx(category.name) }}</h2>
        <p class="summary__models">{{ category.exampleModels }}</p>
      </div>
    </div>
    <p v-else class="summary__placeholder">
      <i class="fa-solid fa-car-side"></i>
      {{ t('booking.bar.from', { price: money(pricing.fromPerDay) }) }}
    </p>

    <ul v-if="rows.length" class="summary__rows">
      <li v-for="row in rows" :key="row.icon"><i :class="row.icon"></i>{{ row.text }}</li>
    </ul>

    <PriceBreakdown
      v-if="hasTotal"
      compact
      :lines="pricing.lines"
      :total="pricing.total"
      :deposit="pricing.deposit"
      :guarantee="pricing.guarantee"
      :loading="pricing.state === 'loading'"
    />
    <div v-else-if="pricing.state === 'loading'" class="summary__skeleton">
      <span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.summary {
  @include flex(column, stretch, flex-start, 1.25rem);
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-lg;
  padding: 1.5rem;
  box-shadow: $shadow-md;

  &__car {
    @include flex(row, center, flex-start, 1rem);
  }

  &__img {
    width: 112px;
    height: 76px;
    object-fit: cover;
    border-radius: $radius-sm;
    background: $sand;
  }

  &__eyebrow {
    @include eyebrow;
    font-size: 0.66rem;
  }

  &__name {
    font-size: $text-xl;
    margin-top: 0.2rem;
  }

  &__models {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__placeholder {
    @include flex(row, center, flex-start, 0.6rem);
    font-weight: 700;
    color: $ink-soft;

    i {
      color: $blue;
    }
  }

  &__rows {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);
    padding-block: 1rem;
    border-block: 1px solid $line;
    font-size: $text-sm;
    color: $ink-soft;

    li {
      // Sin capitalize: convertía "Aeropuerto de Guayaquil" en "…De…" y "a. m." en "A. M.".
      @include flex(row, center, flex-start, 0.6rem);
    }

    i {
      width: 18px;
      color: $blue;
      text-align: center;
    }
  }

  &__skeleton {
    @include flex(column, stretch, flex-start, 0.6rem);

    span {
      height: 14px;
    }

    span:last-child {
      height: 26px;
      width: 60%;
      align-self: flex-end;
    }
  }
}
</style>
