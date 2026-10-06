<script setup lang="ts">
import { damageZones } from '@/config/admin/ops'
import type { DamageZone } from '@/types/ops'

/**
 * Auto visto desde arriba con zonas tocables. Marca en ámbar las zonas con
 * daños previos y en rojo las que tienen daños nuevos.
 */
const props = defineProps<{ marked?: DamageZone[]; fresh?: DamageZone[]; readonly?: boolean }>()
const emit = defineEmits<{ pick: [zone: DamageZone] }>()

interface Shape {
  zone: DamageZone
  d: string
  lx: number
  ly: number
  label: string
}

const shapes: Shape[] = [
  {
    zone: 'front',
    d: 'M30 82 L30 46 Q30 18 80 16 Q130 18 130 46 L130 82 Z',
    lx: 80,
    ly: 52,
    label: 'Frente',
  },
  {
    zone: 'windshield',
    d: 'M34 84 L126 84 L118 112 L42 112 Z',
    lx: 80,
    ly: 101,
    label: 'Parabrisas',
  },
  { zone: 'roof', d: 'M42 114 L118 114 L118 196 L42 196 Z', lx: 80, ly: 158, label: 'Techo' },
  { zone: 'trunk', d: 'M38 198 L122 198 L130 246 L30 246 Z', lx: 80, ly: 226, label: 'Maletero' },
  {
    zone: 'rear',
    d: 'M30 248 L130 248 L130 262 Q130 284 80 286 Q30 284 30 262 Z',
    lx: 80,
    ly: 270,
    label: 'Atrás',
  },
  { zone: 'left', d: 'M10 92 L28 92 L28 212 L10 212 Z', lx: 19, ly: 152, label: 'Izq.' },
  { zone: 'right', d: 'M132 92 L150 92 L150 212 L132 212 Z', lx: 141, ly: 152, label: 'Der.' },
]

// Las cuatro llantas son una sola zona.
const wheels = [
  { x: 10, y: 46 },
  { x: 132, y: 46 },
  { x: 10, y: 218 },
  { x: 132, y: 218 },
]

const isMarked = (z: DamageZone) => props.marked?.includes(z)
const isFresh = (z: DamageZone) => props.fresh?.includes(z)
const cls = (z: DamageZone) => ({
  'car__zone--marked': isMarked(z),
  'car__zone--fresh': isFresh(z),
})

function pick(z: DamageZone) {
  if (!props.readonly) emit('pick', z)
}
</script>

<template>
  <div class="car" :class="{ 'car--ro': readonly }">
    <svg class="car__svg" viewBox="0 0 160 300" role="group" aria-label="Zonas del vehículo">
      <g
        v-for="s in shapes"
        :key="s.zone"
        class="car__zone"
        :class="cls(s.zone)"
        role="button"
        :aria-label="damageZones[s.zone]"
        tabindex="0"
        @click="pick(s.zone)"
        @keydown.enter="pick(s.zone)"
      >
        <path :d="s.d" />
        <text
          :x="s.lx"
          :y="s.ly"
          :transform="
            s.zone === 'left' || s.zone === 'right' ? `rotate(-90 ${s.lx} ${s.ly})` : undefined
          "
        >
          {{ s.label }}
        </text>
      </g>
      <g
        class="car__zone"
        :class="cls('wheels')"
        role="button"
        :aria-label="damageZones.wheels"
        tabindex="0"
        @click="pick('wheels')"
        @keydown.enter="pick('wheels')"
      >
        <rect v-for="(w, i) in wheels" :key="i" :x="w.x" :y="w.y" width="18" height="36" rx="5" />
      </g>
    </svg>
    <div class="car__chips">
      <button
        v-for="z in ['wheels', 'interior', 'other'] as DamageZone[]"
        :key="z"
        type="button"
        class="car__chip"
        :class="cls(z)"
        :disabled="readonly"
        @click="pick(z)"
      >
        <i
          :class="
            z === 'wheels'
              ? 'fa-solid fa-circle-dot'
              : z === 'interior'
                ? 'fa-solid fa-couch'
                : 'fa-solid fa-ellipsis'
          "
        ></i>
        {{ damageZones[z] }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.car {
  @include flex(column, center, flex-start, 0.7rem);

  &__svg {
    width: 100%;
    max-width: 210px;
    touch-action: manipulation;
  }

  &__zone {
    cursor: pointer;
    outline: none;

    path,
    rect {
      fill: $surface;
      stroke: $line-strong;
      stroke-width: 1.5;
      transition: fill 0.2s ease;
    }

    text {
      font-size: 10px;
      font-weight: 700;
      fill: $ink-muted;
      text-anchor: middle;
      pointer-events: none;
    }

    &:hover path,
    &:hover rect,
    &:focus-visible path,
    &:focus-visible rect {
      fill: $blue-soft;
    }

    &--marked path,
    &--marked rect {
      fill: $warning-bg;
      stroke: $warning;
    }

    &--fresh path,
    &--fresh rect {
      fill: $danger-bg;
      stroke: $danger;
    }
  }

  &--ro &__zone {
    cursor: default;
  }

  &__chips {
    @include flex(row, center, center, 0.4rem);
    flex-wrap: wrap;
  }

  &__chip {
    min-height: 40px;
    padding: 0.4rem 0.85rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: 0.82rem;
    font-weight: 700;
    color: $ink-soft;
    @include flex(row, center, center, 0.35rem);

    &.car__zone--marked {
      border-color: $warning;
      background: $warning-bg;
    }

    &.car__zone--fresh {
      border-color: $danger;
      background: $danger-bg;
    }

    &:disabled {
      cursor: default;
    }
  }
}
</style>
