<script setup lang="ts">
/**
 * Opción grande y tocable (radio o checkbox visual). Se usa en los pasos de
 * ambas rutas: ubicación, pasajeros, kilometraje, cobertura, extras...
 */
withDefaults(
  defineProps<{
    selected: boolean
    title: string
    subtitle?: string
    icon?: string
    badge?: string
    price?: string
    multiple?: boolean
    compact?: boolean
    disabled?: boolean
  }>(),
  { subtitle: '', icon: '', badge: '', price: '', multiple: false, compact: false, disabled: false },
)

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="opt"
    :class="{ 'opt--on': selected, 'opt--compact': compact }"
    :role="multiple ? 'checkbox' : 'radio'"
    :aria-checked="selected"
    :disabled="disabled"
    @click="emit('select')"
  >
    <span v-if="icon" class="opt__icon"><i :class="icon"></i></span>
    <span class="opt__text">
      <span class="opt__title">
        {{ title }}
        <span v-if="badge" class="opt__badge">{{ badge }}</span>
      </span>
      <span v-if="subtitle" class="opt__subtitle">{{ subtitle }}</span>
      <slot />
    </span>
    <span v-if="price" class="opt__price">{{ price }}</span>
    <span class="opt__check" :class="{ 'opt__check--square': multiple }" aria-hidden="true">
      <i class="fa-solid fa-check"></i>
    </span>
  </button>
</template>

<style scoped lang="scss">
.opt {
  position: relative;
  width: 100%;
  min-height: 68px;
  @include flex(row, center, flex-start, 0.9rem);
  text-align: left;
  padding: 0.95rem 1rem;
  background: $surface;
  border: 1.5px solid $line;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  transition:
    border-color 0.25s ease,
    box-shadow 0.3s $ease,
    transform 0.25s $ease,
    background-color 0.25s ease;

  &:active {
    transform: scale(0.985);
  }

  @media (hover: hover) {
    &:hover {
      border-color: $line-strong;
      box-shadow: $shadow-md;
    }
  }

  &--compact {
    min-height: 56px;
    padding-block: 0.7rem;
  }

  &--on {
    border-color: $blue;
    background: linear-gradient(0deg, rgba($blue, 0.04), rgba($blue, 0.04)), $surface;
    box-shadow:
      0 0 0 3px rgba($blue, 0.14),
      $shadow-md;
  }

  &:disabled {
    opacity: 0.5;
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: $blue-soft;
    color: $blue;
    font-size: 1.1rem;
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      transform 0.35s $ease-spring;
  }

  &--on &__icon {
    background: $blue;
    color: $surface;
    transform: scale(1.06) rotate(-4deg);
  }

  &__text {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.15rem);
  }

  &__title {
    font-weight: 700;
    color: $ink;
    line-height: 1.25;
    @include flex(row, center, flex-start, 0.45rem);
    flex-wrap: wrap;
  }

  &__badge {
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $navy;
  }

  &__subtitle {
    font-size: $text-sm;
    color: $ink-soft;
    line-height: 1.4;
  }

  &__price {
    flex: 0 0 auto;
    font-weight: 800;
    color: $ink;
    font-size: 0.92rem;
    white-space: nowrap;
  }

  &__check {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid $line-strong;
    color: transparent;
    font-size: 0.7rem;
    transition:
      background-color 0.25s ease,
      border-color 0.25s ease,
      color 0.2s ease,
      transform 0.35s $ease-spring;

    &--square {
      border-radius: 7px;
    }
  }

  &--on &__check {
    background: $blue;
    border-color: $blue;
    color: $surface;
    transform: scale(1.1);
  }
}
</style>
