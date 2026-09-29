<script setup lang="ts">
import ExpandTransition from './ExpandTransition.vue'

/** Una pregunta: botón con aria-expanded que controla su región de respuesta. */
defineProps<{ id: string; question: string; answer: string; open: boolean; dark?: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div class="faq-item" :class="{ 'faq-item--open': open, 'faq-item--dark': dark }">
    <h3 class="faq-item__h">
      <button
        :id="`${id}-q`"
        type="button"
        class="faq-item__q"
        :aria-expanded="open"
        :aria-controls="`${id}-a`"
        @click="emit('toggle')"
      >
        <span>{{ question }}</span>
        <span class="faq-item__icon" aria-hidden="true"><i class="fa-solid fa-plus"></i></span>
      </button>
    </h3>
    <ExpandTransition>
      <div
        v-show="open"
        :id="`${id}-a`"
        class="faq-item__a"
        role="region"
        :aria-labelledby="`${id}-q`"
      >
        <p class="faq-item__text">{{ answer }}</p>
      </div>
    </ExpandTransition>
  </div>
</template>

<style scoped lang="scss">
.faq-item {
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-md;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &--open {
    border-color: rgba($blue, 0.35);
    box-shadow: $shadow-sm;
  }

  &__h {
    font: inherit;
  }

  &__q {
    width: 100%;
    min-height: 60px;
    @include flex(row, center, space-between, 1rem);
    padding: 1rem 1.15rem;
    text-align: left;
    font-family: $font-principal;
    font-size: $text-base;
    font-weight: 700;
    color: $ink;
    border-radius: $radius-md;
    @include focus-ring($blue);
  }

  &__icon {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    @include flex(row, center, center);
    background: $sand;
    color: $ink;
    font-size: 0.85rem;
    transition:
      transform 0.4s $ease-spring,
      background-color 0.3s ease,
      color 0.3s ease;
  }

  &--open &__icon {
    transform: rotate(135deg);
    background: $accent;
    color: $navy;
  }

  &__text {
    padding: 0 1.15rem 1.2rem;
    color: $ink-soft;
    white-space: pre-line;
  }

  &--dark {
    background: rgba($on-dark, 0.04);
    border-color: rgba($on-dark, 0.12);
  }

  &--dark &__q {
    color: $surface;
  }

  &--dark &__text {
    color: $on-dark-soft;
  }

  &--dark &__icon {
    background: rgba($on-dark, 0.1);
    color: $surface;
  }
}
</style>
