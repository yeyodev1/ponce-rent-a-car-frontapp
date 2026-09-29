<script setup lang="ts">
import { useRoute } from 'vue-router'
import EmptyState from '@/components/admin/EmptyState.vue'
import ReservationInfo from '@/components/admin/reservations/ReservationInfo.vue'
import ReservationPricing from '@/components/admin/reservations/ReservationPricing.vue'
import ReservationVerification from '@/components/admin/reservations/ReservationVerification.vue'
import ReservationManage from '@/components/admin/reservations/ReservationManage.vue'
import { useReservation } from '@/composables/admin/useReservation'

const route = useRoute()
const { reservation, loading, saving, error, load, patch, openDocument } = useReservation(String(route.params.id))
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
        <ReservationInfo :r="reservation" />
        <ReservationVerification
          :r="reservation"
          :saving="saving"
          @open="openDocument"
          @save="(b) => patch(b, 'Verificación guardada')"
        />
      </div>
      <div class="rdetail__side">
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
