<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import FilterPills from '@/components/admin/FilterPills.vue'
import Pagination from '@/components/admin/Pagination.vue'
import WalkInDrawer from '@/components/admin/reservations/walkin/WalkInDrawer.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { adminService } from '@/services/admin.service'
import {
  reservationCopy,
  reservationFilters,
  reservationPaymentStatuses,
  reservationStatuses,
  verificationStatuses,
} from '@/config/admin'
import { money } from '@/utils/format'
import { es, shortDate, vehicleLabel } from '@/composables/admin/helpers'
import { refObj, type AdminReservation, type Column } from '@/types/admin'

const router = useRouter()
const list = useAdminList<AdminReservation>((p) => adminService.list<AdminReservation>('reservations', p), {
  filters: ['paymentStatus'],
})
const walkInOpen = ref(false)

const columns: Column[] = [
  { key: 'code', label: 'Reserva' },
  { key: 'customer', label: 'Cliente' },
  { key: 'category', label: 'Vehículo' },
  { key: 'dates', label: 'Fechas' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'payment', label: 'Pago' },
  { key: 'verification', label: 'Verificación', mobileHidden: true },
  { key: 'status', label: 'Estado' },
]
</script>

<template>
  <div>
    <PageHeader title="Reservas" subtitle="Reservas de la web y presenciales, con su estado de pago y verificación.">
      <button class="btn btn--primary btn--sm" type="button" @click="walkInOpen = true">
        <i class="fa-solid fa-plus"></i> {{ reservationCopy.newReservation }}
      </button>
    </PageHeader>

    <div class="res__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por código, cliente o cédula" />
    </div>
    <FilterPills v-model="list.filters.status" :options="reservationFilters" class="res__pills" />
    <FilterPills
      :model-value="list.filters.paymentStatus || ''"
      @update:model-value="(v) => (list.filters.paymentStatus = v)"
      :options="reservationPaymentStatuses"
      all-label="Cualquier pago"
      class="res__pills"
    />

    <section class="res__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        clickable
        empty-title="No hay reservas con estos filtros"
        empty-icon="fa-solid fa-calendar-xmark"
        @row-click="(r) => router.push(`/admin/reservas/${r._id}`)"
        @retry="list.load"
      >
        <template #cell-code="{ row }"><span class="res__code">{{ row.code }}</span></template>
        <template #cell-customer="{ row }">
          <span class="res__who">
            <strong>{{ refObj(row.customer)?.name || '—' }}</strong>
            <small>{{ refObj(row.customer)?.phone || refObj(row.customer)?.email }}</small>
          </span>
        </template>
        <template #cell-category="{ row }">
          <span class="res__who">
            <strong>{{ es(row.categoryName) || row.categorySlug }}</strong>
            <small>{{ refObj(row.vehicle) ? vehicleLabel(refObj(row.vehicle)) : 'Sin unidad' }}</small>
          </span>
        </template>
        <template #cell-dates="{ row }">{{ shortDate(row.pickupAt) }} – {{ shortDate(row.returnAt) }}</template>
        <template #cell-total="{ row }">
          <strong class="res__money">{{ money(row.pricing?.total || 0) }}</strong>
          <small v-if="row.balance" class="res__balance">Saldo {{ money(row.balance) }}</small>
        </template>
        <template #cell-payment="{ row }">
          <StatusBadge v-if="row.paymentStatus" :status="row.paymentStatus" :map="reservationPaymentStatuses" />
          <span v-else>—</span>
        </template>
        <template #cell-verification="{ row }"><StatusBadge :status="row.verification" :map="verificationStatuses" /></template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" :map="reservationStatuses" /></template>
      </AdminTable>
      <div class="res__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>

    <WalkInDrawer :open="walkInOpen" @close="walkInOpen = false" />
  </div>
</template>

<style scoped lang="scss">
.res {
  &__filters {
    @include flex(row, center, flex-start, 0.6rem);
    margin-bottom: 0.8rem;
    max-width: 520px;
  }

  &__pills {
    margin-bottom: 0.7rem;

    & + & {
      margin-bottom: 1rem;
    }
  }

  &__card {
    @include card;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__pager {
    padding: 0 1rem 1rem;
  }

  &__code {
    font-weight: 800;
    color: $blue-deep;
    white-space: nowrap;
  }

  &__who {
    @include flex(column, flex-start, center);
    line-height: 1.3;

    strong {
      color: $ink;
    }

    small {
      color: $ink-muted;
      font-size: 0.76rem;
    }
  }

  &__money {
    color: $ink;
    display: block;
  }

  &__balance {
    font-size: 0.72rem;
    color: $warning;
    font-weight: 700;
  }
}
</style>
