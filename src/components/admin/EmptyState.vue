<script setup lang="ts">
import { copy } from '@/config/admin'

defineProps<{
  icon?: string
  title?: string
  message?: string
  error?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="empty" :class="{ 'empty--error': error }">
    <span class="empty__icon">
      <i :class="icon || (error ? 'fa-solid fa-plug-circle-exclamation' : 'fa-regular fa-folder-open')"></i>
    </span>
    <p class="empty__title">{{ title || (error ? copy.loadError : copy.empty) }}</p>
    <p v-if="message" class="empty__message">{{ message }}</p>
    <button v-if="error" class="btn btn--ghost btn--sm" type="button" @click="emit('retry')">
      <i class="fa-solid fa-rotate-right"></i> {{ copy.retry }}
    </button>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.empty {
  @include flex(column, center, center, 0.5rem);
  text-align: center;
  padding: 2.8rem 1.25rem;
  color: $ink-soft;

  &__icon {
    @include flex(row, center, center);
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: $sand;
    color: $ink-muted;
    font-size: 1.35rem;
    margin-bottom: 0.4rem;
  }

  &__title {
    font-weight: 700;
    color: $ink;
  }

  &__message {
    font-size: $text-sm;
    max-width: 380px;
    margin-bottom: 0.4rem;
  }

  &--error &__icon {
    background: $danger-bg;
    color: $danger;
  }
}
</style>
