<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import { whatsappLink } from '@/config/site'
import { publicService } from '@/services/public.service'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import type { ApiError, PublicReservation } from '@/types'

/**
 * El cliente (sin cuenta) corrige su correo o su WhatsApp desde el enlace
 * seguro. Nombre y documento no: van atados a los documentos verificados.
 */
const props = defineProps<{ res: PublicReservation; token: string }>()
const emit = defineEmits<{ updated: [res: PublicReservation] }>()
const { t } = useI18n()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const open = ref(false)
const email = ref(props.res.driver.email)
const phone = ref(props.res.driver.phone || '')
const status = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const message = ref('')
const tried = ref(false)

watch(
  () => props.res.driver,
  (d) => {
    email.value = d.email
    phone.value = d.phone || ''
  },
)

const emailError = computed(() => (tried.value && !EMAIL_RE.test(email.value.trim()) ? t('common.errors.email') : ''))
const phoneError = computed(() => (tried.value && !phone.value ? t('common.errors.phone') : ''))
const changes = computed(() => {
  const out: { email?: string; phone?: string } = {}
  const e = email.value.trim().toLowerCase()
  if (e !== props.res.driver.email) out.email = e
  if (phone.value && phone.value !== (props.res.driver.phone || '')) out.phone = phone.value
  return out
})
const advisorLink = computed(() => whatsappLink(t('booking.reservation.updateContact.whatsappMsg', { code: props.res.code })))

async function save() {
  tried.value = true
  if (emailError.value || phoneError.value) return
  if (!Object.keys(changes.value).length) {
    status.value = 'saved'
    message.value = t('booking.reservation.updateContact.noChanges')
    return
  }
  status.value = 'saving'
  try {
    const updated = await publicService.updateContact(props.res.code, props.token, changes.value)
    emit('updated', updated)
    status.value = 'saved'
    message.value = t('booking.reservation.updateContact.saved')
    tried.value = false
  } catch (e) {
    status.value = 'error'
    message.value = (e as ApiError).message || t('booking.reservation.updateContact.error')
  }
}
</script>

<template>
  <section class="contact">
    <button type="button" class="contact__toggle" :aria-expanded="open" aria-controls="contact-form" @click="open = !open">
      <span class="contact__icon"><i class="fa-regular fa-address-card"></i></span>
      <span class="contact__head">
        <strong>{{ t('booking.reservation.updateContact.title') }}</strong>
        <small>{{ t('booking.reservation.updateContact.subtitle') }}</small>
      </span>
      <i class="fa-solid fa-chevron-down contact__chev" :class="{ 'contact__chev--open': open }" aria-hidden="true"></i>
    </button>

    <form v-show="open" id="contact-form" class="contact__form" novalidate @submit.prevent="save">
      <div class="field" :class="{ 'field--err': emailError }">
        <label for="contact-email">{{ t('booking.reservation.updateContact.email') }}</label>
        <input id="contact-email" v-model="email" type="email" inputmode="email" autocomplete="email"
          autocapitalize="off" spellcheck="false" :aria-invalid="!!emailError" />
        <p v-if="emailError" class="field__err">{{ emailError }}</p>
      </div>

      <div class="field">
        <PhoneInput id="contact-phone" v-model="phone" :label="t('booking.reservation.updateContact.phone')"
          :invalid="!!phoneError" enterkeyhint="done" />
      </div>

      <p v-if="status === 'saved' || status === 'error'" class="contact__msg" :class="`contact__msg--${status}`"
        role="status">
        <i :class="status === 'saved' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'"></i>{{ message }}
      </p>

      <button type="submit" class="btn btn--primary btn--block" :disabled="status === 'saving'">
        <i v-if="status === 'saving'" class="fa-solid fa-spinner fa-spin"></i>
        {{ status === 'saving' ? t('booking.reservation.updateContact.saving') : t('booking.reservation.updateContact.save') }}
      </button>

      <p class="contact__note">
        <i class="fa-solid fa-circle-info"></i>
        <span>
          {{ t('booking.reservation.updateContact.advisorNote') }}
          <a :href="advisorLink" target="_blank" rel="noopener">{{ t('booking.reservation.updateContact.advisorCta') }}</a>
        </span>
      </p>
    </form>
  </section>
</template>

<style scoped lang="scss">
.contact {
  border: 1px solid $line;
  border-radius: $radius-lg;
  background: $surface;
  overflow: hidden;

  &__toggle {
    width: 100%;
    min-height: $tap;
    @include flex(row, center, flex-start, 0.8rem);
    padding: 1rem;
    text-align: left;
  }

  &__icon {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $sand;
    color: $ink-soft;
    @include flex(row, center, center);
  }

  &__head {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, flex-start, 0.15rem);

    strong {
      font-size: $text-sm;
      color: $ink;
    }

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__chev {
    color: $ink-muted;
    transition: transform 0.3s $ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, 1rem);
    padding: 0 1rem 1.1rem;
  }

  &__msg {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    font-weight: 600;

    &--saved {
      color: $success;
    }

    &--error {
      color: $danger;
    }
  }

  &__note {
    @include flex(row, flex-start, flex-start, 0.5rem);
    font-size: $text-xs;
    color: $ink-muted;

    i {
      margin-top: 0.15rem;
    }

    a {
      color: $ink;
      font-weight: 700;
      text-decoration: underline;
    }
  }
}

.field {
  &--err input {
    border-color: $danger;
  }

  &__err {
    margin-top: 0.35rem;
    font-size: $text-xs;
    color: $danger;
    font-weight: 600;
  }
}
</style>
