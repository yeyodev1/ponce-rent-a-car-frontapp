<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

/**
 * Etiqueta + control + error en línea. El slot recibe los atributos ARIA que
 * conectan el campo con su mensaje, para que el lector de pantalla lo anuncie.
 */
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    error?: string
    hint?: string
    optional?: boolean
    dark?: boolean
  }>(),
  { error: '', hint: '', optional: false, dark: false },
)

const { t } = useI18n()
const describedby = computed(
  () =>
    [props.error && `${props.id}-err`, props.hint && `${props.id}-hint`]
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>

<template>
  <div class="field" :class="{ 'field--error': error, 'field--dark': dark }">
    <label :for="id" class="field__label">
      {{ label }}
      <span v-if="optional" class="field__optional">{{ t('content.form.optional') }}</span>
    </label>
    <slot :id="id" :describedby="describedby" :invalid="Boolean(error)" />
    <p v-if="hint && !error" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
    <Transition name="rise">
      <p v-if="error" :id="`${id}-err`" class="field__error" role="alert">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ error }}
      </p>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.field {
  min-width: 0;

  &__optional {
    font-weight: 500;
    color: $ink-muted;
    margin-left: 0.25rem;
  }

  &__hint {
    margin-top: 0.35rem;
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__error {
    margin-top: 0.4rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $danger;
    @include flex(row, center, flex-start, 0.35rem);
  }

  &--error :slotted(input),
  &--error :slotted(select),
  &--error :slotted(textarea) {
    border-color: $danger;
  }

  &--dark &__label {
    color: $on-dark-soft;
  }

  &--dark :slotted(input),
  &--dark :slotted(select),
  &--dark :slotted(textarea) {
    background: rgba($on-dark, 0.05);
    border-color: rgba($on-dark, 0.18);
    color: $surface;

    &::placeholder {
      color: rgba($on-dark, 0.4);
    }

    &:focus {
      border-color: $accent;
      box-shadow: 0 0 0 4px rgba($accent, 0.16);
    }
  }

  &--dark &__error {
    color: #ff8a97;
  }
}
</style>
