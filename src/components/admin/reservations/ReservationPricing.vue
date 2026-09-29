<script setup lang="ts">
import StatusBadge from '../StatusBadge.vue'
import { paymentModes, paymentProviders, paymentStatuses } from '@/config/admin'
import { money } from '@/utils/format'
import { dateTime, es } from '@/composables/admin/helpers'
import type { AdminReservation } from '@/types/admin'

defineProps<{ r: AdminReservation }>()
</script>

<template>
  <section class="price">
    <h2 class="price__title"><i class="fa-solid fa-receipt"></i> Precio congelado al reservar</h2>
    <ul class="price__lines">
      <li v-for="l in r.pricing?.lines || []" :key="l.key">
        <span>{{ es(l.label) || l.key }}</span>
        <strong>{{ money(l.amount) }}</strong>
      </li>
    </ul>
    <div class="price__total">
      <span>Total</span>
      <strong>{{ money(r.pricing?.total || 0) }}</strong>
    </div>
    <div class="price__summary">
      <div><span>Pagado</span><strong class="price__paid">{{ money(r.amountPaid || 0) }}</strong></div>
      <div><span>Saldo</span><strong :class="{ 'price__due': r.balance > 0 }">{{ money(r.balance || 0) }}</strong></div>
      <div><span>Separación</span><strong>{{ money(r.pricing?.deposit || 0) }}</strong></div>
    </div>
    <p v-if="r.pricing?.guaranteeAmount" class="price__guarantee">
      <i class="fa-solid fa-shield-halved"></i>
      Garantía del vehículo: <strong>{{ money(r.pricing.guaranteeAmount) }}</strong> — se gestiona en el retiro (Datafast), no online.
    </p>

    <h3 class="price__sub">Pagos</h3>
    <ul v-if="r.payments?.length" class="price__payments">
      <li v-for="p in r.payments" :key="p._id">
        <div class="price__pay-main">
          <strong>{{ money(p.amount) }}</strong>
          <small>{{ paymentModes[p.mode] }} · {{ paymentProviders[p.provider] || p.provider }} · {{ dateTime(p.approvedAt || p.createdAt) }}</small>
        </div>
        <StatusBadge :status="p.status" :map="paymentStatuses" />
      </li>
    </ul>
    <p v-else class="price__muted">Sin pagos registrados.</p>
  </section>
</template>

<style scoped lang="scss">
.price {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.8rem);

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
    margin-top: 0.4rem;
  }

  &__lines {
    list-style: none;

    li {
      @include flex(row, baseline, space-between, 1rem);
      padding: 0.45rem 0;
      font-size: 0.88rem;
      color: $ink-soft;
      border-bottom: 1px dashed $line;
    }

    strong {
      color: $ink;
      white-space: nowrap;
    }
  }

  &__total {
    @include flex(row, baseline, space-between);
    font-weight: 800;

    strong {
      font-family: $font-display;
      font-size: 1.5rem;
    }
  }

  &__summary {
    @include flex(row, stretch, flex-start, 0.5rem);

    div {
      flex: 1;
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
    }
  }

  &__paid {
    color: $success;
  }

  &__due {
    color: $warning;
  }

  &__guarantee {
    font-size: 0.8rem;
    color: $ink-soft;
    background: $accent-soft;
    border-radius: 12px;
    padding: 0.65rem 0.8rem;

    i {
      color: $accent-deep;
      margin-right: 0.3rem;
    }
  }

  &__payments {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.45rem);

    li {
      @include flex(row, center, space-between, 0.6rem);
      padding: 0.6rem 0.75rem;
      border: 1px solid $line;
      border-radius: 12px;
    }
  }

  &__pay-main {
    @include flex(column, flex-start, center);
    line-height: 1.3;
    min-width: 0;

    small {
      font-size: 0.74rem;
      color: $ink-muted;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
