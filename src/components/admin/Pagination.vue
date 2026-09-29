<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; pages: number; total?: number }>()
const emit = defineEmits<{ 'update:page': [value: number] }>()

// Ventana corta de páginas alrededor de la actual: cabe en un celular.
const window_ = computed(() => {
  const out: number[] = []
  const start = Math.max(1, Math.min(props.page - 2, props.pages - 4))
  for (let p = start; p <= Math.min(props.pages, start + 4); p++) out.push(p)
  return out
})

function go(p: number) {
  if (p >= 1 && p <= props.pages && p !== props.page) emit('update:page', p)
}
</script>

<template>
  <nav v-if="pages > 1 || total" class="pager" aria-label="Paginación">
    <span v-if="total !== undefined" class="pager__total">{{ total }} registro{{ total === 1 ? '' : 's' }}</span>
    <div v-if="pages > 1" class="pager__pages">
      <button class="pager__btn" type="button" :disabled="page <= 1" aria-label="Anterior" @click="go(page - 1)">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <button
        v-for="p in window_"
        :key="p"
        class="pager__btn"
        :class="{ 'pager__btn--active': p === page }"
        type="button"
        :aria-current="p === page ? 'page' : undefined"
        @click="go(p)"
      >
        {{ p }}
      </button>
      <button class="pager__btn" type="button" :disabled="page >= pages" aria-label="Siguiente" @click="go(page + 1)">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.pager {
  @include flex(row, center, space-between, 0.75rem);
  flex-wrap: wrap;
  padding: 0.9rem 0.25rem 0;

  &__total {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__pages {
    @include flex(row, center, flex-end, 0.3rem);
  }

  &__btn {
    min-width: 38px;
    height: 38px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: $ink-soft;
    background: $surface;
    border: 1px solid $line;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover:not(:disabled) {
      border-color: $line-strong;
      color: $ink;
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }

    &--active {
      background: $navy;
      border-color: $navy;
      color: $surface;
    }
  }
}
</style>
