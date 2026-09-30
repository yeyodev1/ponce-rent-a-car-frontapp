<script setup lang="ts">
import { computed, watch } from 'vue'
import FormRow from '../../FormRow.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { walkInCopy as t } from '@/config/admin'
import { countryOptions } from '@/composables/booking/countries'
import type { WalkInForm } from '@/composables/admin/useWalkIn'

/** Datos del conductor principal; con ellos se crea o reutiliza la ficha del cliente. */
const props = defineProps<{ form: WalkInForm; tried: boolean; licenseProblem: '' | 'invalid' | 'expired' }>()
const countries = countryOptions('es')
const d = computed(() => props.form.driver)
const bad = (ok: boolean) => props.tried && !ok
// La vencida se avisa apenas se elige la fecha; lo incompleto, al intentar crear.
const licenseMsg = computed(() =>
  props.licenseProblem === 'expired' ? t.licenseExpired : props.tried && props.licenseProblem ? t.licenseInvalid : '',
)

// El país de emisión sigue al de residencia mientras no se cambie a mano.
watch(
  () => props.form.driver.country,
  (country, previous) => {
    const drv = props.form.driver
    if (!drv.licenseCountry || drv.licenseCountry === previous) drv.licenseCountry = country
  },
)
</script>

<template>
  <fieldset class="wdrv">
    <legend class="wdrv__legend"><i class="fa-solid fa-id-card"></i> {{ t.driver }}</legend>
    <div :class="{ 'wdrv__err': bad(d.name.trim().length > 1) }">
      <label for="wi-name">{{ t.driverName }} *</label>
      <input id="wi-name" v-model="d.name" type="text" autocomplete="off" />
    </div>
    <FormRow basis="140px">
      <div class="wdrv__doctype">
        <label for="wi-doctype">{{ t.docType }}</label>
        <select id="wi-doctype" v-model="d.documentType">
          <option value="cedula">{{ t.cedula }}</option>
          <option value="passport">{{ t.passport }}</option>
        </select>
      </div>
      <div :class="{ 'wdrv__err': bad(d.documentNumber.trim().length > 3) }">
        <label for="wi-doc">{{ t.docNumber }} *</label>
        <input id="wi-doc" v-model="d.documentNumber" type="text" :inputmode="d.documentType === 'cedula' ? 'numeric' : 'text'" autocomplete="off" />
      </div>
    </FormRow>
    <div :class="{ 'wdrv__err': bad(/\S+@\S+\.\S+/.test(d.email)) }">
      <label for="wi-email">{{ t.email }} *</label>
      <input id="wi-email" v-model="d.email" type="email" autocomplete="off" />
    </div>
    <PhoneInput id="wi-phone" v-model="d.phone" :label="`${t.phone} *`" :invalid="bad(Boolean(d.phone))" />
    <div>
      <label for="wi-country">{{ t.country }}</label>
      <select id="wi-country" v-model="d.country">
        <optgroup label="Frecuentes">
          <option v-for="c in countries.frequent" :key="`f-${c.code}`" :value="c.code">{{ c.name }}</option>
        </optgroup>
        <optgroup label="Otros">
          <option v-for="c in countries.rest" :key="c.code" :value="c.code">{{ c.name }}</option>
        </optgroup>
      </select>
    </div>
    <FormRow basis="140px">
      <div :class="{ 'wdrv__err': tried && licenseProblem === 'invalid' }">
        <label for="wi-lic">{{ t.licenseNumber }} *</label>
        <input id="wi-lic" v-model="d.licenseNumber" type="text" autocomplete="off" class="wdrv__mono" />
      </div>
      <div :class="{ 'wdrv__err': licenseProblem === 'expired' || (tried && !d.licenseExpiresAt) }">
        <label for="wi-lic-exp">{{ t.licenseExpiresAt }} *</label>
        <input id="wi-lic-exp" v-model="d.licenseExpiresAt" type="date" />
      </div>
    </FormRow>
    <div>
      <label for="wi-lic-country">{{ t.licenseCountry }}</label>
      <select id="wi-lic-country" v-model="d.licenseCountry">
        <optgroup label="Frecuentes">
          <option v-for="c in countries.frequent" :key="`lf-${c.code}`" :value="c.code">{{ c.name }}</option>
        </optgroup>
        <optgroup label="Otros">
          <option v-for="c in countries.rest" :key="`l-${c.code}`" :value="c.code">{{ c.name }}</option>
        </optgroup>
      </select>
    </div>
    <p v-if="licenseMsg" class="wdrv__msg" role="alert"><i class="fa-solid fa-triangle-exclamation"></i> {{ licenseMsg }}</p>
  </fieldset>
</template>

<style scoped lang="scss">
.wdrv {
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
  }

  &__err :deep(input) {
    border-color: $danger;
  }

  &__mono {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__msg {
    font-size: 0.8rem;
    font-weight: 700;
    color: $danger;
  }
}
</style>
