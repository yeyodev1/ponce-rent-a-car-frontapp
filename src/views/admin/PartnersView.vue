<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminDrawer from '@/components/admin/AdminDrawer.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import SearchBar from '@/components/admin/SearchBar.vue'
import FilterPills from '@/components/admin/FilterPills.vue'
import Pagination from '@/components/admin/Pagination.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { copy, partnerStatuses } from '@/config/admin'
import { timeAgo, waLink } from '@/composables/admin/helpers'
import type { ApiError } from '@/types'
import type { Column, Partner } from '@/types/admin'

const toast = useToastStore()
const list = useAdminList<Partner>((p) => adminService.list<Partner>('partners', p))
const current = ref<Partner | null>(null)
const draft = ref({ status: '', notes: '' })
const saving = ref(false)

function open(p: Partner) {
  current.value = p
  draft.value = { status: p.status, notes: p.notes || '' }
}

async function save() {
  if (!current.value) return
  saving.value = true
  const id = current.value._id
  try {
    await adminService.patchPartner(id, draft.value)
    list.patchItem(id, draft.value as Partial<Partner>)
    toast.success(copy.saved)
    current.value = null
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    saving.value = false
  }
}

const columns: Column[] = [
  { key: 'code', label: 'Código' },
  { key: 'name', label: 'Socio' },
  { key: 'vehicle', label: 'Vehículo' },
  { key: 'photos', label: 'Fotos', align: 'center' },
  { key: 'createdAt', label: 'Recibida' },
  { key: 'status', label: 'Estado' },
]
</script>

<template>
  <div>
    <PageHeader title="Socios sobre Ruedas" subtitle="Dueños que quieren poner su vehículo a trabajar con Ponce's." />
    <div class="partners__filters">
      <SearchBar v-model="list.filters.q" placeholder="Buscar por nombre, ciudad o marca" />
    </div>
    <FilterPills v-model="list.filters.status" :options="partnerStatuses" class="partners__pills" />

    <section class="partners__card">
      <AdminTable
        :columns="columns"
        :rows="list.items.value"
        :loading="list.loading.value"
        :error="list.error.value"
        clickable
        empty-title="Todavía no hay solicitudes de socios"
        empty-icon="fa-solid fa-handshake"
        @row-click="open"
        @retry="list.load"
      >
        <template #cell-code="{ row }"><strong class="partners__code">{{ row.code }}</strong></template>
        <template #cell-name="{ row }">
          <span class="partners__who"><strong>{{ row.name }}</strong><small>{{ row.city }} · {{ row.whatsapp }}</small></span>
        </template>
        <template #cell-vehicle="{ row }">{{ row.brand }} {{ row.model }} {{ row.year }} <small class="partners__muted">{{ row.vehicleType }}</small></template>
        <template #cell-photos="{ row }">{{ row.photos?.length || 0 }}</template>
        <template #cell-createdAt="{ row }">{{ timeAgo(row.createdAt) }}</template>
        <template #cell-status="{ row }"><StatusBadge :status="row.status" :map="partnerStatuses" /></template>
      </AdminTable>
      <div class="partners__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>

    <AdminDrawer :open="Boolean(current)" :title="current ? `${current.name} · ${current.code}` : ''" :subtitle="current ? `${current.brand} ${current.model} ${current.year}` : ''" @close="current = null">
      <template v-if="current">
        <a :href="waLink(current.whatsapp, `Hola ${current.name.split(' ')[0]}, te escribimos de Ponce's por tu solicitud de Socio sobre Ruedas.`)" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm partners__wa">
          <i class="fa-brands fa-whatsapp"></i> Escribir por WhatsApp
        </a>
        <ul class="partners__facts">
          <li><span>Ciudad</span><strong>{{ current.city || '—' }}</strong></li>
          <li><span>Tipo</span><strong>{{ current.vehicleType || '—' }}</strong></li>
          <li><span>WhatsApp</span><strong>{{ current.whatsapp }}</strong></li>
          <li><span>Idioma</span><strong>{{ current.language === 'en' ? 'Inglés' : 'Español' }}</strong></li>
        </ul>
        <div v-if="current.photos?.length" class="partners__photos">
          <a v-for="(src, i) in current.photos" :key="i" :href="src" target="_blank" rel="noopener"><img :src="src" alt="" loading="lazy" /></a>
        </div>
        <div>
          <label for="p-status">Estado</label>
          <select id="p-status" v-model="draft.status">
            <option v-for="(def, key) in partnerStatuses" :key="key" :value="key">{{ def.label }}</option>
          </select>
        </div>
        <div>
          <label for="p-notes">Notas</label>
          <textarea id="p-notes" v-model="draft.notes" rows="3"></textarea>
        </div>
      </template>
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="current = null">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="save">{{ saving ? copy.saving : copy.save }}</button>
      </template>
    </AdminDrawer>
  </div>
</template>

<style scoped lang="scss">
.partners {
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

  &__who {
    @include flex(column, flex-start, center);
    line-height: 1.3;

    small {
      color: $ink-muted;
      font-size: 0.76rem;
    }
  }

  &__muted {
    color: $ink-muted;
  }

  &__wa {
    align-self: flex-start;
  }

  &__facts {
    list-style: none;

    li {
      @include flex(row, baseline, space-between, 1rem);
      padding: 0.5rem 0;
      border-bottom: 1px solid $line;
      font-size: 0.88rem;
    }

    span {
      color: $ink-muted;
    }
  }

  &__photos {
    @include flex-cards(120px, 0.5rem);

    img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 10px;
    }
  }
}
</style>
