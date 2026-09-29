<script setup lang="ts">
/** Filtro por chips deslizable en móvil; aria-pressed indica el activo. */
defineProps<{
  options: { value: string; label: string; count?: number }[]
  modelValue: string
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="tchips" role="group" :aria-label="label">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="tchips__chip"
      :class="{ 'tchips__chip--on': o.value === modelValue }"
      :aria-pressed="o.value === modelValue"
      @click="emit('update:modelValue', o.value)"
    >
      {{ o.label }}
      <span v-if="o.count !== undefined" class="tchips__count">{{ o.count }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.tchips {
  @include flex(row, center, flex-start, 0.5rem);
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.25rem 1.25rem;
  margin-inline: -1.25rem;
  scroll-padding-inline: 1.25rem;

  &::-webkit-scrollbar {
    display: none;
  }

  @include from('md') {
    flex-wrap: wrap;
    overflow: visible;
    padding-inline: 0;
    margin-inline: 0;
  }

  &__chip {
    flex: none;
    min-height: $tap;
    @include flex(row, center, center, 0.45rem);
    padding: 0.5rem 1.05rem;
    border-radius: $radius-pill;
    border: 1.5px solid $line;
    background: $surface;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      transform 0.3s $ease-spring;

    &:active {
      transform: scale(0.95);
    }

    &--on {
      background: $navy;
      border-color: $navy;
      color: $surface;
    }
  }

  &__count {
    min-width: 22px;
    height: 22px;
    padding-inline: 0.35rem;
    border-radius: $radius-pill;
    @include flex(row, center, center);
    background: rgba($ink, 0.07);
    font-size: 0.7rem;
  }

  &__chip--on &__count {
    background: $accent;
    color: $navy;
  }
}
</style>
