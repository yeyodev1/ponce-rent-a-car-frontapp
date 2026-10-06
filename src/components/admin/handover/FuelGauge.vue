<script setup lang="ts">
import { computed } from 'vue'
import { fuelLabel } from '@/config/admin/ops'

/** Medidor de combustible en octavos: se toca el segmento hasta donde marca la aguja. */
const props = defineProps<{ modelValue: number; compare?: number | null; readonly?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const CX = 110
const CY = 106
const R = 82
const rad = (deg: number) => (deg * Math.PI) / 180
const xy = (deg: number, r = R) => ({
  x: +(CX + r * Math.cos(rad(deg))).toFixed(2),
  y: +(CY - r * Math.sin(rad(deg))).toFixed(2),
})
const pt = (deg: number, r = R) => `${xy(deg, r).x} ${xy(deg, r).y}`

// 8 segmentos de 22,5° de izquierda (vacío) a derecha (lleno), con una pequeña separación.
const segments = Array.from({ length: 8 }, (_, i) => {
  const a1 = 180 - i * 22.5 - 1.2
  const a2 = 180 - (i + 1) * 22.5 + 1.2
  return { i, d: `M ${pt(a1)} A ${R} ${R} 0 0 1 ${pt(a2)}` }
})

const needle = computed(() => xy(180 - props.modelValue * 22.5, R - 24))
const marker = computed(() =>
  props.compare === null || props.compare === undefined
    ? null
    : xy(180 - props.compare * 22.5, R + 18),
)

function set(v: number) {
  if (!props.readonly) emit('update:modelValue', Math.max(0, Math.min(8, v)))
}
</script>

<template>
  <div class="fuel" :class="{ 'fuel--ro': readonly }">
    <svg
      class="fuel__svg"
      viewBox="0 0 220 124"
      role="slider"
      aria-label="Nivel de combustible"
      aria-valuemin="0"
      aria-valuemax="8"
      :aria-valuenow="modelValue"
      :aria-valuetext="fuelLabel(modelValue)"
      tabindex="0"
      @keydown.left.prevent="set(modelValue - 1)"
      @keydown.right.prevent="set(modelValue + 1)"
    >
      <path
        v-for="s in segments"
        :key="s.i"
        :d="s.d"
        class="fuel__seg"
        :class="{
          'fuel__seg--on': s.i < modelValue,
          'fuel__seg--low': s.i < modelValue && modelValue <= 2,
        }"
        @click="set(s.i + 1 === modelValue ? s.i : s.i + 1)"
      />
      <circle v-if="marker" :cx="marker.x" :cy="marker.y" r="5" class="fuel__marker" />
      <line :x1="CX" :y1="CY" :x2="needle.x" :y2="needle.y" class="fuel__needle" />
      <circle :cx="CX" :cy="CY" r="7" class="fuel__hub" />
      <text x="16" y="120" class="fuel__end" @click="set(0)">E</text>
      <text x="196" y="120" class="fuel__end" @click="set(8)">F</text>
    </svg>
    <div class="fuel__row">
      <button
        v-if="!readonly"
        type="button"
        class="fuel__step"
        :disabled="modelValue <= 0"
        aria-label="Menos"
        @click="set(modelValue - 1)"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      <strong class="fuel__value"
        ><i class="fa-solid fa-gas-pump"></i> {{ fuelLabel(modelValue) }}</strong
      >
      <button
        v-if="!readonly"
        type="button"
        class="fuel__step"
        :disabled="modelValue >= 8"
        aria-label="Más"
        @click="set(modelValue + 1)"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fuel {
  @include flex(column, center, flex-start, 0.4rem);
  width: 100%;

  &__svg {
    width: 100%;
    max-width: 320px;
    touch-action: manipulation;
    @include focus-ring($blue);
  }

  &__seg {
    fill: none;
    stroke: $line;
    stroke-width: 28;
    cursor: pointer;
    transition: stroke 0.2s ease;

    &--on {
      stroke: $success;
    }

    &--low {
      stroke: $warning;
    }
  }

  &--ro &__seg,
  &--ro &__end {
    cursor: default;
  }

  &__needle {
    stroke: $navy;
    stroke-width: 4;
    stroke-linecap: round;
    transition: all 0.3s $ease;
  }

  &__hub {
    fill: $navy;
  }

  &__marker {
    fill: $blue;
  }

  &__end {
    font-family: $font-principal;
    font-weight: 800;
    font-size: 15px;
    fill: $ink-muted;
    cursor: pointer;
  }

  &__row {
    @include flex(row, center, center, 1rem);
  }

  &__step {
    width: $tap;
    height: $tap;
    border-radius: 50%;
    background: $sand;
    color: $ink;
    font-size: 1rem;

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
  }

  &__value {
    min-width: 7rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 800;
    color: $ink;

    i {
      color: $ink-muted;
      font-size: 1rem;
      margin-right: 0.3rem;
    }
  }
}
</style>
