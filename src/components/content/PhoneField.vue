<script setup lang="ts">
import { ref } from 'vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'

/**
 * PhoneInput compartido (E.164, Ecuador por defecto) con el error en línea de
 * los formularios de contenido y una variante oscura para Renaissance.
 */
withDefaults(
  defineProps<{
    id: string
    label: string
    error?: string
    dark?: boolean
    enterkeyhint?: 'next' | 'send' | 'done'
  }>(),
  { error: '', dark: false, enterkeyhint: 'next' },
)
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ blur: [] }>()

// Con texto escrito, PhoneInput ya explica el formato: aquí solo se avisa si está vacío.
const hasText = ref(false)
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  if (el.type === 'tel') hasText.value = el.value.trim() !== ''
}
</script>

<template>
  <div class="pfield" :class="{ 'pfield--dark': dark }" @input="onInput">
    <PhoneInput
      :id="id"
      v-model="model"
      :label="label"
      :invalid="Boolean(error)"
      :enterkeyhint="enterkeyhint"
      @blur="emit('blur')"
    />
    <Transition name="rise">
      <p v-if="error && !hasText" :id="`${id}-err`" class="pfield__error" role="alert">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ error }}
      </p>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.pfield {
  min-width: 0;

  &__error {
    margin-top: 0.3rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $danger;
    @include flex(row, center, flex-start, 0.35rem);
  }

  &--dark {
    :deep(label) {
      color: $on-dark-soft;
    }

    :deep(input),
    :deep(.phone__country) {
      background: rgba($on-dark, 0.05);
      border-color: rgba($on-dark, 0.18);
      color: $surface;
    }

    :deep(.phone__dial) {
      color: $surface;
    }

    :deep(.phone__hint) {
      color: rgba($on-dark, 0.55);
    }

    :deep(input:focus),
    :deep(.phone__country:focus-within) {
      border-color: #e9c46a;
      box-shadow: 0 0 0 4px rgba(#e9c46a, 0.16);
    }
  }

  &--dark &__error {
    color: #ff8a97;
  }
}
</style>
