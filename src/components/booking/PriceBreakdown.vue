<script setup lang="ts">
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import type { PriceLine } from '@/types'

/**
 * Desglose línea por línea tal como lo calcula el backend. Las líneas en $0
 * también se muestran: ver "Km limitado $0" da tranquilidad, no ruido.
 */
withDefaults(
  defineProps<{
    lines: PriceLine[]
    total: number
    deposit?: number
    guarantee?: number
    loading?: boolean
    compact?: boolean
  }>(),
  { deposit: 0, guarantee: 0, loading: false, compact: false },
)

const { t, tx } = useI18n()
</script>

<template>
  <div class="breakdown" :class="{ 'breakdown--compact': compact, 'breakdown--loading': loading }">
    <ul class="breakdown__lines">
      <li v-for="line in lines" :key="line.key" class="breakdown__line">
        <span>{{ tx(line.label) }}</span>
        <span class="breakdown__amount">{{ money(line.amount, true) }}</span>
      </li>
    </ul>
    <div class="breakdown__total">
      <span>{{ t('booking.bar.total') }}</span>
      <span class="breakdown__total-value">
        <Transition name="price-bump">
          <span :key="total">{{ money(total, true) }}</span>
        </Transition>
      </span>
    </div>
    <p v-if="deposit" class="breakdown__meta">
      <span>{{ t('booking.bar.deposit') }}</span>
      <span>{{ money(deposit, true) }}</span>
    </p>
    <p v-if="guarantee" class="breakdown__meta breakdown__meta--muted">
      <span><i class="fa-solid fa-shield-halved"></i> {{ t('booking.bar.guarantee') }}</span>
      <span>{{ money(guarantee) }}</span>
    </p>
    <p class="breakdown__note"><i class="fa-solid fa-circle-check"></i> {{ t('booking.bar.noSurprises') }}</p>
  </div>
</template>

<style scoped lang="scss">
.breakdown {
  @include flex(column, stretch, flex-start, 0.75rem);
  transition: opacity 0.2s ease;

  &--loading {
    opacity: 0.55;
  }

  &__lines {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__line,
  &__meta {
    @include flex(row, baseline, space-between, 1rem);
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__amount {
    font-variant-numeric: tabular-nums;
    color: $ink;
    font-weight: 600;
    white-space: nowrap;
  }

  &__total {
    @include flex(row, baseline, space-between, 1rem);
    padding-top: 0.85rem;
    border-top: 1.5px dashed $line;
    font-weight: 800;
    color: $ink;
  }

  &__total-value {
    position: relative;
    font-family: $font-display;
    font-size: $text-xl;
    font-variant-numeric: tabular-nums;
  }

  &__meta {
    font-weight: 600;

    &--muted {
      color: $ink-muted;
      font-weight: 500;

      i {
        margin-right: 0.25rem;
      }
    }
  }

  &__note {
    font-size: $text-xs;
    color: $success;
    font-weight: 700;

    i {
      margin-right: 0.3rem;
    }
  }

  &--compact &__total-value {
    font-size: $text-lg;
  }
}
</style>
