<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { adminService } from '@/services/admin.service'
import { vehicleStatuses } from '@/config/admin'
import { vehicleLabel } from '@/composables/admin/helpers'
import { refId, refObj, type AdminReservation, type Vehicle } from '@/types/admin'

const props = defineProps<{ r: AdminReservation; saving?: boolean }>()
const emit = defineEmits<{ patch: [body: Record<string, unknown>, success: string] }>()

// Los cambios de estado viven en ReservationActions (ciclo estricto); aquí, unidad y notas.
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
  <section id="reservation-manage" class="manage">
    <h2 class="manage__title"><i class="fa-solid fa-sliders"></i> Unidad y notas</h2>

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
          @click="emit('patch', { vehicleId: vehicleId || null }, vehicleId ? 'Unidad asignada' : 'Unidad quitada')"
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
