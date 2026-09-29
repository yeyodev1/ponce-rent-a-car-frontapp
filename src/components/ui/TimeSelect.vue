<script setup lang="ts">
import { computed } from 'vue'

/**
 * Hora compacta: chips deslizables cada 30 min. Sin rueda de 24 horas: la
 * mayoría de retiros cae en horario de atención.
 */
const props = withDefaults(defineProps<{ from?: number; to?: number; step?: number; minTime?: string }>(), {
  from: 6,
  to: 22,
  step: 30,
  minTime: '',
})
const model = defineModel<string>({ required: true })

const slots = computed(() => {
  const out: string[] = []
  for (let m = props.from * 60; m <= props.to * 60; m += props.step) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    const v = `${hh}:${mm}`
    if (!props.minTime || v >= props.minTime) out.push(v)
  }
  return out
})
</script>

<template>
  <div class="times" role="radiogroup">
    <button
      v-for="slot in slots"
      :key="slot"
      type="button"
      class="times__item"
      :class="{ 'times__item--on': model === slot }"
      role="radio"
      :aria-checked="model === slot"
      @click="model = slot"
    >
      {{ slot }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.times {
  @include flex(row, center, flex-start, 0.5rem);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  margin-inline: -1.25rem;
  padding: 0.25rem 1.25rem 0.5rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__item {
    scroll-snap-align: start;
    flex: 0 0 auto;
    min-height: 44px;
    padding: 0 1rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: 0.92rem;
    font-variant-numeric: tabular-nums;
    color: $ink;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.3s $ease-spring;

    &:active {
      transform: scale(0.94);
    }

    &--on {
      background: $blue;
      border-color: $blue;
      color: $surface;
      box-shadow: $shadow-blue;
    }
  }
}
</style>
