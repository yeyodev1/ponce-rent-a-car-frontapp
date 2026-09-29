<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { copy } from '@/config/admin'

const props = withDefaults(defineProps<{ modelValue: string; placeholder?: string; delay?: number }>(), {
  placeholder: copy.search,
  delay: 350,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// Texto local inmediato; el valor sube con debounce para no pedir en cada tecla.
const text = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.modelValue,
  (v) => {
    if (v !== text.value) text.value = v
  },
)

function onInput(value: string) {
  text.value = value
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', value.trim()), props.delay)
}

function clear() {
  clearTimeout(timer)
  text.value = ''
  emit('update:modelValue', '')
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <label class="search">
    <i class="fa-solid fa-magnifying-glass search__icon"></i>
    <span class="visually-hidden">{{ placeholder }}</span>
    <input
      class="search__input"
      type="search"
      :value="text"
      :placeholder="placeholder"
      @input="onInput(($event.target as HTMLInputElement).value)"
    />
    <button v-if="text" class="search__clear" type="button" aria-label="Limpiar búsqueda" @click.prevent="clear">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </label>
</template>

<style scoped lang="scss">
.search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 220px;
  margin: 0;
  min-width: 0;

  &__icon {
    position: absolute;
    left: 0.95rem;
    color: $ink-muted;
    font-size: 0.9rem;
    pointer-events: none;
  }

  &__input {
    padding-left: 2.5rem;
    padding-right: 2.4rem;
    min-height: 44px;
    border-radius: $radius-pill;

    @include from('md') {
      font-size: 0.92rem;
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__clear {
    position: absolute;
    right: 0.4rem;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    color: $ink-muted;

    &:hover {
      background: $sand;
      color: $ink;
    }
  }
}
</style>
