<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import { rules, useForm } from '@/composables/content/useForm'
import { useLeadSubmit } from '@/composables/content/useLeadSubmit'
import FormField from './FormField.vue'
import PhoneField from './PhoneField.vue'
import FormSuccess from './FormSuccess.vue'

/** Formulario breve de contacto → lead "contact". */
const { t } = useI18n()
const { send } = useLeadSubmit('contact')
const code = ref('')

const {
  form,
  errors,
  submitting,
  apiError,
  done,
  validateField: v,
  revalidate: r,
  submit,
  reset,
} = useForm(
  { name: '', phone: '', email: '', comments: '' },
  {
    name: rules.required,
    phone: rules.e164,
    email: rules.email,
    comments: rules.required,
  },
  'contact-form',
)

function onSubmit() {
  return submit(async () => {
    const lead = await send({
      name: form.name.trim(),
      phone: form.phone,
      email: form.email.trim() || undefined,
      comments: form.comments.trim(),
    })
    code.value = lead.code
  })
}
</script>

<template>
  <div class="cform">
    <Transition name="fade" mode="out-in">
      <FormSuccess
        v-if="done"
        :title="t('content.contact.successTitle')"
        :text="t('content.contact.successText')"
        :code="code"
      >
        <button type="button" class="btn btn--ghost" @click="reset">
          {{ t('content.form.another') }}
        </button>
      </FormSuccess>
      <form v-else id="contact-form" class="cform__form" novalidate @submit.prevent="onSubmit">
        <FormField id="cf-name" v-slot="a" :label="t('content.form.name')" :error="errors.name">
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
        <div class="cform__row">
          <PhoneField
            id="cf-phone"
            v-model="form.phone"
            :label="t('content.form.phone')"
            :error="errors.phone"
            @blur="v('phone')"
            @update:model-value="r('phone')"
          />
          <FormField
            id="cf-email"
            v-slot="a"
            :label="t('content.form.email')"
            :error="errors.email"
            optional
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
        </div>
        <FormField
          id="cf-msg"
          v-slot="a"
          :label="t('content.contact.message')"
          :error="errors.comments"
        >
          <textarea
            v-model="form.comments"
            :id="a.id"
            :aria-describedby="a.describedby"
            :aria-invalid="a.invalid"
            rows="4"
            :placeholder="t('content.contact.messagePlaceholder')"
            @blur="v('comments')"
            @input="r('comments')"
          ></textarea>
        </FormField>
        <p v-if="apiError" class="cform__api" role="alert">
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
          {{ submitting ? t('content.form.sending') : t('content.contact.submit') }}
        </button>
      </form>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.cform {
  @include card;
  border-radius: $radius-lg;
  padding: 1.5rem 1.15rem;
  box-shadow: $shadow-md;

  @include from('md') {
    padding: 2rem;
  }

  &__form {
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__row {
    @include flex-cards(200px, 1rem);
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
