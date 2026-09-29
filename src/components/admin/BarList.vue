<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{ items: { key: string; label: string; value: number; color?: string; to?: string }[] }>()

const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)))
const total = computed(() => props.items.reduce((s, i) => s + i.value, 0))

// Las barras crecen desde cero al montar: se lee como "carga" y no como salto.
const grown = ref(false)
onMounted(() => requestAnimationFrame(() => requestAnimationFrame(() => (grown.value = true))))
</script>

<template>
  <ul class="bars">
    <li v-for="(item, i) in items" :key="item.key" class="bars__row">
      <component :is="item.to ? 'RouterLink' : 'div'" :to="item.to" class="bars__link">
        <div class="bars__meta">
          <span class="bars__label">{{ item.label }}</span>
          <span class="bars__value">
            {{ item.value }}
            <small v-if="total">{{ Math.round((item.value / total) * 100) }}%</small>
          </span>
        </div>
        <div class="bars__track">
          <span
            class="bars__fill"
            :style="{
              width: grown ? `${(item.value / max) * 100}%` : '0%',
              background: item.color || '#1f5bff',
              transitionDelay: `${i * 60}ms`,
            }"
          ></span>
        </div>
      </component>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.bars {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.75rem);

  &__link {
    display: block;
    border-radius: 8px;
  }

  &__meta {
    @include flex(row, baseline, space-between, 0.5rem);
    margin-bottom: 0.3rem;
  }

  &__label {
    font-size: 0.84rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__value {
    font-size: 0.86rem;
    font-weight: 800;
    color: $ink;

    small {
      font-weight: 600;
      color: $ink-muted;
      margin-left: 0.3rem;
    }
  }

  &__track {
    height: 8px;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
    display: flex;
  }

  &__fill {
    height: 100%;
    border-radius: $radius-pill;
    transition: width 0.9s $ease;
  }

  a.bars__link:hover .bars__label {
    color: $blue;
  }
}
</style>
