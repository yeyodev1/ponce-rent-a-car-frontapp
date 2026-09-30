<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/admin/EmptyState.vue'
import ReservationInfo from '@/components/admin/reservations/ReservationInfo.vue'
import ReservationActions from '@/components/admin/reservations/ReservationActions.vue'
import ReservationPayments from '@/components/admin/reservations/ReservationPayments.vue'
import ReservationPricing from '@/components/admin/reservations/ReservationPricing.vue'
import ReservationShareLink from '@/components/admin/reservations/ReservationShareLink.vue'
import ReservationVerification from '@/components/admin/reservations/ReservationVerification.vue'
import ReservationManage from '@/components/admin/reservations/ReservationManage.vue'
import { useReservation } from '@/composables/admin/useReservation'
import { readShareToken } from '@/composables/admin/useWalkIn'

const route = useRoute()
const id = String(route.params.id)
const { reservation, loading, saving, error, load, patch, addPayment, refund, openDocument } = useReservation(id)

// El token solo existe al crear la reserva presencial (el API no lo vuelve a mandar).
const shareToken = computed(() => reservation.value?.accessToken || readShareToken(id))

/** "Entregar" sin unidad: se lleva al selector de unidad. */
function goAssign() {
  const el = document.getElementById('assign-vehicle')
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="rdetail">
    <RouterLink to="/admin/reservas" class="rdetail__back"><i class="fa-solid fa-arrow-left"></i> Reservas</RouterLink>

    <div v-if="loading" class="rdetail__grid">
      <div class="skeleton rdetail__sk rdetail__main"></div>
      <div class="skeleton rdetail__sk rdetail__side"></div>
    </div>

    <EmptyState
      v-else-if="error || !reservation"
      error
      :title="error?.status === 404 ? 'Esta reserva no existe' : undefined"
      :message="error?.message"
      @retry="load"
    />

    <div v-else class="rdetail__grid">
      <div class="rdetail__main">
        <ReservationActions :r="reservation" :saving="saving" @patch="patch" @assign="goAssign" />
        <ReservationInfo :r="reservation" />
        <ReservationVerification
          :r="reservation"
          :saving="saving"
          @open="openDocument"
          @save="(b) => patch(b, 'Verificación guardada')"
        />
      </div>
      <div class="rdetail__side">
        <ReservationShareLink v-if="shareToken" :r="reservation" :token="shareToken" />
        <ReservationPayments :r="reservation" :saving="saving" @pay="addPayment" @refund="refund" />
        <ReservationManage :r="reservation" :saving="saving" @patch="patch" />
        <ReservationPricing :r="reservation" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rdetail {
  &__back {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-muted;
    margin-bottom: 0.9rem;
    width: fit-content;

    &:hover {
      color: $blue;
    }
  }

  &__grid {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__main,
  &__side {
    min-width: 0;
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__main {
    flex: 1;
  }

  &__side {
    @include from('lg') {
      flex: 0 0 380px;
    }
  }

  &__sk {
    min-height: 360px;
    border-radius: 14px;
  }
}
</style>
