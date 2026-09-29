<script setup lang="ts">
import { ref, useId, watch } from 'vue'

// El dueño escribe dólares; el API guarda centavos enteros.
const props = defineProps<{ modelValue: number | undefined; label: string; hint?: string; suffix?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const id = useId()
const toText = (cents: number | undefined) => (cents || cents === 0 ? String(cents / 100) : '')
const text = ref(toText(props.modelValue))

watch(
  () => props.modelValue,
  (v) => {
    if (Math.round(parseFloat(text.value || '0') * 100) !== (v || 0)) text.value = toText(v)
  },
)

function onInput(value: string) {
  text.value = value
  const n = parseFloat(value.replace(',', '.'))
  emit('update:modelValue', Number.isFinite(n) ? Math.round(n * 100) : 0)
}
</script>

<template>
  <div class="money">
    <label :for="id">{{ label }}</label>
    <div class="money__wrap">
      <span class="money__prefix">$</span>
      <input
        :id="id"
        type="text"
        inputmode="decimal"
        :value="text"
        placeholder="0.00"
        @input="onInput(($event.target as HTMLInputElement).value)"
      />
      <span v-if="suffix" class="money__suffix">{{ suffix }}</span>
    </div>
    <p v-if="hint" class="money__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.money {
  &__wrap {
    position: relative;
    @include flex(row, center);

    input {
      padding-left: 1.9rem;
    }
  }

  &__prefix {
    position: absolute;
    left: 0.95rem;
    color: $ink-muted;
    font-weight: 700;
  }

  &__suffix {
    position: absolute;
    right: 0.95rem;
    color: $ink-muted;
    font-size: 0.8rem;
  }

  &__hint {
    font-size: 0.75rem;
    color: $ink-muted;
    margin-top: 0.3rem;
  }
}
</style>
