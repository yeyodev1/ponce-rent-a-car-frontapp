<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useBodyScroll } from '@/composables/useBodyScroll'
import type { DisplayPricing } from '@/composables/booking/useDisplayPricing'
import PriceBreakdown from './PriceBreakdown.vue'

/**
 * Pie fijo de la reserva: total vivo a la izquierda (se toca para ver el
 * desglose en una hoja inferior) y la acción del paso a la derecha.
 */
const props = withDefaults(
  defineProps<{ pricing: DisplayPricing; canContinue: boolean; label: string; busy?: boolean; showAction?: boolean }>(),
  { busy: false, showAction: true },
)
const emit = defineEmits<{ continue: [] }>()
const { t } = useI18n()

const open = ref(false)
useBodyScroll(open)

const hasTotal = computed(() => props.pricing.total > 0 && props.pricing.state !== 'invalid')
const daysLabel = computed(() =>
  props.pricing.days === 1 ? t('booking.bar.oneDay') : props.pricing.days ? t('booking.bar.days', { n: props.pricing.days }) : '',
)
const caption = computed(() => {
  if (props.pricing.state === 'invalid') return t('booking.bar.unavailable')
  if (props.pricing.state === 'offline') return t('booking.bar.offline')
  return [t('booking.bar.total'), daysLabel.value].filter(Boolean).join(' · ')
})
</script>

<template>
  <div class="bar">
    <button
      type="button"
      class="bar__price"
      :disabled="!hasTotal"
      :aria-expanded="open"
      :aria-label="t('booking.bar.details')"
      @click="open = true"
    >
      <span class="bar__caption">{{ caption }}</span>
      <span class="bar__amount" aria-live="polite">
        <span v-if="pricing.state === 'loading' && !hasTotal" class="bar__skeleton skeleton"></span>
        <Transition v-else-if="hasTotal" name="price-bump">
          <span :key="pricing.total" class="bar__value">{{ money(pricing.total) }}</span>
        </Transition>
        <span v-else class="bar__from">{{ t('booking.bar.from', { price: money(pricing.fromPerDay) }) }}</span>
        <i v-if="pricing.state === 'loading' && hasTotal" class="bar__spin fa-solid fa-circle-notch fa-spin"></i>
        <i v-else-if="hasTotal" class="bar__chev fa-solid fa-chevron-up"></i>
      </span>
    </button>

    <button
      v-if="showAction"
      type="button"
      class="btn btn--primary bar__action"
      :disabled="!canContinue || busy"
      @click="emit('continue')"
    >
      <i v-if="busy" class="fa-solid fa-circle-notch fa-spin"></i>
      <span>{{ label }}</span>
      <i v-if="!busy" class="fa-solid fa-arrow-right"></i>
    </button>

    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="open" class="sheet" @click.self="open = false">
          <div class="sheet__panel" role="dialog" aria-modal="true" :aria-label="t('booking.bar.breakdown')">
            <span class="sheet__grip" aria-hidden="true"></span>
            <div class="sheet__head">
              <h2 class="sheet__title">{{ t('booking.bar.breakdown') }}</h2>
              <button type="button" class="sheet__close" :aria-label="t('common.actions.close')" @click="open = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <PriceBreakdown
              :lines="pricing.lines"
              :total="pricing.total"
              :deposit="pricing.deposit"
              :guarantee="pricing.guarantee"
              :loading="pricing.state === 'loading'"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.bar {
  @include flex(row, center, space-between, 0.75rem);
  width: 100%;

  &__price {
    flex: 1 1 auto;
    min-width: 0;
    min-height: $tap;
    @include flex(column, flex-start, center, 0.1rem);
    text-align: left;

    &:disabled {
      cursor: default;
    }
  }

  &__caption {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  &__amount {
    position: relative;
    @include flex(row, center, flex-start, 0.45rem);
    min-height: 2rem;
  }

  &__value {
    font-family: $font-display;
    font-size: 1.65rem;
    font-weight: 800;
    font-stretch: 110%;
    color: $ink;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__from {
    font-weight: 700;
    color: $ink-soft;
    font-size: $text-sm;
  }

  &__skeleton {
    width: 92px;
    height: 1.6rem;
  }

  &__chev,
  &__spin {
    font-size: 0.75rem;
    color: $ink-muted;
    margin-left: auto;
    padding-left: 0.2rem;
  }

  &__chev {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: $sand;
    @include flex(row, center, center);
  }

  &__action {
    flex: 0 0 auto;
    min-height: 54px;
    padding-inline: 1.3rem;
  }

  @include from('lg') {
    &__price {
      display: none;
    }

    &__action {
      flex: 1;
    }
  }
}

.sheet {
  position: fixed;
  inset: 0;
  z-index: 210;
  background: $overlay;
  @include flex(column, stretch, flex-end);

  &__panel {
    background: $surface;
    border-radius: $radius-lg $radius-lg 0 0;
    padding: 0.6rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom));
    max-height: 85dvh;
    overflow-y: auto;
    box-shadow: $shadow-lg;
    width: 100%;
    max-width: 560px;
    margin-inline: auto;
  }

  &__grip {
    display: block;
    width: 42px;
    height: 5px;
    border-radius: $radius-pill;
    background: $line-strong;
    margin: 0 auto 0.9rem;
  }

  &__head {
    @include flex(row, center, space-between);
    margin-bottom: 1.1rem;
  }

  &__title {
    font-size: $text-lg;
  }

  &__close {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    background: $sand;
    @include flex(row, center, center);
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;

  .sheet__panel {
    transition: transform 0.42s $ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(100%);
  }
}
</style>
