<script setup lang="ts">
import StatusBadge from '../StatusBadge.vue'
import { reservationStatuses, toneColors, vehicleStatuses } from '@/config/admin'
import { categoryOf, dateTime, vehicleLabel } from '@/composables/admin/helpers'
import type { AvailabilityRow, BusySlot } from '@/types/admin'

// Una fila del calendario: etiqueta fija a la izquierda y la tira de días con
// las reservas posicionadas en porcentaje (flexbox + absolute, sin grid).
defineProps<{
  row?: AvailabilityRow
  days: { key: number; today: boolean; weekend: boolean; weekday: string; day: string }[]
  head?: boolean
  skeleton?: number
  place?: (s: BusySlot) => { left: number; width: number; cutStart: boolean; cutEnd: boolean }
  visible?: (s: BusySlot) => boolean
}>()

const colorOf = (status: string) => toneColors[reservationStatuses[status]?.tone || 'neutral'].fg
</script>

<template>
  <div class="lane" :class="{ 'lane--head': head }">
    <div class="lane__label">
      <template v-if="head">Unidad</template>
      <span v-else-if="skeleton" class="skeleton lane__sk-label"></span>
      <template v-else-if="row">
        <strong>{{ vehicleLabel(row.vehicle) }}</strong>
        <span class="lane__sub">
          {{ categoryOf(row.vehicle) }}
          <StatusBadge :status="row.vehicle.status" :map="vehicleStatuses" />
        </span>
      </template>
    </div>

    <div class="lane__track">
      <template v-if="head">
        <div v-for="d in days" :key="d.key" class="lane__day" :class="{ 'lane__day--today': d.today, 'lane__cell--weekend': d.weekend }">
          <small>{{ d.weekday }}</small>
          <strong>{{ d.day }}</strong>
        </div>
      </template>
      <template v-else>
        <div v-for="d in days" :key="d.key" class="lane__cell" :class="{ 'lane__cell--today': d.today, 'lane__cell--weekend': d.weekend }"></div>
        <span v-if="skeleton" class="skeleton lane__sk-bar" :style="{ left: `${skeleton * 9}%`, width: `${18 + skeleton * 5}%` }"></span>
        <template v-if="row && place && visible">
          <RouterLink
            v-for="slot in row.busy.filter(visible)"
            :key="slot.reservationCode + slot.from"
            :to="`/admin/reservas?q=${slot.reservationCode}`"
            class="lane__bar"
            :class="{ 'lane__bar--cut-start': place(slot).cutStart, 'lane__bar--cut-end': place(slot).cutEnd }"
            :style="{ left: `${place(slot).left}%`, width: `${place(slot).width}%`, background: colorOf(slot.status) }"
            :title="`${slot.reservationCode} · ${dateTime(slot.from)} → ${dateTime(slot.to)}`"
          >
            {{ slot.reservationCode }}
          </RouterLink>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
$label-w: 150px;
$cell-min: 46px;

.lane {
  display: flex;
  min-width: calc(#{$label-w} + #{$cell-min} * 14);
  border-bottom: 1px solid rgba($line, 0.7);

  &:last-child {
    border-bottom: 0;
  }

  &--head {
    background: rgba($paper, 0.8);
  }

  // Columna fija a la izquierda mientras se desliza la tira de días.
  &__label {
    position: sticky;
    left: 0;
    z-index: 2;
    flex: 0 0 $label-w;
    width: $label-w;
    padding: 0.6rem 0.75rem;
    background: $surface;
    border-right: 1px solid $line;
    @include flex(column, flex-start, center, 0.25rem);
    line-height: 1.25;

    @include from('md') {
      flex-basis: 220px;
      width: 220px;
    }

    strong {
      font-size: 0.82rem;
      color: $ink;
    }
  }

  &--head &__label {
    background: $paper;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  &__sub {
    @include flex(row, center, flex-start, 0.35rem);
    flex-wrap: wrap;
    font-size: 0.72rem;
    color: $ink-muted;
  }

  &__track {
    position: relative;
    flex: 1;
    display: flex;
    min-height: 58px;
  }

  &--head &__track {
    min-height: 0;
  }

  &__day,
  &__cell {
    flex: 1 1 0;
    min-width: $cell-min;
    border-right: 1px solid rgba($line, 0.55);

    &:last-child {
      border-right: 0;
    }
  }

  &__day {
    @include flex(column, center, center);
    padding: 0.45rem 0;
    line-height: 1.15;

    small {
      font-size: 0.64rem;
      text-transform: uppercase;
      color: $ink-muted;
      font-weight: 700;
    }

    strong {
      font-size: 0.9rem;
    }

    &--today strong {
      background: $accent;
      color: $navy;
      border-radius: 8px;
      padding: 0 0.4rem;
    }
  }

  &__cell {
    &--weekend {
      background: rgba($sand, 0.45);
    }

    &--today {
      background: rgba($accent, 0.12);
    }
  }

  &__bar {
    position: absolute;
    top: 50%;
    height: 28px;
    margin-top: -14px;
    border-radius: 8px;
    color: $surface;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0 0.5rem;
    @include flex(row, center, flex-start);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 4px 12px rgba($navy, 0.18);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba($navy, 0.25);
    }

    &--cut-start {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &--cut-end {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__sk-label {
    display: block;
    width: 80%;
    height: 14px;
  }

  &__sk-bar {
    position: absolute;
    top: 50%;
    height: 24px;
    margin-top: -12px;
  }
}
</style>
