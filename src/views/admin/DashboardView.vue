<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import KpiCard from '@/components/admin/KpiCard.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import LineChart from '@/components/admin/LineChart.vue'
import BarList from '@/components/admin/BarList.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import LatestList from '@/components/admin/dashboard/LatestList.vue'
import DashboardOps from '@/components/admin/dashboard/DashboardOps.vue'
import DashboardToday from '@/components/admin/dashboard/DashboardToday.vue'
import { adminService } from '@/services/admin.service'
import { useUserStore } from '@/stores/user'
import { money } from '@/utils/format'
import { es, shortDate, timeAgo } from '@/composables/admin/helpers'
import {
  leadSources,
  leadStatuses,
  leadStatusOrder,
  reservationStatuses,
  toneColors,
  vehicleStatuses,
} from '@/config/admin'
import { refObj, type Dashboard } from '@/types/admin'
import type { ApiError } from '@/types'

const userStore = useUserStore()
const data = ref<Dashboard | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await adminService.dashboard()
  } catch (e) {
    error.value = e as ApiError
  } finally {
    loading.value = false
  }
}

onMounted(load)

const k = computed(() => data.value?.kpis)
const conversion = computed(() => {
  const r = k.value?.conversionRate ?? 0
  return `${Math.round(r <= 1 ? r * 100 : r)}%`
})

const monthFmt = new Intl.DateTimeFormat('es-EC', { month: 'short', timeZone: 'UTC' })
const chartPoints = computed(() =>
  (data.value?.reservationsByMonth || []).map((m) => ({
    label: monthFmt.format(new Date(`${m.month}-15T00:00:00Z`)).replace('.', ''),
    value: m.count,
  })),
)

const byStatus = computed(() =>
  leadStatusOrder.map((s) => ({
    key: s,
    label: leadStatuses[s]!.label,
    value: data.value?.leadsByStatus?.[s as keyof Dashboard['leadsByStatus']] || 0,
    color: toneColors[leadStatuses[s]!.tone].fg,
    to: `/admin/leads?status=${s}`,
  })),
)

const bySource = computed(() =>
  [...(data.value?.leadsBySource || [])]
    .sort((a, b) => b.count - a.count)
    .map((s) => ({ key: s.source, label: leadSources[s.source] || s.source, value: s.count, color: '#06173a' })),
)

const fleet = computed(() =>
  Object.keys(vehicleStatuses).map((s) => ({ status: s, count: data.value?.fleet?.[s as keyof Dashboard['fleet']] || 0 })),
)
const fleetTotal = computed(() => fleet.value.reduce((a, b) => a + b.count, 0))

const latestReservations = computed(() =>
  (data.value?.latestReservations || []).map((r) => ({
    id: r._id,
    to: `/admin/reservas/${r._id}`,
    code: r.code,
    title: r.customerName || refObj(r.customer)?.name || es(r.categoryName) || r.categorySlug,
    meta: `${es(r.categoryName) || r.categorySlug} · ${shortDate(r.pickupAt)} – ${shortDate(r.returnAt)}${r.total ?? r.pricing?.total ? ` · ${money(r.total ?? r.pricing?.total ?? 0)}` : ''}`,
    status: r.status,
  })),
)

const latestLeads = computed(() =>
  (data.value?.latestLeads || []).map((l) => ({
    id: l._id,
    to: `/admin/leads/${l._id}`,
    code: l.code,
    title: l.name || l.phone || 'Sin nombre',
    meta: `${leadSources[l.source] || l.source} · ${timeAgo(l.createdAt)}`,
    status: l.status,
  })),
)

const greeting = computed(() => {
  const h = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Guayaquil' }).format(new Date()))
  const part = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  const name = userStore.user?.name?.split(' ')[0]
  return name ? `${part}, ${name}` : part
})

const today = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guayaquil' }).format(new Date())
</script>

<template>
  <div class="dash">
    <PageHeader :title="greeting" :subtitle="`Resumen del negocio · ${today}`">
      <RouterLink to="/admin/leads?status=new" class="btn btn--primary btn--sm">
        <i class="fa-solid fa-inbox"></i> Leads nuevos
      </RouterLink>
    </PageHeader>

    <EmptyState v-if="error" error :message="error.message" @retry="load" />

    <template v-else>
      <DashboardOps :data="data" :loading="loading" />
      <DashboardToday :today="data?.today" :loading="loading" />

      <div class="dash__kpis">
        <KpiCard label="Leads del mes" icon="fa-solid fa-inbox" :loading="loading" :value="String(k?.leadsMonth ?? 0)" :current="k?.leadsMonth" :previous="k?.leadsPrevMonth" />
        <KpiCard label="Reservas" icon="fa-solid fa-calendar-check" :loading="loading" :value="String(k?.reservationsMonth ?? 0)" :current="k?.reservationsMonth" :previous="k?.reservationsPrevMonth" />
        <KpiCard label="Tasa de conversión" icon="fa-solid fa-bullseye" :loading="loading" :value="conversion" hint="Leads que terminaron en reserva" />
      </div>

      <div class="dash__row">
        <AdminCard title="Reservas por mes" icon="fa-solid fa-chart-line" class="dash__wide">
          <div v-if="loading" class="skeleton dash__chart-sk"></div>
          <LineChart v-else-if="chartPoints.length" :points="chartPoints" />
          <p v-else class="dash__muted">Aún no hay reservas para graficar.</p>
        </AdminCard>
        <AdminCard title="Leads por estado" icon="fa-solid fa-filter">
          <div v-if="loading" class="dash__sk-list"><div v-for="i in 5" :key="i" class="skeleton"></div></div>
          <BarList v-else :items="byStatus" />
        </AdminCard>
      </div>

      <div class="dash__row">
        <AdminCard title="Leads por fuente" icon="fa-solid fa-bullhorn">
          <div v-if="loading" class="dash__sk-list"><div v-for="i in 4" :key="i" class="skeleton"></div></div>
          <BarList v-else-if="bySource.length" :items="bySource" />
          <p v-else class="dash__muted">Sin leads este mes.</p>
        </AdminCard>
        <AdminCard title="Estado de la flota" icon="fa-solid fa-car-side">
          <template #actions>
            <RouterLink to="/admin/flota" class="dash__link">{{ fleetTotal }} unidades <i class="fa-solid fa-arrow-right"></i></RouterLink>
          </template>
          <div v-if="loading" class="dash__sk-list"><div v-for="i in 3" :key="i" class="skeleton"></div></div>
          <div v-else class="dash__fleet">
            <div v-for="f in fleet" :key="f.status" class="dash__fleet-item">
              <strong>{{ f.count }}</strong>
              <StatusBadge :status="f.status" :map="vehicleStatuses" />
            </div>
          </div>
        </AdminCard>
      </div>

      <div class="dash__row">
        <AdminCard title="Últimas reservas" icon="fa-solid fa-calendar-check" flush>
          <template #actions><RouterLink to="/admin/reservas" class="dash__link">Ver todas <i class="fa-solid fa-arrow-right"></i></RouterLink></template>
          <div v-if="loading" class="dash__sk-list dash__sk-list--pad"><div v-for="i in 4" :key="i" class="skeleton"></div></div>
          <LatestList v-else :rows="latestReservations" :map="reservationStatuses" empty="Todavía no hay reservas." />
        </AdminCard>
        <AdminCard title="Últimos leads" icon="fa-solid fa-inbox" flush>
          <template #actions><RouterLink to="/admin/leads" class="dash__link">Ver todos <i class="fa-solid fa-arrow-right"></i></RouterLink></template>
          <div v-if="loading" class="dash__sk-list dash__sk-list--pad"><div v-for="i in 4" :key="i" class="skeleton"></div></div>
          <LatestList v-else :rows="latestLeads" :map="leadStatuses" empty="Todavía no hay leads." />
        </AdminCard>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.dash {
  @include flex(column, stretch, flex-start, 1rem);

  &__kpis {
    @include flex-cards(200px, 0.85rem);

    @include until('sm') {
      > * {
        flex-basis: calc(50% - 0.5rem);
      }
    }
  }

  &__row {
    @include flex-cards(320px, 1rem);
  }

  &__wide {
    flex-grow: 2 !important;
  }

  &__chart-sk {
    height: 220px;
  }

  &__sk-list {
    @include flex(column, stretch, flex-start, 0.7rem);

    .skeleton {
      height: 30px;
    }

    &--pad {
      padding: 0.5rem 1.15rem 1.15rem;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
    padding: 1rem 0;
  }

  &__link {
    font-size: 0.78rem;
    font-weight: 700;
    color: $blue;
    @include flex(row, center, flex-start, 0.35rem);
  }

  &__fleet {
    @include flex-cards(120px, 0.6rem);
  }

  &__fleet-item {
    @include flex(column, flex-start, flex-start, 0.35rem);
    padding: 0.75rem 0.85rem;
    border-radius: 12px;
    background: $paper;

    strong {
      font-family: $font-display;
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
    }
  }
}
</style>
