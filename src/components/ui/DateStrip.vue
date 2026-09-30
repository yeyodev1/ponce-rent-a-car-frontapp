<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { ymdInGuayaquil } from '@/utils/format'

/**
 * Selector de fecha compacto: carrusel de los próximos días (Hoy, Mañana...)
 * en vez de un calendario mensual. Con allowFar muestra "Otra fecha" con el
 * selector nativo del teléfono, para fechas más lejanas.
 */
const props = withDefaults(
  defineProps<{ days?: number; allowFar?: boolean; min?: string; max?: string }>(),
  { days: 7, allowFar: true, min: '', max: '' },
)
const model = defineModel<string>({ required: true })
const { t, locale } = useI18n()
const farInput = ref<HTMLInputElement | null>(null)

const items = computed(() =>
  Array.from({ length: props.days }, (_, i) => {
    const ymd = ymdInGuayaquil(i)
    const d = new Date(`${ymd}T12:00:00-05:00`)
    const loc = locale.value === 'en' ? 'en-US' : 'es-EC'
    const weekday = new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'America/Guayaquil' }).format(d)
    const month = new Intl.DateTimeFormat(loc, { month: 'short', timeZone: 'America/Guayaquil' }).format(d)
    const label = i === 0 ? t('dates.today') : i === 1 ? t('dates.tomorrow') : weekday.replace('.', '')
    return { ymd, label, day: d.getUTCDate(), month: month.replace('.', '') }
  }),
)

const isFar = computed(() => Boolean(model.value) && !items.value.some((i) => i.ymd === model.value))
const farLabel = computed(() => {
  if (!isFar.value) return t('dates.otherDate')
  const d = new Date(`${model.value}T12:00:00-05:00`)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-EC', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Guayaquil',
  }).format(d)
})

function openFar() {
  const el = farInput.value
  if (!el) return
  if (typeof el.showPicker === 'function') el.showPicker()
  else el.focus()
}
</script>

<template>
  <div class="dates" role="radiogroup">
    <button
      v-for="item in items"
      :key="item.ymd"
      type="button"
      class="dates__item"
      :class="{ 'dates__item--on': model === item.ymd }"
      role="radio"
      :aria-checked="model === item.ymd"
      @click="model = item.ymd"
    >
      <span class="dates__label">{{ item.label }}</span>
      <span class="dates__day">{{ item.day }}</span>
      <span class="dates__month">{{ item.month }}</span>
    </button>

    <div v-if="allowFar" class="dates__far" :class="{ 'dates__item--on': isFar }">
      <button type="button" class="dates__item dates__item--far" :class="{ 'dates__item--on': isFar }" @click="openFar">
        <i class="fa-regular fa-calendar"></i>
        <span class="dates__label">{{ farLabel }}</span>
      </button>
      <input
        ref="farInput"
        v-model="model"
        class="dates__native"
        type="date"
        :min="min || items[0]?.ymd"
        :max="max || undefined"
        :aria-label="t('dates.otherDate')"
        tabindex="-1"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dates {
  @include flex(row, stretch, flex-start, 0.6rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  // Sin esto el snap alinea la primera opción al borde y se come el padding
  scroll-padding-inline: 1.25rem;
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
    min-height: 86px;
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

  &__far {
    position: relative;
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  &__item--on.dates__item--far {
    color: $surface;
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
