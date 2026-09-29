<script setup lang="ts">
import { useI18n } from '@/i18n'
import { MAX_PHOTOS, VEHICLE_TYPES, usePartnerForm } from '@/composables/content/usePartnerForm'
import FormField from './FormField.vue'
import PhoneField from './PhoneField.vue'
import FormSuccess from './FormSuccess.vue'
import PhotoPicker from './PhotoPicker.vue'

const { t } = useI18n()
const p = usePartnerForm()
const { form, errors, validateField: v, revalidate: r } = p
</script>

<template>
  <div class="pform">
    <Transition name="fade" mode="out-in">
      <FormSuccess
        v-if="p.done.value"
        :title="t('content.partner.successTitle')"
        :text="t('content.partner.successText')"
        :code="p.code.value"
      >
        <button type="button" class="btn btn--ghost" @click="p.resetAll">
          {{ t('content.form.another') }}
        </button>
      </FormSuccess>

      <form v-else id="partner-form" class="pform__form" novalidate @submit.prevent="p.onSubmit">
        <div class="pform__row">
          <FormField id="pf-name" v-slot="a" :label="t('content.form.name')" :error="errors.name">
            <input
              v-model="form.name"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="name"
              @blur="v('name')"
              @input="r('name')"
            />
          </FormField>
          <PhoneField
            id="pf-wa"
            v-model="form.whatsapp"
            :label="t('content.partner.whatsapp')"
            :error="errors.whatsapp"
            @blur="v('whatsapp')"
            @update:model-value="r('whatsapp')"
          />
        </div>
        <div class="pform__row">
          <FormField
            id="pf-city"
            v-slot="a"
            :label="t('content.partner.city')"
            :error="errors.city"
          >
            <input
              v-model="form.city"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="address-level2"
              @blur="v('city')"
              @input="r('city')"
            />
          </FormField>
          <FormField
            id="pf-type"
            v-slot="a"
            :label="t('content.partner.vehicleType')"
            :error="errors.vehicleType"
          >
            <select
              v-model="form.vehicleType"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              @blur="v('vehicleType')"
              @change="r('vehicleType')"
            >
              <option value="" disabled>{{ t('content.form.choose') }}</option>
              <option v-for="vt in VEHICLE_TYPES" :key="vt" :value="vt">
                {{ t(`content.partner.types.${vt}`) }}
              </option>
            </select>
          </FormField>
        </div>
        <div class="pform__row pform__row--3">
          <FormField
            id="pf-brand"
            v-slot="a"
            :label="t('content.partner.brand')"
            :error="errors.brand"
          >
            <input
              v-model="form.brand"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="off"
              placeholder="Kia"
              @blur="v('brand')"
              @input="r('brand')"
            />
          </FormField>
          <FormField
            id="pf-model"
            v-slot="a"
            :label="t('content.partner.model')"
            :error="errors.model"
          >
            <input
              v-model="form.model"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="off"
              placeholder="Sportage"
              @blur="v('model')"
              @input="r('model')"
            />
          </FormField>
          <FormField
            id="pf-year"
            v-slot="a"
            :label="t('content.partner.year')"
            :error="errors.year"
          >
            <input
              v-model="form.year"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              type="number"
              inputmode="numeric"
              min="1990"
              :max="p.maxYear"
              autocomplete="off"
              placeholder="2022"
              @blur="v('year')"
              @input="r('year')"
            />
          </FormField>
        </div>

        <PhotoPicker
          :photos="p.photos.value"
          :max="MAX_PHOTOS"
          :processing="p.processing.value"
          :error="p.photoError.value"
          @add="p.addPhotos"
          @remove="p.removePhoto"
        />

        <p class="pform__note">
          <i class="fa-solid fa-user-check" aria-hidden="true"></i>
          {{ t('content.partner.reviewNote') }}
        </p>
        <p v-if="p.apiError.value" class="pform__api" role="alert">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> {{ p.apiError.value }}
        </p>
        <button
          type="submit"
          class="btn btn--primary btn--lg btn--block"
          :disabled="p.submitting.value || p.processing.value"
          :aria-busy="p.submitting.value"
        >
          <i
            :class="
              p.submitting.value ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-paper-plane'
            "
            aria-hidden="true"
          ></i>
          {{ p.submitting.value ? t('content.form.sending') : t('content.partner.submit') }}
        </button>
      </form>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.pform {
  @include card;
  border-radius: $radius-lg;
  padding: 1.5rem 1.15rem;
  box-shadow: $shadow-md;

  @include from('md') {
    padding: 2.25rem;
  }

  &__form {
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__row {
    @include flex-cards(220px, 1rem);

    &--3 {
      @include flex-cards(150px, 1rem);
    }
  }

  &__note {
    @include flex(row, flex-start, flex-start, 0.6rem);
    padding: 0.85rem 1rem;
    border-radius: $radius-sm;
    background: $blue-soft;
    color: $blue-deep;
    font-size: $text-sm;
    font-weight: 600;

    i {
      margin-top: 0.2rem;
    }
  }

  &__api {
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.8rem 1rem;
    border-radius: $radius-sm;
    background: $danger-bg;
    color: $danger;
    font-weight: 600;
    font-size: $text-sm;
  }
}
</style>
