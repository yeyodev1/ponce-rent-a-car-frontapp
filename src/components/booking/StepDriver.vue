<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import { booking } from '@/composables/booking/useBookingState'
import { fieldError, touched } from '@/composables/booking/useDriverForm'
import { countryOptions } from '@/composables/booking/countries'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import DriverLicenseFields from './DriverLicenseFields.vue'
import { noUnits } from '@/composables/booking/useBookingFlow'

/** Paso 6: datos del conductor. Validación al salir de cada campo, con el teclado correcto en móvil. */
const emit = defineEmits<{ goto: [step: number] }>()
const { t, locale } = useI18n()
const d = booking.driver

const countries = computed(() => countryOptions(locale.value))
const isCedula = computed(() => d.documentType === 'cedula')

// Fuera de Ecuador lo normal es pasaporte. El teléfono no se toca: su país
// se elige en el propio campo (formato internacional, Ecuador por defecto).
watch(
  () => d.country,
  (c) => {
    if (c !== 'EC' && d.documentType === 'cedula' && !d.documentNumber) d.documentType = 'passport'
  },
)

const blur = (name: string) => (touched[name] = true)
</script>

<template>
  <form class="driver" novalidate @submit.prevent>
    <Transition name="rise">
      <div v-if="noUnits" class="driver__alert" role="alert">
        <i class="fa-solid fa-car-burst"></i>
        <div>
          <strong>{{ t('booking.driver.noUnitsTitle') }}</strong>
          <p>{{ t('booking.driver.noUnitsBody') }}</p>
          <button type="button" class="btn btn--dark btn--sm" @click="emit('goto', 2)">
            {{ t('booking.driver.noUnitsCta') }}
          </button>
        </div>
      </div>
    </Transition>

    <div class="field" :class="{ 'field--err': fieldError('name') }">
      <label for="drv-name">{{ t('booking.driver.name') }}</label>
      <input id="drv-name" v-model="d.name" type="text" autocomplete="name" autocapitalize="words"
        :placeholder="t('booking.driver.namePh')" :aria-invalid="!!fieldError('name')" @blur="blur('name')" />
      <p v-if="fieldError('name')" class="field__err">{{ fieldError('name') }}</p>
    </div>

    <div class="field">
      <span class="field__label">{{ t('booking.driver.docType') }}</span>
      <div class="seg" role="radiogroup" :aria-label="t('booking.driver.docType')">
        <span class="seg__thumb" :class="{ 'seg__thumb--right': !isCedula }" aria-hidden="true"></span>
        <button type="button" class="seg__opt" role="radio" :aria-checked="isCedula" :class="{ 'seg__opt--on': isCedula }"
          @click="d.documentType = 'cedula'">
          <i class="fa-regular fa-id-card"></i>{{ t('booking.driver.cedula') }}
        </button>
        <button type="button" class="seg__opt" role="radio" :aria-checked="!isCedula" :class="{ 'seg__opt--on': !isCedula }"
          @click="d.documentType = 'passport'">
          <i class="fa-solid fa-passport"></i>{{ t('booking.driver.passport') }}
        </button>
      </div>
    </div>

    <div class="field" :class="{ 'field--err': fieldError('documentNumber') }">
      <label for="drv-doc">{{ t('booking.driver.docNumber') }}</label>
      <input id="drv-doc" v-model="d.documentNumber" type="text" :inputmode="isCedula ? 'numeric' : 'text'"
        :maxlength="isCedula ? 10 : 20" autocomplete="off" autocapitalize="characters"
        :aria-invalid="!!fieldError('documentNumber')" @blur="blur('documentNumber')" />
      <p v-if="fieldError('documentNumber')" class="field__err">{{ fieldError('documentNumber') }}</p>
    </div>

    <div class="field" :class="{ 'field--err': fieldError('email') }">
      <label for="drv-email">{{ t('booking.driver.email') }}</label>
      <input id="drv-email" v-model="d.email" type="email" inputmode="email" autocomplete="email" autocapitalize="off"
        spellcheck="false" :aria-invalid="!!fieldError('email')" @blur="blur('email')" />
      <p v-if="fieldError('email')" class="field__err">{{ fieldError('email') }}</p>
      <p v-else class="field__hint">{{ t('booking.driver.emailHint') }}</p>
    </div>

    <div class="field" :class="{ 'field--err': fieldError('phone') }">
      <PhoneInput id="drv-phone" v-model="d.phone" :label="t('booking.driver.phone')" :invalid="!!fieldError('phone')"
        @blur="blur('phone')" />
    </div>

    <div class="field" :class="{ 'field--err': fieldError('country') }">
      <label for="drv-country">{{ t('booking.driver.country') }}</label>
      <div class="field__select">
        <select id="drv-country" v-model="d.country" autocomplete="country" @blur="blur('country')">
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

    <DriverLicenseFields />

    <p class="driver__privacy"><i class="fa-solid fa-lock"></i>{{ t('booking.driver.privacy') }}</p>
  </form>
</template>

<style scoped lang="scss">
.driver {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__alert {
    @include flex(row, flex-start, flex-start, 0.8rem);
    padding: 1rem;
    border-radius: $radius-md;
    background: $danger-bg;
    color: $ink;

    > i {
      color: $danger;
      font-size: 1.3rem;
      margin-top: 0.15rem;
    }

    p {
      font-size: $text-sm;
      color: $ink-soft;
      margin: 0.2rem 0 0.7rem;
    }
  }

  &__privacy {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-xs;
    color: $ink-muted;
  }
}

.field {
  &__label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
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
    animation: field-shake 0.35s $ease;
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

.seg {
  position: relative;
  @include flex(row, stretch, flex-start);
  padding: 4px;
  border-radius: $radius-pill;
  background: $sand;

  &__thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    border-radius: $radius-pill;
    background: $surface;
    box-shadow: $shadow-sm;
    transition: transform 0.45s $ease-spring;

    &--right {
      transform: translateX(100%);
    }
  }

  &__opt {
    position: relative;
    flex: 1;
    min-height: $tap;
    @include flex(row, center, center, 0.5rem);
    font-weight: 700;
    font-size: $text-sm;
    color: $ink-muted;
    transition: color 0.25s ease;

    &--on {
      color: $ink;
    }
  }
}

@keyframes field-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(3px);
  }
}
</style>
