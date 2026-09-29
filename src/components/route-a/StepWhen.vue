<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import { ymdInGuayaquil } from '@/utils/format'
import { useRouteA } from '@/composables/useRouteA'
import DateStrip from '@/components/ui/DateStrip.vue'
import TimeSelect from '@/components/ui/TimeSelect.vue'
import type { DurationBucket } from '@/types'

/** Pregunta 1: fecha, hora aproximada y duración, todo en una pantalla. */
const { t } = useI18n()
const { answers } = useRouteA()

const durations: DurationBucket[] = ['1', '2-3', '4-7', '8-15', '16-30', '30+']
const pad = (n: number) => String(n).padStart(2, '0')

// Si es para hoy, no se ofrecen horas que ya pasaron (con 1 h de margen).
const minTime = computed(() => {
  if (answers.startDate !== ymdInGuayaquil(0)) return ''
  const now = new Date(Date.now() - 5 * 3600 * 1000)
  const m = Math.ceil((now.getUTCHours() * 60 + now.getUTCMinutes() + 60) / 30) * 30
  // Muy tarde en la noche: se deja elegir y el asesor lo ajusta
  if (m > 22 * 60) return ''
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
})

watch(minTime, (min) => {
  if (min && answers.startTime && answers.startTime < min) answers.startTime = ''
})
</script>

<template>
  <div class="when">
    <fieldset class="when__group">
      <legend class="when__label"><i class="fa-regular fa-calendar"></i>{{ t('routeA.when.date') }}</legend>
      <DateStrip v-model="answers.startDate" :days="7" allow-far />
    </fieldset>

    <fieldset class="when__group">
      <legend class="when__label"><i class="fa-regular fa-clock"></i>{{ t('routeA.when.time') }}</legend>
      <TimeSelect v-model="answers.startTime" :min-time="minTime" />
    </fieldset>

    <fieldset class="when__group">
      <legend class="when__label"><i class="fa-solid fa-hourglass-half"></i>{{ t('routeA.when.duration') }}</legend>
      <div class="when__chips" role="radiogroup" :aria-label="t('routeA.when.duration')">
        <button
          v-for="d in durations"
          :key="d"
          type="button"
          role="radio"
          class="when__chip"
          :class="{ 'when__chip--on': answers.duration === d }"
          :aria-checked="answers.duration === d"
          @click="answers.duration = d"
        >
          {{ t(`common.durations.${d}`) }}
        </button>
      </div>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.when {
  @include flex(column, stretch, flex-start, 1.4rem);

  &__group {
    border: 0;
    min-width: 0;
  }

  &__label {
    @include flex(row, center, flex-start, 0.5rem);
    margin-bottom: 0.55rem;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $ink-soft;

    i {
      color: $blue;
    }
  }

  &__chips {
    @include flex(row, stretch, flex-start, 0.55rem);
    flex-wrap: wrap;
  }

  &__chip {
    flex: 1 1 calc(33.333% - 0.55rem);
    min-height: 52px;
    padding: 0 0.5rem;
    border-radius: $radius-sm;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: 0.95rem;
    color: $ink;
    white-space: nowrap;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.3s $ease-spring;
    @include focus-ring($blue);

    &:active {
      transform: scale(0.95);
    }

    &--on {
      background: $navy;
      border-color: $navy;
      color: $surface;
      box-shadow: $shadow-md;
    }
  }
}
</style>
