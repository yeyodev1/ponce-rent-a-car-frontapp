<script setup lang="ts">
import { handoverCopy as t } from '@/config/admin/ops'
import { money } from '@/utils/format'
import type { InspectionComparison } from '@/types/ops'

/** Resumen devolución vs entrega: km, combustible y daños nuevos. */
defineProps<{ c: InspectionComparison }>()

const km = (n: number) => n.toLocaleString('es-EC')
</script>

<template>
  <section class="cmp">
    <h3 class="cmp__title"><i class="fa-solid fa-scale-balanced"></i> {{ t.comparison }}</h3>
    <ul class="cmp__list">
      <li class="cmp__row">
        <span>{{ t.kmDriven }}</span>
        <strong>{{ km(c.kmDriven) }} km</strong>
      </li>
      <li class="cmp__row">
        <span>{{ t.included }}</span>
        <strong>{{ c.includedKm === null ? t.unlimited : `${km(c.includedKm)} km` }}</strong>
      </li>
      <li class="cmp__row" :class="{ 'cmp__row--bad': c.extraKm > 0 }">
        <span>{{ t.extraKm }}</span>
        <strong>{{ km(c.extraKm) }} km</strong>
      </li>
      <li class="cmp__row" :class="{ 'cmp__row--bad': c.extraKmCharge > 0 }">
        <span>{{ t.extraCharge }}</span>
        <strong>{{ money(c.extraKmCharge, true) }}</strong>
      </li>
      <li class="cmp__row" :class="{ 'cmp__row--bad': c.fuelDiff < 0 }">
        <span>{{ t.fuelDiff }}</span>
        <strong>{{
          c.fuelDiff === 0
            ? t.fuelSame
            : c.fuelDiff < 0
              ? t.fuelLess(-c.fuelDiff)
              : t.fuelMore(c.fuelDiff)
        }}</strong>
      </li>
      <li class="cmp__row" :class="{ 'cmp__row--bad': c.newDamages > 0 }">
        <span>{{ t.newDamages }}</span>
        <strong>{{ c.newDamages }}</strong>
      </li>
    </ul>
    <p v-if="c.newDamages > 0" class="cmp__alert">
      <i class="fa-solid fa-triangle-exclamation"></i> {{ t.goGuarantee }}
    </p>
  </section>
</template>

<style scoped lang="scss">
.cmp {
  @include flex(column, stretch, flex-start, 0.6rem);
  padding: 0.9rem;
  border-radius: 14px;
  background: $surface;
  border: 1px solid $line;

  &__title {
    font-family: $font-principal;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.1rem);
  }

  &__row {
    @include flex(row, center, space-between, 0.6rem);
    padding: 0.45rem 0;
    border-bottom: 1px dashed $line;
    font-size: 0.88rem;
    color: $ink-soft;

    &:last-child {
      border-bottom: none;
    }

    strong {
      color: $ink;
      text-align: right;
    }

    &--bad strong {
      color: $danger;
    }
  }

  &__alert {
    font-size: 0.84rem;
    font-weight: 700;
    color: $danger;
    background: $danger-bg;
    border-radius: 10px;
    padding: 0.6rem 0.75rem;
    @include flex(row, flex-start, flex-start, 0.45rem);

    i {
      margin-top: 0.15rem;
    }
  }
}
</style>
