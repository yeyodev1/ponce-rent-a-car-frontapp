<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  icon: string
  current?: number
  previous?: number
  hint?: string
  loading?: boolean
}>()

// Variación contra el mes anterior. Sin base previa no se inventa un porcentaje.
const delta = computed(() => {
  if (props.current === undefined || props.previous === undefined) return null
  if (!props.previous) return props.current ? { pct: null, up: true } : null
  const pct = Math.round(((props.current - props.previous) / props.previous) * 100)
  return { pct, up: pct >= 0 }
})
</script>

<template>
  <article class="kpi">
    <div class="kpi__top">
      <span class="kpi__label">{{ label }}</span>
      <span class="kpi__icon"><i :class="icon"></i></span>
    </div>
    <div v-if="loading" class="skeleton kpi__skeleton"></div>
    <p v-else class="kpi__value">{{ value }}</p>
    <p v-if="!loading && delta" class="kpi__delta" :class="delta.up ? 'kpi__delta--up' : 'kpi__delta--down'">
      <i :class="delta.up ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
      <span v-if="delta.pct !== null">{{ delta.pct > 0 ? '+' : '' }}{{ delta.pct }}%</span>
      <span v-else>Nuevo</span>
      <small>vs. mes anterior</small>
    </p>
    <p v-else-if="!loading && hint" class="kpi__hint">{{ hint }}</p>
  </article>
</template>

<style scoped lang="scss">
.kpi {
  @include card;
  @include flex(column, stretch, flex-start, 0.35rem);
  padding: 1rem 1.1rem 1.05rem;
  box-shadow: $shadow-sm;
  min-width: 0;

  &__top {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__label {
    font-size: 0.78rem;
    font-weight: 700;
    color: $ink-muted;
  }

  &__icon {
    @include flex(row, center, center);
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: $blue-soft;
    color: $blue-deep;
    font-size: 0.85rem;
  }

  &__value {
    font-family: $font-display;
    font-size: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
    font-weight: 800;
    font-stretch: 108%;
    letter-spacing: -0.02em;
    color: $ink;
    line-height: 1.1;
  }

  &__skeleton {
    height: 2rem;
    width: 60%;
  }

  &__delta {
    @include flex(row, center, flex-start, 0.35rem);
    flex-wrap: wrap;
    font-size: 0.78rem;
    font-weight: 800;

    small {
      font-weight: 500;
      color: $ink-muted;
    }

    &--up {
      color: $success;
    }

    &--down {
      color: $danger;
    }
  }

  &__hint {
    font-size: 0.78rem;
    color: $ink-muted;
  }
}
</style>
