<script setup lang="ts">
import MoneyInput from '../MoneyInput.vue'
import { logTypes, vehicleHistoryCopy as t } from '@/config/admin/ops'
import type { VehicleLogInput } from '@/types/ops'

/** Nuevo registro de la bitácora: mantenimiento, reparación, daño o nota. */
defineProps<{ error?: string }>()
const form = defineModel<VehicleLogInput>({ required: true })

function onKm(e: Event) {
  const n = parseInt((e.target as HTMLInputElement).value.replace(/\D/g, ''), 10)
  form.value.mileageKm = Number.isFinite(n) ? n : null
}
</script>

<template>
  <div class="vlog">
    <div>
      <p class="vlog__label">{{ t.logType }}</p>
      <div class="vlog__types" role="radiogroup" :aria-label="t.logType">
        <label
          v-for="(def, key) in logTypes"
          :key="key"
          class="vlog__type"
          :class="{ 'vlog__type--on': form.type === key }"
        >
          <input
            v-model="form.type"
            type="radio"
            name="log-type"
            :value="key"
            class="visually-hidden"
          />
          <i :class="def.icon"></i> {{ def.label }}
        </label>
      </div>
    </div>
    <div class="vlog__row">
      <div>
        <label for="log-date">{{ t.logDate }}</label>
        <input id="log-date" v-model="form.date" type="date" />
      </div>
      <div>
        <label for="log-km">{{ t.logKm }}</label>
        <input
          id="log-km"
          type="text"
          inputmode="numeric"
          :value="form.mileageKm ?? ''"
          @input="onKm"
        />
      </div>
    </div>
    <MoneyInput v-model="form.cost" :label="t.logCost" />
    <div>
      <label for="log-desc">{{ t.logDesc }}</label>
      <textarea
        id="log-desc"
        v-model="form.description"
        maxlength="2000"
        :placeholder="t.logDescPh"
      ></textarea>
    </div>
    <p v-if="error" class="vlog__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.vlog {
  @include flex(column, stretch, flex-start, 0.9rem);

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__types {
    @include flex-cards(130px, 0.4rem);
  }

  &__type {
    margin: 0;
    min-height: $tap;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: 0.86rem;
    color: $ink-soft;
    cursor: pointer;
    @include flex(row, center, center, 0.4rem);

    &--on {
      border-color: $navy;
      color: $ink;
      box-shadow: 0 0 0 3px rgba($navy, 0.08);
    }
  }

  &__row {
    @include flex(row, flex-start, flex-start, 0.6rem);

    > div {
      flex: 1;
      min-width: 0;
    }
  }

  &__error {
    font-size: 0.84rem;
    font-weight: 700;
    color: $danger;
  }
}
</style>
