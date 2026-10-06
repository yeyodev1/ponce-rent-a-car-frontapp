<script setup lang="ts">
import ConfirmDialog from '../ConfirmDialog.vue'
import { voidCopy as t } from '@/config/admin/ops'
import { money } from '@/utils/format'
import type { Payment } from '@/types/admin'

/** Confirmación de anulación con motivo obligatorio. */
defineProps<{ payment: Payment | null; error?: string }>()
const reason = defineModel<string>('reason', { required: true })
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <ConfirmDialog
    :open="Boolean(payment)"
    :title="t.title(money(payment?.amount || 0, true))"
    :message="t.message"
    :confirm-label="t.action"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <div class="vpd">
      <label for="void-reason">{{ t.reason }}</label>
      <textarea
        id="void-reason"
        v-model="reason"
        maxlength="500"
        rows="3"
        :placeholder="t.reasonPh"
      ></textarea>
      <p v-if="error" class="vpd__error" role="alert">{{ error }}</p>
      <p class="vpd__hint">{{ t.staffWindow }}</p>
    </div>
  </ConfirmDialog>
</template>

<style scoped lang="scss">
.vpd {
  width: 100%;
  text-align: left;
  margin-top: 0.3rem;

  textarea {
    min-height: 84px;
  }

  &__error {
    font-size: 0.82rem;
    font-weight: 700;
    color: $danger;
    margin-top: 0.3rem;
  }

  &__hint {
    font-size: 0.74rem;
    color: $ink-muted;
    margin-top: 0.3rem;
  }
}
</style>
