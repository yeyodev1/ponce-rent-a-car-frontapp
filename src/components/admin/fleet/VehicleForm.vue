<script setup lang="ts">
import FormRow from '../FormRow.vue'
import GalleryField from '../GalleryField.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import { fuelTypes, vehicleStatuses } from '@/config/admin'
import { es } from '@/composables/admin/helpers'
import type { Category } from '@/types'
import type { VehicleForm } from '@/composables/admin/vehicleForm'

const form = defineModel<VehicleForm>({ required: true })
defineProps<{ categories: Category[] }>()
</script>

<template>
  <div class="vform">
    <div>
      <label for="veh-cat">Categoría *</label>
      <select id="veh-cat" v-model="form.category" required>
        <option value="" disabled>Elige una categoría</option>
        <option v-for="c in categories" :key="c._id" :value="c._id">{{ es(c.name) || c.slug }}</option>
      </select>
    </div>
    <FormRow basis="160px">
      <div>
        <label for="veh-brand">Marca</label>
        <input id="veh-brand" v-model.trim="form.brand" type="text" placeholder="Chevrolet" />
      </div>
      <div>
        <label for="veh-model">Modelo</label>
        <input id="veh-model" v-model.trim="form.model" type="text" placeholder="Tracker" />
      </div>
      <div>
        <label for="veh-year">Año</label>
        <input id="veh-year" v-model.number="form.year" type="number" min="1990" max="2100" />
      </div>
    </FormRow>
    <FormRow basis="160px">
      <div>
        <label for="veh-plate">Placa</label>
        <input id="veh-plate" v-model.trim="form.plate" type="text" placeholder="GSA-1234" class="vform__plate" />
      </div>
      <div>
        <label for="veh-color">Color</label>
        <input id="veh-color" v-model.trim="form.color" type="text" placeholder="Blanco" />
      </div>
      <div>
        <label for="veh-tr">Transmisión</label>
        <select id="veh-tr" v-model="form.transmission">
          <option value="automatic">Automática</option>
          <option value="manual">Manual</option>
        </select>
      </div>
    </FormRow>
    <FormRow basis="160px">
      <div>
        <label for="veh-fuel">Combustible</label>
        <select id="veh-fuel" v-model="form.fuel">
          <option v-for="(label, key) in fuelTypes" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div>
        <label for="veh-seats">Asientos</label>
        <input id="veh-seats" v-model.number="form.seats" type="number" min="1" max="60" inputmode="numeric" />
      </div>
      <div>
        <label for="veh-km">Kilometraje (km)</label>
        <input id="veh-km" v-model.number="form.mileageKm" type="number" min="0" step="1" inputmode="numeric" />
      </div>
    </FormRow>
    <div>
      <label for="veh-desc">Descripción</label>
      <textarea id="veh-desc" v-model="form.description" rows="2" placeholder="Versión, equipamiento destacado…"></textarea>
    </div>
    <FormRow>
      <div>
        <label for="veh-status">Estado</label>
        <select id="veh-status" v-model="form.status">
          <option v-for="(def, key) in vehicleStatuses" :key="key" :value="key">{{ def.label }}</option>
        </select>
      </div>
      <div>
        <label for="veh-owner">Dueño (si es de un socio)</label>
        <input id="veh-owner" v-model="form.owner" type="text" placeholder="Vacío = flota propia" />
      </div>
    </FormRow>
    <div>
      <label for="veh-notes">Notas</label>
      <textarea id="veh-notes" v-model="form.notes" rows="3" placeholder="Mantenimientos, detalles, llaves…"></textarea>
    </div>
    <GalleryField v-model="form.images" label="Fotos de la unidad" />
    <ToggleSwitch v-model="form.isActive" label="Unidad activa (se puede asignar a reservas)" />
  </div>
</template>

<style scoped lang="scss">
.vform {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__plate {
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
  }
}
</style>
