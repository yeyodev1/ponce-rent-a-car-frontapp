<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import { track } from '@/composables/useAnalytics'
import OptionCard from '@/components/ui/OptionCard.vue'
import { booking, localDays } from '@/composables/booking/useBookingState'
import { quote } from '@/composables/booking/useQuote'
import type { MileageOption } from '@/types'

/** Paso 3: kilometraje. Se explica la cuenta con los días reales de esta renta. */
const { t } = useI18n()
const catalog = useCatalogStore()

const m = computed(() => catalog.config?.booking.mileage ?? { limitedKmPerDay: 150, extraKmPrice: 25, unlimitedPricePerDay: 2500 })
const days = computed(() => quote.value?.days || localDays.value || 1)
const includedKm = computed(() => quote.value?.mileageInfo.includedKm ?? m.value.limitedKmPerDay * days.value)
const extraPrice = computed(() => money(quote.value?.mileageInfo.extraKmPrice ?? m.value.extraKmPrice, true))
const daysLabel = computed(() => (days.value === 1 ? t('booking.bar.oneDay') : t('booking.bar.days', { n: days.value })))

function choose(value: MileageOption) {
  booking.mileage = value
  track('mileage_select', { mileage: value })
}
</script>

<template>
  <div class="mileage" role="radiogroup">
    <OptionCard
      icon="fa-solid fa-gauge"
      :title="t('booking.mileage.limitedTitle')"
      :subtitle="t('booking.mileage.limitedSub', { km: m.limitedKmPerDay, price: extraPrice })"
      :price="t('booking.mileage.included')"
      :selected="booking.mileage === 'limited'"
      @select="choose('limited')"
    />
    <Transition name="rise">
      <p v-if="booking.mileage === 'limited'" class="mileage__how">
        <i class="fa-solid fa-calculator"></i>
        <span>
          {{ t('booking.mileage.how', { km: m.limitedKmPerDay, days: daysLabel, total: includedKm, price: extraPrice }) }}
        </span>
      </p>
    </Transition>
    <OptionCard
      icon="fa-solid fa-infinity"
      :title="t('booking.mileage.unlimitedTitle')"
      :subtitle="t('booking.mileage.unlimitedSub')"
      :price="t('booking.mileage.unlimitedPrice', { price: money(m.unlimitedPricePerDay) })"
      :selected="booking.mileage === 'unlimited'"
      @select="choose('unlimited')"
    />
  </div>
</template>

<style scoped lang="scss">
.mileage {
  @include flex(column, stretch, flex-start, 0.75rem);

  &__how {
    @include flex(row, flex-start, flex-start, 0.65rem);
    padding: 0.85rem 1rem;
    border-radius: $radius-md;
    background: $blue-soft;
    color: $blue-deep;
    font-size: $text-sm;
    line-height: 1.5;

    i {
      margin-top: 0.2rem;
    }
  }
}
</style>
