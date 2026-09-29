<script setup lang="ts">
/** Eyebrow + título + bajada: el mismo ritmo en todas las secciones del home. */
withDefaults(
  defineProps<{ eyebrow?: string; title: string; subtitle?: string; tone?: 'light' | 'dark'; center?: boolean }>(),
  { eyebrow: '', subtitle: '', tone: 'light', center: false },
)
</script>

<template>
  <header v-reveal class="head" :class="[`head--${tone}`, { 'head--center': center }]">
    <p v-if="eyebrow" class="head__eyebrow">{{ eyebrow }}</p>
    <h2 class="head__title">{{ title }}</h2>
    <p v-if="subtitle" class="head__subtitle">{{ subtitle }}</p>
    <slot />
  </header>
</template>

<style scoped lang="scss">
.head {
  @include flex(column, flex-start, flex-start, 0.6rem);
  max-width: 640px;

  &--center {
    align-items: center;
    text-align: center;
    margin-inline: auto;
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-md, 800);
    color: $ink;
  }

  &__subtitle {
    color: $ink-soft;
    font-size: $text-base;
    max-width: 48ch;
  }

  &--dark &__eyebrow {
    color: $accent;
  }

  &--dark &__title {
    color: $surface;
  }

  &--dark &__subtitle {
    color: $on-dark-soft;
  }
}
</style>
