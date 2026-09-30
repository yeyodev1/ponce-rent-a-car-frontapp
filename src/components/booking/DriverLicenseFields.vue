<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import { booking } from '@/composables/booking/useBookingState'
import { fieldError, touched } from '@/composables/booking/useDriverForm'
import { countryOptions } from '@/composables/booking/countries'
import { ymdInGuayaquil } from '@/utils/format'

/**
 * Licencia de conducir dentro del paso del conductor. La vigencia se compara
 * con la devolución elegida: el error aparece aquí mismo, antes de apartar.
 */
const { t, locale } = useI18n()
const d = booking.driver

const countries = computed(() => countryOptions(locale.value))
const today = ymdInGuayaquil()

// El país de emisión sigue al de residencia mientras la persona no lo cambie a mano.
watch(
  () => d.country,
  (country, previous) => {
    if (!d.licenseCountry || d.licenseCountry === previous) d.licenseCountry = country
  },
)

const blur = (name: string) => (touched[name] = true)
</script>

<template>
  <fieldset class="license">
    <legend class="license__title"><i class="fa-solid fa-id-card"></i>{{ t('booking.driver.licenseTitle') }}</legend>

    <div class="field" :class="{ 'field--err': fieldError('licenseNumber') }">
      <label for="drv-license">{{ t('booking.driver.licenseNumber') }}</label>
      <input id="drv-license" v-model="d.licenseNumber" type="text" maxlength="24" autocomplete="off"
        autocapitalize="characters" spellcheck="false" :aria-invalid="!!fieldError('licenseNumber')"
        aria-describedby="drv-license-err" @blur="blur('licenseNumber')" />
      <p v-if="fieldError('licenseNumber')" id="drv-license-err" class="field__err">{{ fieldError('licenseNumber') }}</p>
    </div>

    <div class="license__row">
      <div class="field license__cell" :class="{ 'field--err': fieldError('licenseExpiresAt') }">
        <label for="drv-license-exp">{{ t('booking.driver.licenseExpires') }}</label>
        <input id="drv-license-exp" v-model="d.licenseExpiresAt" type="date" :min="today"
          :aria-invalid="!!fieldError('licenseExpiresAt')" aria-describedby="drv-license-exp-msg"
          @blur="blur('licenseExpiresAt')" @change="blur('licenseExpiresAt')" />
        <p v-if="fieldError('licenseExpiresAt')" id="drv-license-exp-msg" class="field__err" role="alert">
          {{ fieldError('licenseExpiresAt') }}
        </p>
        <p v-else id="drv-license-exp-msg" class="field__hint">{{ t('booking.driver.licenseExpiresHint') }}</p>
      </div>

      <div class="field license__cell">
        <label for="drv-license-country">{{ t('booking.driver.licenseCountry') }}</label>
        <div class="field__select">
          <select id="drv-license-country" v-model="d.licenseCountry">
            <optgroup :label="t('booking.driver.frequent')">
              <option v-for="c in countries.frequent" :key="`f-${c.code}`" :value="c.code">{{ c.name }}</option>
            </optgroup>
            <optgroup :label="t('booking.driver.others')">
              <option v-for="c in countries.rest" :key="c.code" :value="c.code">{{ c.name }}</option>
            </optgroup>
          </select>
          <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.license {
  @include flex(column, stretch, flex-start, 1.1rem);
  border: 0;
  padding: 1.1rem 0 0;
  margin: 0;
  border-top: 1px solid $line;

  &__title {
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 700;
    font-size: $text-sm;
    color: $ink;
    padding: 0;
    margin-bottom: 1.1rem;

    i {
      color: $accent;
    }
  }

  &__row {
    @include flex(column, stretch, flex-start, 1.1rem);

    @include from('sm') {
      flex-direction: row;
    }
  }

  &__cell {
    flex: 1 1 0;
    min-width: 0;
  }
}

.field {
  input[type='date'] {
    min-height: $tap;
  }

  &--err input,
  &--err select {
    border-color: $danger;
  }

  &__err,
  &__hint {
    margin-top: 0.35rem;
    font-size: $text-xs;
  }

  &__err {
    color: $danger;
    font-weight: 600;
  }

  &__hint {
    color: $ink-muted;
  }

  &__select {
    position: relative;

    select {
      appearance: none;
      padding-right: 2.5rem;
    }

    i {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8rem;
      color: $ink-muted;
      pointer-events: none;
    }
  }
}
</style>
