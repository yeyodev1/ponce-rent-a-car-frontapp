<script setup lang="ts">
import { useRoute } from 'vue-router'
import EmptyState from '@/components/admin/EmptyState.vue'
import AdminDrawer from '@/components/admin/AdminDrawer.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import VehicleHeader from '@/components/admin/vehicle/VehicleHeader.vue'
import VehicleTimeline from '@/components/admin/vehicle/VehicleTimeline.vue'
import VehicleLogForm from '@/components/admin/vehicle/VehicleLogForm.vue'
import { useVehicleHistory } from '@/composables/admin/useVehicleHistory'
import { useUserStore } from '@/stores/user'
import { vehicleHistoryCopy as t } from '@/config/admin/ops'

const route = useRoute()
const userStore = useUserStore()
const {
  history,
  loading,
  error,
  formOpen,
  saving,
  formError,
  form,
  toDelete,
  load,
  openForm,
  save,
  confirmDelete,
} = useVehicleHistory(String(route.params.id))
</script>

<template>
  <div class="vdet">
    <RouterLink to="/admin/flota" class="vdet__back"
      ><i class="fa-solid fa-arrow-left"></i> {{ t.back }}</RouterLink
    >

    <div v-if="loading" class="vdet__col">
      <div class="skeleton vdet__sk"></div>
      <div class="skeleton vdet__sk vdet__sk--tall"></div>
    </div>

    <EmptyState
      v-else-if="error || !history"
      error
      :title="error?.status === 404 ? 'Esta unidad no existe' : undefined"
      :message="error?.message"
      @retry="load()"
    />

    <div v-else class="vdet__col">
      <VehicleHeader :v="history.vehicle" :stats="history.stats" />
      <section class="vdet__card">
        <header class="vdet__head">
          <h2 class="vdet__title"><i class="fa-solid fa-timeline"></i> {{ t.timeline }}</h2>
          <button type="button" class="btn btn--primary btn--sm" @click="openForm">
            <i class="fa-solid fa-plus"></i> {{ t.addLog }}
          </button>
        </header>
        <VehicleTimeline
          v-if="history.timeline.length"
          :items="history.timeline"
          :can-delete="userStore.isAdmin"
          @delete="(i) => (toDelete = i)"
        />
        <p v-else class="vdet__empty">{{ t.empty }}</p>
      </section>
    </div>

    <AdminDrawer
      :open="formOpen"
      :title="t.addLog"
      :subtitle="
        history
          ? `${history.vehicle.brand} ${history.vehicle.model} · ${history.vehicle.plate}`
          : ''
      "
      @close="formOpen = false"
    >
      <VehicleLogForm v-model="form" :error="formError" />
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="formOpen = false">
          {{ t.cancel }}
        </button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="save">
          <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'"></i> {{ t.save }}
        </button>
      </template>
    </AdminDrawer>

    <ConfirmDialog
      :open="Boolean(toDelete)"
      :title="t.deleteTitle"
      :message="t.deleteMsg"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>

<style scoped lang="scss">
.vdet {
  max-width: 860px;

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

  &__col {
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__sk {
    min-height: 160px;
    border-radius: 14px;

    &--tall {
      min-height: 360px;
    }
  }

  &__card {
    @include card;
    box-shadow: $shadow-sm;
    padding: 1rem;
    @include flex(column, stretch, flex-start, 1rem);

    @include from('md') {
      padding: 1.2rem;
    }
  }

  &__head {
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
  }

  &__title {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
