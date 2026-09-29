<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import FilterPills from '@/components/admin/FilterPills.vue'
import Pagination from '@/components/admin/Pagination.vue'
import AdminTabs from '@/components/admin/AdminTabs.vue'
import LeadBoard from '@/components/admin/leads/LeadBoard.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { useLeadStatus } from '@/composables/admin/useLeadStatus'
import { adminService } from '@/services/admin.service'
import { durations, leadSources, leadStatuses, leadTags } from '@/config/admin'
import { shortDate, timeAgo } from '@/composables/admin/helpers'
import type { Column, Lead } from '@/types/admin'

const VIEW_KEY = 'ponce_admin_leads_view'
const router = useRouter()

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) || 'list'
  } catch {
    return 'list'
  }
}

const view = ref(readView())
watch(view, (v) => {
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch {
    /* modo privado */
  }
  list.load()
})

// En tablero se traen muchos leads de una vez: cada columna es un estado.
const list = useAdminList<Lead>(
  (p) => adminService.list<Lead>('leads', view.value === 'board' ? { ...p, status: '', page: 1, limit: 200 } : p),
  { filters: ['source', 'tag'] },
)
const { move } = useLeadStatus(list.patchItem)

const columns: Column[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Cliente' },
  { key: 'source', label: 'Fuente' },
  { key: 'startDate', label: 'Inicio' },
  { key: 'duration', label: 'Duración' },
  { key: 'status', label: 'Estado' },
  { key: 'createdAt', label: 'Recibido' },
]

const tabs = [
  { value: 'list', label: 'Lista', icon: 'fa-solid fa-list' },
  { value: 'board', label: 'Tablero', icon: 'fa-solid fa-table-columns' },
]
</script>

<template>
  <div class="leads">
    <PageHeader title="Leads" subtitle="Toda solicitud que llega por la web, WhatsApp o formularios.">
      <AdminTabs v-model="view" :tabs="tabs" class="leads__view" />
    </PageHeader>

    <div class="leads__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por nombre, teléfono o código" />
      <select v-model="list.filters.source" class="leads__select" aria-label="Fuente">
        <option value="">Todas las fuentes</option>
        <option v-for="(label, key) in leadSources" :key="key" :value="key">{{ label }}</option>
      </select>
      <select v-model="list.filters.tag" class="leads__select" aria-label="Etiqueta">
        <option value="">Todas las etiquetas</option>
        <option v-for="(def, key) in leadTags" :key="key" :value="key">{{ def.label }}</option>
      </select>
    </div>
    <FilterPills v-if="view === 'list'" v-model="list.filters.status" :options="leadStatuses" class="leads__pills" />

    <LeadBoard v-if="view === 'board'" :leads="list.items.value" :loading="list.loading.value" @move="move" />

    <section v-else class="leads__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        clickable
        empty-title="No hay leads con estos filtros"
        empty-icon="fa-solid fa-inbox"
        @row-click="(r) => router.push(`/admin/leads/${r._id}`)"
        @retry="list.load"
      >
        <template #cell-code="{ row }">
          <span class="leads__code">#{{ row.code }}</span>
          <i v-if="row.needsHuman" class="fa-solid fa-headset leads__human" title="Pidió hablar con un asesor"></i>
        </template>
        <template #cell-name="{ row }">
          <span class="leads__who">
            <strong>{{ row.name || 'Sin nombre' }}</strong>
            <small>{{ row.phone || row.whatsapp || row.email }}</small>
          </span>
        </template>
        <template #cell-source="{ row }">
          {{ leadSources[row.source] || row.source }}
          <StatusBadge v-for="t in row.tags.filter((x: string) => leadTags[x])" :key="t" :status="t" :map="leadTags" class="leads__tag" />
        </template>
        <template #cell-startDate="{ row }">{{ row.startDate ? shortDate(row.startDate) : '—' }}</template>
        <template #cell-duration="{ row }">{{ durations[row.duration] || '—' }}</template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" :map="leadStatuses" /></template>
        <template #cell-createdAt="{ row }">{{ timeAgo(row.createdAt) }}</template>
      </AdminTable>
      <div class="leads__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.leads {
  &__view {
    margin-bottom: 0;
  }

  &__filters {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
    margin-bottom: 0.8rem;
  }

  &__select {
    flex: 1 1 140px;
    min-height: 44px;
    border-radius: $radius-pill;
    padding-block: 0.5rem;

    @include from('md') {
      flex: 0 1 210px;
      font-size: 0.9rem;
    }
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
    font-weight: 800;
    color: $blue-deep;
  }

  &__human {
    color: $danger;
    margin-left: 0.4rem;
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

  &__tag {
    margin-left: 0.3rem;
  }
}
</style>
