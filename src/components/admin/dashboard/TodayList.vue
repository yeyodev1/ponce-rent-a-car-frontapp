<script setup lang="ts">
import { locations } from '@/config/admin'
import { es, vehicleLabel } from '@/composables/admin/helpers'
import { refObj, type TodayItem } from '@/types/admin'

/** Entregas o devoluciones de hoy: hora, código, cliente, vehículo y lugar. */
const props = defineProps<{ items: TodayItem[]; kind: 'pickup' | 'return'; empty: string }>()

const timeFmt = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil' })
const time = (i: TodayItem) => {
  if (i.time) return i.time
  const at = i.at || (props.kind === 'pickup' ? i.pickupAt : i.returnAt)
  return at ? timeFmt.format(new Date(at)) : '—'
}
const place = (i: TodayItem) => {
  const code = i.location || (props.kind === 'pickup' ? i.pickupLocation : i.returnLocation)
  return code ? locations[code] || code : ''
}
const who = (i: TodayItem) => i.customerName || refObj(i.customer)?.name || 'Cliente'
const what = (i: TodayItem) => {
  const cat = es(i.categoryName) || i.categorySlug || ''
  const unit = i.vehicleLabel || (refObj(i.vehicle) ? vehicleLabel(refObj(i.vehicle)) : '')
  return [cat, unit].filter(Boolean).join(' · ')
}
</script>

<template>
  <ul v-if="items.length" class="today">
    <li v-for="i in items" :key="i._id">
      <RouterLink :to="`/admin/reservas/${i._id}`" class="today__row">
        <span class="today__time">{{ time(i) }}</span>
        <span class="today__main">
          <span class="today__top">
            <span class="today__code">{{ i.code }}</span>
            <strong>{{ who(i) }}</strong>
          </span>
          <small v-if="what(i)"><i class="fa-solid fa-car-side"></i> {{ what(i) }}</small>
          <small v-if="place(i)"><i class="fa-solid fa-location-dot"></i> {{ place(i) }}</small>
        </span>
        <i class="fa-solid fa-chevron-right today__go"></i>
      </RouterLink>
    </li>
  </ul>
  <p v-else class="today__empty"><i class="fa-regular fa-face-smile"></i> {{ empty }}</p>
</template>

<style scoped lang="scss">
.today {
  list-style: none;

  li + li {
    border-top: 1px solid rgba($line, 0.7);
  }

  &__row {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.75rem 1.15rem;
    transition: background-color 0.18s ease;

    &:hover {
      background: rgba($blue-soft, 0.5);
    }
  }

  &__time {
    flex-shrink: 0;
    min-width: 62px;
    padding: 0.35rem 0.4rem;
    border-radius: 10px;
    background: $navy;
    color: $surface;
    font-weight: 800;
    font-size: 0.8rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);
    line-height: 1.3;

    small {
      font-size: 0.75rem;
      color: $ink-muted;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      i {
        width: 14px;
        margin-right: 0.15rem;
      }
    }
  }

  &__top {
    @include flex(row, center, flex-start, 0.45rem);
    max-width: 100%;

    strong {
      font-size: 0.88rem;
      color: $ink;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 800;
    color: $blue-deep;
    background: $blue-soft;
    padding: 0.12rem 0.4rem;
    border-radius: 6px;
    flex-shrink: 0;
  }

  &__go {
    color: $ink-muted;
    font-size: 0.75rem;
  }

  &__empty {
    padding: 1.4rem 1.15rem;
    font-size: $text-sm;
    color: $ink-muted;
    @include flex(row, center, flex-start, 0.5rem);
  }
}
</style>
