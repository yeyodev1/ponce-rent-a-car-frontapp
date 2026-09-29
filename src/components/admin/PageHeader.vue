<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; back?: string; eyebrow?: string }>()
</script>

<template>
  <header class="phead">
    <div class="phead__text">
      <RouterLink v-if="back" :to="back" class="phead__back"><i class="fa-solid fa-arrow-left"></i> Volver</RouterLink>
      <p v-if="eyebrow" class="phead__eyebrow">{{ eyebrow }}</p>
      <h1 class="phead__title">{{ title }}</h1>
      <p v-if="subtitle" class="phead__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="phead__actions">
      <slot />
    </div>
  </header>
</template>

<style scoped lang="scss">
.phead {
  @include flex(row, flex-end, space-between, 0.9rem 1rem);
  flex-wrap: wrap;
  margin-bottom: 1.25rem;

  &__text {
    min-width: 0;
    @include flex(column, flex-start, flex-start, 0.2rem);
  }

  &__back {
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.4rem);
    margin-bottom: 0.4rem;

    &:hover {
      color: $blue;
    }
  }

  &__eyebrow {
    @include eyebrow;
    font-size: 0.66rem;
  }

  &__title {
    font-size: clamp(1.45rem, 1.2rem + 1vw, 1.95rem);
    font-weight: 800;
    color: $ink;
  }

  &__subtitle {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
    flex-wrap: wrap;
  }
}
</style>
