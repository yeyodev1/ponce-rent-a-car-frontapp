<script setup lang="ts">
/** Estado vacío o de error: siempre con una salida (reintentar o hablar con alguien). */
withDefaults(
  defineProps<{ icon?: string; title: string; text?: string; tone?: 'empty' | 'error' }>(),
  {
    icon: 'fa-solid fa-road',
    text: '',
    tone: 'empty',
  },
)
</script>

<template>
  <div class="state" :class="`state--${tone}`" :role="tone === 'error' ? 'alert' : undefined">
    <span class="state__icon" aria-hidden="true"><i :class="icon"></i></span>
    <h2 class="state__title">{{ title }}</h2>
    <p v-if="text" class="state__text">{{ text }}</p>
    <div v-if="$slots.default" class="state__actions"><slot /></div>
  </div>
</template>

<style scoped lang="scss">
.state {
  @include flex(column, center, center, 0.6rem);
  text-align: center;
  padding: 3rem 1.25rem;
  border: 1.5px dashed $line-strong;
  border-radius: $radius-lg;
  background: $surface;
  animation: state-in 0.5s $ease both;

  &__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    @include flex(row, center, center);
    background: $blue-soft;
    color: $blue;
    font-size: 1.6rem;
    margin-bottom: 0.4rem;
  }

  &--error &__icon {
    background: $danger-bg;
    color: $danger;
  }

  &__title {
    font-size: $text-xl;
    color: $ink;
  }

  &__text {
    color: $ink-soft;
    max-width: 44ch;
  }

  &__actions {
    margin-top: 0.8rem;
    @include flex(row, center, center, 0.6rem);
    flex-wrap: wrap;
  }
}

@keyframes state-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
