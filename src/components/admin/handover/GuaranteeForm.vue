<script setup lang="ts">
import MoneyInput from '../MoneyInput.vue'
import { guaranteeCopy as t, guaranteeMethods } from '@/config/admin/ops'
import { money } from '@/utils/format'
import type { GuaranteeAction, GuaranteeMethod } from '@/types/ops'

/** Formulario de retención o de cobro de la garantía. */
defineProps<{ mode: GuaranteeAction; held: number; saving?: boolean; error?: string }>()
const form = defineModel<{
  amount: number
  method: GuaranteeMethod
  reference: string
  chargedAmount: number
  chargeReason: string
  notes: string
}>({
  required: true,
})
const emit = defineEmits<{ submit: []; cancel: [] }>()
</script>

<template>
  <form class="gform" @submit.prevent="emit('submit')">
    <template v-if="mode === 'hold'">
      <MoneyInput v-model="form.amount" :label="t.amount" />
      <div>
        <p class="gform__label">{{ t.method }}</p>
        <div class="gform__methods" role="radiogroup" :aria-label="t.method">
          <label
            v-for="(m, key) in guaranteeMethods"
            :key="key"
            class="gform__method"
            :class="{ 'gform__method--on': form.method === key }"
          >
            <input
              v-model="form.method"
              type="radio"
              name="g-method"
              :value="key"
              class="visually-hidden"
            />
            <i :class="m.icon"></i> {{ m.label }}
          </label>
        </div>
      </div>
      <div>
        <label for="g-ref">{{ t.reference }}</label>
        <input
          id="g-ref"
          v-model="form.reference"
          type="text"
          maxlength="120"
          :placeholder="t.referencePh"
        />
      </div>
    </template>
    <template v-else>
      <MoneyInput
        v-model="form.chargedAmount"
        :label="t.chargedAmount"
        :hint="`Retenido: ${money(held, true)}`"
      />
      <div>
        <label for="g-reason">{{ t.chargeReason }}</label>
        <textarea
          id="g-reason"
          v-model="form.chargeReason"
          maxlength="1000"
          rows="3"
          :placeholder="t.chargeReasonPh"
        ></textarea>
      </div>
    </template>
    <div>
      <label for="g-notes">{{ t.notes }}</label>
      <input id="g-notes" v-model="form.notes" type="text" maxlength="300" />
    </div>
    <p v-if="error" class="gform__error" role="alert">{{ error }}</p>
    <div class="gform__actions">
      <button type="button" class="btn btn--ghost btn--sm" @click="emit('cancel')">
        {{ t.cancel }}
      </button>
      <button
        type="submit"
        class="btn btn--sm"
        :class="mode === 'charge' ? 'btn--danger' : 'btn--dark'"
        :disabled="saving"
      >
        <i
          :class="
            saving
              ? 'fa-solid fa-spinner fa-spin'
              : mode === 'charge'
                ? 'fa-solid fa-hand-holding-dollar'
                : 'fa-solid fa-lock'
          "
        ></i>
        {{ mode === 'charge' ? t.charge : t.hold }}
      </button>
    </div>
  </form>
</template>

<style scoped lang="scss">
.gform {
  @include flex(column, stretch, flex-start, 0.75rem);
  padding: 0.9rem;
  border-radius: 14px;
  background: $paper;

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__methods {
    @include flex(row, stretch, flex-start, 0.4rem);
    flex-wrap: wrap;
  }

  &__method {
    flex: 1 1 90px;
    margin: 0;
    min-height: $tap;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: 0.84rem;
    color: $ink-soft;
    cursor: pointer;
    @include flex(row, center, center, 0.4rem);

    &--on {
      border-color: $navy;
      color: $ink;
      box-shadow: 0 0 0 3px rgba($navy, 0.08);
    }
  }

  textarea {
    min-height: 80px;
  }

  &__error {
    font-size: 0.84rem;
    font-weight: 700;
    color: $danger;
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
  }
}
</style>
