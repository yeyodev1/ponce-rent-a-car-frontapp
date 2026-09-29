<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { whatsappLink } from '@/config/site'
import { useCatalogStore } from '@/stores/catalog'
import { track } from '@/composables/useAnalytics'
import OptionCard from '@/components/ui/OptionCard.vue'
import { booking } from '@/composables/booking/useBookingState'
import PayphoneBox from './PayphoneBox.vue'

/**
 * Paso 9: separar con el depósito o pagar todo. Sin Payphone configurado se
 * ofrece terminar por WhatsApp con el código: nunca un error sin salida.
 */
const { t } = useI18n()
const catalog = useCatalogStore()

const res = computed(() => booking.reservation)
const enabled = computed(() => Boolean(catalog.config?.payphoneEnabled))
const canDeposit = computed(
  () => catalog.config?.booking.depositMode !== 'none' && (res.value?.pricing.deposit || 0) > 0 && (res.value?.pricing.deposit || 0) < (res.value?.pricing.total || 0),
)
const amount = computed(() =>
  booking.payMode === 'deposit' && canDeposit.value ? res.value?.pricing.deposit || 0 : res.value?.pricing.total || 0,
)
const balance = computed(() => (res.value ? res.value.pricing.total - res.value.pricing.deposit : 0))
const paying = ref(false)

watchEffect(() => {
  if (!canDeposit.value && booking.payMode === 'deposit') booking.payMode = 'full'
})

const waLink = computed(() => whatsappLink(t('booking.payment.whatsappMsg', { code: res.value?.code || '' })))

function pay() {
  paying.value = true
}

function onWhatsapp() {
  track('whatsapp_open', { source: 'booking_payment', reservation: res.value?.code })
}
</script>

<template>
  <div v-if="res" class="pay">
    <div v-if="enabled && !paying" class="pay__options" role="radiogroup">
      <OptionCard
        v-if="canDeposit"
        icon="fa-solid fa-lock"
        :title="t('booking.payment.deposit')"
        :subtitle="t('booking.payment.depositSub', { balance: money(balance) })"
        :price="money(res.pricing.deposit)"
        :selected="booking.payMode === 'deposit'"
        @select="booking.payMode = 'deposit'"
      />
      <OptionCard
        icon="fa-solid fa-circle-check"
        :title="t('booking.payment.full')"
        :subtitle="t('booking.payment.fullSub')"
        :price="money(res.pricing.total)"
        :selected="booking.payMode === 'full'"
        @select="booking.payMode = 'full'"
      />
    </div>

    <Transition name="rise" mode="out-in">
      <div v-if="!enabled" key="soon" class="pay__soon">
        <span class="pay__soon-icon"><i class="fa-solid fa-credit-card"></i></span>
        <h2>{{ t('booking.payment.soonTitle') }}</h2>
        <p>{{ t('booking.payment.soonBody', { code: res.code }) }}</p>
        <a :href="waLink" target="_blank" rel="noopener" class="btn btn--whatsapp btn--lg btn--block" @click="onWhatsapp">
          <i class="fa-brands fa-whatsapp"></i>{{ t('booking.payment.soonCta') }}
        </a>
      </div>

      <PayphoneBox
        v-else-if="paying"
        key="box"
        :code="res.code"
        :token="res.token"
        :mode="booking.payMode"
        :amount="amount"
        @cancel="paying = false"
      />

      <div v-else key="cta" class="pay__cta">
        <button type="button" class="btn btn--primary btn--lg btn--block btn--shine" @click="pay">
          <i class="fa-solid fa-lock"></i>{{ t('booking.payment.pay', { amount: money(amount, true) }) }}
        </button>
        <p class="pay__secure">
          <span><i class="fa-solid fa-shield-halved"></i>{{ t('booking.payment.secure') }}</span>
          <span class="pay__logos" aria-hidden="true">
            <i class="fa-brands fa-cc-visa"></i><i class="fa-brands fa-cc-mastercard"></i>
          </span>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.pay {
  @include flex(column, stretch, flex-start, 1.25rem);

  &__options {
    @include flex(column, stretch, flex-start, 0.75rem);
  }

  &__soon {
    @include flex(column, center, flex-start, 0.75rem);
    text-align: center;
    padding: 1.6rem 1.25rem;
    border-radius: $radius-lg;
    background: $surface;
    border: 1.5px dashed $line-strong;

    h2 {
      font-size: $text-xl;
    }

    p {
      font-size: $text-sm;
      color: $ink-soft;
      max-width: 36ch;
      margin-bottom: 0.4rem;
    }
  }

  &__soon-icon {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: $blue-soft;
    color: $blue;
    font-size: 1.4rem;
    @include flex(row, center, center);
  }

  &__cta {
    @include flex(column, stretch, flex-start, 0.75rem);
  }

  &__secure {
    @include flex(row, center, space-between, 0.75rem);
    font-size: $text-xs;
    color: $ink-muted;

    i {
      margin-right: 0.35rem;
      color: $success;
    }
  }

  &__logos {
    font-size: 1.7rem;

    i {
      color: $navy;
    }
  }
}
</style>
