<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '@/i18n'
import { useCountdown } from '@/composables/booking/useCountdown'

/** Contador discreto del apartado: informa sin meter presión de más. */
const props = defineProps<{ expiresAt: string | null }>()
const emit = defineEmits<{ renew: [] }>()
const { t } = useI18n()

const { expired, label, remaining } = useCountdown(toRef(props, 'expiresAt'))
const urgent = computed(() => remaining.value > 0 && remaining.value < 3 * 60 * 1000)
</script>

<template>
  <div v-if="expiresAt" class="hold" :class="{ 'hold--urgent': urgent, 'hold--expired': expired }" role="status">
    <template v-if="!expired">
      <span class="hold__dot" aria-hidden="true"></span>
      <span class="hold__text">{{ t('booking.hold.label') }}</span>
      <strong class="hold__time">{{ label }}</strong>
    </template>
    <template v-else>
      <i class="fa-regular fa-clock"></i>
      <span class="hold__text">{{ t('booking.hold.expired') }}</span>
      <button type="button" class="hold__renew" @click="emit('renew')">{{ t('booking.hold.renew') }}</button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.hold {
  @include flex(row, center, flex-start, 0.5rem);
  flex-wrap: wrap;
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  border-radius: $radius-pill;
  background: $blue-soft;
  color: $blue-deep;
  font-size: $text-xs;
  font-weight: 700;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $blue;
    animation: hold-pulse 1.8s ease-in-out infinite;
  }

  &__time {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
  }

  &--urgent {
    background: $warning-bg;
    color: darken($warning, 14%);

    .hold__dot {
      background: $warning;
    }
  }

  &--expired {
    background: $danger-bg;
    color: $danger;
  }

  &__renew {
    min-height: 32px;
    padding: 0 0.8rem;
    border-radius: $radius-pill;
    background: $danger;
    color: $surface;
    font-weight: 800;
    font-size: $text-xs;
  }
}

@keyframes hold-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.6);
    opacity: 0.5;
  }
}
</style>
