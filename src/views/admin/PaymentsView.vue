<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import FilterPills from '@/components/admin/FilterPills.vue'
import Pagination from '@/components/admin/Pagination.vue'
import VoidPaymentDialog from '@/components/admin/payments/VoidPaymentDialog.vue'
import { usePaymentVoid } from '@/composables/admin/usePaymentVoid'
import { paymentStatusesV13, voidCopy } from '@/config/admin/ops'
import { useAdminList } from '@/composables/admin/useAdminList'
import { adminService } from '@/services/admin.service'
import { paymentCopy, paymentMethods, paymentProviders } from '@/config/admin'
import { money } from '@/utils/format'
import { dateTime } from '@/composables/admin/helpers'
import { refId, type Column, type Payment } from '@/types/admin'

const router = useRouter()
const list = useAdminList<Payment>((p) => adminService.list<Payment>('payments', p), { filters: ['method'] })

// Anular deja el pago como "Anulado"; el saldo de la reserva lo recalcula el servidor.
const voider = usePaymentVoid(() => list.load())

const columns: Column[] = [
  { key: 'reservationCode', label: 'Reserva' },
  { key: 'amount', label: 'Monto', align: 'right' },
  { key: 'method', label: 'Método' },
  { key: 'registeredBy', label: paymentCopy.registeredBy, mobileHidden: true },
  { key: 'createdAt', label: 'Fecha' },
  { key: 'status', label: 'Estado' },
]

// Los pagos en línea de Payphone no traen "method" en registros antiguos: son tarjeta.
const methodOf = (p: Payment) =>
  paymentMethods[p.method || ''] || (p.provider === 'payphone' ? paymentMethods.card : paymentProviders[p.provider] || p.provider)
const byOf = (p: Payment) => p.registeredBy?.name || (p.provider === 'payphone' ? `${paymentCopy.online} (Payphone)` : '—')

function open(p: Payment) {
  const id = refId(p.reservation)
  if (id) router.push(`/admin/reservas/${id}`)
}
</script>

<template>
  <div>
    <PageHeader title="Pagos" subtitle="Pagos en línea (Payphone) y los registrados en el local: efectivo, transferencia o tarjeta." />
    <div class="pay__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por reserva o transacción" />
    </div>
    <FilterPills v-model="list.filters.status" :options="paymentStatusesV13" class="pay__pills" />
    <FilterPills
      :model-value="list.filters.method || ''"
      :options="paymentMethods"
      all-label="Todos los métodos"
      class="pay__pills pay__pills--last"
      @update:model-value="(v) => (list.filters.method = v)"
    />

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
        <template #cell-method="{ row }">{{ methodOf(row) }}</template>
        <template #cell-registeredBy="{ row }"><span class="pay__by">{{ byOf(row) }}</span></template>
        <template #cell-createdAt="{ row }">{{ dateTime(row.approvedAt || row.createdAt) }}</template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" :map="paymentStatusesV13" /></template>
        <template #actions="{ row }">
          <button v-if="voider.canVoid(row)" type="button" class="pay__void" :aria-label="`${voidCopy.action} ${row.reservationCode}`" @click="voider.ask(row)">
            <i class="fa-solid fa-ban"></i> {{ voidCopy.action }}
          </button>
        </template>
      </AdminTable>
      <div class="pay__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
    <VoidPaymentDialog
      v-model:reason="voider.reason.value"
      :payment="voider.target.value"
      :error="voider.error.value"
      @confirm="voider.confirm"
      @cancel="voider.cancel"
    />
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
    margin-bottom: 0.7rem;

    &--last {
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
    color: $blue-deep;
  }

  &__amount {
    color: $ink;
  }

  &__void {
    font-size: 0.78rem;
    font-weight: 800;
    color: $danger;
    min-height: 36px;
    padding: 0 0.3rem;
    white-space: nowrap;
  }

  &__by {
    font-size: 0.82rem;
    color: $ink-soft;
  }
}
</style>
