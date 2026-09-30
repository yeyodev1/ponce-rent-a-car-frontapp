<script setup lang="ts">
import { computed } from 'vue'
import { reservationStatuses, reservationSteps } from '@/config/admin'

/**
 * Pendiente → Confirmada → En curso → Completada. Cancelada y Expirada no son
 * un paso más: se muestran como estado final aparte, con el camino recorrido.
 */
const props = defineProps<{ status: string }>()

const isFinalOff = computed(() => props.status === 'cancelled' || props.status === 'expired')
const current = computed(() => reservationSteps.findIndex((s) => s.statuses.includes(props.status)))

function state(i: number): 'done' | 'current' | 'todo' {
  if (isFinalOff.value) return 'todo'
  if (i < current.value || props.status === 'completed') return 'done'
  return i === current.value ? 'current' : 'todo'
}
</script>

<template>
  <div class="stepper" :class="{ 'stepper--off': isFinalOff }">
    <ol class="stepper__list" aria-label="Avance de la reserva">
      <li
        v-for="(s, i) in reservationSteps"
        :key="s.key"
        class="stepper__step"
        :class="`stepper__step--${state(i)}`"
        :aria-current="state(i) === 'current' ? 'step' : undefined"
      >
        <span class="stepper__dot">
          <i :class="state(i) === 'done' ? 'fa-solid fa-check' : s.icon"></i>
        </span>
        <span class="stepper__label">{{ s.label }}</span>
      </li>
    </ol>
    <p v-if="isFinalOff" class="stepper__final">
      <i :class="reservationStatuses[status]?.icon"></i>
      Estado final: <strong>{{ reservationStatuses[status]?.label }}</strong>
    </p>
  </div>
</template>

<style scoped lang="scss">
.stepper {
  @include flex(column, stretch, flex-start, 0.75rem);

  &__list {
    list-style: none;
    @include flex(row, flex-start, space-between, 0.25rem);
  }

  &__step {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    @include flex(column, center, flex-start, 0.4rem);
    text-align: center;

    // Línea hacia el paso siguiente.
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 17px;
      left: calc(50% + 20px);
      right: calc(-50% + 20px);
      height: 3px;
      border-radius: 3px;
      background: $line;
    }

    &--done:not(:last-child)::after {
      background: $success;
    }
  }

  &__dot {
    @include flex(row, center, center);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $paper;
    border: 2px solid $line;
    color: $ink-muted;
    font-size: 0.85rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  &__step--done &__dot {
    background: $success;
    border-color: $success;
    color: $surface;
  }

  &__step--current &__dot {
    background: $blue;
    border-color: $blue;
    color: $surface;
    box-shadow: 0 0 0 5px rgba($blue, 0.16);
  }

  &__label {
    font-size: 0.72rem;
    font-weight: 700;
    color: $ink-muted;
    line-height: 1.2;

    @include from('sm') {
      font-size: 0.8rem;
    }
  }

  &__step--current &__label {
    color: $ink;
    font-weight: 800;
  }

  &--off &__list {
    opacity: 0.45;
  }

  &__final {
    @include flex(row, center, center, 0.45rem);
    padding: 0.55rem 0.8rem;
    border-radius: 12px;
    background: $danger-bg;
    color: $danger;
    font-size: 0.85rem;
    font-weight: 600;
  }
}
</style>
