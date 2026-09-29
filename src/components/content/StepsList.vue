<script setup lang="ts">
export interface Step {
  icon: string
  title: string
  text: string
}

/** Proceso numerado con línea de tiempo vertical en móvil y horizontal en escritorio. */
defineProps<{ steps: Step[] }>()
</script>

<template>
  <ol class="steps">
    <li v-for="(s, i) in steps" :key="s.title" v-reveal="i * 90" class="steps__item">
      <span class="steps__marker" aria-hidden="true">
        <i :class="s.icon"></i>
        <span class="steps__num">{{ i + 1 }}</span>
      </span>
      <div class="steps__body">
        <h3 class="steps__title">{{ s.title }}</h3>
        <p class="steps__text">{{ s.text }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.steps {
  list-style: none;
  @include flex(column, stretch, flex-start, 0);

  @include from('lg') {
    flex-direction: row;
    gap: 1.25rem;
  }

  &__item {
    position: relative;
    @include flex(row, flex-start, flex-start, 1rem);
    padding-bottom: 1.75rem;

    // Línea que une los pasos
    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 25px;
      top: 56px;
      bottom: 6px;
      width: 2px;
      background: linear-gradient($blue, rgba($blue, 0.1));
    }

    @include from('lg') {
      flex: 1 1 0;
      flex-direction: column;
      padding-bottom: 0;

      &:not(:last-child)::before {
        left: 64px;
        right: -8px;
        top: 25px;
        bottom: auto;
        width: auto;
        height: 2px;
        background: linear-gradient(90deg, $blue, rgba($blue, 0.1));
      }
    }
  }

  &__marker {
    position: relative;
    flex: none;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    @include flex(row, center, center);
    background: $navy;
    color: $accent;
    font-size: 1.15rem;
    box-shadow: 0 0 0 6px $paper;
  }

  &__num {
    position: absolute;
    top: -4px;
    right: -6px;
    min-width: 22px;
    height: 22px;
    border-radius: $radius-pill;
    @include flex(row, center, center);
    background: $accent;
    color: $navy;
    font-size: 0.72rem;
    font-weight: 800;
  }

  &__body {
    padding-top: 0.35rem;
  }

  &__title {
    font-size: $text-lg;
    color: $ink;
    margin-bottom: 0.3rem;
  }

  &__text {
    color: $ink-soft;
    font-size: $text-sm;
    max-width: 40ch;
  }
}
</style>
