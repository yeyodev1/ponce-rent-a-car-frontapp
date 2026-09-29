<script setup lang="ts">
/** Tarjeta de dato práctico (ubicación, horario, contacto) con acciones opcionales. */
withDefaults(defineProps<{ icon: string; title: string; text?: string; dark?: boolean }>(), {
  text: '',
  dark: false,
})
</script>

<template>
  <div class="info" :class="{ 'info--dark': dark }">
    <span class="info__icon" aria-hidden="true"><i :class="icon"></i></span>
    <h3 class="info__title">{{ title }}</h3>
    <p v-if="text" class="info__text">{{ text }}</p>
    <slot />
    <div v-if="$slots.actions" class="info__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped lang="scss">
.info {
  @include card;
  border-radius: $radius-lg;
  padding: 1.5rem 1.35rem;
  @include flex(column, flex-start, flex-start, 0.45rem);

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    @include flex(row, center, center);
    background: $navy;
    color: $accent;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: $text-lg;
    color: $ink;
  }

  &__text {
    color: $ink-soft;
    white-space: pre-line;
  }

  &__actions {
    margin-top: auto;
    padding-top: 0.75rem;
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &--dark {
    background: $navy;
    border-color: $navy-3;
  }

  &--dark &__icon {
    background: rgba($accent, 0.14);
  }

  &--dark &__title {
    color: $surface;
  }

  &--dark &__text {
    color: $on-dark-soft;
  }
}
</style>
