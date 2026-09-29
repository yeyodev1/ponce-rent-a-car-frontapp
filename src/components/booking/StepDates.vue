<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useCatalogStore } from '@/stores/catalog'
import DateStrip from '@/components/ui/DateStrip.vue'
import TimeSelect from '@/components/ui/TimeSelect.vue'
import ReturnDateStrip from './ReturnDateStrip.vue'
import LocationPicker from './LocationPicker.vue'
import { booking, localDays } from '@/composables/booking/useBookingState'
import { quoteErrors } from '@/composables/booking/useQuote'
import {
  CLOSE_HOUR,
  OPEN_HOUR,
  ensureDateDefaults,
  pickupMinTime,
  returnMinTime,
  shiftPickup,
} from '@/composables/booking/useDateRules'

/** Paso 2: retiro, devolución y lugar. El retiro solo dentro de la ventana; la devolución, libre. */
const emit = defineEmits<{ goto: [step: number] }>()
const { t } = useI18n()
const catalog = useCatalogStore()

const cfg = computed(() => catalog.config)
const pickupDays = computed(() => (cfg.value?.booking.maxDaysAhead ?? 5) + 1)
const pickupMin = computed(() => pickupMinTime(cfg.value))
const noSlotsToday = computed(() => pickupMin.value === '23:59')
const returnMin = computed(() => returnMinTime())
const daysLabel = computed(() =>
  localDays.value === 1 ? t('booking.bar.oneDay') : t('booking.bar.days', { n: localDays.value }),
)
const tooFar = computed(() => quoteErrors.value.some((e) => e.code === 'too_far'))

onMounted(() => ensureDateDefaults(cfg.value))
watch(cfg, (c) => c && ensureDateDefaults(c))
watch(
  () => booking.pickupDate,
  (next, prev) => shiftPickup(next, prev, cfg.value),
)
watch(returnMin, (min) => {
  if (min && booking.returnTime < min) booking.returnTime = min
})
</script>

<template>
  <div class="when">
    <section class="when__block">
      <h2 class="when__label"><i class="fa-solid fa-arrow-right-from-bracket"></i>{{ t('booking.dates.pickup') }}</h2>
      <DateStrip v-model="booking.pickupDate" :days="pickupDays" :allow-far="false" />
      <p v-if="noSlotsToday" class="when__warn"><i class="fa-regular fa-clock"></i>{{ t('booking.dates.noSlotsToday') }}</p>
      <TimeSelect v-else v-model="booking.pickupTime" :from="OPEN_HOUR" :to="CLOSE_HOUR" :min-time="pickupMin" />
      <RouterLink to="/ayudame-a-elegir" class="when__later" :class="{ 'when__later--loud': tooFar }">
        <span class="when__later-icon"><i class="fa-solid fa-headset"></i></span>
        <span class="when__later-text">
          <strong>{{ t('booking.dates.laterTitle') }}</strong>
          <span>{{ t('booking.dates.laterBody') }}</span>
        </span>
        <span class="when__later-cta">{{ t('booking.dates.laterCta') }} <i class="fa-solid fa-arrow-right"></i></span>
      </RouterLink>
    </section>

    <section class="when__block">
      <div class="when__row">
        <h2 class="when__label"><i class="fa-solid fa-arrow-right-to-bracket"></i>{{ t('booking.dates.return') }}</h2>
        <Transition name="price-bump" mode="out-in">
          <span v-if="localDays" :key="localDays" class="chip chip--blue">
            <i class="fa-regular fa-calendar-check"></i>{{ daysLabel }}
          </span>
        </Transition>
      </div>
      <ReturnDateStrip v-if="booking.pickupDate" v-model="booking.returnDate" :start="booking.pickupDate" />
      <TimeSelect v-model="booking.returnTime" :from="OPEN_HOUR" :to="CLOSE_HOUR" :min-time="returnMin" />
    </section>

    <TransitionGroup name="rise" tag="div" class="when__errors">
      <div v-for="e in quoteErrors" :key="e.code + e.text" class="when__error" role="alert">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ e.text }}</span>
        <button v-if="e.code === 'unavailable'" type="button" class="when__error-cta" @click="emit('goto', 1)">
          {{ t('booking.errors.changeCategory') }}
        </button>
      </div>
    </TransitionGroup>

    <LocationPicker />
  </div>
</template>

<style scoped lang="scss">
.when {
  @include flex(column, stretch, flex-start, 1.75rem);

  &__block {
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__row {
    @include flex(row, center, space-between, 0.75rem);
  }

  &__label {
    @include flex(row, center, flex-start, 0.55rem);
    font-size: $text-lg;
    font-stretch: 105%;

    i {
      color: $blue;
      font-size: 0.95rem;
    }
  }

  &__warn {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    color: darken($warning, 12%);
    background: $warning-bg;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
  }

  &__later {
    @include flex(row, center, flex-start, 0.75rem);
    margin-top: 0.3rem;
    padding: 0.75rem 0.9rem;
    border-radius: $radius-md;
    border: 1.5px dashed $line-strong;
    font-size: $text-xs;
    color: $ink-soft;
    transition:
      border-color 0.25s ease,
      background-color 0.25s ease,
      transform 0.3s $ease-spring;

    &:active {
      transform: scale(0.98);
    }

    &--loud {
      border-style: solid;
      border-color: $accent;
      background: $accent-soft;
    }
  }

  &__later-icon {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $sand;
    color: $blue;
    @include flex(row, center, center);
  }

  &__later-text {
    flex: 1;
    @include flex(column, flex-start, center, 0.05rem);

    strong {
      color: $ink;
      font-size: $text-sm;
    }
  }

  &__later-cta {
    flex: 0 0 auto;
    font-weight: 800;
    color: $blue;
    white-space: nowrap;
  }

  &__errors {
    @include flex(column, stretch, flex-start, 0.5rem);

    &:empty {
      display: none;
    }
  }

  &__error {
    @include flex(row, flex-start, flex-start, 0.6rem);
    flex-wrap: wrap;
    padding: 0.8rem 0.95rem;
    border-radius: $radius-sm;
    background: $danger-bg;
    color: $danger;
    font-size: $text-sm;
    font-weight: 600;

    i {
      margin-top: 0.2rem;
    }

    span {
      flex: 1;
      min-width: 180px;
    }
  }

  &__error-cta {
    min-height: 40px;
    padding: 0 0.9rem;
    border-radius: $radius-pill;
    background: $surface;
    color: $danger;
    font-weight: 800;
    font-size: $text-xs;
  }
}
</style>
