<script setup lang="ts">
import { ref, useId } from 'vue'
import type { I18nText } from '@/types'

const props = defineProps<{
  modelValue: I18nText | undefined
  label: string
  multiline?: boolean
  rows?: number
  required?: boolean
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: I18nText] }>()

const lang = ref<'es' | 'en'>('es')
const id = useId()

function set(value: string) {
  emit('update:modelValue', { es: '', en: '', ...props.modelValue, [lang.value]: value })
}

const filled = (l: 'es' | 'en') => Boolean(props.modelValue?.[l]?.trim())
</script>

<template>
  <div class="i18n">
    <div class="i18n__head">
      <label :for="id" class="i18n__label">{{ label }}<span v-if="required"> *</span></label>
      <div class="i18n__tabs" role="tablist">
        <button
          v-for="l in (['es', 'en'] as const)"
          :key="l"
          type="button"
          role="tab"
          class="i18n__tab"
          :class="{ 'i18n__tab--active': lang === l, 'i18n__tab--empty': !filled(l) }"
          :aria-selected="lang === l"
          @click="lang = l"
        >
          {{ l.toUpperCase() }}
        </button>
      </div>
    </div>
    <textarea
      v-if="multiline"
      :id="id"
      :rows="rows || 4"
      :value="modelValue?.[lang] || ''"
      :placeholder="lang === 'es' ? 'Texto en español' : 'Text in English'"
      @input="set(($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <input
      v-else
      :id="id"
      type="text"
      :value="modelValue?.[lang] || ''"
      :placeholder="lang === 'es' ? 'Texto en español' : 'Text in English'"
      @input="set(($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint" class="i18n__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.i18n {
  @include flex(column, stretch, flex-start, 0.4rem);

  &__head {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__label {
    margin: 0;
  }

  &__tabs {
    @include flex(row, center, flex-end, 0.2rem);
    background: $sand;
    border-radius: $radius-pill;
    padding: 3px;
  }

  &__tab {
    position: relative;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.6rem;
    border-radius: $radius-pill;
    color: $ink-muted;
    transition: background-color 0.2s ease, color 0.2s ease;

    &--active {
      background: $surface;
      color: $ink;
      box-shadow: $shadow-sm;
    }

    // Punto de aviso: ese idioma todavía está vacío.
    &--empty::after {
      content: '';
      position: absolute;
      top: 2px;
      right: 3px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: $warning;
    }
  }

  &__hint {
    font-size: 0.75rem;
    color: $ink-muted;
  }
}
</style>
