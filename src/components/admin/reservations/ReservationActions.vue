<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import ReservationStepper from './ReservationStepper.vue'
import {
  fallbackTransitions,
  reservationActions,
  reservationCopy,
  reservationStatuses,
  type ReservationAction,
} from '@/config/admin'
import { refId, type AdminReservation } from '@/types/admin'

/**
 * Ciclo estricto: solo se ofrecen los botones de las transiciones válidas que
 * manda el servidor (allowedTransitions). Cancelar va aparte, en rojo.
 * "Entregar" sin unidad asignada queda deshabilitado: el API respondería 409.
 */
const props = defineProps<{ r: AdminReservation; saving?: boolean }>()
const emit = defineEmits<{ patch: [body: Record<string, unknown>, success: string]; assign: [] }>()

const allowed = computed(() => props.r.allowedTransitions ?? fallbackTransitions[props.r.status] ?? [])
const forward = computed(() =>
  allowed.value.filter((to) => to !== 'cancelled').map((to) => reservationActions[to]).filter(Boolean) as ReservationAction[],
)
const canCancel = computed(() => allowed.value.includes('cancelled'))
const hasVehicle = computed(() => Boolean(refId(props.r.vehicle)))
const blocked = (a: ReservationAction) => Boolean(a.needsVehicle && !hasVehicle.value)

const pending = ref<ReservationAction | null>(null)

function ask(a: ReservationAction) {
  if (!blocked(a)) pending.value = a
}

function confirm() {
  const a = pending.value
  pending.value = null
  if (a) emit('patch', { status: a.to }, a.success)
}
</script>

<template>
  <section class="ractions">
    <ReservationStepper :status="r.status" />

    <div v-if="forward.length || canCancel" class="ractions__row">
      <div v-for="a in forward" :key="a.to" class="ractions__item">
        <button type="button" class="btn btn--primary btn--sm" :disabled="saving || blocked(a)" @click="ask(a)">
          <i :class="a.icon"></i> {{ a.label }}
        </button>
        <p v-if="blocked(a)" class="ractions__warn">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ reservationCopy.needsVehicle }}
          <button type="button" class="ractions__link" @click="emit('assign')">{{ reservationCopy.assignFirst }}</button>
        </p>
      </div>
      <button
        v-if="canCancel"
        type="button"
        class="btn btn--ghost btn--sm ractions__cancel"
        :disabled="saving"
        @click="ask(reservationActions.cancelled!)"
      >
        <i :class="reservationActions.cancelled!.icon"></i> {{ reservationActions.cancelled!.label }}
      </button>
    </div>
    <p v-else class="ractions__muted">{{ reservationCopy.finalState(reservationStatuses[r.status]?.label || r.status) }}</p>

    <ConfirmDialog
      :open="Boolean(pending)"
      :title="`${pending?.label}: ${r.code}`"
      :message="pending?.confirm"
      :confirm-label="pending?.label"
      :danger="Boolean(pending?.danger)"
      @confirm="confirm"
      @cancel="pending = null"
    />
  </section>
</template>

<style scoped lang="scss">
.ractions {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 1.1rem);

  &__row {
    @include flex(row, flex-start, flex-start, 0.6rem);
    flex-wrap: wrap;
    padding-top: 0.9rem;
    border-top: 1px dashed $line;
  }

  &__item {
    @include flex(column, flex-start, flex-start, 0.4rem);
  }

  &__warn {
    font-size: 0.78rem;
    color: $warning;
    font-weight: 600;
    @include flex(row, center, flex-start, 0.35rem);
    flex-wrap: wrap;
  }

  &__link {
    color: $blue;
    font-weight: 800;
    text-decoration: underline;
    font-size: 0.78rem;
  }

  &__cancel {
    margin-left: auto;
    color: $danger;
    border-color: rgba($danger, 0.4);

    &:hover:not(:disabled) {
      background: $danger-bg;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
