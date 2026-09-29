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
import { verificationStatuses } from '@/config/admin'
import { shortDate } from '@/composables/admin/helpers'
import type { Column, Customer } from '@/types/admin'

const router = useRouter()
const list = useAdminList<Customer>((p) => adminService.list<Customer>('customers', p))

const columns: Column[] = [
  { key: 'name', label: 'Cliente' },
  { key: 'documentNumber', label: 'Documento' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'country', label: 'País' },
  { key: 'totalRentals', label: 'Rentas', align: 'center' },
  { key: 'verification', label: 'Verificación' },
  { key: 'createdAt', label: 'Desde' },
]
</script>

<template>
  <div>
    <PageHeader title="Clientes" subtitle="Personas que ya reservaron al menos una vez." />
    <div class="cust__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por nombre, cédula, correo o teléfono" />
    </div>
    <FilterPills v-model="list.filters.status" :options="verificationStatuses" class="cust__pills" />

    <section class="cust__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        clickable
        empty-title="No hay clientes con estos filtros"
        empty-icon="fa-solid fa-users"
        @row-click="(r) => router.push(`/admin/clientes/${r._id}`)"
        @retry="list.load"
      >
        <template #cell-name="{ row }">
          <span class="cust__who">
            <strong>{{ row.name }}</strong>
            <small>{{ row.email }}</small>
          </span>
          <i v-if="row.isClubMember" class="fa-solid fa-crown cust__club" title="Miembro Renaissance"></i>
        </template>
        <template #cell-documentNumber="{ row }">
          {{ row.documentNumber }} <small class="cust__muted">{{ row.documentType === 'passport' ? 'Pasaporte' : 'Cédula' }}</small>
        </template>
        <template #cell-verification="{ row }"><StatusBadge :status="row.verification" :map="verificationStatuses" /></template>
        <template #cell-createdAt="{ row }">{{ shortDate(row.createdAt) }}</template>
      </AdminTable>
      <div class="cust__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.cust {
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

  &__who {
    display: inline-flex;
    flex-direction: column;
    line-height: 1.3;
    vertical-align: middle;

    strong {
      color: $ink;
    }

    small {
      color: $ink-muted;
      font-size: 0.76rem;
    }
  }

  &__club {
    color: $accent-deep;
    margin-left: 0.4rem;
  }

  &__muted {
    color: $ink-muted;
    font-size: 0.72rem;
  }
}
</style>
