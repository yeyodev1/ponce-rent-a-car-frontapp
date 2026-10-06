<script setup lang="ts">
import { computed, ref } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import PaymentForm from './PaymentForm.vue'
import VoidPaymentDialog from '../payments/VoidPaymentDialog.vue'
import { usePaymentVoid } from '@/composables/admin/usePaymentVoid'
import { adminService } from '@/services/admin.service'
import { paymentStatusesV13, voidCopy } from '@/config/admin/ops'
import type { PaymentVoidFields } from '@/types/ops'
import { useUserStore } from '@/stores/user'
import {
  paymentCopy as t,
  paymentMethods,
  paymentProviders,
  reservationPaymentStatuses,
} from '@/config/admin'
import { money } from '@/utils/format'
import { dateTime } from '@/composables/admin/helpers'
import type { AdminReservation, Payment, PaymentMethod } from '@/types/admin'

/** Estado de pago, totales, historial y registro de pagos en el local. */
const props = defineProps<{ r: AdminReservation; saving?: boolean }>()
const emit = defineEmits<{
  pay: [body: { amount: number; method: PaymentMethod; note?: string }]
  refund: [paymentId: string]
  changed: []
}>()

const userStore = useUserStore()
const closed = computed(() => props.r.status === 'cancelled' || props.r.status === 'expired')
const total = computed(() => props.r.pricing?.total || 0)
const balance = computed(() => props.r.balance ?? Math.max(total.value - (props.r.amountPaid || 0), 0))
const payments = computed(() =>
  [...(props.r.payments || [])].sort((a, b) => +new Date(b.approvedAt || b.createdAt) - +new Date(a.approvedAt || a.createdAt)),
)

const toRefund = ref<Payment | null>(null)
function confirmRefund() {
  const p = toRefund.value
  toRefund.value = null
  if (p) emit('refund', p._id)
}

// Tras anular, el servidor recalcula los totales: se relee la reserva y se
// actualiza en sitio (el detalle todavía no escucha "changed").
const voider = usePaymentVoid(async () => {
  const { payments, amountPaid, balance, paymentStatus } = await adminService.reservation(props.r._id)
  Object.assign(props.r, { payments, amountPaid, balance, paymentStatus })
  emit('changed')
})
const voided = (p: Payment) => p as Payment & PaymentVoidFields

const methodOf = (p: Payment) =>
  paymentMethods[p.method || ''] || (p.provider === 'payphone' ? `${paymentMethods.card} · ${t.online}` : paymentProviders[p.provider] || p.provider)
</script>

<template>
  <section class="rpay">
    <header class="rpay__head">
      <h2 class="rpay__title"><i class="fa-solid fa-wallet"></i> {{ t.title }}</h2>
      <StatusBadge v-if="r.paymentStatus" :status="r.paymentStatus" :map="reservationPaymentStatuses" icon />
    </header>

    <div class="rpay__summary">
      <div><span>{{ t.total }}</span><strong>{{ money(total) }}</strong></div>
      <div><span>{{ t.paid }}</span><strong class="rpay__paid">{{ money(r.amountPaid || 0) }}</strong></div>
      <div><span>{{ t.balance }}</span><strong :class="{ 'rpay__due': balance > 0 }">{{ money(balance) }}</strong></div>
    </div>

    <PaymentForm v-if="!closed && balance > 0" :balance="balance" :saving="saving" @submit="(b) => emit('pay', b)" />
    <p v-else-if="closed" class="rpay__muted"><i class="fa-solid fa-lock"></i> {{ t.closed }}</p>

    <h3 class="rpay__sub">{{ t.history }}</h3>
    <ul v-if="payments.length" class="rpay__list">
      <li v-for="p in payments" :key="p._id" class="rpay__item" :class="{ 'rpay__item--off': p.status !== 'approved' }">
        <div class="rpay__row">
          <strong class="rpay__amount">{{ money(p.amount, true) }}</strong>
          <StatusBadge :status="p.status" :map="paymentStatusesV13" />
        </div>
        <p class="rpay__meta">
          <span><i class="fa-regular fa-calendar"></i> {{ dateTime(p.approvedAt || p.createdAt) }}</span>
          <span><i class="fa-solid fa-money-check-dollar"></i> {{ methodOf(p) }}</span>
          <span v-if="p.registeredBy?.name"><i class="fa-regular fa-user"></i> {{ p.registeredBy.name }}</span>
        </p>
        <p v-if="p.note" class="rpay__note">{{ p.note }}</p>
        <p v-if="p.refundedAt" class="rpay__note">Reembolsado el {{ dateTime(p.refundedAt) }}</p>
        <p v-if="voided(p).voidedAt" class="rpay__note">
          {{ voidCopy.voidedAt(dateTime(voided(p).voidedAt), voided(p).voidedBy?.name || '') }}: {{ voided(p).voidReason }}
        </p>
        <div class="rpay__acts">
          <button v-if="userStore.isAdmin && p.status === 'approved'" type="button" class="rpay__refund" :disabled="saving" @click="toRefund = p">
            <i class="fa-solid fa-rotate-left"></i> {{ t.refund }}
          </button>
          <button v-if="voider.canVoid(p)" type="button" class="rpay__refund rpay__void" :disabled="voider.saving.value" @click="voider.ask(p)">
            <i class="fa-solid fa-ban"></i> {{ voidCopy.action }}
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="rpay__muted">{{ t.none }}</p>

    <ConfirmDialog
      :open="Boolean(toRefund)"
      :title="t.refundTitle(money(toRefund?.amount || 0, true))"
      :message="t.refundMsg"
      :confirm-label="t.refund"
      @confirm="confirmRefund"
      @cancel="toRefund = null"
    />
    <VoidPaymentDialog
      v-model:reason="voider.reason.value"
      :payment="voider.target.value"
      :error="voider.error.value"
      @confirm="voider.confirm"
      @cancel="voider.cancel"
    />
  </section>
</template>

<style scoped lang="scss">
.rpay {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.85rem);

  &__head {
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
  }

  &__title,
  &__sub {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__sub {
    font-size: 0.85rem;
    margin-top: 0.3rem;
  }

  &__summary {
    @include flex(row, stretch, flex-start, 0.5rem);

    div {
      flex: 1;
      min-width: 0;
      background: $paper;
      border-radius: 12px;
      padding: 0.6rem 0.7rem;
      @include flex(column, flex-start, flex-start);
    }

    span {
      font-size: 0.7rem;
      font-weight: 700;
      color: $ink-muted;
    }

    strong {
      font-size: 0.98rem;
      white-space: nowrap;
    }
  }

  &__paid {
    color: $success;
  }

  &__due {
    color: $warning;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);
  }

  &__item {
    @include flex(column, stretch, flex-start, 0.3rem);
    padding: 0.7rem 0.8rem;
    border: 1px solid $line;
    border-radius: 12px;

    &--off {
      background: rgba($paper, 0.6);
    }
  }

  &__row {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__amount {
    font-size: 1rem;
    color: $ink;
  }

  &__item--off &__amount {
    color: $ink-muted;
  }

  &__meta {
    @include flex(row, center, flex-start, 0.3rem 0.8rem);
    flex-wrap: wrap;
    font-size: 0.74rem;
    color: $ink-muted;

    i {
      margin-right: 0.2rem;
    }
  }

  &__note {
    font-size: 0.78rem;
    color: $ink-soft;
    font-style: italic;
  }

  &__acts {
    @include flex(row, center, flex-start, 1rem);
  }

  &__void {
    color: $ink-soft;
  }

  &__refund {
    align-self: flex-start;
    margin-top: 0.2rem;
    font-size: 0.76rem;
    font-weight: 800;
    color: $danger;
    @include flex(row, center, flex-start, 0.35rem);
    padding: 0.2rem 0;
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
