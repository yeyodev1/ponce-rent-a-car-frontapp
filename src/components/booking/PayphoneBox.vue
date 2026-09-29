<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { usePayphoneBox } from '@/composables/booking/usePayphoneBox'
import { useCountdown } from '@/composables/booking/useCountdown'

/**
 * Marco propio alrededor de la Cajita de Payphone: título, monto, estados de
 * carga/error y el aviso de los 10 minutos. El formulario en sí es de Payphone.
 */
const props = defineProps<{ code: string; token: string; mode: 'deposit' | 'full'; amount: number }>()
const emit = defineEmits<{ cancel: [] }>()
const { t, locale } = useI18n()

const box = usePayphoneBox('pp-button')
const { label, expired } = useCountdown(box.expiresAt)

const start = () => box.start(props.code, props.token, props.mode, locale.value)
onMounted(start)
watch(expired, (v) => v && box.expire())
</script>

<template>
  <section class="pp">
    <header class="pp__head">
      <div>
        <p class="pp__eyebrow">{{ t('booking.payment.toPay') }}</p>
        <p class="pp__amount">{{ money(amount, true) }}</p>
      </div>
      <span class="pp__logos" aria-hidden="true">
        <i class="fa-brands fa-cc-visa"></i><i class="fa-brands fa-cc-mastercard"></i>
      </span>
    </header>

    <div v-if="box.status.value === 'loading'" class="pp__state">
      <span class="skeleton pp__ghost"></span>
      <span class="skeleton pp__ghost pp__ghost--short"></span>
      <p><i class="fa-solid fa-lock"></i>{{ t('booking.payment.loading') }}</p>
    </div>

    <div v-else-if="box.status.value === 'error'" class="pp__state pp__state--err" role="alert">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>{{ t('booking.payment.error') }}</p>
      <button type="button" class="btn btn--dark" @click="start">
        <i class="fa-solid fa-rotate-right"></i>{{ t('common.actions.retry') }}
      </button>
    </div>

    <div v-else-if="box.status.value === 'expired'" class="pp__state" role="status">
      <i class="fa-regular fa-clock"></i>
      <p>{{ t('booking.payment.expired') }}</p>
      <button type="button" class="btn btn--blue" @click="start">
        <i class="fa-solid fa-rotate"></i>{{ t('booking.payment.newAttempt') }}
      </button>
    </div>

    <div v-show="box.status.value === 'ready'" class="pp__form">
      <p class="pp__title">{{ t('booking.payment.boxTitle') }}</p>
      <div id="pp-button"></div>
      <p v-if="box.expiresAt.value" class="pp__timer">
        <i class="fa-regular fa-clock"></i>{{ t('booking.payment.expires', { time: label }) }}
      </p>
    </div>

    <footer class="pp__foot">
      <span><i class="fa-solid fa-shield-halved"></i>{{ t('booking.payment.secure') }}</span>
      <button type="button" class="pp__change" @click="emit('cancel')">{{ t('booking.payment.change') }}</button>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.pp {
  @include flex(column, stretch, flex-start, 1rem);
  padding: 1.2rem;
  border-radius: $radius-lg;
  background: $surface;
  border: 1px solid $line;
  box-shadow: $shadow-md;

  &__head {
    @include flex(row, center, space-between, 1rem);
    padding-bottom: 1rem;
    border-bottom: 1px dashed $line;
  }

  &__eyebrow {
    @include eyebrow;
    font-size: 0.66rem;
  }

  &__amount {
    font-family: $font-display;
    font-size: $display-sm;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  &__logos {
    @include flex(row, center, flex-end, 0.5rem);
    font-size: 2rem;
    color: $navy;
  }

  &__state {
    @include flex(column, center, center, 0.75rem);
    text-align: center;
    padding: 1rem 0;
    color: $ink-soft;
    font-size: $text-sm;

    > i {
      font-size: 1.6rem;
      color: $blue;
    }

    p i {
      margin-right: 0.4rem;
    }

    &--err > i {
      color: $danger;
    }
  }

  &__ghost {
    width: 100%;
    height: 48px;

    &--short {
      width: 70%;
    }
  }

  &__title {
    font-weight: 800;
    margin-bottom: 0.6rem;
  }

  &__timer {
    @include flex(row, center, flex-start, 0.45rem);
    margin-top: 0.75rem;
    font-size: $text-xs;
    font-weight: 700;
    color: $ink-muted;
    font-variant-numeric: tabular-nums;
  }

  &__foot {
    @include flex(row, center, space-between, 0.75rem);
    flex-wrap: wrap;
    font-size: $text-xs;
    color: $ink-muted;

    i {
      margin-right: 0.35rem;
      color: $success;
    }
  }

  &__change {
    min-height: 40px;
    font-weight: 700;
    color: $blue;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
