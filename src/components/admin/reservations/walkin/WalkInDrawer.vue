<script setup lang="ts">
import { computed, watch } from 'vue'
import AdminDrawer from '../../AdminDrawer.vue'
import WalkInTrip from './WalkInTrip.vue'
import WalkInOptions from './WalkInOptions.vue'
import WalkInDriver from './WalkInDriver.vue'
import WalkInQuote from './WalkInQuote.vue'
import { useWalkIn } from '@/composables/admin/useWalkIn'
import { copy, locations, walkInCopy as t } from '@/config/admin'
import type { LocationCode, LocationOption } from '@/types'

/** Reserva presencial en un solo drawer: vehículo → fechas → opciones → conductor, con precio en vivo. */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const w = useWalkIn(() => emit('close'))
const { form, catalog } = w

watch(
  () => props.open,
  (open) => {
    if (open) w.loadVehicles()
  },
)

// Lugares configurados; si la configuración no llegó, los cuatro de siempre.
const locationOptions = computed<LocationOption[]>(() =>
  catalog.config?.booking.locations?.length
    ? catalog.config.booking.locations
    : (Object.keys(locations) as LocationCode[]).map((code) => ({ code, label: { es: locations[code]!, en: '' }, fee: 0 })),
)
const categories = computed(() => [...catalog.categories].sort((a, b) => a.order - b.order))
const activeExtras = computed(() => catalog.extras.filter((x) => x.isActive !== false))
</script>

<template>
  <AdminDrawer :open="open" :title="t.title" :subtitle="t.subtitle" wide @close="emit('close')">
    <form id="walkin-form" class="walkin" @submit.prevent="w.submit">
      <div class="walkin__cols">
        <div class="walkin__col">
          <WalkInTrip
            :form="form"
            :categories="categories"
            :units="w.units.value"
            :location-options="locationOptions"
            :date-error="w.dateError.value"
            :tried="w.tried.value"
          />
          <WalkInOptions :form="form" :coverages="catalog.coverages" :extras="activeExtras" />
        </div>
        <div class="walkin__col">
          <WalkInDriver :form="form" :tried="w.tried.value" />
          <div>
            <label for="wi-notes">{{ t.notes }}</label>
            <textarea id="wi-notes" v-model="form.notes" rows="2" :placeholder="t.notesPlaceholder"></textarea>
          </div>
          <WalkInQuote
            :quote="w.quote.value"
            :loading="w.quoting.value"
            :failed="w.quoteFailed.value"
            :warnings="w.quoteWarnings.value"
          />
        </div>
      </div>
    </form>
    <template #footer>
      <button class="btn btn--ghost btn--sm" type="button" @click="emit('close')">{{ copy.cancel }}</button>
      <button class="btn btn--primary btn--sm" type="submit" form="walkin-form" :disabled="w.creating.value">
        <i :class="w.creating.value ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'"></i>
        {{ w.creating.value ? t.creating : t.submit }}
      </button>
    </template>
  </AdminDrawer>
</template>

<style scoped lang="scss">
.walkin {
  &__cols {
    @include flex(column, stretch, flex-start, 1.4rem);

    @include from('md') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__col {
    flex: 1 1 0;
    min-width: 0;
    @include flex(column, stretch, flex-start, 1.4rem);
  }
}
</style>
