<script setup lang="ts">
import { computed } from 'vue'
import { copy, toneColors, type StatusDef } from '@/config/admin'

// Filtro de un solo valor como fila de pastillas deslizables (cómodo con el pulgar).
const props = defineProps<{
  modelValue: string
  options: Record<string, StatusDef | string>
  allLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const list = computed(() =>
  Object.entries(props.options).filter(([k]) => k !== '').map(([value, def]) => ({
    value,
    label: typeof def === 'string' ? def : def.label,
    color: typeof def === 'string' ? null : toneColors[def.tone].fg,
  })),
)
</script>

<template>
  <div class="pills">
    <button
      type="button"
      class="pills__pill"
      :class="{ 'pills__pill--active': !modelValue }"
      @click="emit('update:modelValue', '')"
    >
      {{ allLabel || copy.all }}
    </button>
    <button
      v-for="o in list"
      :key="o.value"
      type="button"
      class="pills__pill"
      :class="{ 'pills__pill--active': modelValue === o.value }"
      @click="emit('update:modelValue', modelValue === o.value ? '' : o.value)"
    >
      <span v-if="o.color" class="pills__dot" :style="{ background: o.color }"></span>
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.pills {
  @include flex(row, center, flex-start, 0.4rem);
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
  margin-inline: -1rem;
  padding-inline: 1rem;

  @include from('md') {
    flex-wrap: wrap;
    margin-inline: 0;
    padding-inline: 0;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  &__pill {
    @include flex(row, center, center, 0.4rem);
    flex-shrink: 0;
    padding: 0.42rem 0.85rem;
    border-radius: $radius-pill;
    border: 1px solid $line;
    background: $surface;
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-soft;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      border-color: $line-strong;
    }

    &--active {
      background: $navy;
      border-color: $navy;
      color: $surface;
    }
  }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
}
</style>
