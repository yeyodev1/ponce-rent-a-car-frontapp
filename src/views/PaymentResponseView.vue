<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useSeo } from '@/composables/useSeo'
import { whatsappLink } from '@/config/site'
import AnimatedCheck from '@/components/booking/AnimatedCheck.vue'
import { usePaymentConfirm } from '@/composables/booking/usePaymentConfirm'

/** /pago/respuesta: Payphone vuelve acá con ?id=&clientTransactionId=. */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { phase, message, code, token, confirm, retryTarget } = usePaymentConfirm()

useSeo(() => ({ title: t('booking.confirm.confirming'), noindex: true }))

const q = (k: string) => (typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
onMounted(() => confirm(q('id'), q('clientTransactionId')))

// Aprobado: se muestra el check un instante y se pasa a la reserva confirmada.
watch(phase, (p) => {
  if (p === 'approved' && code.value && token.value) {
    setTimeout(() => {
      router.replace({ path: `/reserva/${code.value}`, query: { t: token.value, nuevo: '1' } })
    }, 1400)
  }
})

const failed = computed(() => phase.value === 'canceled' || phase.value === 'error' || phase.value === 'missing')
const waLink = computed(() => whatsappLink(t('booking.confirm.whatsappMsg', { code: code.value || '—' })))
const title = computed(() => {
  if (phase.value === 'approved') return t('booking.confirm.approved')
  if (phase.value === 'canceled') return t('booking.confirm.canceled')
  if (phase.value === 'confirming') return t('booking.confirm.confirming')
  return t('booking.confirm.error')
})
const body = computed(() => {
  if (phase.value === 'confirming') return t('booking.confirm.confirmingSub')
  if (phase.value === 'canceled') return t('booking.confirm.canceledSub')
  if (phase.value === 'missing') return t('booking.confirm.missing')
  if (phase.value === 'error') return message.value || t('booking.confirm.errorSub')
  return ''
})
</script>

<template>
  <section class="pay-res" aria-live="polite">
    <div class="pay-res__card">
      <Transition name="rise" mode="out-in">
        <span v-if="phase === 'confirming'" key="spin" class="pay-res__orbit" aria-hidden="true">
          <span></span><i class="fa-solid fa-lock"></i>
        </span>
        <AnimatedCheck v-else-if="phase === 'approved'" key="ok" :size="88" />
        <span v-else key="ko" class="pay-res__ko" aria-hidden="true"><i class="fa-solid fa-xmark"></i></span>
      </Transition>

      <h1 class="pay-res__title">{{ title }}</h1>
      <p v-if="body" class="pay-res__body">{{ body }}</p>
      <p v-if="code" class="pay-res__code">{{ code }}</p>

      <div v-if="failed" class="pay-res__actions">
        <RouterLink :to="retryTarget()" class="btn btn--primary btn--lg btn--block">
          <i class="fa-solid fa-rotate-right"></i>{{ t('booking.confirm.retry') }}
        </RouterLink>
        <a :href="waLink" target="_blank" rel="noopener" class="btn btn--ghost btn--block">
          <i class="fa-brands fa-whatsapp"></i>{{ t('booking.confirm.contact') }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pay-res {
  flex: 1;
  @include flex(column, center, center);
  padding: 2rem 1.25rem 3rem;
  min-height: calc(100dvh - var(--header-h));

  &__card {
    width: 100%;
    max-width: 440px;
    @include flex(column, center, flex-start, 0.9rem);
    text-align: center;
  }

  &__orbit {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $blue-soft;
    color: $blue;
    font-size: 1.5rem;
    @include flex(row, center, center);

    span {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: $blue;
      border-right-color: rgba($blue, 0.3);
      animation: orbit 0.9s linear infinite;
    }
  }

  &__ko {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $danger-bg;
    color: $danger;
    font-size: 2rem;
    @include flex(row, center, center);
    animation: ko-in 0.5s $ease-spring both;
  }

  &__title {
    @include display($display-sm, 800);
    margin-top: 0.6rem;
  }

  &__body {
    color: $ink-soft;
    font-size: $text-sm;
    max-width: 34ch;
  }

  &__code {
    font-family: $font-display;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 0.4rem 0.9rem;
    border-radius: $radius-pill;
    background: $sand;
  }

  &__actions {
    width: 100%;
    @include flex(column, stretch, flex-start, 0.6rem);
    margin-top: 0.8rem;
  }
}

@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ko-in {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}
</style>
