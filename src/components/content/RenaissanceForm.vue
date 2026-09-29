<script setup lang="ts">
import { useI18n } from '@/i18n'
import { publicService } from '@/services/public.service'
import { track } from '@/composables/useAnalytics'
import { all, rules, useForm } from '@/composables/content/useForm'
import FormField from './FormField.vue'
import PhoneField from './PhoneField.vue'
import FormSuccess from './FormSuccess.vue'

/** Registro de interés en el club: tres campos y listo. */
const { t, locale } = useI18n()

const {
  form,
  errors,
  submitting,
  apiError,
  done,
  validateField: v,
  revalidate: r,
  submit,
} = useForm(
  { name: '', email: '', phone: '' },
  {
    name: rules.required,
    email: all(rules.required, rules.email),
    phone: rules.e164,
  },
  'club-form-el',
)

function onSubmit() {
  return submit(async () => {
    await publicService.renaissance({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      language: locale.value,
    })
    track('lead_form_submit', { source: 'renaissance' })
  })
}
</script>

<template>
  <div class="rform">
    <Transition name="fade" mode="out-in">
      <FormSuccess
        v-if="done"
        dark
        :title="t('content.renaissance.successTitle')"
        :text="t('content.renaissance.successText')"
      />
      <form v-else id="club-form-el" class="rform__form" novalidate @submit.prevent="onSubmit">
        <FormField
          id="rf-name"
          v-slot="a"
          dark
          :label="t('content.form.name')"
          :error="errors.name"
        >
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
        <FormField
          id="rf-email"
          v-slot="a"
          dark
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
            @blur="v('email')"
            @input="r('email')"
          />
        </FormField>
        <PhoneField
          id="rf-phone"
          v-model="form.phone"
          dark
          :label="t('content.form.phone')"
          :error="errors.phone"
          @blur="v('phone')"
          @update:model-value="r('phone')"
        />
        <p v-if="apiError" class="rform__api" role="alert">{{ apiError }}</p>
        <button type="submit" class="rform__submit" :disabled="submitting" :aria-busy="submitting">
          <i
            :class="submitting ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-crown'"
            aria-hidden="true"
          ></i>
          {{ submitting ? t('content.form.sending') : t('content.renaissance.submit') }}
        </button>
        <p class="rform__note">{{ t('content.renaissance.optional') }}</p>
      </form>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
$gold: #e9c46a;

.rform {
  padding: 1.5rem 1.2rem;
  border-radius: $radius-lg;
  border: 1px solid rgba($gold, 0.3);
  background: rgba($on-dark, 0.03);
  backdrop-filter: blur(10px);

  @include from('md') {
    padding: 2.25rem;
  }

  &__form {
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__api {
    padding: 0.8rem 1rem;
    border-radius: $radius-sm;
    background: rgba($danger, 0.18);
    color: #ffb3bc;
    font-weight: 600;
    font-size: $text-sm;
  }

  &__submit {
    min-height: $tap-lg;
    @include flex(row, center, center, 0.6rem);
    border-radius: $radius-pill;
    background: linear-gradient(120deg, #f7e2a6, $gold 50%, #c9973a);
    color: #1a1204;
    font-weight: 800;
    letter-spacing: 0.04em;
    transition:
      transform 0.25s $ease,
      opacity 0.25s ease;

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__note {
    text-align: center;
    font-size: $text-xs;
    color: $on-dark-soft;
  }
}
</style>
