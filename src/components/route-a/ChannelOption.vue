<script setup lang="ts">
/** Botón grande de canal: WhatsApp, llamada o "te llamamos". */
withDefaults(
  defineProps<{
    tone: 'whatsapp' | 'call' | 'callback'
    icon: string
    title: string
    hint: string
    primary?: boolean
    expanded?: boolean | null
  }>(),
  { primary: false, expanded: null },
)
const emit = defineEmits<{ choose: [] }>()
</script>

<template>
  <button
    type="button"
    class="ch"
    :class="[`ch--${tone}`, { 'ch--primary': primary, 'ch--open': expanded }]"
    :aria-expanded="expanded ?? undefined"
    @click="emit('choose')"
  >
    <span class="ch__icon" aria-hidden="true"><i :class="icon"></i></span>
    <span class="ch__text">
      <span class="ch__title">{{ title }}</span>
      <span class="ch__hint">{{ hint }}</span>
    </span>
    <span class="ch__arrow" aria-hidden="true">
      <i :class="expanded === null ? 'fa-solid fa-arrow-right' : 'fa-solid fa-chevron-down'"></i>
    </span>
  </button>
</template>

<style scoped lang="scss">
.ch {
  width: 100%;
  min-height: 76px;
  @include flex(row, center, flex-start, 0.95rem);
  padding: 0.9rem 1rem;
  text-align: left;
  border-radius: $radius-md;
  background: $surface;
  border: 1.5px solid $line;
  color: $ink;
  box-shadow: $shadow-sm;
  transition: transform 0.3s $ease;
  @include focus-ring($blue);

  &:active {
    transform: scale(0.98);
  }

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
    }

    &:hover .ch__arrow i {
      transform: translateX(3px);
    }
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border-radius: 15px;
    font-size: 1.3rem;
    background: $blue-soft;
    color: $blue;
  }

  &--whatsapp &__icon {
    background: rgba($whatsapp, 0.14);
    color: $whatsapp-deep;
  }

  &--callback &__icon {
    background: $accent-soft;
    color: darken($accent-deep, 14%);
  }

  &__text {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);
  }

  &__title {
    font-family: $font-display;
    font-size: 1.12rem;
    font-weight: 800;
    font-stretch: 108%;
    line-height: 1.15;
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__arrow i {
    display: block;
    color: $ink-muted;
    transition: transform 0.3s $ease;
  }

  &--open &__arrow i {
    transform: rotate(180deg);
  }

  // El canal prioritario del idioma se pinta lleno
  &--primary {
    border-color: transparent;
    box-shadow: $shadow-md;
  }

  &--primary.ch--whatsapp {
    background: linear-gradient(135deg, $whatsapp-deep, darken($whatsapp-deep, 7%));
    color: $surface;
  }

  &--primary.ch--call {
    background: linear-gradient(135deg, lighten($blue, 6%), $blue-deep);
    color: $surface;
  }

  &--primary &__icon {
    background: rgba($surface, 0.18);
    color: $surface;
  }

  &--primary &__hint,
  &--primary &__arrow i {
    color: rgba($surface, 0.85);
  }
}
</style>
