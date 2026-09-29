<script setup lang="ts">
defineProps<{ modelValue: string; tabs: { value: string; label: string; icon?: string; count?: number }[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.value"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': modelValue === t.value }"
      :aria-selected="modelValue === t.value"
      @click="emit('update:modelValue', t.value)"
    >
      <i v-if="t.icon" :class="t.icon"></i>
      {{ t.label }}
      <span v-if="t.count !== undefined" class="tabs__count">{{ t.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  @include flex(row, center, flex-start, 0.3rem);
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px;
  background: $sand;
  border-radius: 14px;
  margin-bottom: 1.1rem;
  max-width: 100%;
  width: fit-content;

  &::-webkit-scrollbar {
    display: none;
  }

  &__tab {
    @include flex(row, center, center, 0.45rem);
    flex-shrink: 0;
    padding: 0.55rem 0.95rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: $ink-soft;
    white-space: nowrap;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    i {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    &:hover {
      color: $ink;
    }

    &--active {
      background: $surface;
      color: $ink;
      box-shadow: $shadow-sm;

      i {
        color: $blue;
        opacity: 1;
      }
    }
  }

  &__count {
    font-size: 0.7rem;
    background: rgba($navy, 0.07);
    padding: 0.05rem 0.45rem;
    border-radius: $radius-pill;
  }
}
</style>
