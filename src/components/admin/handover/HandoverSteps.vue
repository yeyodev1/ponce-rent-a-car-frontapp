<script setup lang="ts">
/** Pasos del acta como pastillas tocables: se puede saltar a cualquiera. */
defineProps<{ steps: string[] }>()
const step = defineModel<number>({ required: true })
</script>

<template>
  <nav class="hsteps" aria-label="Pasos del acta">
    <button
      v-for="(s, i) in steps"
      :key="s"
      type="button"
      class="hsteps__step"
      :class="{ 'hsteps__step--on': step === i, 'hsteps__step--done': step > i }"
      :aria-current="step === i ? 'step' : undefined"
      @click="step = i"
    >
      <span>{{ i + 1 }}</span> {{ s }}
    </button>
  </nav>
</template>

<style scoped lang="scss">
.hsteps {
  @include flex(row, center, flex-start, 0.35rem);
  overflow-x: auto;
  scrollbar-width: none;
  margin: -0.25rem -0.25rem 0;
  padding: 0.25rem;

  &__step {
    flex-shrink: 0;
    min-height: 38px;
    padding: 0.35rem 0.7rem 0.35rem 0.4rem;
    border-radius: $radius-pill;
    background: $surface;
    border: 1px solid $line;
    font-size: 0.78rem;
    font-weight: 700;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.35rem);

    span {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: $sand;
      @include flex(row, center, center);
      font-size: 0.72rem;
    }

    &--done span {
      background: $success;
      color: $surface;
    }

    &--on {
      border-color: $navy;
      color: $ink;

      span {
        background: $navy;
        color: $surface;
      }
    }
  }
}
</style>
