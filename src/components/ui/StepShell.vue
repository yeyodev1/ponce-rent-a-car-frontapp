<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

/**
 * Marco de cada paso de un wizard: volver, barra de progreso, título y un
 * pie fijo con la acción principal (al alcance del pulgar en móvil).
 * El contenido se anima según la dirección (next/prev).
 */
const props = withDefaults(
  defineProps<{
    step: number
    total: number
    title: string
    subtitle?: string
    eyebrow?: string
    direction?: 'next' | 'prev'
    stepKey?: string | number
    hideBack?: boolean
  }>(),
  { direction: 'next', subtitle: '', eyebrow: '', stepKey: undefined, hideBack: false },
)

const emit = defineEmits<{ back: [] }>()
const { t } = useI18n()

const progress = computed(() => Math.min(100, Math.max(4, (props.step / props.total) * 100)))
</script>

<template>
  <section class="step">
    <div class="step__top">
      <button v-if="!hideBack" class="step__back" type="button" :aria-label="t('actions.back')" @click="emit('back')">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div class="step__bar" role="progressbar" :aria-valuenow="step" :aria-valuemin="1" :aria-valuemax="total">
        <span class="step__fill" :style="{ width: `${progress}%` }"></span>
      </div>
      <span class="step__count">{{ step }}/{{ total }}</span>
    </div>

    <Transition :name="`step-${direction}`" mode="out-in">
      <div :key="stepKey ?? step" class="step__body">
        <p v-if="eyebrow" class="step__eyebrow">{{ eyebrow }}</p>
        <h1 class="step__title">{{ title }}</h1>
        <p v-if="subtitle" class="step__subtitle">{{ subtitle }}</p>
        <div class="step__content">
          <slot />
        </div>
      </div>
    </Transition>

    <div v-if="$slots.footer" class="step__footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped lang="scss">
.step {
  @include flex(column, stretch, flex-start);
  width: 100%;
  max-width: 560px;
  margin-inline: auto;
  min-height: calc(100dvh - var(--header-h) - var(--tabbar-h));
  padding: 1rem 1.25rem 0;

  &__top {
    @include flex(row, center, flex-start, 0.85rem);
    padding-block: 0.25rem 1.25rem;
  }

  &__back {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: $surface;
    border: 1.5px solid $line;
    color: $ink;
    transition: transform 0.2s $ease, border-color 0.2s ease;

    &:active {
      transform: scale(0.92);
    }

    @media (hover: hover) {
      &:hover {
        border-color: $ink;
      }
    }
  }

  &__bar {
    flex: 1;
    height: 6px;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, $blue, lighten($blue, 12%));
    transition: width 0.6s $ease;
  }

  &__count {
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    font-variant-numeric: tabular-nums;
  }

  &__body {
    flex: 1;
    @include flex(column, stretch, flex-start);
  }

  &__eyebrow {
    @include eyebrow;
    margin-bottom: 0.5rem;
  }

  &__title {
    @include display($display-sm, 800);
    color: $ink;
  }

  &__subtitle {
    margin-top: 0.5rem;
    color: $ink-soft;
    font-size: $text-sm;
  }

  &__content {
    margin-top: 1.5rem;
    @include flex(column, stretch, flex-start, 1.25rem);
  }

  &__footer {
    position: sticky;
    bottom: var(--tabbar-h);
    margin-inline: -1.25rem;
    padding: 1rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
    background: linear-gradient(to top, $paper 70%, rgba($paper, 0));
    @include flex(column, stretch, flex-start, 0.6rem);
    z-index: 5;

    @include from('md') {
      position: static;
      background: none;
      margin-inline: 0;
      padding-inline: 0;
    }
  }
}
</style>
