<script setup lang="ts">
import { useI18n } from '@/i18n'
import { DURATIONS, useBusinessForm } from '@/composables/content/useBusinessForm'
import FormField from './FormField.vue'
import PhoneField from './PhoneField.vue'
import FormSuccess from './FormSuccess.vue'

const { t } = useI18n()
const {
  form,
  errors,
  submitting,
  apiError,
  done,
  code,
  validateField,
  revalidate,
  onSubmit,
  reset,
} = useBusinessForm()
</script>

<template>
  <div class="bform">
    <Transition name="fade" mode="out-in">
      <FormSuccess
        v-if="done"
        :title="t('content.business.successTitle')"
        :text="t('content.business.successText')"
        :code="code"
      >
        <button type="button" class="btn btn--ghost" @click="reset">
          {{ t('content.form.another') }}
        </button>
      </FormSuccess>

      <form v-else id="business-form" class="bform__form" novalidate @submit.prevent="onSubmit">
        <div class="bform__row">
          <FormField
            id="bf-company"
            v-slot="a"
            :label="t('content.form.company')"
            :error="errors.company"
          >
            <input
              v-model="form.company"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="organization"
              @blur="validateField('company')"
              @input="revalidate('company')"
            />
          </FormField>
          <FormField
            id="bf-name"
            v-slot="a"
            :label="t('content.form.contactName')"
            :error="errors.name"
          >
            <input
              v-model="form.name"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              autocomplete="name"
              @blur="validateField('name')"
              @input="revalidate('name')"
            />
          </FormField>
        </div>
        <div class="bform__row">
          <PhoneField
            id="bf-phone"
            v-model="form.phone"
            :label="t('content.form.phone')"
            :error="errors.phone"
            @blur="validateField('phone')"
            @update:model-value="revalidate('phone')"
          />
          <FormField
            id="bf-email"
            v-slot="a"
            :label="t('content.form.email')"
            :error="errors.email"
          >
            <input
              v-model="form.email"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              type="email"
              inputmode="email"
              autocomplete="email"
              @blur="validateField('email')"
              @input="revalidate('email')"
            />
          </FormField>
        </div>
        <div class="bform__row">
          <FormField
            id="bf-vehicles"
            v-slot="a"
            :label="t('content.form.vehicles')"
            :error="errors.vehicles"
          >
            <input
              v-model="form.vehicles"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              type="number"
              inputmode="numeric"
              min="1"
              max="500"
              autocomplete="off"
              @blur="validateField('vehicles')"
              @input="revalidate('vehicles')"
            />
          </FormField>
          <FormField
            id="bf-duration"
            v-slot="a"
            :label="t('content.form.duration')"
            :error="errors.duration"
          >
            <select
              v-model="form.duration"
              :id="a.id"
              :aria-describedby="a.describedby"
              :aria-invalid="a.invalid"
              @blur="validateField('duration')"
              @change="revalidate('duration')"
            >
              <option value="" disabled>{{ t('content.form.choose') }}</option>
              <option v-for="d in DURATIONS" :key="d" :value="d">
                {{ t(`common.durations.${d}`) }}
              </option>
            </select>
          </FormField>
        </div>
        <FormField id="bf-comments" v-slot="a" :label="t('content.form.comments')" optional>
          <textarea
            v-model="form.comments"
            :id="a.id"
            rows="4"
            :placeholder="t('content.business.commentsPlaceholder')"
          ></textarea>
        </FormField>

        <p v-if="apiError" class="bform__api" role="alert">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> {{ apiError }}
        </p>
        <button
          type="submit"
          class="btn btn--primary btn--lg btn--block"
          :disabled="submitting"
          :aria-busy="submitting"
        >
          <i
            :class="submitting ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-paper-plane'"
            aria-hidden="true"
          ></i>
          {{ submitting ? t('content.form.sending') : t('content.business.submit') }}
        </button>
        <p class="bform__privacy">{{ t('content.form.privacy') }}</p>
      </form>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.bform {
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

  &__privacy {
    font-size: $text-xs;
    color: $ink-muted;
    text-align: center;
  }
}
</style>
