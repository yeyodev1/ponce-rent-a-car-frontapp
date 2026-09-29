<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import { useRouteA } from '@/composables/useRouteA'

/** "Te llamamos": solo nombre y teléfono, con el prefijo de Ecuador editable. */
const emit = defineEmits<{ cancel: [] }>()
const { t } = useI18n()
const { requestCallback } = useRouteA()

const name = ref('')
const prefix = ref('+593')
const number = ref('')
const sending = ref(false)
const error = ref('')
const touched = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const digits = computed(() => number.value.replace(/\D/g, '').replace(/^0+/, ''))
const phoneValid = computed(() => digits.value.length >= 7 && digits.value.length <= 12)
const nameValid = computed(() => name.value.trim().length >= 2)

onMounted(() => nameInput.value?.focus({ preventScroll: true }))

async function submit() {
  touched.value = true
  if (!nameValid.value || !phoneValid.value || sending.value) return
  sending.value = true
  error.value = ''
  const code = prefix.value.replace(/[^\d+]/g, '') || '+593'
  const full = `${code.startsWith('+') ? code : `+${code}`}${digits.value}`
  error.value = await requestCallback(name.value.trim(), full)
  sending.value = false
}
</script>

<template>
  <form class="cb" novalidate @submit.prevent="submit">
    <div class="cb__field">
      <label for="cb-name">{{ t('common.channel.callbackName') }}</label>
      <input
        id="cb-name"
        ref="nameInput"
        v-model="name"
        type="text"
        autocomplete="name"
        enterkeyhint="next"
        :aria-invalid="touched && !nameValid"
      />
      <p v-if="touched && !nameValid" class="cb__err">{{ t('common.errors.required') }}</p>
    </div>

    <div class="cb__field">
      <label for="cb-phone">{{ t('common.channel.callbackPhone') }}</label>
      <div class="cb__phone">
        <input
          v-model="prefix"
          class="cb__prefix"
          type="tel"
          inputmode="tel"
          autocomplete="tel-country-code"
          :aria-label="t('routeA.channel.prefix')"
        />
        <input
          id="cb-phone"
          v-model="number"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
          enterkeyhint="send"
          placeholder="99 123 4567"
          :aria-invalid="touched && !phoneValid"
        />
      </div>
      <p v-if="touched && !phoneValid" class="cb__err">{{ t('common.errors.phone') }}</p>
    </div>

    <p v-if="error" class="cb__err cb__err--box" role="alert">{{ error }}</p>

    <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="sending">
      <i :class="sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-phone-volume'"></i>
      {{ t('common.channel.callbackSubmit') }}
    </button>
    <button type="button" class="cb__cancel" @click="emit('cancel')">{{ t('routeA.channel.cancel') }}</button>
  </form>
</template>

<style scoped lang="scss">
.cb {
  @include flex(column, stretch, flex-start, 0.85rem);
  padding: 1.1rem 1rem 0.6rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1.5px solid $accent;
  box-shadow: 0 0 0 4px rgba($accent, 0.18);

  &__phone {
    @include flex(row, stretch, flex-start, 0.5rem);
  }

  &__prefix {
    flex: 0 0 5.2rem;
    text-align: center;
    font-weight: 700;
  }

  input[aria-invalid='true'] {
    border-color: $danger;
  }

  &__err {
    margin-top: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: $danger;

    &--box {
      margin: 0;
      padding: 0.6rem 0.8rem;
      border-radius: $radius-sm;
      background: $danger-bg;
    }
  }

  &__cancel {
    align-self: center;
    min-height: $tap;
    padding-inline: 1rem;
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;
    @include focus-ring($blue);
  }
}
</style>
