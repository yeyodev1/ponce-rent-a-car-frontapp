<script setup lang="ts">
/**
 * Check con trazo SVG que se dibuja al aparecer: confirma sin palabras que
 * algo salió bien (documento subido, pago aprobado).
 */
withDefaults(defineProps<{ size?: number; tone?: 'success' | 'blue' }>(), { size: 28, tone: 'success' })
</script>

<template>
  <span class="check" :class="`check--${tone}`" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <svg viewBox="0 0 52 52">
      <circle class="check__ring" cx="26" cy="26" r="24" fill="none" />
      <path class="check__mark" fill="none" d="M15 27.5l7.2 7.2L37.5 19" />
    </svg>
  </span>
</template>

<style scoped lang="scss">
.check {
  display: inline-flex;
  flex: 0 0 auto;
  border-radius: 50%;
  animation: check-pop 0.55s $ease-spring both;

  svg {
    width: 100%;
    height: 100%;
  }

  &__ring {
    stroke-width: 3;
    stroke-dasharray: 151;
    stroke-dashoffset: 151;
    animation: check-draw 0.6s $ease forwards;
  }

  &__mark {
    stroke-width: 4.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 36;
    stroke-dashoffset: 36;
    animation: check-draw 0.4s $ease 0.45s forwards;
  }

  &--success {
    background: $success-bg;

    .check__ring,
    .check__mark {
      stroke: $success;
    }
  }

  &--blue {
    background: $blue-soft;

    .check__ring,
    .check__mark {
      stroke: $blue;
    }
  }
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes check-pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@include reduced-motion {
  .check__ring,
  .check__mark {
    stroke-dashoffset: 0;
  }
}
</style>
