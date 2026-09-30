<script setup lang="ts">
import { money } from '@/utils/format'
import { es } from '@/composables/admin/helpers'
import type { AdminReservation } from '@/types/admin'

defineProps<{ r: AdminReservation }>()
</script>

<template>
  <section class="price">
    <h2 class="price__title"><i class="fa-solid fa-receipt"></i> Precio congelado al reservar</h2>
    <ul class="price__lines">
      <li v-for="l in r.pricing?.lines || []" :key="l.key">
        <span>{{ es(l.label) || l.key }}</span>
        <strong>{{ money(l.amount) }}</strong>
      </li>
    </ul>
    <div class="price__total">
      <span>Total</span>
      <strong>{{ money(r.pricing?.total || 0) }}</strong>
    </div>
    <p v-if="r.pricing?.deposit" class="price__deposit">Separación sugerida en línea: <strong>{{ money(r.pricing.deposit) }}</strong></p>
    <p v-if="r.pricing?.guaranteeAmount" class="price__guarantee">
      <i class="fa-solid fa-shield-halved"></i>
      Garantía del vehículo: <strong>{{ money(r.pricing.guaranteeAmount) }}</strong> — se gestiona en el retiro (Datafast), no online.
    </p>
  </section>
</template>

<style scoped lang="scss">
.price {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.8rem);

  &__deposit {
    font-size: 0.8rem;
    color: $ink-muted;
  }

  &__title {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__lines {
    list-style: none;

    li {
      @include flex(row, baseline, space-between, 1rem);
      padding: 0.45rem 0;
      font-size: 0.88rem;
      color: $ink-soft;
      border-bottom: 1px dashed $line;
    }

    strong {
      color: $ink;
      white-space: nowrap;
    }
  }

  &__total {
    @include flex(row, baseline, space-between);
    font-weight: 800;

    strong {
      font-family: $font-display;
      font-size: 1.5rem;
    }
  }

  &__guarantee {
    font-size: 0.8rem;
    color: $ink-soft;
    background: $accent-soft;
    border-radius: 12px;
    padding: 0.65rem 0.8rem;

    i {
      color: $accent-deep;
      margin-right: 0.3rem;
    }
  }
}
</style>
