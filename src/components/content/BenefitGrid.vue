<script setup lang="ts">
export interface Benefit {
  icon: string
  title: string
  text: string
}

withDefaults(defineProps<{ items: Benefit[]; dark?: boolean }>(), { dark: false })
</script>

<template>
  <ul class="benefits" :class="{ 'benefits--dark': dark }">
    <li v-for="(b, i) in items" :key="b.title" v-reveal="i * 70" class="benefits__item">
      <span class="benefits__icon" aria-hidden="true"><i :class="b.icon"></i></span>
      <h3 class="benefits__title">{{ b.title }}</h3>
      <p class="benefits__text">{{ b.text }}</p>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.benefits {
  list-style: none;
  @include flex-cards(240px, 1rem);

  @include from('md') {
    gap: 1.25rem;
  }

  &__item {
    @include card;
    padding: 1.4rem 1.3rem;
    transition:
      transform 0.35s $ease,
      box-shadow 0.35s $ease;

    @media (hover: hover) {
      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-md;
      }
    }
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    @include flex(row, center, center);
    background: $blue-soft;
    color: $blue;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: $text-lg;
    color: $ink;
    margin-bottom: 0.4rem;
  }

  &__text {
    color: $ink-soft;
    font-size: $text-sm;
  }

  &--dark &__item {
    background: rgba($on-dark, 0.04);
    border-color: rgba($on-dark, 0.1);
  }

  &--dark &__icon {
    background: rgba($accent, 0.12);
    color: $accent;
  }

  &--dark &__title {
    color: $surface;
  }

  &--dark &__text {
    color: $on-dark-soft;
  }
}
</style>
