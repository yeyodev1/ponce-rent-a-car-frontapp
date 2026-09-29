<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import { copy } from '@/config/admin'

// Envoltorio del modal compartido con los valores por defecto de "Eliminar".
withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    danger?: boolean
  }>(),
  { title: copy.confirmDelete, message: copy.confirmDeleteMsg, confirmLabel: copy.delete, danger: true },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    :message="message"
    :confirm-label="confirmLabel"
    :cancel-label="copy.cancel"
    :danger="danger"
    @confirm="emit('confirm')"
    @cancel="emit('cancel')"
  >
    <slot />
  </BaseModal>
</template>
