<script setup lang="ts">
import FormRow from '../../FormRow.vue'
import ToggleSwitch from '../../ToggleSwitch.vue'
import { locations, walkInCopy as t } from '@/config/admin'
import { es, vehicleLabel } from '@/composables/admin/helpers'
import { ymdInGuayaquil } from '@/utils/format'
import type { WalkInForm } from '@/composables/admin/useWalkIn'
import type { Category, LocationOption } from '@/types'
import type { Vehicle } from '@/types/admin'

/** Categoría, unidad opcional, fechas (sin ventana de 5 días) y lugares. */
const props = defineProps<{
  form: WalkInForm
  categories: Category[]
  units: Vehicle[]
  locationOptions: LocationOption[]
  dateError: string
  tried: boolean
}>()

const today = ymdInGuayaquil(0)
const locationLabel = (code: string) =>
  es(props.locationOptions.find((l) => l.code === code)?.label) || locations[code] || code
</script>

<template>
  <fieldset class="wtrip">
    <legend class="wtrip__legend"><i class="fa-solid fa-car-side"></i> {{ t.vehicle }}</legend>
    <FormRow basis="200px">
      <div :class="{ 'wtrip__err': tried && !form.categorySlug }">
        <label for="wi-cat">{{ t.category }} *</label>
        <select id="wi-cat" v-model="form.categorySlug">
          <option value="" disabled>{{ t.chooseCategory }}</option>
          <option v-for="c in categories" :key="c._id" :value="c.slug">{{ es(c.name) || c.slug }}</option>
        </select>
      </div>
      <div>
        <label for="wi-unit">{{ t.unit }}</label>
        <select id="wi-unit" v-model="form.vehicleId" :disabled="!form.categorySlug">
          <option value="">{{ t.anyUnit }}</option>
          <option v-for="v in units" :key="v._id" :value="v._id">{{ vehicleLabel(v) }}</option>
        </select>
      </div>
    </FormRow>

    <legend class="wtrip__legend wtrip__legend--inner"><i class="fa-regular fa-calendar"></i> {{ t.dates }}</legend>
    <FormRow basis="140px">
      <div>
        <label for="wi-pd">{{ t.pickupDate }} *</label>
        <input id="wi-pd" v-model="form.pickupDate" type="date" :min="today" required />
      </div>
      <div>
        <label for="wi-pt">{{ t.pickupTime }} *</label>
        <input id="wi-pt" v-model="form.pickupTime" type="time" step="900" required />
      </div>
    </FormRow>
    <FormRow basis="140px">
      <div>
        <label for="wi-rd">{{ t.returnDate }} *</label>
        <input id="wi-rd" v-model="form.returnDate" type="date" :min="form.pickupDate || today" required />
      </div>
      <div>
        <label for="wi-rt">{{ t.returnTime }} *</label>
        <input id="wi-rt" v-model="form.returnTime" type="time" step="900" required />
      </div>
    </FormRow>
    <p v-if="dateError" class="wtrip__error" role="alert"><i class="fa-solid fa-circle-exclamation"></i> {{ dateError }}</p>

    <FormRow basis="200px">
      <div>
        <label for="wi-pl">{{ t.pickupLocation }}</label>
        <select id="wi-pl" v-model="form.pickupLocation">
          <option v-for="l in locationOptions" :key="l.code" :value="l.code">{{ locationLabel(l.code) }}</option>
        </select>
      </div>
      <div v-if="!form.sameReturn">
        <label for="wi-rl">{{ t.returnLocation }}</label>
        <select id="wi-rl" v-model="form.returnLocation">
          <option v-for="l in locationOptions" :key="l.code" :value="l.code">{{ locationLabel(l.code) }}</option>
        </select>
      </div>
    </FormRow>
    <ToggleSwitch v-model="form.sameReturn" :label="t.sameReturn" small />
  </fieldset>
</template>

<style scoped lang="scss">
.wtrip {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  @include flex(column, stretch, flex-start, 0.9rem);

  &__legend {
    font-family: $font-principal;
    font-size: 0.9rem;
    font-weight: 800;
    color: $ink;
    padding: 0;
    margin-bottom: 0.2rem;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }

    &--inner {
      margin-top: 0.4rem;
    }
  }

  &__err :deep(select) {
    border-color: $danger;
  }

  &__error {
    font-size: 0.8rem;
    font-weight: 600;
    color: $danger;
    @include flex(row, center, flex-start, 0.4rem);
  }
}
</style>
