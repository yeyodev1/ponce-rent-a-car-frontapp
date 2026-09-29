<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import { languages, locations, reservationStatuses, verificationStatuses } from '@/config/admin'
import { dateTime, es, vehicleLabel } from '@/composables/admin/helpers'
import { refId, refObj, type AdminReservation } from '@/types/admin'
import { useCatalogStore } from '@/stores/catalog'

const props = defineProps<{ r: AdminReservation }>()

const catalog = useCatalogStore()
catalog.load()

// La reserva guarda códigos: se muestran con el nombre del catálogo (o el código si ya no existe).
const coverageName = (code: string) =>
  es(catalog.coverages.find((c) => c.code === code)?.name) || code
const extraName = (code: string) => es(catalog.extras.find((x) => x.code === code)?.name) || code

const customer = computed(() => refObj(props.r.customer))
const vehicle = computed(() => refObj(props.r.vehicle))

const trip = computed(() => [
  {
    icon: 'fa-solid fa-plane-arrival',
    label: 'Retiro',
    value: dateTime(props.r.pickupAt),
    sub: locations[props.r.pickupLocation] || props.r.pickupLocation,
  },
  {
    icon: 'fa-solid fa-plane-departure',
    label: 'Devolución',
    value: dateTime(props.r.returnAt),
    sub: locations[props.r.returnLocation] || props.r.returnLocation,
  },
])

const details = computed(() =>
  [
    { label: 'Categoría', value: es(props.r.categoryName) || props.r.categorySlug },
    { label: 'Unidad', value: vehicle.value ? vehicleLabel(vehicle.value) : 'Sin asignar' },
    { label: 'Días', value: String(props.r.pricing?.days || '—') },
    {
      label: 'Kilometraje',
      value:
        props.r.mileage === 'unlimited'
          ? 'Ilimitado'
          : `Limitado${props.r.pricing?.includedKm ? ` (${props.r.pricing.includedKm} km)` : ''}`,
    },
    { label: 'Cobertura', value: props.r.coverage && coverageName(props.r.coverage) },
    {
      label: 'Extras',
      value: props.r.extras?.map((e) => `${extraName(e.code)} ×${e.quantity}`).join(', '),
    },
    { label: 'Dirección de entrega', value: props.r.pickupAddress },
    { label: 'Idioma', value: languages[props.r.language] },
    {
      label: 'Contrato',
      value:
        props.r.contract?.status && props.r.contract.status !== 'not_required'
          ? props.r.contract.status
          : '',
    },
    { label: 'Creada', value: dateTime(props.r.createdAt) },
  ].filter((d) => d.value),
)
</script>

<template>
  <section class="rinfo">
    <header class="rinfo__head">
      <div>
        <p class="rinfo__eyebrow">Reserva</p>
        <h1 class="rinfo__code">{{ r.code }}</h1>
      </div>
      <div class="rinfo__badges">
        <StatusBadge :status="r.status" :map="reservationStatuses" />
        <StatusBadge :status="r.verification" :map="verificationStatuses" icon />
      </div>
    </header>

    <div class="rinfo__trip">
      <div v-for="t in trip" :key="t.label" class="rinfo__leg">
        <i :class="t.icon"></i>
        <div>
          <span class="rinfo__label">{{ t.label }}</span>
          <strong>{{ t.value }}</strong>
          <small>{{ t.sub }}</small>
        </div>
      </div>
    </div>

    <div class="rinfo__customer">
      <span class="rinfo__avatar"><i class="fa-solid fa-id-card"></i></span>
      <div class="rinfo__cust-text">
        <strong>{{ customer?.name || 'Cliente' }}</strong>
        <small>{{
          [customer?.documentNumber, customer?.phone, customer?.email].filter(Boolean).join(' · ')
        }}</small>
      </div>
      <RouterLink
        v-if="refId(r.customer)"
        :to="`/admin/clientes/${refId(r.customer)}`"
        class="rinfo__go"
        aria-label="Ver cliente"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </RouterLink>
    </div>

    <dl class="rinfo__details">
      <div v-for="d in details" :key="d.label">
        <dt>{{ d.label }}</dt>
        <dd>{{ d.value }}</dd>
      </div>
    </dl>

    <RouterLink v-if="refId(r.lead)" :to="`/admin/leads/${refId(r.lead)}`" class="rinfo__lead">
      <i class="fa-solid fa-inbox"></i> Viene del lead
      {{ refObj(r.lead)?.code ? `#${refObj(r.lead)?.code}` : '' }}
    </RouterLink>
  </section>
</template>

<style scoped lang="scss">
.rinfo {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 1.1rem);

  @include from('md') {
    padding: 1.5rem;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.75rem);
    flex-wrap: wrap;
  }

  &__eyebrow {
    @include eyebrow;
    font-size: 0.66rem;
  }

  &__code {
    font-size: clamp(1.6rem, 1.3rem + 1.2vw, 2.2rem);
    color: $navy;
  }

  &__badges {
    @include flex(row, center, flex-end, 0.35rem);
    flex-wrap: wrap;
  }

  &__trip {
    @include flex-cards(220px, 0.6rem);
  }

  &__leg {
    @include flex(row, flex-start, flex-start, 0.75rem);
    padding: 0.85rem 0.95rem;
    border-radius: 14px;
    background: $navy;
    color: $on-dark;

    > i {
      color: $accent;
      margin-top: 0.2rem;
    }

    div {
      @include flex(column, flex-start, flex-start);
      line-height: 1.3;
    }

    strong {
      font-size: 0.95rem;
    }

    small {
      font-size: 0.76rem;
      color: $on-dark-soft;
    }
  }

  &__label {
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba($on-dark, 0.55);
  }

  &__customer {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.8rem 0.9rem;
    border: 1px solid $line;
    border-radius: 14px;
  }

  &__avatar {
    @include flex(row, center, center);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: $blue-soft;
    color: $blue-deep;
    flex-shrink: 0;
  }

  &__cust-text {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center);
    line-height: 1.3;

    small {
      font-size: 0.78rem;
      color: $ink-muted;
      overflow-wrap: anywhere;
    }
  }

  &__go {
    @include flex(row, center, center);
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: $ink-muted;

    &:hover {
      background: $sand;
      color: $ink;
    }
  }

  &__details {
    @include flex-cards(160px, 0.8rem 1.2rem);

    dt {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: $ink-muted;
    }

    dd {
      font-size: 0.9rem;
      font-weight: 600;
      color: $ink;
    }
  }

  &__lead {
    font-size: 0.82rem;
    font-weight: 700;
    color: $blue;
    @include flex(row, center, flex-start, 0.45rem);
  }
}
</style>
