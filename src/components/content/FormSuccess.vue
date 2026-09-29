<script setup lang="ts">
import { onMounted, ref } from 'vue'

/** Confirmación animada tras enviar un formulario. Recibe el foco para anunciarse. */
withDefaults(defineProps<{ title: string; text: string; code?: string; dark?: boolean }>(), {
  code: '',
  dark: false,
})

const root = ref<HTMLElement | null>(null)
onMounted(() => root.value?.focus())
</script>

<template>
  <div ref="root" class="success" :class="{ 'success--dark': dark }" tabindex="-1" role="status">
    <svg class="success__mark" viewBox="0 0 64 64" aria-hidden="true">
      <circle class="success__circle" cx="32" cy="32" r="29" />
      <path class="success__check" d="M20 33.5l8 8 16-17" />
    </svg>
    <h3 class="success__title">{{ title }}</h3>
    <p class="success__text">{{ text }}</p>
    <p v-if="code" class="success__code">{{ code }}</p>
    <div v-if="$slots.default" class="success__actions"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.success {
  @include flex(column, center, center, 0.6rem);
  text-align: center;
  padding: 2rem 1rem;
  outline: none;
  animation: success-in 0.5s $ease both;

  &__mark {
    width: 76px;
    height: 76px;
    margin-bottom: 0.5rem;
  }

  &__circle {
    fill: $success-bg;
    stroke: $success;
    stroke-width: 3;
    stroke-dasharray: 190;
    stroke-dashoffset: 190;
    animation: success-draw 0.7s $ease forwards;
  }

  &__check {
    fill: none;
    stroke: $success;
    stroke-width: 4.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 40;
    stroke-dashoffset: 40;
    animation: success-draw 0.45s $ease 0.5s forwards;
  }

  &__title {
    font-size: $text-xl;
    color: $ink;
  }

  &__text {
    color: $ink-soft;
    max-width: 40ch;
  }

  &__code {
    font-family: $font-display;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 0.35rem 0.9rem;
    border-radius: $radius-pill;
    background: $accent-soft;
    color: $navy;
  }

  &__actions {
    margin-top: 0.75rem;
    @include flex(row, center, center, 0.6rem);
    flex-wrap: wrap;
  }

  &--dark &__title {
    color: $surface;
  }

  &--dark &__text {
    color: $on-dark-soft;
  }
}

@keyframes success-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
}

@keyframes success-draw {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
