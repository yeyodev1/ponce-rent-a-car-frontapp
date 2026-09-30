<script setup lang="ts">
import { computed } from 'vue'
import AdminCard from '../AdminCard.vue'
import TodayList from './TodayList.vue'
import { dashboardCopy as t } from '@/config/admin'
import type { Dashboard } from '@/types/admin'

/** Agenda del día: quién retira y quién devuelve hoy (hora de Guayaquil). */
const props = defineProps<{ today?: Dashboard['today']; loading: boolean }>()

const deliveries = computed(() => props.today?.deliveriesList || [])
const returns = computed(() => props.today?.returnsList || [])
</script>

<template>
  <section class="dtoday" aria-labelledby="dtoday-title">
    <h2 id="dtoday-title" class="dtoday__title"><i class="fa-regular fa-calendar"></i> {{ t.today }}</h2>
    <div class="dtoday__row">
      <AdminCard :title="`${t.deliveries} (${today?.deliveries ?? deliveries.length})`" icon="fa-solid fa-key" flush>
        <div v-if="loading" class="dtoday__sk"><div v-for="i in 2" :key="i" class="skeleton"></div></div>
        <TodayList v-else :items="deliveries" kind="pickup" :empty="today ? t.noDeliveries : t.todayUnavailable" />
      </AdminCard>
      <AdminCard :title="`${t.returns} (${today?.returns ?? returns.length})`" icon="fa-solid fa-rotate-left" flush>
        <div v-if="loading" class="dtoday__sk"><div v-for="i in 2" :key="i" class="skeleton"></div></div>
        <TodayList v-else :items="returns" kind="return" :empty="today ? t.noReturns : t.todayUnavailable" />
      </AdminCard>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dtoday {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__title {
    font-family: $font-principal;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

  &__row {
    @include flex-cards(320px, 1rem);
  }

  &__sk {
    padding: 0.5rem 1.15rem 1.15rem;
    @include flex(column, stretch, flex-start, 0.6rem);

    .skeleton {
      height: 44px;
    }
  }
}
</style>
