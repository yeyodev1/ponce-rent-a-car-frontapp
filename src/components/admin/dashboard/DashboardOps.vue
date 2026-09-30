<script setup lang="ts">
import { computed } from 'vue'
import KpiCard from '../KpiCard.vue'
import { dashboardCopy as t } from '@/config/admin'
import { money } from '@/utils/format'
import type { Dashboard } from '@/types/admin'

/** Lo operativo primero: flota libre, reservas por estado e ingresos del mes. */
const props = defineProps<{ data: Dashboard | null; loading: boolean }>()

const fleet = computed(() => {
  const s = props.data?.fleetSummary
  if (s) return s
  // Sin fleetSummary (API anterior): se estima con el conteo por estado.
  const f = props.data?.fleet || {}
  const total = Object.values(f).reduce((a, b) => a + (b || 0), 0)
  return { available: f.available || 0, total }
})
const counts = computed(() => props.data?.reservationCounts)
const revenue = computed(() => props.data?.revenueMonth ?? props.data?.kpis?.revenueMonth ?? 0)
</script>

<template>
  <div class="dops">
    <KpiCard
      :label="t.available"
      icon="fa-solid fa-car-side"
      :loading="loading"
      :value="`${fleet.available} / ${fleet.total}`"
      :hint="t.availableHint"
    />
    <RouterLink to="/admin/reservas?status=pending_payment" class="dops__link">
      <KpiCard :label="t.pending" icon="fa-solid fa-hourglass-half" :loading="loading" :value="String(counts?.pending ?? '—')" />
    </RouterLink>
    <RouterLink to="/admin/reservas?status=confirmed" class="dops__link">
      <KpiCard :label="t.confirmed" icon="fa-solid fa-calendar-check" :loading="loading" :value="String(counts?.confirmed ?? '—')" />
    </RouterLink>
    <RouterLink to="/admin/reservas?status=delivered" class="dops__link">
      <KpiCard :label="t.inProgress" icon="fa-solid fa-key" :loading="loading" :value="String(counts?.inProgress ?? '—')" />
    </RouterLink>
    <KpiCard
      :label="t.revenue"
      icon="fa-solid fa-sack-dollar"
      :loading="loading"
      :value="money(revenue)"
      :current="data?.kpis?.revenueMonth"
      :previous="data?.kpis?.revenuePrevMonth"
      :hint="t.revenueHint"
    />
  </div>
</template>

<style scoped lang="scss">
.dops {
  @include flex-cards(180px, 0.85rem);

  @include until('sm') {
    > * {
      flex-basis: calc(50% - 0.5rem);
    }
  }

  &__link {
    display: flex;
    min-width: 0;

    > * {
      flex: 1;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }

    &:hover > * {
      box-shadow: $shadow-md;
      transform: translateY(-1px);
    }
  }
}
</style>
