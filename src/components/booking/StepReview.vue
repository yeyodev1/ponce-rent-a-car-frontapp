<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatDateTime, money } from '@/utils/format'
import { useCatalogStore } from '@/stores/catalog'
import { booking, effectiveReturnLocation, pickupAt, returnAt } from '@/composables/booking/useBookingState'
import { formatYmd, maskLicense } from '@/composables/booking/useDriverForm'
import PriceBreakdown from './PriceBreakdown.vue'

/** Paso 8: todo lo elegido en una sola vista, con el total que se va a cobrar. */
const { t, tx } = useI18n()
const catalog = useCatalogStore()

const res = computed(() => booking.reservation)
const category = computed(() => catalog.bySlug(booking.categorySlug))
const coverage = computed(() => catalog.coverages.find((c) => c.code === booking.coverage))
const place = (code: string) =>
  tx(catalog.config?.booking.locations.find((l) => l.code === code)?.label) || t(`common.locations.${code}`)

const extras = computed(() =>
  Object.entries(booking.extras)
    .filter(([, q]) => q > 0)
    .map(([code, q]) => {
      const name = tx(catalog.extras.find((e) => e.code === code)?.name) || code
      return q > 1 ? `${name} × ${q}` : name
    }),
)

const rows = computed(() => {
  const km = res.value?.pricing.includedKm
  const out = [
    { icon: 'fa-solid fa-arrow-right-from-bracket', label: t('booking.review.pickup'), value: formatDateTime(pickupAt.value) },
    { icon: 'fa-solid fa-arrow-right-to-bracket', label: t('booking.review.return'), value: formatDateTime(returnAt.value) },
    {
      icon: 'fa-solid fa-location-dot',
      label: t('booking.review.place'),
      value: [place(booking.pickupLocation), booking.pickupAddress].filter(Boolean).join(' · '),
    },
  ]
  if (!booking.sameReturn)
    out.push({ icon: 'fa-solid fa-flag-checkered', label: t('booking.review.returnPlace'), value: place(effectiveReturnLocation.value) })
  out.push(
    {
      icon: 'fa-solid fa-gauge',
      label: t('booking.review.mileage'),
      value: booking.mileage === 'unlimited' ? t('booking.review.unlimited') : t('booking.review.limited', { km: km ?? '—' }),
    },
    { icon: 'fa-solid fa-shield-halved', label: t('booking.review.coverage'), value: tx(coverage.value?.name) || booking.coverage },
    { icon: 'fa-solid fa-puzzle-piece', label: t('booking.review.extras'), value: extras.value.join(', ') || t('booking.review.noExtras') },
  )
  const d = booking.driver
  if (d.licenseNumber)
    out.push({
      icon: 'fa-solid fa-id-card',
      label: t('booking.review.license'),
      value: t('booking.review.licenseValue', { number: maskLicense(d.licenseNumber), date: formatYmd(d.licenseExpiresAt) }),
    })
  return out
})
</script>

<template>
  <div v-if="res" class="review">
    <div class="review__car">
      <img v-if="category?.image" :src="category.image" :alt="tx(category?.name)" />
      <div>
        <p class="review__code">{{ t('booking.review.code') }} {{ res.code }}</p>
        <h2 class="review__name">{{ tx(category?.name) }}</h2>
        <p class="review__models">{{ category?.exampleModels }}</p>
      </div>
    </div>

    <dl class="review__rows">
      <div v-for="row in rows" :key="row.label" class="review__row">
        <dt><i :class="row.icon"></i>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>

    <div class="review__price">
      <PriceBreakdown :lines="res.pricing.lines" :total="res.pricing.total" :deposit="res.pricing.deposit" />
    </div>

    <aside class="review__notice review__notice--guarantee">
      <i class="fa-solid fa-shield-halved"></i>
      <div>
        <strong>{{ t('booking.review.guaranteeTitle', { amount: money(res.pricing.guaranteeAmount) }) }}</strong>
        <p>{{ t('booking.review.guaranteeBody') }}</p>
      </div>
    </aside>

    <aside class="review__notice">
      <i class="fa-solid fa-user-check"></i>
      <div>
        <strong>{{ t('booking.review.verifyTitle') }}</strong>
        <p>{{ t('booking.review.verifyBody') }}</p>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.review {
  @include flex(column, stretch, flex-start, 1rem);

  &__car {
    @include flex(row, center, flex-start, 1rem);
    padding: 0.9rem;
    border-radius: $radius-lg;
    background: linear-gradient(135deg, $navy, $navy-2);
    color: $on-dark;

    img {
      width: 116px;
      height: 80px;
      object-fit: cover;
      border-radius: $radius-sm;
      background: $navy-3;
    }
  }

  &__code {
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $accent;
  }

  &__name {
    font-size: $text-xl;
    color: $surface;
  }

  &__models {
    font-size: $text-xs;
    color: $on-dark-soft;
  }

  &__rows {
    @include flex(column, stretch, flex-start);
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-md;
    padding: 0.25rem 1rem;
  }

  &__row {
    @include flex(row, flex-start, space-between, 1rem);
    padding-block: 0.75rem;
    font-size: $text-sm;

    & + & {
      border-top: 1px solid $line;
    }

    dt {
      @include flex(row, center, flex-start, 0.55rem);
      flex: 0 0 auto;
      color: $ink-muted;
      font-weight: 600;

      i {
        width: 16px;
        text-align: center;
        color: $blue;
      }
    }

    dd {
      text-align: right;
      font-weight: 700;
      color: $ink;
    }
  }

  &__price {
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-md;
    padding: 1.1rem 1rem;
  }

  &__notice {
    @include flex(row, flex-start, flex-start, 0.8rem);
    padding: 1rem;
    border-radius: $radius-md;
    background: $blue-soft;
    font-size: $text-sm;
    color: $ink-soft;

    > i {
      color: $blue;
      font-size: 1.15rem;
      margin-top: 0.15rem;
    }

    strong {
      color: $ink;
    }

    &--guarantee {
      background: $accent-soft;
      border: 1.5px solid rgba($accent-deep, 0.45);

      > i {
        color: darken($accent-deep, 12%);
      }
    }
  }
}
</style>
