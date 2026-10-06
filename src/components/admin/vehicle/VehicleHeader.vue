<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import { vehicleStatuses } from '@/config/admin'
import { vehicleHistoryCopy as t } from '@/config/admin/ops'
import { categoryOf } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Vehicle } from '@/types/admin'
import type { VehicleHistory } from '@/types/ops'

/** Cabecera de la unidad con sus números clave. */
const props = defineProps<{ v: Vehicle; stats: VehicleHistory['stats'] }>()

const status = computed(() => (props.v.isActive === false ? 'blocked' : props.v.status))
const km = (n: number | undefined) => (n || 0).toLocaleString('es-EC')
</script>

<template>
  <section class="vhead">
    <div class="vhead__top">
      <div class="vhead__photo">
        <img v-if="v.images?.[0]" :src="v.images[0]" :alt="`${v.brand} ${v.model}`" />
        <i v-else class="fa-solid fa-car-side"></i>
      </div>
      <div class="vhead__info">
        <p class="vhead__cat">{{ categoryOf(v) }}</p>
        <h1 class="vhead__name">
          {{ v.brand }} {{ v.model }} <small v-if="v.year">{{ v.year }}</small>
        </h1>
        <div class="vhead__row">
          <span class="vhead__plate">{{ v.plate }}</span>
          <StatusBadge :status="status" :map="vehicleStatuses" />
        </div>
      </div>
    </div>
    <ul class="vhead__stats">
      <li>
        <span>{{ t.km }}</span
        ><strong>{{ km(v.mileageKm) }}</strong>
      </li>
      <li>
        <span>{{ t.rentals }}</span
        ><strong>{{ stats.rentals }}</strong>
      </li>
      <li>
        <span>{{ t.kmDriven }}</span
        ><strong>{{ km(stats.kmDriven) }}</strong>
      </li>
      <li>
        <span>{{ t.revenue }}</span
        ><strong>{{ money(stats.revenue) }}</strong>
      </li>
      <li v-if="stats.maintenanceCost">
        <span>{{ t.maintenance }}</span
        ><strong>{{ money(stats.maintenanceCost) }}</strong>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.vhead {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1rem;
  @include flex(column, stretch, flex-start, 1rem);

  &__top {
    @include flex(row, center, flex-start, 0.9rem);
  }

  &__photo {
    flex: 0 0 96px;
    height: 72px;
    border-radius: 12px;
    background: $sand;
    overflow: hidden;
    @include flex(row, center, center);
    color: $ink-muted;
    font-size: 1.8rem;

    @include from('md') {
      flex-basis: 140px;
      height: 100px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    min-width: 0;
    @include flex(column, flex-start, flex-start, 0.25rem);
  }

  &__cat {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $blue;
  }

  &__name {
    font-size: 1.2rem;
    font-weight: 800;
    line-height: 1.2;

    small {
      font-size: 0.85rem;
      color: $ink-muted;
    }
  }

  &__row {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__plate {
    font-family: monospace;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 0.15rem 0.5rem;
    border: 1.5px solid $ink;
    border-radius: 6px;
  }

  &__stats {
    list-style: none;
    @include flex-cards(120px, 0.5rem);

    li {
      background: $paper;
      border-radius: 12px;
      padding: 0.6rem 0.75rem;
      @include flex(column, flex-start, flex-start);
    }

    span {
      font-size: 0.7rem;
      font-weight: 700;
      color: $ink-muted;
    }

    strong {
      font-size: 1.1rem;
      white-space: nowrap;
    }
  }
}
</style>
