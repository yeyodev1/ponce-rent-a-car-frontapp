<script setup lang="ts">
import { useI18n } from '@/i18n'

/**
 * Aceptación electrónica: casilla + nombre + documento. Los campos llegan
 * vacíos a propósito: escribirlos es parte del consentimiento.
 */
defineProps<{
  errors: { name: string; documentNumber: string; checked: string }
  submitting: boolean
  note?: string
}>()
const emit = defineEmits<{ submit: [] }>()
const checked = defineModel<boolean>('checked', { required: true })
const name = defineModel<string>('name', { required: true })
const documentNumber = defineModel<string>('documentNumber', { required: true })
const { t } = useI18n()
</script>

<template>
  <form class="caccept" novalidate @submit.prevent="emit('submit')">
    <label class="caccept__check" :class="{ 'caccept__check--err': errors.checked }">
      <input v-model="checked" type="checkbox" />
      <span class="caccept__box" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
      <span>{{ t('booking.contract.check') }}</span>
    </label>
    <p v-if="errors.checked" class="caccept__err" role="alert">{{ errors.checked }}</p>

    <div class="caccept__field" :class="{ 'caccept__field--err': errors.name }">
      <label for="ct-name">{{ t('booking.contract.name') }}</label>
      <input id="ct-name" v-model="name" type="text" autocomplete="off" autocapitalize="words" spellcheck="false"
        :placeholder="t('booking.contract.namePh')" :aria-invalid="!!errors.name" />
      <p v-if="errors.name" class="caccept__err" role="alert">{{ errors.name }}</p>
    </div>

    <div class="caccept__field" :class="{ 'caccept__field--err': errors.documentNumber }">
      <label for="ct-doc">{{ t('booking.contract.document') }}</label>
      <input id="ct-doc" v-model="documentNumber" type="text" autocomplete="off" autocapitalize="characters"
        spellcheck="false" :placeholder="t('booking.contract.documentPh')" :aria-invalid="!!errors.documentNumber" />
      <p v-if="errors.documentNumber" class="caccept__err" role="alert">{{ errors.documentNumber }}</p>
    </div>

    <p class="caccept__hint">{{ note || t('booking.contract.hint') }}</p>

    <button type="submit" class="btn btn--primary btn--lg btn--block" :disabled="submitting">
      <i :class="submitting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-signature'"></i>
      {{ submitting ? t('booking.contract.accepting') : t('booking.contract.accept') }}
    </button>
  </form>
</template>

<style scoped lang="scss">
.caccept {
  @include flex(column, stretch, flex-start, 0.85rem);
  padding: 1rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1.5px solid rgba($blue, 0.3);

  &__check {
    @include flex(row, flex-start, flex-start, 0.7rem);
    min-height: $tap;
    font-weight: 700;
    color: $ink;
    cursor: pointer;

    input {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
    }

    input:focus-visible + .caccept__box {
      @include focus-ring($blue);
    }

    input:checked + .caccept__box {
      background: $blue;
      border-color: $blue;
      color: $surface;
    }

    &--err .caccept__box {
      border-color: $danger;
    }
  }

  &__box {
    flex: 0 0 24px;
    height: 24px;
    border-radius: 7px;
    border: 2px solid $line-strong;
    color: transparent;
    font-size: 0.75rem;
    @include flex(row, center, center);
    transition: background-color 0.18s ease, border-color 0.18s ease;
  }

  &__field label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__field--err input {
    border-color: $danger;
  }

  &__err {
    margin-top: 0.3rem;
    font-size: $text-xs;
    font-weight: 600;
    color: $danger;
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
