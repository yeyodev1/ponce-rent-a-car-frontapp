<script setup lang="ts">
import { computed, onMounted, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useSeo } from '@/composables/useSeo'
import { track } from '@/composables/useAnalytics'
import { useCatalogStore } from '@/stores/catalog'
import StepShell from '@/components/ui/StepShell.vue'
import BookingPriceBar from '@/components/booking/BookingPriceBar.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import HoldTimer from '@/components/booking/HoldTimer.vue'
import StepCategory from '@/components/booking/StepCategory.vue'
import StepDates from '@/components/booking/StepDates.vue'
import StepMileage from '@/components/booking/StepMileage.vue'
import StepCoverage from '@/components/booking/StepCoverage.vue'
import StepExtras from '@/components/booking/StepExtras.vue'
import StepDriver from '@/components/booking/StepDriver.vue'
import StepDocuments from '@/components/booking/StepDocuments.vue'
import StepReview from '@/components/booking/StepReview.vue'
import StepPayment from '@/components/booking/StepPayment.vue'
import { booking } from '@/composables/booking/useBookingState'
import { startQuoteWatcher } from '@/composables/booking/useQuote'
import { useBookingFlow, creating } from '@/composables/booking/useBookingFlow'
import { direction, TOTAL_STEPS, type StepKey } from '@/composables/booking/useBookingSteps'
import { useDisplayPricing } from '@/composables/booking/useDisplayPricing'

/**
 * Ruta B: reserva directa. Esta vista solo compone: el marco del paso, el
 * paso actual, el pie con el total vivo y (en escritorio) el resumen fijo.
 */
const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const { t } = useI18n()
const { step, key, go, back, clamp, canContinue, continueLabel, onContinue, syncReservation, restart } = useBookingFlow()
const pricing = useDisplayPricing(step)

useSeo(() => ({ title: t('booking.meta.title'), description: t('booking.meta.description'), noindex: true }))

const STEPS: Record<StepKey, Component> = {
  category: StepCategory,
  dates: StepDates,
  mileage: StepMileage,
  coverage: StepCoverage,
  extras: StepExtras,
  driver: StepDriver,
  documents: StepDocuments,
  review: StepReview,
  payment: StepPayment,
}

const copy = computed(() => ({
  eyebrow: t(`booking.steps.${key.value}.eyebrow`),
  title: t(`booking.steps.${key.value}.title`),
  subtitle: t(`booking.steps.${key.value}.subtitle`),
}))
const showHold = computed(() => Boolean(booking.reservation?.holdExpiresAt) && step.value >= 7 && step.value <= 9)

function next() {
  if (key.value === 'extras') {
    const chosen = Object.entries(booking.extras).filter(([, q]) => q > 0)
    track('extras_select', { extras: chosen.map(([code]) => code), count: chosen.length })
  }
  onContinue()
}

onMounted(async () => {
  catalog.load()
  startQuoteWatcher()
  track('route_b_start', { step: step.value })

  // Desde la ficha de un vehículo: ?categoria=suv ya elige y salta a las fechas.
  const slug = typeof route.query.categoria === 'string' ? route.query.categoria : ''
  // Desde /vehiculos con fechas: ?retiro=YYYY-MM-DD&devolucion=YYYY-MM-DD precargan el paso 2
  // (StepDates corrige lo que quede fuera de la ventana al montarse).
  const ymd = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '')
  const from = ymd(route.query.retiro)
  const to = ymd(route.query.devolucion)
  if (from && to && to > from) {
    if (booking.pickupDate !== from || booking.returnDate !== to) booking.reservation = null
    booking.pickupDate = from
    booking.returnDate = to
  }
  if (slug) {
    if (booking.categorySlug !== slug) booking.reservation = null
    booking.categorySlug = slug
    track('category_select', { category: slug, source: 'link' })
    const { categoria: _drop, retiro: _from, devolucion: _to, ...rest } = route.query
    void [_drop, _from, _to]
    await router.replace({ path: '/reservar', query: { ...rest, paso: step.value > 2 ? String(step.value) : '2' } })
  }

  if (booking.reservation) await syncReservation()
  clamp()
})

watch(step, () => clamp())

// Un slug que no existe (enlace viejo) no debe dejar al cliente en un paso sin vehículo.
watch(
  () => catalog.categories,
  (cats) => {
    if (cats.length && booking.categorySlug && !cats.some((c) => c.slug === booking.categorySlug)) {
      booking.categorySlug = ''
      go(1, true)
    }
  },
)

watch(
  () => catalog.coverages,
  (list) => {
    if (!booking.coverage && list.length) booking.coverage = (list.find((c) => c.isDefault) || list[0]!).code
  },
  { immediate: true },
)
</script>

<template>
  <div class="booking">
    <div class="booking__main">
      <StepShell
        :step="step"
        :total="TOTAL_STEPS"
        :title="copy.title"
        :subtitle="copy.subtitle"
        :eyebrow="copy.eyebrow"
        :direction="direction"
        :step-key="key"
        @back="back"
      >
        <HoldTimer v-if="showHold" :expires-at="booking.reservation?.holdExpiresAt ?? null" @renew="restart(6)" />
        <component :is="STEPS[key]" @picked="go(2)" @goto="go" />

        <template #footer>
          <BookingPriceBar
            :pricing="pricing"
            :can-continue="canContinue"
            :label="continueLabel"
            :busy="creating"
            :show-action="key !== 'payment'"
            @continue="next"
          />
        </template>
      </StepShell>
    </div>

    <aside class="booking__aside" :aria-label="t('booking.bar.breakdown')">
      <div class="booking__sticky">
        <BookingSummary :pricing="pricing" />
      </div>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.booking {
  @include flex(row, flex-start, center, 2.5rem);
  width: 100%;
  max-width: 1160px;
  margin-inline: auto;

  &__main {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__aside {
    display: none;
  }

  // El pie es una barra blanca con el total: más legible que el degradado genérico del asistente.
  :deep(.step__footer) {
    position: sticky;
    bottom: 0;
    margin-inline: -1.25rem;
    padding: 0.75rem 1.25rem calc(0.75rem + env(safe-area-inset-bottom));
    background: rgba($surface, 0.94);
    backdrop-filter: blur(14px);
    border-top: 1px solid $line;
    box-shadow: 0 -12px 30px rgba($navy, 0.08);
    margin-top: 2rem;
  }

  @include from('lg') {
    padding: 1.5rem 2rem 3rem;

    &__aside {
      display: block;
      flex: 0 0 360px;
      align-self: stretch;
    }

    &__sticky {
      position: sticky;
      top: calc(var(--header-h) + 1.5rem);
      margin-top: 4.5rem;
    }

    :deep(.step__footer) {
      position: static;
      margin-inline: 0;
      padding-inline: 0;
      background: none;
      backdrop-filter: none;
      border-top: none;
      box-shadow: none;
    }
  }
}
</style>
