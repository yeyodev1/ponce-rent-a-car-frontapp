<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import FilterPills from '@/components/admin/FilterPills.vue'
import Pagination from '@/components/admin/Pagination.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { adminService } from '@/services/admin.service'
import { paymentModes, paymentProviders, paymentStatuses } from '@/config/admin'
import { money } from '@/utils/format'
import { dateTime } from '@/composables/admin/helpers'
import { refId, type Column, type Payment } from '@/types/admin'

const router = useRouter()
const list = useAdminList<Payment>((p) => adminService.list<Payment>('payments', p))

const columns: Column[] = [
  { key: 'reservationCode', label: 'Reserva' },
  { key: 'amount', label: 'Monto', align: 'right' },
  { key: 'mode', label: 'Tipo' },
  { key: 'provider', label: 'Medio' },
  { key: 'transactionId', label: 'Transacción', mobileHidden: true },
  { key: 'createdAt', label: 'Fecha' },
  { key: 'status', label: 'Estado' },
]

function open(p: Payment) {
  const id = refId(p.reservation)
  if (id) router.push(`/admin/reservas/${id}`)
}
</script>

<template>
  <div>
    <PageHeader title="Pagos" subtitle="Cobros de separación y pagos totales hechos con Payphone o registrados a mano." />
    <div class="pay__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por reserva o transacción" />
    </div>
    <FilterPills v-model="list.filters.status" :options="paymentStatuses" class="pay__pills" />

    <section class="pay__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        clickable
        empty-title="No hay pagos con estos filtros"
        empty-icon="fa-solid fa-credit-card"
        @row-click="open"
        @retry="list.load"
      >
        <template #cell-reservationCode="{ row }"><strong class="pay__code">{{ row.reservationCode }}</strong></template>
        <template #cell-amount="{ row }"><strong class="pay__amount">{{ money(row.amount, true) }}</strong></template>
        <template #cell-mode="{ row }">{{ paymentModes[row.mode] || row.mode }}</template>
        <template #cell-provider="{ row }">{{ paymentProviders[row.provider] || row.provider }}</template>
        <template #cell-transactionId="{ row }"><code class="pay__tx">{{ row.transactionId || row.clientTransactionId || '—' }}</code></template>
        <template #cell-createdAt="{ row }">{{ dateTime(row.approvedAt || row.createdAt) }}</template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" :map="paymentStatuses" /></template>
      </AdminTable>
      <div class="pay__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.pay {
  &__filters {
    max-width: 520px;
    display: flex;
    margin-bottom: 0.8rem;
  }

  &__pills {
    margin-bottom: 1rem;
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
    color: $blue-deep;
  }

  &__amount {
    color: $ink;
  }

  &__tx {
    font-size: 0.75rem;
    color: $ink-muted;
  }
}
</style>
