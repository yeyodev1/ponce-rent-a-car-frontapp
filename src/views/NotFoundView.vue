<script setup lang="ts">
import { useI18n } from '@/i18n'
import { useSeo } from '@/composables/useSeo'

const { t } = useI18n()

// Sin esto la 404 heredaba la descripción y el canonical de la página anterior.
useSeo(() => ({ title: t('common.notFound.title'), description: t('common.notFound.text'), noindex: true }))
</script>

<template>
  <section class="not-found">
    <p class="not-found__code">404</p>
    <h1 class="not-found__title">{{ t('common.notFound.heading') }}</h1>
    <p class="not-found__text">{{ t('common.notFound.text') }}</p>
    <RouterLink to="/" class="btn btn--primary">{{ t('common.notFound.home') }}</RouterLink>
  </section>
</template>

<style scoped lang="scss">
.not-found {
  @include container(640px);
  @include flex(column, center, center, 0.8rem);
  flex: 1;
  text-align: center;
  // El header es fijo y superpuesto: esta vista no tiene hero que lo compense.
  padding-block: calc(var(--header-h) + #{$space-section}) $space-section;

  &__code {
    @include eyebrow;
    font-size: $text-base;
  }

  &__title {
    @include display($display-md);
  }

  &__text {
    color: $ink-soft;
    margin-bottom: 0.6rem;
  }
}
</style>
