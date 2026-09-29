<script setup lang="ts">
/**
 * Portada de cada página de contenido: eyebrow, el único H1 de la página,
 * intro y CTAs. La foto (opcional) va de fondo con velo navy para que el
 * texto siempre cumpla contraste AA.
 */
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    intro?: string
    image?: string
    imageAlt?: string
    icon?: string
  }>(),
  { eyebrow: '', intro: '', image: '', imageAlt: '', icon: '' },
)
</script>

<template>
  <header class="hero" :class="{ 'hero--image': image }">
    <img
      v-if="image"
      class="hero__bg"
      :src="image"
      :alt="imageAlt"
      width="1400"
      height="900"
      loading="eager"
      fetchpriority="high"
      decoding="async"
    />
    <div class="hero__veil" aria-hidden="true"></div>
    <div class="hero__inner">
      <p v-if="eyebrow" class="hero__eyebrow">
        <i v-if="icon" :class="icon" aria-hidden="true"></i>
        {{ eyebrow }}
      </p>
      <h1 class="hero__title">{{ title }}</h1>
      <p v-if="intro" class="hero__intro">{{ intro }}</p>
      <div v-if="$slots.actions" class="hero__actions">
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </header>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: $navy;
  color: $on-dark;
  padding: calc(var(--header-h) + 2.25rem) 0 3rem;

  @include from('md') {
    padding: calc(var(--header-h) + 4rem) 0 5rem;
  }

  &--image {
    min-height: min(78vh, 620px);
    @include flex(column, stretch, flex-end);
  }

  &__bg {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: hero-zoom 14s $ease both;
  }

  &__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(circle at 85% 0%, rgba($blue, 0.35), transparent 50%),
      radial-gradient(circle at 0% 100%, rgba($accent, 0.1), transparent 45%);
  }

  &--image &__veil {
    background:
      linear-gradient(180deg, rgba($navy, 0.55) 0%, rgba($navy, 0.35) 40%, rgba($navy, 0.92) 100%),
      linear-gradient(90deg, rgba($navy, 0.7) 0%, transparent 70%);
  }

  &__inner {
    @include container;
    position: relative;
    animation: hero-in 0.8s $ease both;
  }

  &__eyebrow {
    @include eyebrow;
    color: $accent;
    @include flex(row, center, flex-start, 0.5rem);
    margin-bottom: 0.9rem;
  }

  &__title {
    @include display($display-md);
    max-width: 18ch;
    color: $surface;
  }

  &__intro {
    margin-top: 1rem;
    max-width: 56ch;
    font-size: $text-lg;
    color: $on-dark-soft;
  }

  &__actions {
    margin-top: 1.75rem;
    @include flex(column, stretch, flex-start, 0.75rem);

    @include from('sm') {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@keyframes hero-zoom {
  from {
    transform: scale(1.08);
  }
}
</style>
