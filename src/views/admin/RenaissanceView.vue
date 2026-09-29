<script setup lang="ts">
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import Pagination from '@/components/admin/Pagination.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { adminService } from '@/services/admin.service'
import { clubLevels, languages } from '@/config/admin'
import { shortDate, waLink } from '@/composables/admin/helpers'
import type { ClubMember, Column } from '@/types/admin'

const list = useAdminList<ClubMember>((p) => adminService.list<ClubMember>('renaissance', p))

const columns: Column[] = [
  { key: 'name', label: 'Miembro' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'level', label: 'Nivel' },
  { key: 'rentals', label: 'Rentas', align: 'center' },
  { key: 'language', label: 'Idioma' },
  { key: 'createdAt', label: 'Se unió' },
]
</script>

<template>
  <div>
    <PageHeader title="Ponce's Renaissance" subtitle="Personas interesadas en el club de beneficios.">
      <span class="ren__count"><i class="fa-solid fa-crown"></i> {{ list.total.value }} miembros</span>
    </PageHeader>
    <div class="ren__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por nombre, correo o teléfono" />
    </div>
    <section class="ren__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        empty-title="Todavía no hay interesados"
        empty-icon="fa-solid fa-crown"
        @retry="list.load"
      >
        <template #cell-name="{ row }">
          <span class="ren__who"><strong>{{ row.name }}</strong><small>{{ row.email }}</small></span>
        </template>
        <template #cell-phone="{ row }">
          <a v-if="row.phone" :href="waLink(row.phone)" target="_blank" rel="noopener" class="ren__wa" @click.stop>
            <i class="fa-brands fa-whatsapp"></i> {{ row.phone }}
          </a>
          <span v-else>—</span>
        </template>
        <template #cell-level="{ row }"><StatusBadge :status="row.level" :label="clubLevels[row.level] || row.level" tone="accent" /></template>
        <template #cell-language="{ row }">{{ languages[row.language] || row.language }}</template>
        <template #cell-createdAt="{ row }">{{ shortDate(row.createdAt) }}</template>
      </AdminTable>
      <div class="ren__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ren {
  &__count {
    @include flex(row, center, flex-start, 0.45rem);
    font-size: 0.85rem;
    font-weight: 800;
    color: darken($accent-deep, 15%);
    background: $accent-soft;
    padding: 0.5rem 0.9rem;
    border-radius: $radius-pill;
  }

  &__filters {
    max-width: 520px;
    display: flex;
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
    @include flex(column, flex-start, center);
    line-height: 1.3;

    small {
      color: $ink-muted;
      font-size: 0.76rem;
    }
  }

  &__wa {
    color: $whatsapp-deep;
    font-weight: 700;
  }
}
</style>
