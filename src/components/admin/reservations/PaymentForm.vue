<script setup lang="ts">
import { ref, watch } from 'vue'
import MoneyInput from '../MoneyInput.vue'
import { paymentCopy as t, paymentMethods } from '@/config/admin'
import { money } from '@/utils/format'
import type { PaymentMethod } from '@/types/admin'

/** Registrar un pago en el local. El monto arranca con el saldo pendiente. */
const props = defineProps<{ balance: number; saving?: boolean }>()
const emit = defineEmits<{ submit: [body: { amount: number; method: PaymentMethod; note?: string }] }>()

const amount = ref(props.balance)
const method = ref<PaymentMethod>('cash')
const note = ref('')
const error = ref('')

// Tras registrar un pago el saldo cambia: el formulario se prepara para el siguiente.
watch(
  () => props.balance,
  (b) => {
    amount.value = b
    note.value = ''
  },
)

function submit() {
  error.value = ''
  if (!amount.value || amount.value <= 0) {
    error.value = t.invalidAmount
    return
  }
  emit('submit', { amount: amount.value, method: method.value, ...(note.value.trim() ? { note: note.value.trim() } : {}) })
}
</script>

<template>
  <form class="payform" @submit.prevent="submit">
    <h3 class="payform__title"><i class="fa-solid fa-cash-register"></i> {{ t.register }}</h3>
    <MoneyInput v-model="amount" :label="t.amount" :hint="t.amountHint(money(balance, true))" />
    <div>
      <p class="payform__label">{{ t.method }}</p>
      <div class="payform__methods" role="radiogroup" :aria-label="t.method">
        <label v-for="(label, key) in paymentMethods" :key="key" class="payform__method" :class="{ 'payform__method--on': method === key }">
          <input v-model="method" type="radio" name="pay-method" :value="key" class="visually-hidden" />
          <i :class="key === 'cash' ? 'fa-solid fa-money-bill-wave' : key === 'transfer' ? 'fa-solid fa-building-columns' : 'fa-regular fa-credit-card'"></i>
          {{ label }}
        </label>
      </div>
    </div>
    <div>
      <label for="pay-note">{{ t.note }}</label>
      <input id="pay-note" v-model="note" type="text" maxlength="200" :placeholder="t.notePlaceholder" />
    </div>
    <p v-if="error" class="payform__error" role="alert">{{ error }}</p>
    <button class="btn btn--dark btn--sm payform__submit" type="submit" :disabled="saving">
      <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-plus'"></i> {{ t.submit }}
    </button>
  </form>
</template>

<style scoped lang="scss">
.payform {
  @include flex(column, stretch, flex-start, 0.8rem);
  padding: 1rem;
  border-radius: 14px;
  background: $paper;

  &__title {
    font-family: $font-principal;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.45rem);

    i {
      color: $blue;
    }
  }

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
    @include flex(row, center, center, 0.4rem);
    min-height: 42px;
    padding: 0.4rem 0.6rem;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    font-size: 0.82rem;
    font-weight: 700;
    color: $ink-soft;
    cursor: pointer;
    transition: all 0.2s ease;

    &--on {
      border-color: $blue;
      background: $blue-soft;
      color: $blue-deep;
    }

    &:focus-within {
      outline: 2px solid $blue;
      outline-offset: 2px;
    }
  }

  &__error {
    font-size: 0.8rem;
    color: $danger;
    font-weight: 600;
  }

  &__submit {
    align-self: flex-end;
  }
}
</style>
