<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/i18n'
import { useContract } from '@/composables/booking/useContract'
import ContractViewer from './ContractViewer.vue'
import ContractAcceptForm from './ContractAcceptForm.vue'
import ContractSeal from './ContractSeal.vue'

/**
 * Contrato en /reserva/:code: siempre se puede descargar (borrador o aceptado)
 * y, si falta, el cliente lo lee y lo acepta aquí mismo.
 */
const props = defineProps<{ code: string; token: string; active: boolean }>()
const emit = defineEmits<{ signed: [] }>()
const { t } = useI18n()
const { contract, loading, loadError, submitting, form, errors, signed, pdfUrl, load, accept } = useContract(
  () => props.code,
  () => props.token,
)
const open = ref(false)

const canAccept = computed(() => props.active && !signed.value)
const meta = computed(() => (contract.value?.version ? t('booking.contract.version', { n: contract.value.version }) : ''))

async function onAccept() {
  if (await accept()) {
    open.value = false
    emit('signed')
  }
}

onMounted(load)
</script>

<template>
  <section id="contrato" class="ccard">
    <header class="ccard__head">
      <span class="ccard__icon"><i class="fa-solid fa-file-signature"></i></span>
      <div class="ccard__titles">
        <h2>{{ t('booking.contract.cardTitle') }}</h2>
        <p v-if="meta">{{ meta }}</p>
      </div>
      <span v-if="contract" class="chip" :class="signed ? 'chip--success' : 'chip--warning'">
        {{ signed ? t('booking.contract.cardSigned') : t('booking.contract.cardPending') }}
      </span>
    </header>

    <p v-if="loading && !contract" class="ccard__muted">{{ t('booking.contract.loading') }}</p>
    <p v-else-if="loadError && !contract" class="ccard__muted">
      {{ loadError }}
      <button type="button" class="btn btn--ghost btn--sm" @click="load">{{ t('booking.contract.retry') }}</button>
    </p>

    <template v-else-if="contract">
      <ContractSeal v-if="signed" :acceptance="contract.acceptance" :hash="contract.hash" :version="contract.version" />
      <p v-else-if="canAccept && contract.required" class="ccard__muted">{{ t('booking.contract.requiredNote') }}</p>

      <div class="ccard__actions">
        <a :href="pdfUrl" target="_blank" rel="noopener" class="btn btn--dark btn--block">
          <i class="fa-solid fa-file-arrow-down"></i>{{ t('booking.reservation.contract') }}
        </a>
        <button type="button" class="btn btn--ghost btn--block" :aria-expanded="open" @click="open = !open">
          <i :class="open ? 'fa-solid fa-chevron-up' : 'fa-solid fa-file-lines'"></i>
          {{ open ? t('booking.contract.hide') : canAccept ? t('booking.contract.read') : t('booking.contract.view') }}
        </button>
      </div>

      <div v-if="open" class="ccard__body">
        <ContractViewer :title="contract.title" :text="contract.text" :meta="meta" :hint="t('booking.contract.readHint')" />
        <ContractAcceptForm
          v-if="canAccept"
          v-model:checked="form.checked"
          v-model:name="form.name"
          v-model:document-number="form.documentNumber"
          :errors="errors"
          :submitting="submitting"
          @submit="onAccept"
        />
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.ccard {
  @include flex(column, stretch, flex-start, 0.9rem);
  padding: 1.1rem;
  background: $surface;
  border: 1px solid $line;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  &__head {
    @include flex(row, center, flex-start, 0.75rem);
  }

  &__icon {
    flex: 0 0 40px;
    height: 40px;
    border-radius: 50%;
    background: $blue-soft;
    color: $blue;
    @include flex(row, center, center);
  }

  &__titles {
    flex: 1;
    min-width: 0;

    h2 {
      font-family: $font-principal;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0;
    }

    p {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-soft;
  }

  &__actions,
  &__body {
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__body {
    gap: 0.9rem;
  }
}
</style>
