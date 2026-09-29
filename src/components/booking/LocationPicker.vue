<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import OptionCard from '@/components/ui/OptionCard.vue'
import { booking, needsAddress } from '@/composables/booking/useBookingState'
import type { LocationCode, LocationOption } from '@/types'

/** Lugar de entrega y devolución. La devolución solo se pregunta si es distinta. */
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const ICONS: Record<LocationCode, string> = {
  airport: 'fa-solid fa-plane-arrival',
  office: 'fa-solid fa-building',
  hotel: 'fa-solid fa-hotel',
  other: 'fa-solid fa-location-dot',
}

const fallback: LocationOption[] = (['airport', 'office', 'hotel', 'other'] as LocationCode[]).map((code) => ({
  code,
  label: { es: '', en: '' },
  fee: 0,
}))
const locations = computed(() => catalog.config?.booking.locations?.length ? catalog.config.booking.locations : fallback)
const label = (l: LocationOption) => tx(l.label) || t(`common.locations.${l.code}`)
const fee = (l: LocationOption) => (l.fee ? t('booking.dates.fee', { fee: money(l.fee) }) : '')
</script>

<template>
  <div class="place">
    <h2 class="place__q">{{ t('booking.dates.placeQ') }}</h2>
    <div class="place__list" role="radiogroup">
      <OptionCard
        v-for="l in locations"
        :key="l.code"
        compact
        :icon="ICONS[l.code]"
        :title="label(l)"
        :price="fee(l)"
        :selected="booking.pickupLocation === l.code"
        @select="booking.pickupLocation = l.code"
      />
    </div>

    <Transition name="rise">
      <div v-if="needsAddress" class="place__address">
        <label for="pickup-address">{{ t('booking.dates.address') }}</label>
        <input
          id="pickup-address"
          v-model="booking.pickupAddress"
          type="text"
          autocomplete="street-address"
          maxlength="160"
          :placeholder="t('booking.dates.addressPh')"
        />
        <p class="place__hint">{{ t('booking.dates.addressHint') }}</p>
      </div>
    </Transition>

    <label class="place__same">
      <input v-model="booking.sameReturn" type="checkbox" class="place__box" />
      <span class="place__tick" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
      <span>{{ t('booking.dates.sameReturn') }}</span>
    </label>

    <Transition name="rise">
      <div v-if="!booking.sameReturn" class="place__return">
        <h3 class="place__q place__q--sm">{{ t('booking.dates.returnPlace') }}</h3>
        <div class="place__list" role="radiogroup">
          <OptionCard
            v-for="l in locations"
            :key="l.code"
            compact
            :icon="ICONS[l.code]"
            :title="label(l)"
            :price="fee(l)"
            :selected="booking.returnLocation === l.code"
            @select="booking.returnLocation = l.code"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.place {
  @include flex(column, stretch, flex-start, 0.9rem);

  &__q {
    font-size: $text-lg;
    font-stretch: 105%;

    &--sm {
      font-size: $text-base;
      margin-bottom: 0.75rem;
    }
  }

  &__list {
    @include flex-cards(240px, 0.6rem);
  }

  &__hint {
    margin-top: 0.35rem;
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__same {
    position: relative;
    @include flex(row, center, flex-start, 0.75rem);
    min-height: $tap;
    margin: 0;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;
    cursor: pointer;
  }

  &__box {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    min-height: 0;
  }

  &__tick {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    border: 2px solid $line-strong;
    background: $surface;
    color: transparent;
    font-size: 0.75rem;
    @include flex(row, center, center);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      transform 0.35s $ease-spring;
  }

  &__box:checked + &__tick {
    background: $blue;
    border-color: $blue;
    color: $surface;
    transform: scale(1.08);
  }

  &__box:focus-visible + &__tick {
    outline: 2px solid $blue;
    outline-offset: 2px;
  }
}
</style>
