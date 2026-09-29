<script setup lang="ts">
defineProps<{ modelValue: boolean | undefined; label?: string; small?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="toggle" :class="{ 'toggle--sm': small }" @click.stop>
    <input
      type="checkbox"
      class="visually-hidden"
      :checked="Boolean(modelValue)"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="toggle__track" :class="{ 'toggle__track--on': modelValue }"><span class="toggle__thumb"></span></span>
    <span v-if="label" class="toggle__label">{{ label }}</span>
  </label>
</template>

<style scoped lang="scss">
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  cursor: pointer;
  user-select: none;

  &__track {
    position: relative;
    width: 42px;
    height: 24px;
    border-radius: $radius-pill;
    background: $line-strong;
    transition: background-color 0.25s ease;
    flex-shrink: 0;

    &--on {
      background: $success;
    }
  }

  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: $surface;
    box-shadow: 0 1px 3px rgba($navy, 0.25);
    transition: transform 0.28s $ease-spring;
  }

  &__track--on &__thumb {
    transform: translateX(18px);
  }

  &--sm &__track {
    width: 36px;
    height: 20px;
  }

  &--sm &__thumb {
    width: 14px;
    height: 14px;
  }

  &--sm &__track--on &__thumb {
    transform: translateX(16px);
  }

  input:focus-visible + &__track {
    outline: 2px solid $blue;
    outline-offset: 2px;
  }

  &__label {
    font-size: 0.88rem;
    font-weight: 600;
    color: $ink-soft;
  }
}
</style>
