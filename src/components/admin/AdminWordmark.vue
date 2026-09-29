<script setup lang="ts">
import { brand } from '@/config/admin'

defineProps<{ compact?: boolean; light?: boolean }>()
</script>

<template>
  <span class="mark" :class="{ 'mark--compact': compact, 'mark--light': light }">
    <span class="mark__main">{{ compact ? 'P' : brand.wordmark }}</span>
    <span v-if="!compact" class="mark__dot">·</span>
    <span v-if="!compact" class="mark__sub">{{ brand.sub }}</span>
  </span>
</template>

<style scoped lang="scss">
.mark {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  font-family: $font-display;
  color: $surface;
  white-space: nowrap;

  &__main {
    font-size: 1.25rem;
    font-weight: 900;
    font-stretch: 118%;
    letter-spacing: -0.01em;
  }

  &__dot {
    color: $accent;
    font-weight: 900;
  }

  &__sub {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: $accent;
  }

  &--compact &__main {
    @include flex(row, center, center);
    width: 36px;
    height: 36px;
    border-radius: 11px;
    background: $accent;
    color: $navy;
    font-size: 1.1rem;
  }

  &--light {
    color: $navy;
  }

  &--light &__sub,
  &--light &__dot {
    color: $blue;
  }
}
</style>
