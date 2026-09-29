<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import { track } from '@/composables/useAnalytics'
import OptionCard from '@/components/ui/OptionCard.vue'
import { booking } from '@/composables/booking/useBookingState'
import type { Coverage } from '@/types'

/**
 * Paso 4: cobertura. Lo que NO cubre se muestra igual de visible que lo que
 * cubre: el cliente pidió cero sorpresas.
 */
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const coverages = computed(() => [...catalog.coverages].sort((a, b) => a.order - b.order))

watchEffect(() => {
  if (!booking.coverage && coverages.value.length) {
    booking.coverage = (coverages.value.find((c) => c.isDefault) || coverages.value[0]!).code
  }
})

function choose(c: Coverage) {
  booking.coverage = c.code
  track('coverage_select', { coverage: c.code })
}
</script>

<template>
  <div class="cov" role="radiogroup">
    <template v-if="!coverages.length && catalog.loading">
      <span v-for="i in 2" :key="i" class="skeleton cov__ghost"></span>
    </template>
    <div v-for="c in coverages" :key="c.code" class="cov__item">
      <OptionCard
        :icon="c.isDefault ? 'fa-solid fa-shield' : 'fa-solid fa-shield-heart'"
        :title="tx(c.name)"
        :subtitle="tx(c.description)"
        :badge="c.isDefault ? '' : t('booking.coverage.recommended')"
        :price="c.pricePerDay ? t('booking.coverage.perDay', { price: money(c.pricePerDay) }) : t('booking.coverage.included')"
        :selected="booking.coverage === c.code"
        @select="choose(c)"
      />
      <div class="cov__lists" :class="{ 'cov__lists--on': booking.coverage === c.code }">
        <div v-if="c.includes.length" class="cov__list">
          <p class="cov__head">{{ t('booking.coverage.includes') }}</p>
          <ul>
            <li v-for="(item, i) in c.includes" :key="`in-${i}`" class="cov__yes">
              <i class="fa-solid fa-check"></i><span>{{ tx(item) }}</span>
            </li>
          </ul>
        </div>
        <div v-if="c.excludes.length" class="cov__list">
          <p class="cov__head">{{ t('booking.coverage.excludes') }}</p>
          <ul>
            <li v-for="(item, i) in c.excludes" :key="`ex-${i}`" class="cov__no">
              <i class="fa-solid fa-xmark"></i><span>{{ tx(item) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cov {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__ghost {
    height: 180px;
    border-radius: $radius-md;
  }

  &__item {
    @include flex(column, stretch, flex-start);
  }

  &__lists {
    @include flex-cards(220px, 0.9rem);
    margin: -0.6rem 0.4rem 0;
    padding: 1.4rem 1rem 1rem;
    border: 1.5px solid $line;
    border-top: none;
    border-radius: 0 0 $radius-md $radius-md;
    background: $paper;
    transition:
      border-color 0.25s ease,
      background-color 0.25s ease;

    &--on {
      border-color: rgba($blue, 0.35);
      background: $surface;
    }
  }

  &__head {
    font-size: $text-xs;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $ink-muted;
    margin-bottom: 0.45rem;
  }

  ul {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.4rem);
  }

  li {
    @include flex(row, flex-start, flex-start, 0.55rem);
    font-size: $text-sm;
    line-height: 1.4;
    color: $ink-soft;

    i {
      flex: 0 0 auto;
      width: 20px;
      height: 20px;
      margin-top: 0.05rem;
      border-radius: 50%;
      font-size: 0.65rem;
      @include flex(row, center, center);
    }
  }

  &__yes i {
    background: $success-bg;
    color: $success;
  }

  &__no i {
    background: $danger-bg;
    color: $danger;
  }
}
</style>
