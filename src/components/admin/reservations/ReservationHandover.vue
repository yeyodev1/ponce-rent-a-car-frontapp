<script setup lang="ts">
import { computed, watch } from 'vue'
import HandoverDrawer from '../handover/HandoverDrawer.vue'
import InspectionCard from '../handover/InspectionCard.vue'
import HandoverComparison from '../handover/HandoverComparison.vue'
import { useHandover } from '@/composables/admin/useHandover'
import { useUserStore } from '@/stores/user'
import { handoverCopy as t } from '@/config/admin/ops'
import type { AdminReservation } from '@/types/admin'
import type { Inspection } from '@/types/ops'

/** Actas de entrega y devolución. Guardar un acta avanza la reserva: el padre recarga. */
const props = defineProps<{ r: AdminReservation }>()
const emit = defineEmits<{ changed: [] }>()

const userStore = useUserStore()
const h = useHandover(
  () => props.r,
  () => emit('changed'),
)
const { data, loading } = h

const status = computed(() => props.r.status)
const hasVehicle = computed(() => Boolean(props.r.vehicle))
const canDeliver = computed(
  () => status.value === 'confirmed' && hasVehicle.value && !data.value?.delivery,
)
const canReturn = computed(
  () => status.value === 'delivered' && Boolean(data.value?.delivery) && !data.value?.return,
)
const pending = computed(() => ['pending_documents', 'pending_payment'].includes(status.value))
const closedEmpty = computed(
  () => ['cancelled', 'expired'].includes(status.value) && !data.value?.delivery,
)

// El estado cambia por el acta o por el PATCH manual: en ambos casos se relee.
watch(
  () => [props.r._id, props.r.status],
  () => h.load(),
  { immediate: true },
)

function fix(insp: Inspection) {
  h.startFix(insp)
}

/**
 * Los botones "Entregar vehículo" / "Completar" del encabezado abren el acta
 * aquí. Devuelve false si el acta no aplica (p. ej. una reserva entregada
 * antes de existir las actas): el padre hace el cambio de estado directo.
 */
function tryStart(type: 'delivery' | 'return'): boolean {
  const ok = type === 'delivery' ? canDeliver.value : canReturn.value
  if (!ok) return false
  h.start(type)
  return true
}

defineExpose({ tryStart })

function goGuarantee() {
  document
    .getElementById('reservation-guarantee')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <section class="rhand">
    <header class="rhand__head">
      <h2 class="rhand__title"><i class="fa-solid fa-clipboard-check"></i> {{ t.title }}</h2>
    </header>

    <div v-if="loading && !data" class="skeleton rhand__sk"></div>
    <template v-else>
      <button
        v-if="canDeliver"
        type="button"
        class="btn btn--primary rhand__cta"
        @click="h.start('delivery')"
      >
        <i class="fa-solid fa-key"></i> {{ t.startDelivery }}
      </button>
      <p v-else-if="status === 'confirmed' && !hasVehicle" class="rhand__muted">
        <i class="fa-solid fa-car"></i> {{ t.needsVehicle }}
      </p>
      <p v-else-if="pending" class="rhand__muted">
        <i class="fa-regular fa-clock"></i> {{ t.waiting }}
      </p>
      <p v-else-if="closedEmpty" class="rhand__muted">{{ t.closed }}</p>

      <button
        v-if="canReturn"
        type="button"
        class="btn btn--dark rhand__cta"
        @click="h.start('return')"
      >
        <i class="fa-solid fa-flag-checkered"></i> {{ t.startReturn }}
      </button>

      <template v-if="data?.comparison">
        <HandoverComparison :c="data.comparison" />
        <button
          v-if="data.comparison.newDamages > 0"
          type="button"
          class="rhand__link"
          @click="goGuarantee"
        >
          <i class="fa-solid fa-shield-halved"></i> Ir a la garantía
        </button>
      </template>

      <div v-if="data?.delivery || data?.return" class="rhand__list">
        <InspectionCard
          v-if="data?.return"
          :insp="data.return"
          :can-fix="userStore.isAdmin"
          @fix="fix(data.return)"
        />
        <InspectionCard
          v-if="data?.delivery"
          :insp="data.delivery"
          :can-fix="userStore.isAdmin"
          @fix="fix(data.delivery)"
        />
      </div>
    </template>

    <HandoverDrawer :h="h" :code="r.code" />
  </section>
</template>

<style scoped lang="scss">
.rhand {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.85rem);

  &__title {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__sk {
    min-height: 120px;
    border-radius: 12px;
  }

  &__cta {
    min-height: $tap-lg;
    width: 100%;

    @include from('md') {
      width: auto;
      align-self: flex-start;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;

    i {
      margin-right: 0.3rem;
    }
  }

  &__link {
    align-self: flex-start;
    font-size: 0.84rem;
    font-weight: 800;
    color: $danger;
    min-height: 36px;
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__list {
    @include flex(column, stretch, flex-start, 0.7rem);
  }
}
</style>
