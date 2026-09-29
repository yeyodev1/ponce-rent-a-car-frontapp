<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { addDays } from '@/composables/booking/useDateRules'

/**
 * Carrusel de devolución que arranca en la fecha de retiro (el DateStrip
 * compartido siempre arranca hoy). Cada día dice cuántos días de renta son,
 * y "Otra fecha" abre el selector nativo para rentas largas.
 */
const props = withDefaults(defineProps<{ start: string; days?: number }>(), { days: 15 })
const model = defineModel<string>({ required: true })
const { t, locale } = useI18n()
const farInput = ref<HTMLInputElement | null>(null)

const loc = computed(() => (locale.value === 'en' ? 'en-US' : 'es-EC'))
const fmt = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(loc.value, { ...opts, timeZone: 'America/Guayaquil' })
    .format(new Date(`${ymd}T12:00:00-05:00`))
    .replace('.', '')

const items = computed(() =>
  Array.from({ length: props.days }, (_, i) => {
    const ymd = addDays(props.start, i)
    return {
      ymd,
      weekday: fmt(ymd, { weekday: 'short' }),
      day: Number(ymd.slice(8, 10)),
      month: fmt(ymd, { month: 'short' }),
      span: i === 0 ? '' : t('booking.dates.plus', { n: i }),
    }
  }),
)

const isFar = computed(() => Boolean(model.value) && !items.value.some((i) => i.ymd === model.value))
const farLabel = computed(() => (isFar.value ? fmt(model.value, { day: 'numeric', month: 'short' }) : t('common.dates.otherDate')))

function openFar() {
  const el = farInput.value
  if (!el) return
  if (typeof el.showPicker === 'function') el.showPicker()
  else el.focus()
}
</script>

<template>
  <div class="rdates" role="radiogroup" :aria-label="t('booking.dates.return')">
    <button
      v-for="item in items"
      :key="item.ymd"
      type="button"
      class="rdates__item"
      :class="{ 'rdates__item--on': model === item.ymd }"
      role="radio"
      :aria-checked="model === item.ymd"
      @click="model = item.ymd"
    >
      <span class="rdates__label">{{ item.weekday }}</span>
      <span class="rdates__day">{{ item.day }}</span>
      <span class="rdates__month">{{ item.month }}</span>
      <span v-if="item.span" class="rdates__span">{{ item.span }}</span>
    </button>
    <div class="rdates__far">
      <button type="button" class="rdates__item rdates__item--far" :class="{ 'rdates__item--on': isFar }" @click="openFar">
        <i class="fa-regular fa-calendar"></i>
        <span class="rdates__label">{{ farLabel }}</span>
      </button>
      <input
        ref="farInput"
        v-model="model"
        class="rdates__native"
        type="date"
        :min="start"
        :aria-label="t('common.dates.otherDate')"
        tabindex="-1"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.rdates {
  @include flex(row, stretch, flex-start, 0.6rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin-inline: -1.25rem;
  padding: 0.35rem 1.25rem 0.6rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__item {
    scroll-snap-align: start;
    flex: 0 0 auto;
    width: 74px;
    min-height: 96px;
    @include flex(column, center, center, 0.1rem);
    background: $surface;
    border: 1.5px solid $line;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    transition:
      transform 0.3s $ease-spring,
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.25s ease;

    &:active {
      transform: scale(0.95);
    }

    &--on {
      background: $navy;
      border-color: $navy;
      color: $surface;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &--far {
      width: 96px;
      gap: 0.4rem;
      color: $blue;

      i {
        font-size: 1.2rem;
      }
    }

    &--far.rdates__item--on {
      color: $surface;
    }
  }

  &__label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: capitalize;
    opacity: 0.8;
  }

  &__day {
    font-family: $font-display;
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
  }

  &__month {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }

  &__span {
    margin-top: 0.2rem;
    font-size: 0.64rem;
    font-weight: 800;
    padding: 0.05rem 0.4rem;
    border-radius: $radius-pill;
    background: $blue-soft;
    color: $blue-deep;
  }

  &__item--on &__span {
    background: $accent;
    color: $navy;
  }

  &__far {
    position: relative;
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  &__native {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    min-height: 0;
  }
}
</style>
