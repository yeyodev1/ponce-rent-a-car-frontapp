<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    points: { label: string; value: number }[]
    height?: number
    format?: (v: number) => string
  }>(),
  { height: 220, format: (v: number) => String(v) },
)

// Espacio de dibujo fijo; el SVG escala al ancho del contenedor con viewBox.
const W = 640
const pad = { top: 18, right: 16, bottom: 30, left: 36 }
const gradId = `lc-${useId()}`

const max = computed(() => {
  const m = Math.max(0, ...props.points.map((p) => p.value))
  if (m <= 4) return 4
  const step = Math.pow(10, Math.floor(Math.log10(m)))
  return Math.ceil(m / step) * step
})

const coords = computed(() => {
  const n = props.points.length
  const innerW = W - pad.left - pad.right
  const innerH = props.height - pad.top - pad.bottom
  return props.points.map((p, i) => ({
    x: pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: pad.top + innerH - (p.value / max.value) * innerH,
    ...p,
  }))
})

// Curva suave (Catmull-Rom → Bézier) para que se lea como tendencia, no como zigzag.
const line = computed(() => {
  const c = coords.value
  if (!c.length) return ''
  let d = `M${c[0]!.x},${c[0]!.y}`
  for (let i = 0; i < c.length - 1; i++) {
    const p1 = c[i]!
    const p2 = c[i + 1]!
    const p0 = c[i - 1] || p1
    const p3 = c[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
})

const area = computed(() => {
  const c = coords.value
  if (!c.length) return ''
  const base = props.height - pad.bottom
  return `${line.value} L${c[c.length - 1]!.x},${base} L${c[0]!.x},${base} Z`
})

const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((t) => ({
  y: pad.top + (props.height - pad.top - pad.bottom) * (1 - t),
  label: props.format(Math.round(max.value * t)),
})))

const path = ref<SVGPathElement | null>(null)
const length = ref(0)
const drawn = ref(false)
const hover = ref<number | null>(null)

// Globito con el valor del punto señalado, siempre dentro del lienzo.
const tip = computed(() => {
  const c = hover.value === null ? null : coords.value[hover.value]
  if (!c) return null
  const top = Math.max(c.y - 38, 0)
  return { x: Math.min(Math.max(c.x - 40, 0), W - 80), cx: Math.min(Math.max(c.x, 40), W - 40), y: top, text: props.format(c.value) }
})

onMounted(() => {
  length.value = path.value?.getTotalLength() || 0
  requestAnimationFrame(() => requestAnimationFrame(() => (drawn.value = true)))
})
</script>

<template>
  <div class="chart">
    <svg :viewBox="`0 0 ${W} ${height}`" class="chart__svg" role="img" aria-label="Gráfico de líneas">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f5bff" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#1f5bff" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g class="chart__grid">
        <g v-for="t in ticks" :key="t.y">
          <line :x1="pad.left" :x2="W - pad.right" :y1="t.y" :y2="t.y" />
          <text :x="pad.left - 8" :y="t.y + 4" text-anchor="end">{{ t.label }}</text>
        </g>
      </g>

      <path :d="area" :fill="`url(#${gradId})`" class="chart__area" :class="{ 'chart__area--in': drawn }" />
      <path
        ref="path"
        :d="line"
        class="chart__line"
        :style="{ strokeDasharray: length, strokeDashoffset: drawn ? 0 : length }"
      />

      <g v-for="(c, i) in coords" :key="c.label">
        <text :x="c.x" :y="height - 8" text-anchor="middle" class="chart__xlabel">{{ c.label }}</text>
        <rect
          :x="c.x - 18"
          :y="pad.top"
          width="36"
          :height="height - pad.top - pad.bottom"
          fill="transparent"
          @mouseenter="hover = i"
          @mouseleave="hover = null"
          @click="hover = i"
        />
        <circle
          :cx="c.x"
          :cy="c.y"
          :r="hover === i ? 6 : 4"
          class="chart__dot"
          :class="{ 'chart__dot--in': drawn }"
          :style="{ transitionDelay: `${0.5 + i * 0.05}s` }"
        />
      </g>

      <g v-if="tip" class="chart__tip">
        <rect :x="tip.x" :y="tip.y" width="80" height="26" rx="8" />
        <text :x="tip.cx" :y="tip.y + 17" text-anchor="middle">{{ tip.text }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.chart {
  width: 100%;

  &__svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  &__grid {
    line {
      stroke: $line;
      stroke-dasharray: 3 4;
    }

    text {
      font-size: 11px;
      fill: $ink-muted;
      font-family: $font-principal;
    }
  }

  &__xlabel {
    font-size: 11px;
    fill: $ink-muted;
    font-family: $font-principal;
    text-transform: capitalize;
  }

  &__line {
    fill: none;
    stroke: $blue;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-dashoffset 1.3s $ease-in-out;
  }

  &__area {
    opacity: 0;
    transition: opacity 0.8s ease 0.6s;

    &--in {
      opacity: 1;
    }
  }

  &__dot {
    fill: $surface;
    stroke: $blue;
    stroke-width: 2.5;
    opacity: 0;
    transition: opacity 0.3s ease, r 0.2s ease;
    pointer-events: none;

    &--in {
      opacity: 1;
    }
  }

  &__tip {
    pointer-events: none;

    rect {
      fill: $navy;
    }

    text {
      fill: $surface;
      font-size: 12px;
      font-weight: 700;
      font-family: $font-principal;
    }
  }
}
</style>
