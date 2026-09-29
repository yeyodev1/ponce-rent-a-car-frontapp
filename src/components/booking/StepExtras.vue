<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import OptionCard from '@/components/ui/OptionCard.vue'
import { booking } from '@/composables/booking/useBookingState'
import type { Extra } from '@/types'

/**
 * Paso 5: extras opcionales. El contador de cantidad vive fuera de la tarjeta
 * (un botón dentro de otro no es accesible) y solo aparece si aplica.
 */
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const extras = computed(() => catalog.extras.filter((e) => e.isActive !== false))
const qty = (e: Extra) => booking.extras[e.code] || 0
const icon = (e: Extra) => (e.icon ? (e.icon.includes(' ') ? e.icon : `fa-solid ${e.icon}`) : 'fa-solid fa-plus')
const price = (e: Extra) =>
  e.pricing === 'per_day'
    ? t('booking.extras.perDay', { price: money(e.price) })
    : t('booking.extras.perRental', { price: money(e.price) })

function toggle(e: Extra) {
  booking.extras = { ...booking.extras, [e.code]: qty(e) ? 0 : 1 }
}

function step(e: Extra, delta: number) {
  const next = Math.min(Math.max(0, qty(e) + delta), Math.max(1, e.maxQuantity))
  booking.extras = { ...booking.extras, [e.code]: next }
}
</script>

<template>
  <div class="extras">
    <p v-if="!extras.length && !catalog.loading" class="extras__empty">{{ t('booking.extras.none') }}</p>
    <TransitionGroup name="stagger" tag="div" class="extras__list" appear>
      <div v-for="(e, i) in extras" :key="e.code" class="extras__item" :style="{ '--i': i }">
        <OptionCard
          multiple
          :icon="icon(e)"
          :title="tx(e.name)"
          :subtitle="tx(e.description)"
          :price="price(e)"
          :selected="qty(e) > 0"
          @select="toggle(e)"
        />
        <Transition name="rise">
          <div v-if="qty(e) > 0 && e.maxQuantity > 1" class="qty">
            <span class="qty__label">{{ t('booking.extras.quantity') }}</span>
            <div class="qty__ctrl">
              <button type="button" class="qty__btn" :aria-label="t('booking.extras.less')" @click="step(e, -1)">
                <i class="fa-solid fa-minus"></i>
              </button>
              <Transition name="price-bump" mode="out-in">
                <span :key="qty(e)" class="qty__value" aria-live="polite">{{ qty(e) }}</span>
              </Transition>
              <button
                type="button"
                class="qty__btn"
                :disabled="qty(e) >= e.maxQuantity"
                :aria-label="t('booking.extras.more')"
                @click="step(e, 1)"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.extras {
  &__list {
    @include flex(column, stretch, flex-start, 0.75rem);
  }

  &__item {
    @include flex(column, stretch, flex-start);
  }

  &__empty {
    color: $ink-muted;
    font-size: $text-sm;
  }
}

.qty {
  @include flex(row, center, space-between, 1rem);
  margin: -0.5rem 0.4rem 0;
  padding: 1.1rem 1rem 0.6rem;
  border: 1.5px solid rgba($blue, 0.35);
  border-top: none;
  border-radius: 0 0 $radius-md $radius-md;
  background: $surface;

  &__label {
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
  }

  &__ctrl {
    @include flex(row, center, flex-end, 0.35rem);
  }

  &__btn {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    border: 1.5px solid $line;
    background: $paper;
    color: $ink;
    @include flex(row, center, center);
    transition: transform 0.3s $ease-spring;

    &:active {
      transform: scale(0.88);
    }

    &:disabled {
      opacity: 0.35;
    }
  }

  &__value {
    min-width: 2ch;
    text-align: center;
    font-family: $font-display;
    font-size: 1.3rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
}
</style>
