<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatDateTime, money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import type { PublicReservation } from '@/types'

/** Ficha de la reserva: vehículo, fechas, lugar, montos y estado de documentos. */
const props = defineProps<{ res: PublicReservation }>()
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const place = (code: string) =>
  tx(catalog.config?.booking.locations.find((l) => l.code === code)?.label) || t(`common.locations.${code}`)

const docsOk = computed(() => props.res.documents.license && props.res.documents.identity)
const verifTone = computed(
  () => ({ verified: 'success', needs_info: 'warning', rejected: 'danger', pending: 'blue' })[props.res.verification] || 'blue',
)
</script>

<template>
  <div class="facts">
    <div class="facts__car">
      <img v-if="res.category.image" :src="res.category.image" :alt="tx(res.category.name)" />
      <div>
        <p class="facts__label">{{ t('booking.review.vehicle') }}</p>
        <p class="facts__name">{{ tx(res.category.name) }}</p>
      </div>
    </div>

    <ul class="facts__list">
      <li>
        <i class="fa-solid fa-calendar-days"></i>
        <span>{{ formatDateTime(res.pickupAt) }} → {{ formatDateTime(res.returnAt) }}</span>
        <small>{{ res.pricing.days === 1 ? t('booking.bar.oneDay') : t('booking.bar.days', { n: res.pricing.days }) }}</small>
      </li>
      <li>
        <i class="fa-solid fa-location-dot"></i>
        <span>{{ place(res.pickupLocation) }}</span>
        <small v-if="res.returnLocation !== res.pickupLocation">→ {{ place(res.returnLocation) }}</small>
      </li>
    </ul>

    <div class="facts__money">
      <p><span>{{ t('booking.reservation.total') }}</span><strong>{{ money(res.pricing.total, true) }}</strong></p>
      <p><span>{{ t('booking.reservation.paid') }}</span><strong class="facts__ok">{{ money(res.amountPaid, true) }}</strong></p>
      <p><span>{{ t('booking.reservation.balance') }}</span><strong>{{ money(res.balance, true) }}</strong></p>
      <p class="facts__guarantee">
        <span><i class="fa-solid fa-shield-halved"></i>{{ t('booking.reservation.guaranteePending') }}</span>
        <strong>{{ money(res.guaranteeAmount) }}</strong>
      </p>
    </div>

    <div class="facts__status">
      <p>
        <span>{{ t('booking.reservation.documents') }}</span>
        <span class="chip" :class="docsOk ? 'chip--success' : 'chip--warning'">
          <i :class="docsOk ? 'fa-solid fa-check' : 'fa-regular fa-clock'"></i>
          {{ docsOk ? t('booking.reservation.docsDone') : t('booking.reservation.docsMissing') }}
        </span>
      </p>
      <p>
        <span>{{ t('booking.reservation.verification') }}</span>
        <span class="chip" :class="`chip--${verifTone}`">{{ t(`booking.reservation.verificationStatus.${res.verification}`) }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.facts {
  @include flex(column, stretch, flex-start, 1rem);
  padding: 1.2rem;
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  text-align: left;

  &__car {
    @include flex(row, center, flex-start, 0.9rem);

    img {
      width: 96px;
      height: 64px;
      object-fit: cover;
      border-radius: $radius-sm;
      background: $sand;
    }
  }

  &__label {
    @include eyebrow;
    font-size: 0.64rem;
  }

  &__name {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 800;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.6rem);
    padding-block: 0.9rem;
    border-block: 1px solid $line;
    font-size: $text-sm;

    li {
      @include flex(row, baseline, flex-start, 0.6rem);
      flex-wrap: wrap;
    }

    i {
      width: 16px;
      color: $blue;
    }

    small {
      color: $ink-muted;
      font-weight: 600;
    }
  }

  &__money,
  &__status {
    @include flex(column, stretch, flex-start, 0.5rem);

    p {
      @include flex(row, center, space-between, 1rem);
      font-size: $text-sm;
      color: $ink-soft;
    }

    strong {
      color: $ink;
      font-variant-numeric: tabular-nums;
    }
  }

  &__money &__ok {
    color: $success;
  }

  &__guarantee {
    padding: 0.6rem 0.75rem;
    border-radius: $radius-sm;
    background: $accent-soft;

    i {
      margin-right: 0.4rem;
    }
  }

  &__status {
    padding-top: 0.9rem;
    border-top: 1px solid $line;
  }
}
</style>
