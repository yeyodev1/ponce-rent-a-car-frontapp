<script setup lang="ts">
import AdminCard from '../AdminCard.vue'
import EmptyState from '../EmptyState.vue'
import FormRow from '../FormRow.vue'
import MoneyInput from '../MoneyInput.vue'
import I18nField from '../I18nField.vue'
import ListEditor from '../ListEditor.vue'
import { useSettings } from '@/composables/admin/useSettings'
import { copy, locations } from '@/config/admin'
import { emptyI18n } from '@/composables/admin/helpers'
import type { LocationOption } from '@/types'

const { form, loading, saving, error, load, save } = useSettings()

const newLocation = (): LocationOption => ({ code: 'other', label: emptyI18n(), fee: 0 })
</script>

<template>
  <div v-if="loading" class="rules">
    <div v-for="i in 3" :key="i" class="skeleton rules__sk"></div>
  </div>
  <EmptyState v-else-if="error" error :message="error.message" @retry="load" />

  <form v-else class="rules" @submit.prevent="save">
    <AdminCard title="Ventana de reserva en línea" icon="fa-solid fa-calendar-day">
      <FormRow basis="170px">
        <div>
          <label for="r-max">Días hacia adelante</label>
          <input id="r-max" v-model.number="form.booking.maxDaysAhead" type="number" min="0" />
          <p class="rules__hint">Solo se aceptan retiros de hoy a hoy + {{ form.booking.maxDaysAhead }} días.</p>
        </div>
        <div>
          <label for="r-notice">Horas mínimas de aviso</label>
          <input id="r-notice" v-model.number="form.booking.minHoursNotice" type="number" min="0" />
        </div>
        <div>
          <label for="r-hold">Minutos de pre-reserva</label>
          <input id="r-hold" v-model.number="form.booking.holdMinutes" type="number" min="5" />
          <p class="rules__hint">Tiempo que se aparta la unidad mientras el cliente paga.</p>
        </div>
      </FormRow>
    </AdminCard>

    <AdminCard title="Separación y garantía" icon="fa-solid fa-hand-holding-dollar">
      <FormRow>
        <div>
          <label for="r-dmode">Pago para separar</label>
          <select id="r-dmode" v-model="form.booking.depositMode">
            <option value="fixed">Monto fijo</option>
            <option value="percent">Porcentaje del total</option>
            <option value="none">Sin separación (pago total)</option>
          </select>
        </div>
        <MoneyInput v-if="form.booking.depositMode === 'fixed'" v-model="form.booking.depositValue" label="Monto de separación" />
        <div v-else-if="form.booking.depositMode === 'percent'">
          <label for="r-dpct">Porcentaje</label>
          <input id="r-dpct" v-model.number="form.booking.depositValue" type="number" min="1" max="100" />
        </div>
      </FormRow>
      <FormRow>
        <MoneyInput v-model="form.booking.guaranteeAmount" label="Garantía del vehículo" hint="Informativa: se bloquea en el retiro con Datafast, no se cobra online." />
      </FormRow>
    </AdminCard>

    <AdminCard title="Kilometraje" icon="fa-solid fa-gauge">
      <FormRow basis="170px">
        <div>
          <label for="r-km">Km incluidos por día (limitado)</label>
          <input id="r-km" v-model.number="form.booking.mileage.limitedKmPerDay" type="number" min="0" />
        </div>
        <MoneyInput v-model="form.booking.mileage.extraKmPrice" label="Precio por km adicional" />
        <MoneyInput v-model="form.booking.mileage.unlimitedPricePerDay" label="Kilometraje ilimitado" suffix="/ día" />
      </FormRow>
    </AdminCard>

    <AdminCard title="Lugares de entrega y devolución" icon="fa-solid fa-location-dot">
      <ListEditor v-model="form.booking.locations" label="Ubicaciones" add-label="Agregar ubicación" :create="newLocation">
        <template #default="{ item, update }">
          <FormRow basis="150px">
            <div>
              <label>Tipo</label>
              <select :value="item.code" @change="update({ ...item, code: ($event.target as HTMLSelectElement).value as LocationOption['code'] })">
                <option v-for="(label, code) in locations" :key="code" :value="code">{{ label }}</option>
              </select>
            </div>
            <MoneyInput :model-value="item.fee" label="Recargo" @update:model-value="(fee) => update({ ...item, fee })" />
          </FormRow>
          <I18nField :model-value="item.label" label="Nombre visible" @update:model-value="(label) => update({ ...item, label })" />
        </template>
      </ListEditor>
    </AdminCard>

    <div class="rules__bar">
      <button class="btn btn--primary" type="submit" :disabled="saving">
        <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
        {{ saving ? copy.saving : 'Guardar reglas' }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.rules {
  @include flex(column, stretch, flex-start, 1rem);

  &__sk {
    height: 160px;
    border-radius: 14px;
  }

  &__hint {
    font-size: 0.74rem;
    color: $ink-muted;
    margin-top: 0.3rem;
  }

  // Barra de guardado pegada abajo: el formulario es largo en el celular.
  &__bar {
    position: sticky;
    bottom: calc(76px + env(safe-area-inset-bottom));
    @include flex(row, center, flex-end);
    padding: 0.75rem;
    background: rgba($paper, 0.9);
    backdrop-filter: blur(8px);
    border-radius: 16px;

    @include from('lg') {
      bottom: 1rem;
    }
  }
}
</style>
