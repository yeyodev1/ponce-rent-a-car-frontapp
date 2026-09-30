<script setup lang="ts">
import { computed } from 'vue'
import FormRow from '@/components/admin/FormRow.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { licenseCopy as c } from '@/config/admin'
import { adminCountries } from '@/composables/admin/useLicense'
import type { CustomerForm } from '@/composables/admin/useCustomerEdit'

/** Contacto, licencia y notas del cliente. Nombre y documento van atados a los documentos verificados. */
const props = defineProps<{ form: CustomerForm; errors: Partial<Record<keyof CustomerForm, string>> }>()
const countries = computed(() => adminCountries())
const err = (k: keyof CustomerForm) => props.errors[k] || ''
</script>

<template>
  <div class="cform">
    <div>
      <label for="cu-name">{{ c.name }}</label>
      <input id="cu-name" v-model="form.name" type="text" autocomplete="off" :aria-invalid="!!err('name')" />
      <p v-if="err('name')" class="cform__err">{{ err('name') }}</p>
    </div>
    <div>
      <label for="cu-email">{{ c.email }}</label>
      <input id="cu-email" v-model="form.email" type="email" autocomplete="off" :aria-invalid="!!err('email')" />
      <p v-if="err('email')" class="cform__err">{{ err('email') }}</p>
    </div>
    <PhoneInput id="cu-phone" v-model="form.phone" :label="c.phone" :invalid="!!err('phone')" />

    <fieldset class="cform__group">
      <legend><i class="fa-solid fa-id-card"></i> {{ c.title }}</legend>
      <div>
        <label for="cu-lic">{{ c.number }}</label>
        <input id="cu-lic" v-model="form.licenseNumber" type="text" autocomplete="off" class="cform__mono"
          :aria-invalid="!!err('licenseNumber')" />
        <p v-if="err('licenseNumber')" class="cform__err">{{ err('licenseNumber') }}</p>
      </div>
      <FormRow basis="160px">
        <div>
          <label for="cu-lic-exp">{{ c.expiresAt }}</label>
          <input id="cu-lic-exp" v-model="form.licenseExpiresAt" type="date" />
        </div>
        <div>
          <label for="cu-lic-country">{{ c.country }}</label>
          <select id="cu-lic-country" v-model="form.licenseCountry">
            <optgroup label="Frecuentes">
              <option v-for="o in countries.frequent" :key="`f-${o.code}`" :value="o.code">{{ o.name }}</option>
            </optgroup>
            <optgroup label="Todos los países">
              <option v-for="o in countries.rest" :key="o.code" :value="o.code">{{ o.name }}</option>
            </optgroup>
          </select>
        </div>
      </FormRow>
      <p class="cform__hint">{{ c.clearHint }}</p>
    </fieldset>

    <div>
      <label for="cu-notes">{{ c.notes }}</label>
      <textarea id="cu-notes" v-model="form.notes" rows="3"></textarea>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cform {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__group {
    @include flex(column, stretch, flex-start, 0.9rem);
    border: 1px solid $line;
    border-radius: 12px;
    padding: 0.9rem;
    margin: 0;

    legend {
      padding: 0 0.3rem;
      font-size: 0.82rem;
      font-weight: 800;
      color: $ink-soft;
    }
  }

  &__mono {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__err {
    margin-top: 0.3rem;
    font-size: 0.76rem;
    font-weight: 700;
    color: $danger;
  }

  &__hint {
    font-size: 0.76rem;
    color: $ink-muted;
  }
}
</style>
