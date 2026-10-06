<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatDate } from '@/utils/format'
import type { ContractAcceptance } from '@/types/contract'

/** Sello de un contrato ya aceptado: quién, cuándo y la huella del texto. */
const props = defineProps<{ acceptance: ContractAcceptance | null; hash: string | null; version: number | null }>()
const { t } = useI18n()

const when = computed(() =>
  props.acceptance?.at ? formatDate(props.acceptance.at, { hour: '2-digit', minute: '2-digit' }) : '',
)
</script>

<template>
  <div class="cseal" role="status">
    <span class="cseal__icon"><i class="fa-solid fa-file-circle-check"></i></span>
    <div class="cseal__body">
      <strong>{{ t('booking.contract.signedTitle') }}</strong>
      <p>{{ t('booking.contract.signedBody', { name: acceptance?.name || '', date: when }) }}</p>
      <p v-if="version" class="cseal__meta">{{ t('booking.contract.version', { n: version }) }}</p>
      <p v-if="hash" class="cseal__hash">
        <span>{{ t('booking.contract.fingerprint') }}</span>
        <code>{{ hash }}</code>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cseal {
  @include flex(row, flex-start, flex-start, 0.85rem);
  padding: 1rem;
  border-radius: $radius-md;
  background: $success-bg;
  border: 1.5px solid rgba($success, 0.4);

  &__icon {
    flex: 0 0 44px;
    height: 44px;
    border-radius: 50%;
    background: $success;
    color: $surface;
    font-size: 1.15rem;
    @include flex(row, center, center);
  }

  &__body {
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.2rem);
    font-size: $text-sm;
    color: $ink-soft;

    strong {
      color: $ink;
      font-size: 1rem;
    }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__hash {
    margin-top: 0.3rem;
    @include flex(column, stretch, flex-start, 0.15rem);

    span {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: $ink-muted;
    }

    code {
      font-size: 0.72rem;
      word-break: break-all;
      color: $ink;
    }
  }
}
</style>
