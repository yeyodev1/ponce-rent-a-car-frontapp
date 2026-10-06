<script setup lang="ts">
import { computed } from 'vue'
import { contractBlocks } from './blocks'

/**
 * Visor del contrato: recuadro con scroll propio para leerlo cómodo en el
 * teléfono sin perder de vista la aceptación. El texto es plano (nunca HTML).
 */
const props = withDefaults(
  defineProps<{ title: string; text: string; meta?: string; hint?: string; tall?: boolean }>(),
  { meta: '', hint: '', tall: false },
)

const blocks = computed(() => contractBlocks(props.text))
</script>

<template>
  <article class="cviewer">
    <header class="cviewer__head">
      <i class="fa-solid fa-file-contract cviewer__icon" aria-hidden="true"></i>
      <div>
        <h3 class="cviewer__title">{{ title }}</h3>
        <p v-if="meta" class="cviewer__meta">{{ meta }}</p>
      </div>
      <div v-if="$slots.actions" class="cviewer__actions"><slot name="actions" /></div>
    </header>
    <div class="cviewer__scroll" :class="{ 'cviewer__scroll--tall': tall }" tabindex="0" :aria-label="title">
      <template v-for="(b, i) in blocks" :key="i">
        <h4 v-if="b.kind === 'heading'" class="cviewer__h">{{ b.text }}</h4>
        <p v-else class="cviewer__p">{{ b.text }}</p>
      </template>
    </div>
    <p v-if="hint" class="cviewer__hint"><i class="fa-solid fa-arrows-up-down" aria-hidden="true"></i> {{ hint }}</p>
  </article>
</template>

<style scoped lang="scss">
.cviewer {
  @include flex(column, stretch, flex-start, 0.6rem);
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-md;
  padding: 0.9rem;

  &__head {
    @include flex(row, flex-start, flex-start, 0.7rem);
    flex-wrap: wrap;
  }

  &__icon {
    color: $blue;
    font-size: 1.25rem;
    margin-top: 0.15rem;
  }

  &__title {
    font-family: $font-principal;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0;
    color: $ink;
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__actions {
    margin-left: auto;
  }

  &__scroll {
    max-height: 52vh;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 0.9rem 1rem;
    border-radius: $radius-sm;
    background: $paper;
    border: 1px solid rgba($line, 0.8);

    &--tall {
      max-height: 70vh;
    }

    &:focus-visible {
      @include focus-ring($blue);
    }
  }

  &__h {
    font-family: $font-principal;
    font-size: 0.86rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: $navy;
    margin: 1rem 0 0.35rem;

    &:first-child {
      margin-top: 0;
    }
  }

  &__p {
    font-size: 0.9rem;
    line-height: 1.65;
    color: $ink-soft;
    white-space: pre-line;
    margin-bottom: 0.7rem;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.4rem);
  }
}
</style>
