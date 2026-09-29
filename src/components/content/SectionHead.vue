<script setup lang="ts">
/** Encabezado de sección: eyebrow + H2 + bajada. Un H2 por bloque temático. */
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    id?: string
    light?: boolean
    center?: boolean
  }>(),
  { eyebrow: '', lead: '', id: undefined, light: false, center: false },
)
</script>

<template>
  <div v-reveal class="shead" :class="{ 'shead--light': light, 'shead--center': center }">
    <p v-if="eyebrow" class="shead__eyebrow">{{ eyebrow }}</p>
    <h2 :id="id" class="shead__title">{{ title }}</h2>
    <p v-if="lead" class="shead__lead">{{ lead }}</p>
  </div>
</template>

<style scoped lang="scss">
.shead {
  margin-bottom: 1.75rem;
  max-width: 44rem;

  @include from('md') {
    margin-bottom: 2.5rem;
  }

  &--center {
    margin-inline: auto;
    text-align: center;
  }

  &__eyebrow {
    @include eyebrow;
    margin-bottom: 0.6rem;
  }

  &__title {
    @include display($display-sm);
    color: $ink;
  }

  &__lead {
    margin-top: 0.75rem;
    color: $ink-soft;
    font-size: $text-lg;
  }

  &--light &__eyebrow {
    color: $accent;
  }

  &--light &__title {
    color: $surface;
  }

  &--light &__lead {
    color: $on-dark-soft;
  }
}
</style>
