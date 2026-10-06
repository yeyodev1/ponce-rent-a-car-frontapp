<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useSeo } from '@/composables/useSeo'
import { track } from '@/composables/useAnalytics'
import { whatsappLink } from '@/config/site'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import AnimatedCheck from '@/components/booking/AnimatedCheck.vue'
import HoldTimer from '@/components/booking/HoldTimer.vue'
import ReservationFacts from '@/components/booking/ReservationFacts.vue'
import ReservationContactForm from '@/components/booking/ReservationContactForm.vue'
import ReservationContractCard from '@/components/contract/ReservationContractCard.vue'
import { adoptReservation } from '@/composables/booking/useBookingState'
import { contractRequired } from '@/composables/booking/useContract'
import type { PublicReservation } from '@/types'

/** /reserva/:code?t=token — estado público de una reserva, sin cuenta. */
const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const { t } = useI18n()

const res = ref<PublicReservation | null>(null)
const loading = ref(true)
const code = computed(() => String(route.params.code || ''))
const token = computed(() => (typeof route.query.t === 'string' ? route.query.t : ''))

useSeo(() => ({
  title: res.value
    ? `${t('booking.review.code')} ${res.value.code}`
    : loading.value
      ? t('booking.reservation.loading')
      : t('booking.reservation.notFound'),
  noindex: true,
}))

const CONFIRMED = ['confirmed', 'delivered', 'completed']
const kind = computed(() => {
  const s = res.value?.status
  if (!s) return 'none'
  if (CONFIRMED.includes(s)) return 'confirmed'
  if (s === 'pending_documents' || s === 'pending_payment') return 'pending'
  return 'closed'
})
const celebrate = computed(() => kind.value === 'confirmed' || route.query.nuevo === '1')
const title = computed(() =>
  kind.value === 'confirmed'
    ? t('booking.reservation.title')
    : kind.value === 'pending'
      ? t('booking.reservation.titlePending')
      : t('booking.reservation.titleClosed'),
)
const waLink = computed(() => whatsappLink(t('booking.reservation.whatsappMsg', { code: code.value })))
// Con la reserva cerrada ya no hay nada que avisar: el formulario de contacto se oculta.
const editable = computed(() => Boolean(res.value) && !['completed', 'cancelled', 'expired'].includes(res.value!.status))

async function load() {
  loading.value = true
  if (!code.value || !token.value) {
    loading.value = false
    return
  }
  try {
    res.value = await publicService.reservation(code.value, token.value)
  } catch {
    res.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  catalog.load()
  load()
})

function continueBooking() {
  if (!res.value) return
  adoptReservation(res.value, token.value)
  // Con documentos: al contrato si falta aceptarlo (y es obligatorio); si no, directo al pago.
  const signed = res.value.contract?.status === 'signed'
  const paso = res.value.status === 'pending_documents' ? '7' : contractRequired.value && !signed ? '9' : '10'
  router.push({ path: '/reservar', query: { paso } })
}

const bookAgain = () => router.push({ path: '/reservar', query: { categoria: res.value?.category.slug || undefined } })
</script>

<template>
  <section class="resv">
    <div v-if="loading" class="resv__state" aria-busy="true">
      <span class="skeleton resv__ghost-circle"></span>
      <span class="skeleton resv__ghost-line"></span>
      <span class="skeleton resv__ghost-card"></span>
    </div>

    <div v-else-if="!res" class="resv__state">
      <span class="resv__icon"><i class="fa-solid fa-magnifying-glass"></i></span>
      <h1 class="resv__title">{{ t('booking.reservation.notFound') }}</h1>
      <p class="resv__sub">{{ t('booking.reservation.notFoundSub') }}</p>
      <a :href="waLink" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block" @click="track('whatsapp_open', { source: 'reservation' })">
        <i class="fa-brands fa-whatsapp"></i>{{ t('booking.reservation.contact') }}
      </a>
    </div>

    <div v-else class="resv__wrap">
      <header class="resv__hero" :class="`resv__hero--${kind}`">
        <AnimatedCheck v-if="celebrate && kind === 'confirmed'" :size="96" />
        <span v-else class="resv__icon" :class="`resv__icon--${kind}`">
          <i :class="kind === 'closed' ? 'fa-regular fa-calendar-xmark' : 'fa-regular fa-hourglass-half'"></i>
        </span>
        <h1 class="resv__title">{{ title }}</h1>
        <p class="resv__code">
          <span>{{ t('booking.reservation.code') }}</span><strong>{{ res.code }}</strong>
        </p>
        <span class="chip" :class="kind === 'confirmed' ? 'chip--success' : kind === 'pending' ? 'chip--warning' : 'chip--danger'">
          {{ t(`booking.reservation.status.${res.status}`) }}
        </span>
        <p v-if="kind === 'confirmed' && res.driver.email" class="resv__sub">
          {{ t('booking.reservation.sentTo', { email: res.driver.email }) }}
        </p>
      </header>

      <div v-if="kind === 'pending'" class="resv__next">
        <HoldTimer :expires-at="res.holdExpiresAt" @renew="bookAgain" />
        <button type="button" class="btn btn--primary btn--lg btn--block" @click="continueBooking">
          {{ res.status === 'pending_documents' ? t('booking.reservation.continueDocs') : t('booking.reservation.continuePay') }}
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div v-else-if="kind === 'closed'" class="resv__next">
        <p class="resv__sub">{{ t('booking.reservation.closedBody') }}</p>
        <button type="button" class="btn btn--primary btn--lg btn--block" @click="bookAgain">
          {{ t('booking.reservation.bookAgain') }}
        </button>
      </div>

      <ReservationFacts :res="res" />

      <ReservationContractCard :code="res.code" :token="token" :active="editable" @signed="res.contract = { ...res.contract, status: 'signed' }" />

      <ReservationContactForm v-if="editable" :res="res" :token="token" @updated="res = $event" />

      <div class="resv__actions">
        <RouterLink :to="{ path: `/reserva/${res.code}`, query: { t: token } }" class="btn btn--ghost btn--block">
          <i class="fa-regular fa-file-lines"></i>{{ t('booking.reservation.view') }}
        </RouterLink>
        <a :href="waLink" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block" @click="track('whatsapp_open', { source: 'reservation', reservation: res.code })">
          <i class="fa-brands fa-whatsapp"></i>{{ t('booking.reservation.contact') }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.resv {
  width: 100%;
  max-width: 560px;
  margin-inline: auto;
  // El header es fijo y superpuesto: la vista deja su hueco arriba.
  padding: calc(var(--header-h) + 1.5rem) 1.25rem calc(3rem + var(--tabbar-h));

  &__state,
  &__wrap,
  &__hero,
  &__next,
  &__actions {
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__state,
  &__hero {
    align-items: center;
    text-align: center;
  }

  &__state {
    padding-top: 2rem;
  }

  &__wrap {
    gap: 1.4rem;
  }

  &__hero {
    gap: 0.7rem;
    padding: 1.5rem 1rem 0.5rem;
  }

  &__icon {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: $sand;
    color: $ink-soft;
    font-size: 2rem;
    @include flex(row, center, center);

    &--pending {
      background: $warning-bg;
      color: darken($warning, 10%);
    }

    &--closed {
      background: $danger-bg;
      color: $danger;
    }
  }

  &__title {
    @include display($display-sm, 800);
    margin-top: 0.4rem;
  }

  &__code {
    @include flex(column, center, center, 0.1rem);

    span {
      font-size: $text-xs;
      color: $ink-muted;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    strong {
      font-family: $font-display;
      font-size: $text-xl;
      letter-spacing: 0.06em;
    }
  }

  &__sub {
    font-size: $text-sm;
    color: $ink-soft;
    text-align: center;
  }

  &__next {
    align-items: center;
  }

  &__ghost-circle {
    width: 88px;
    height: 88px;
    border-radius: 50%;
  }

  &__ghost-line {
    width: 70%;
    height: 28px;
  }

  &__ghost-card {
    width: 100%;
    height: 260px;
    border-radius: $radius-lg;
  }
}
</style>
