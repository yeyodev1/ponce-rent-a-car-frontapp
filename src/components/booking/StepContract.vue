<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from '@/i18n'
import { booking } from '@/composables/booking/useBookingState'
import { contractRequired, useContract } from '@/composables/booking/useContract'
import ContractViewer from '@/components/contract/ContractViewer.vue'
import ContractAcceptForm from '@/components/contract/ContractAcceptForm.vue'
import ContractSeal from '@/components/contract/ContractSeal.vue'

/** Paso 9: leer el contrato generado con los datos de la reserva y aceptarlo. */
const { t } = useI18n()
const { contract, loading, loadError, submitting, form, errors, signed, pdfUrl, load, accept } = useContract(
  () => booking.reservation?.code || '',
  () => booking.reservation?.token || '',
)

const meta = computed(() => (contract.value?.version ? t('booking.contract.version', { n: contract.value.version }) : ''))

// Un contrato que ya venía aceptado (recarga, otra pestaña) deja seguir sin volver a firmar.
watch(signed, (v) => {
  if (v) booking.contractSigned = true
})

async function onAccept() {
  if (await accept()) booking.contractSigned = true
}

onMounted(load)
</script>

<template>
  <div class="cstep">
    <div v-if="loading && !contract" class="cstep__loading" aria-busy="true">
      <span class="skeleton cstep__sk-head"></span>
      <span class="skeleton cstep__sk-body"></span>
      <p>{{ t('booking.contract.loading') }}</p>
    </div>

    <div v-else-if="loadError && !contract" class="cstep__error" role="alert">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>{{ loadError }}</p>
      <button type="button" class="btn btn--dark btn--sm" @click="load">{{ t('booking.contract.retry') }}</button>
    </div>

    <template v-else-if="contract">
      <p v-if="!signed" class="cstep__note" :class="{ 'cstep__note--optional': !contractRequired }">
        <i :class="contractRequired ? 'fa-solid fa-circle-info' : 'fa-regular fa-clock'"></i>
        {{ contractRequired ? t('booking.contract.requiredNote') : t('booking.contract.optional') }}
      </p>

      <ContractViewer :title="contract.title" :text="contract.text" :meta="meta" :hint="t('booking.contract.readHint')">
        <template #actions>
          <a :href="pdfUrl" target="_blank" rel="noopener" class="btn btn--ghost btn--sm">
            <i class="fa-solid fa-file-arrow-down"></i>{{ t('booking.contract.download') }}
          </a>
        </template>
      </ContractViewer>

      <Transition name="rise" mode="out-in">
        <ContractSeal v-if="signed" key="seal" :acceptance="contract.acceptance" :hash="contract.hash" :version="contract.version" />
        <ContractAcceptForm
          v-else
          key="form"
          v-model:checked="form.checked"
          v-model:name="form.name"
          v-model:document-number="form.documentNumber"
          :errors="errors"
          :submitting="submitting"
          @submit="onAccept"
        />
      </Transition>
    </template>
  </div>
</template>

<style scoped lang="scss">
.cstep {
  @include flex(column, stretch, flex-start, 1rem);

  &__loading,
  &__error {
    @include flex(column, stretch, flex-start, 0.8rem);

    p {
      font-size: $text-sm;
      color: $ink-muted;
      text-align: center;
    }
  }

  &__sk-head {
    height: 44px;
    border-radius: $radius-sm;
  }

  &__sk-body {
    height: 320px;
    border-radius: $radius-md;
  }

  &__error {
    align-items: center;
    padding: 1.5rem 1rem;
    border-radius: $radius-md;
    background: $danger-bg;

    > i {
      color: $danger;
      font-size: 1.5rem;
    }
  }

  &__note {
    @include flex(row, flex-start, flex-start, 0.6rem);
    padding: 0.8rem 1rem;
    border-radius: $radius-md;
    background: $blue-soft;
    font-size: $text-sm;
    font-weight: 600;
    color: $ink;

    i {
      color: $blue;
      margin-top: 0.2rem;
    }

    &--optional {
      background: $sand;
      font-weight: 500;
      color: $ink-soft;
    }
  }
}
</style>
