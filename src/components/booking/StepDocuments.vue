<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { booking } from '@/composables/booking/useBookingState'
import DocumentUploader from './DocumentUploader.vue'

/** Paso 7: licencia y documento de identidad. */
const { t } = useI18n()
const identityTitle = computed(() =>
  booking.driver.documentType === 'passport' ? t('booking.driver.passport') : t('booking.documents.identity'),
)
</script>

<template>
  <div class="docs">
    <DocumentUploader kind="license" icon="fa-solid fa-id-card" :title="t('booking.documents.license')" />
    <DocumentUploader
      kind="identity"
      :icon="booking.driver.documentType === 'passport' ? 'fa-solid fa-passport' : 'fa-regular fa-id-card'"
      :title="identityTitle"
    />
    <p class="docs__privacy"><i class="fa-solid fa-lock"></i>{{ t('booking.documents.privacy') }}</p>
  </div>
</template>

<style scoped lang="scss">
.docs {
  @include flex(column, stretch, flex-start, 1rem);

  &__privacy {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>
