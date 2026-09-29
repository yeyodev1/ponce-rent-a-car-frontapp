<script setup lang="ts">
/**
 * Tarjeta-botón de cada ruta del home. Es la decisión principal de la
 * pantalla: grande, de un toque, con una flecha que invita a avanzar.
 */
defineProps<{
  to: string
  tone: 'accent' | 'blue'
  icon: string
  tag: string
  title: string
  text: string
}>()
</script>

<template>
  <RouterLink :to="to" class="route" :class="`route--${tone}`">
    <span class="route__shine" aria-hidden="true"></span>
    <span class="route__icon" aria-hidden="true"><i :class="icon"></i></span>
    <span class="route__body">
      <span class="route__tag">{{ tag }}</span>
      <span class="route__title">{{ title }}</span>
      <span class="route__text">{{ text }}</span>
    </span>
    <span class="route__arrow" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>
  </RouterLink>
</template>

<style scoped lang="scss">
.route {
  position: relative;
  isolation: isolate;
  @include flex(row, center, flex-start, 0.9rem);
  width: 100%;
  min-height: 84px;
  padding: 0.85rem 0.85rem 0.85rem 0.9rem;
  border-radius: $radius-lg;
  text-align: left;
  transition: transform 0.35s $ease;
  @include focus-ring($surface);

  @include from('lg') {
    min-height: 108px;
    padding: 1.2rem 1.25rem;
    gap: 1.1rem;
  }

  // Sombra en capa propia: al hover solo cambia su opacidad
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -2;
    border-radius: inherit;
    opacity: 0.55;
    transition: opacity 0.35s $ease;
  }

  // Brillo que cruza la tarjeta cada tanto (recortado por su propia capa)
  &__shine {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 35%, rgba(#fff, 0.35) 50%, transparent 65%);
      transform: translateX(-130%);
      animation: route-shine 5s $ease-in-out infinite 2.2s;
    }
  }

  &:active {
    transform: scale(0.975);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px);
    }

    &:hover::before {
      opacity: 1;
    }

    &:hover .route__arrow i {
      transform: translateX(3px);
      animation: none;
    }
  }

  &--accent {
    background: linear-gradient(135deg, lighten($accent, 6%), $accent 55%, $accent-deep);
    color: $navy;

    &::before {
      box-shadow: 0 18px 44px rgba($accent, 0.42);
    }
  }

  &--blue {
    background: linear-gradient(135deg, lighten($blue, 8%), $blue 50%, $blue-deep);
    color: $surface;

    &::before {
      box-shadow: 0 18px 44px rgba($blue, 0.45);
    }

    .route__shine::after {
      animation-delay: 4.7s;
      background: linear-gradient(110deg, transparent 35%, rgba(#fff, 0.2) 50%, transparent 65%);
    }
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border-radius: 15px;
    font-size: 1.25rem;
  }

  &--accent &__icon {
    background: $navy;
    color: $accent;
  }

  &--blue &__icon {
    background: rgba($surface, 0.16);
    color: $surface;
    box-shadow: inset 0 0 0 1px rgba($surface, 0.22);
  }

  &__body {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);
  }

  &__tag {
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.75;
  }

  &__title {
    font-family: $font-display;
    font-size: clamp(1rem, 0.78rem + 1vw, 1.35rem);
    font-weight: 900;
    font-stretch: 100%;
    line-height: 1.1;
    letter-spacing: -0.005em;
    text-transform: uppercase;

    @include from('sm') {
      font-stretch: 112%;
    }
  }

  &__text {
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.3;
    opacity: 0.88;
  }

  &__arrow {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    font-size: 0.9rem;

    i {
      transition: transform 0.35s $ease;
      animation: route-nudge 2.6s $ease-in-out infinite 1.8s;
    }
  }

  &--accent &__arrow {
    background: rgba($navy, 0.1);
  }

  &--blue &__arrow {
    background: rgba($surface, 0.16);
  }
}

@keyframes route-shine {
  0%,
  70% {
    transform: translateX(-130%);
  }
  100% {
    transform: translateX(130%);
  }
}

@keyframes route-nudge {
  0%,
  60%,
  100% {
    transform: translateX(0);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
