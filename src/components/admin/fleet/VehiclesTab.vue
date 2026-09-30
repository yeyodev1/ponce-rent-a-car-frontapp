<script setup lang="ts">
import AdminTable from '../AdminTable.vue'
import AdminDrawer from '../AdminDrawer.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import StatusBadge from '../StatusBadge.vue'
import FilterPills from '../FilterPills.vue'
import VehicleForm from './VehicleForm.vue'
import { useVehicles } from '@/composables/admin/useVehicles'
import { useUserStore } from '@/stores/user'
import { copy, fuelTypes, vehicleStatuses } from '@/config/admin'
import { es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Column, VehicleStatus } from '@/types/admin'

const userStore = useUserStore()
const { crud, categories, catName, dailyRate, visibleStatus, statusFilter, catFilter, rows, setStatus } = useVehicles()
const { loading, error, form, editingId, drawerOpen, saving, toDelete } = crud

const columns: Column[] = [
  { key: 'plate', label: 'Unidad' },
  { key: 'category', label: 'Categoría' },
  { key: 'rate', label: 'Tarifa diaria', align: 'right' },
  { key: 'specs', label: 'Detalle', mobileHidden: true },
  { key: 'status', label: 'Estado' },
]
</script>

<template>
  <div>
    <div class="vtab__bar">
      <select v-model="catFilter" class="vtab__select" aria-label="Categoría">
        <option value="">Todas las categorías</option>
        <option v-for="c in categories" :key="c._id" :value="c._id">{{ es(c.name) }}</option>
      </select>
      <button class="btn btn--primary btn--sm" type="button" @click="crud.openNew"><i class="fa-solid fa-plus"></i> Nueva unidad</button>
    </div>
    <FilterPills v-model="statusFilter" :options="vehicleStatuses" class="vtab__pills" />

    <section class="vtab__card">
      <AdminTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :error="error"
        clickable
        empty-title="No hay unidades"
        empty-icon="fa-solid fa-car"
        @row-click="crud.openEdit"
        @retry="crud.load"
      >
        <template #cell-plate="{ row }">
          <span class="vtab__unit">
            <strong>{{ row.brand }} {{ row.model }} <small v-if="row.year">{{ row.year }}</small></strong>
            <small class="vtab__plate">{{ row.plate || 'Sin placa' }}</small>
          </span>
        </template>
        <template #cell-category="{ row }">{{ catName(row) }}</template>
        <template #cell-rate="{ row }">
          <strong v-if="dailyRate(row) !== null" class="vtab__rate">{{ money(dailyRate(row) || 0) }}</strong>
          <span v-else>—</span>
        </template>
        <template #cell-specs="{ row }">
          <span class="vtab__specs">
            {{ fuelTypes[row.fuel || ''] || 'Gasolina' }} · {{ row.seats || 5 }} asientos
            <template v-if="row.mileageKm"> · {{ row.mileageKm.toLocaleString('es-EC') }} km</template>
          </span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge v-if="row.isActive === false" status="blocked" :map="vehicleStatuses" />
          <div v-else class="vtab__status" @click.stop>
            <StatusBadge :status="visibleStatus(row)" :map="vehicleStatuses" />
            <select :value="row.status" aria-label="Cambiar estado" @change="setStatus(row, ($event.target as HTMLSelectElement).value as VehicleStatus)">
              <option v-for="(def, key) in vehicleStatuses" :key="key" :value="key">{{ def.label }}</option>
            </select>
          </div>
        </template>
        <template #actions="{ row }">
          <button class="vtab__icon" type="button" :aria-label="copy.edit" @click="crud.openEdit(row)"><i class="fa-solid fa-pen"></i></button>
          <button v-if="userStore.isAdmin" class="vtab__icon vtab__icon--del" type="button" :aria-label="copy.delete" @click="toDelete = row">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </template>
      </AdminTable>
    </section>

    <AdminDrawer :open="drawerOpen" :title="editingId ? 'Editar unidad' : 'Nueva unidad'" @close="drawerOpen = false">
      <VehicleForm v-model="form" :categories="categories" />
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="drawerOpen = false">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving || !form.category" @click="crud.save">
          {{ saving ? copy.saving : copy.save }}
        </button>
      </template>
    </AdminDrawer>

    <ConfirmDialog
      :open="Boolean(toDelete)"
      :title="`¿Eliminar ${toDelete?.brand} ${toDelete?.model} ${toDelete?.plate}?`"
      message="Las reservas pasadas conservan su información. Si solo está en taller, cambia su estado a En mantenimiento."
      @confirm="crud.confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>

<style scoped lang="scss">
.vtab {
  &__bar {
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
    margin-bottom: 0.8rem;
  }

  &__select {
    flex: 1 1 200px;
    max-width: 280px;
    min-height: 42px;
    border-radius: $radius-pill;
    padding-block: 0.4rem;

    @include from('md') {
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

  &__unit {
    @include flex(column, flex-start, center);
    line-height: 1.3;

    strong {
      color: $ink;

      small {
        font-weight: 600;
        color: $ink-muted;
      }
    }
  }

  &__plate {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: $ink-muted;
  }

  &__rate {
    color: $ink;
    white-space: nowrap;
  }

  &__specs {
    font-size: 0.8rem;
    color: $ink-soft;
  }

  // El select invisible encima del badge: tocar el estado abre las opciones.
  &__status {
    position: relative;
    display: inline-flex;
    cursor: pointer;

    select {
      position: absolute;
      inset: 0;
      opacity: 0;
      min-height: 0;
      padding: 0;
      cursor: pointer;
    }

    &::after {
      content: '\f078';
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      font-size: 0.55rem;
      color: $ink-muted;
      margin-left: 0.3rem;
      align-self: center;
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    color: $ink-muted;

    &:hover {
      background: $sand;
      color: $ink;
    }

    &--del:hover {
      color: $danger;
      background: $danger-bg;
    }
  }
}
</style>
