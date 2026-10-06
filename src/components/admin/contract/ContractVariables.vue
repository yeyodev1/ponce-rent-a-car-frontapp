<script setup lang="ts">
import { computed } from 'vue'
import { contractCopy } from '@/config/admin/contract'
import type { ContractVariable } from '@/types/contract'

/** Variables insertables agrupadas (Reserva, Cliente, Vehículo, Empresa). Un toque las inserta. */
const props = defineProps<{ variables: ContractVariable[] }>()
const emit = defineEmits<{ insert: [key: string] }>()
const c = contractCopy.templates

const groups = computed(() => {
  const map = new Map<string, ContractVariable[]>()
  for (const v of props.variables) map.set(v.group, [...(map.get(v.group) || []), v])
  return [...map.entries()].map(([name, items]) => ({ name, items }))
})
</script>

<template>
  <div class="cvars">
    <p class="cvars__hint"><i class="fa-solid fa-hand-pointer"></i> {{ c.variablesHint }}</p>
    <div v-for="g in groups" :key="g.name" class="cvars__group">
      <p class="cvars__name">{{ g.name }}</p>
      <div class="cvars__chips">
        <button
          v-for="v in g.items"
          :key="v.key"
          type="button"
          class="cvars__chip"
          :title="`{{${v.key}}}`"
          @mousedown.prevent
          @click="emit('insert', v.key)"
        >
          <i class="fa-solid fa-plus"></i>{{ v.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cvars {
  @include flex(column, stretch, flex-start, 0.75rem);

  &__hint {
    font-size: 0.78rem;
    color: $ink-muted;

    i {
      margin-right: 0.3rem;
    }
  }

  &__name {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $ink-muted;
    margin-bottom: 0.35rem;
  }

  &__chips {
    @include flex(row, center, flex-start, 0.35rem);
    flex-wrap: wrap;
  }

  &__chip {
    @include flex(row, center, flex-start, 0.3rem);
    min-height: 32px;
    padding: 0.25rem 0.6rem;
    border-radius: $radius-pill;
    background: $blue-soft;
    color: $blue-deep;
    font-size: 0.76rem;
    font-weight: 700;
    transition: background-color 0.15s ease;

    i {
      font-size: 0.6rem;
    }

    &:hover {
      background: darken($blue-soft, 5%);
    }

    &:focus-visible {
      @include focus-ring($blue);
    }
  }
}
</style>
