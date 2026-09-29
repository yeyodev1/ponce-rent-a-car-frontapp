<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import { adminService } from '@/services/admin.service'
import { reservationActions, reservationStatuses, vehicleStatuses } from '@/config/admin'
import { vehicleLabel } from '@/composables/admin/helpers'
import { refId, refObj, type AdminReservation, type Vehicle } from '@/types/admin'

const props = defineProps<{ r: AdminReservation; saving?: boolean }>()
const emit = defineEmits<{ patch: [body: Record<string, unknown>, success: string] }>()

const actions = computed(() => reservationActions[props.r.status] || [])
const pending = ref<(typeof actions.value)[number] | null>(null)

function confirm() {
  const a = pending.value
  pending.value = null
  if (a) emit('patch', { status: a.to }, `Reserva ${reservationStatuses[a.to]?.label.toLowerCase() || 'actualizada'}`)
}

// Unidades de la misma categoría para asignar o cambiar la del cliente.
const vehicles = ref<Vehicle[]>([])
const vehicleId = ref(refId(props.r.vehicle))
watch(
  () => refId(props.r.vehicle),
  (v) => (vehicleId.value = v),
)

onMounted(async () => {
  try {
    const res = await adminService.list<Vehicle>('vehicles', { limit: 200 })
    const catId = refId(props.r.category)
    vehicles.value = res.items.filter((v) => {
      const c = refObj(v.category)
      return (c && c.slug === props.r.categorySlug) || (catId && refId(v.category) === catId)
    })
  } catch {
    /* sin lista de unidades: el selector queda vacío */
  }
})

const notes = ref(props.r.notes || '')
</script>

<template>
  <section class="manage">
    <h2 class="manage__title"><i class="fa-solid fa-sliders"></i> Gestionar</h2>

    <div v-if="actions.length" class="manage__actions">
      <button
        v-for="a in actions"
        :key="a.to"
        type="button"
        class="btn btn--sm"
        :class="a.danger ? 'btn--ghost manage__danger' : 'btn--primary'"
        :disabled="saving"
        @click="pending = a"
      >
        <i :class="a.icon"></i> {{ a.label }}
      </button>
    </div>
    <p v-else class="manage__muted">La reserva está {{ reservationStatuses[r.status]?.label.toLowerCase() }}; no hay acciones de estado.</p>

    <div class="manage__field">
      <label for="assign-vehicle">Unidad asignada</label>
      <div class="manage__row">
        <select id="assign-vehicle" v-model="vehicleId">
          <option value="">Sin asignar</option>
          <option v-for="v in vehicles" :key="v._id" :value="v._id">
            {{ vehicleLabel(v) }} — {{ vehicleStatuses[v.status]?.label }}
          </option>
        </select>
        <button
          class="btn btn--dark btn--sm"
          type="button"
          :disabled="saving || vehicleId === refId(r.vehicle)"
          @click="emit('patch', { vehicleId: vehicleId || null }, 'Unidad asignada')"
        >
          Asignar
        </button>
      </div>
    </div>

    <div class="manage__field">
      <label for="res-notes">Notas internas</label>
      <textarea id="res-notes" v-model="notes" rows="3" placeholder="Solo las ve el equipo."></textarea>
      <button
        class="btn btn--ghost btn--sm manage__save"
        type="button"
        :disabled="saving || notes === (r.notes || '')"
        @click="emit('patch', { notes }, 'Notas guardadas')"
      >
        Guardar notas
      </button>
    </div>

    <ConfirmDialog
      :open="Boolean(pending)"
      :title="`${pending?.label}: ${r.code}`"
      :message="pending?.confirm"
      :confirm-label="pending?.label"
      :danger="Boolean(pending?.danger)"
      @confirm="confirm"
      @cancel="pending = null"
    />
  </section>
</template>

<style scoped lang="scss">
.manage {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 1rem);

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

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__danger {
    color: $danger;
    border-color: rgba($danger, 0.4);
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__field {
    @include flex(column, stretch, flex-start, 0.2rem);
  }

  &__row {
    @include flex(row, center, flex-start, 0.5rem);

    select {
      flex: 1;
      min-width: 0;
    }
  }

  &__save {
    align-self: flex-end;
    margin-top: 0.4rem;
  }
}
</style>
