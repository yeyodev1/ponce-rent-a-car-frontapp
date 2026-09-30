<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import AvailabilityLane from '@/components/admin/availability/AvailabilityLane.vue'
import { useAvailability } from '@/composables/admin/useAvailability'
import { reservationFilters, toneColors } from '@/config/admin'

const { offset, rows, loading, error, days, load, place, visible } = useAvailability()

const legend = ['pending_documents', 'pending_payment', 'confirmed', 'delivered']
const colorOf = (status: string) => toneColors[reservationFilters[status]?.tone || 'neutral']
const range = computed(() => {
  const a = days.value[0]
  const b = days.value[days.value.length - 1]
  return a && b ? `${a.day} ${a.month} – ${b.day} ${b.month}` : ''
})
</script>

<template>
  <div>
    <PageHeader title="Disponibilidad" subtitle="Qué unidad está ocupada y por qué reserva, en las próximas dos semanas.">
      <div class="av__nav">
        <button class="av__arrow" type="button" aria-label="Semana anterior" @click="offset -= 7"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="av__today" type="button" :disabled="offset === 0" @click="offset = 0">Hoy</button>
        <button class="av__arrow" type="button" aria-label="Semana siguiente" @click="offset += 7"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </PageHeader>

    <div class="av__meta">
      <strong>{{ range }}</strong>
      <ul class="av__legend">
        <li v-for="s in legend" :key="s"><span :style="{ background: colorOf(s).fg }"></span>{{ reservationFilters[s]?.label }}</li>
      </ul>
    </div>

    <EmptyState v-if="error" error :message="error.message" @retry="load" />

    <section v-else class="av__board">
      <div class="av__scroll">
        <AvailabilityLane head :days="days" />
        <template v-if="loading">
          <AvailabilityLane v-for="i in 5" :key="i" :days="days" :skeleton="i" />
        </template>
        <p v-else-if="!rows.length" class="av__empty">No hay unidades registradas. Agrégalas en Flota → Unidades.</p>
        <AvailabilityLane v-for="row in rows" v-else :key="row.vehicle._id" :row="row" :days="days" :place="place" :visible="visible" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.av {
  &__nav {
    @include flex(row, center, flex-end, 0.35rem);
  }

  &__arrow,
  &__today {
    height: 40px;
    min-width: 40px;
    border-radius: 12px;
    background: $surface;
    border: 1px solid $line;
    font-size: 0.85rem;
    font-weight: 700;

    &:hover:not(:disabled) {
      border-color: $line-strong;
    }

    &:disabled {
      opacity: 0.45;
    }
  }

  &__today {
    padding-inline: 0.9rem;
  }

  &__meta {
    @include flex(row, center, space-between, 0.6rem 1rem);
    flex-wrap: wrap;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
  }

  &__legend {
    list-style: none;
    @include flex(row, center, flex-start, 0.4rem 0.9rem);
    flex-wrap: wrap;
    font-size: 0.74rem;
    color: $ink-soft;

    li {
      @include flex(row, center, flex-start, 0.35rem);
    }

    span {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
  }

  &__board {
    @include card;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__scroll {
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  &__empty {
    padding: 2rem 1rem;
    text-align: center;
    color: $ink-muted;
    font-size: $text-sm;
  }
}
</style>
