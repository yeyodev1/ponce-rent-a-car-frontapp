<script setup lang="ts">
import { checklistItems } from '@/config/admin/ops'
import type { ChecklistKey } from '@/types/ops'

/** Lo que va con el auto. En la devolución se indica lo que se entregó. */
const props = defineProps<{
  checklist: Record<ChecklistKey, boolean>
  before?: Record<ChecklistKey, boolean> | null
  readonly?: boolean
}>()

function toggle(key: ChecklistKey) {
  if (!props.readonly) props.checklist[key] = !props.checklist[key]
}
</script>

<template>
  <ul class="chk">
    <li v-for="(item, key) in checklistItems" :key="key">
      <button
        type="button"
        class="chk__item"
        :class="{
          'chk__item--on': checklist[key],
          'chk__item--missing': before?.[key] && !checklist[key],
        }"
        :aria-pressed="checklist[key]"
        :disabled="readonly"
        @click="toggle(key)"
      >
        <i :class="item.icon" class="chk__icon"></i>
        <span class="chk__label">
          {{ item.label }}
          <small v-if="before">En la entrega: {{ before[key] ? 'sí' : 'no' }}</small>
        </span>
        <i
          class="chk__mark"
          :class="checklist[key] ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"
        ></i>
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.chk {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.45rem);

  &__item {
    width: 100%;
    min-height: $tap;
    padding: 0.6rem 0.85rem;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    text-align: left;
    @include flex(row, center, flex-start, 0.75rem);

    &--on {
      border-color: $success;
      background: $success-bg;
    }

    &--missing {
      border-color: $danger;
      background: $danger-bg;
    }

    &:disabled {
      cursor: default;
    }
  }

  &__icon {
    width: 1.3rem;
    color: $ink-muted;
    text-align: center;
  }

  &__label {
    flex: 1;
    font-weight: 700;
    font-size: 0.92rem;
    color: $ink;
    @include flex(column, flex-start, center);

    small {
      font-weight: 600;
      font-size: 0.72rem;
      color: $ink-muted;
    }
  }

  &__mark {
    font-size: 1.3rem;
    color: $line-strong;
  }

  &__item--on &__mark {
    color: $success;
  }
}
</style>
