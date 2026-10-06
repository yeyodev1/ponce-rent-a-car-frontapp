<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import ContractViewer from '@/components/contract/ContractViewer.vue'
import { contractService } from '@/services/contract.service'
import { useToastStore } from '@/stores/toast'
import { contractCopy } from '@/config/admin/contract'
import { dateTime } from '@/composables/admin/helpers'
import type { ApiError } from '@/types'
import type { AdminReservation } from '@/types/admin'
import type { ContractView } from '@/types/contract'

/**
 * Contrato de la reserva en el panel: estado, versión, datos de la aceptación
 * electrónica (nombre, documento, IP, fecha, huella), texto y PDF.
 */
const props = defineProps<{ r: AdminReservation }>()
defineEmits<{ changed: [] }>()
const c = contractCopy.card
const toast = useToastStore()

const contract = ref<ContractView | null>(null)
const loading = ref(true)
const error = ref('')
const showText = ref(false)
const downloading = ref(false)

const signed = computed(() => contract.value?.status === 'signed')
const confirmedLike = computed(() => ['confirmed', 'delivered', 'completed'].includes(props.r.status))
const pendingLike = computed(() => ['pending_documents', 'pending_payment'].includes(props.r.status))

async function load() {
  loading.value = true
  error.value = ''
  try {
    contract.value = await contractService.reservationContract(props.r._id)
  } catch (e) {
    error.value = (e as ApiError).message || c.loadError
  } finally {
    loading.value = false
  }
}

async function download() {
  downloading.value = true
  try {
    await contractService.downloadReservationPdf(props.r._id, props.r.code)
  } catch (e) {
    toast.error((e as ApiError).message || c.loadError)
  } finally {
    downloading.value = false
  }
}

async function copyHash() {
  try {
    await navigator.clipboard.writeText(contract.value?.hash || '')
    toast.success(c.hashCopied)
  } catch {
    /* sin portapapeles: la huella está visible para copiarla a mano */
  }
}

// El detalle se recarga tras cada cambio (estado, unidad): el texto del borrador depende de eso.
watch(() => [props.r._id, props.r.status, props.r.vehicle], load, { immediate: true })
</script>

<template>
  <AdminCard :title="c.title" icon="fa-solid fa-file-signature">
    <template #actions>
      <span v-if="contract" class="chip" :class="signed ? 'chip--success' : 'chip--warning'">
        {{ signed ? c.signed : c.pending }}
      </span>
    </template>

    <div v-if="loading && !contract" class="skeleton rcontract__sk"></div>
    <p v-else-if="error" class="rcontract__muted">
      {{ error }} <button type="button" class="btn btn--ghost btn--sm" @click="load">{{ c.retry }}</button>
    </p>

    <div v-else-if="contract" class="rcontract">
      <p class="rcontract__version"><i class="fa-solid fa-code-branch"></i> {{ c.version(contract.version) }}</p>

      <dl v-if="signed && contract.acceptance" class="rcontract__facts">
        <div><dt>{{ c.acceptedBy }}</dt><dd>{{ contract.acceptance.name }}</dd></div>
        <div><dt>{{ c.document }}</dt><dd>{{ contract.acceptance.documentNumber }}</dd></div>
        <div><dt>{{ c.date }}</dt><dd>{{ dateTime(contract.acceptance.at) }}</dd></div>
        <div><dt>{{ c.ip }}</dt><dd>{{ contract.acceptance.ip || '—' }}</dd></div>
        <div class="rcontract__wide"><dt>{{ c.device }}</dt><dd class="rcontract__ua">{{ contract.acceptance.userAgent || '—' }}</dd></div>
        <div class="rcontract__wide">
          <dt>{{ c.hash }}</dt>
          <dd class="rcontract__hash">
            <code>{{ contract.hash }}</code>
            <button type="button" class="rcontract__copy" :aria-label="c.copyHash" @click="copyHash"><i class="fa-regular fa-copy"></i></button>
          </dd>
        </div>
      </dl>

      <p v-else-if="confirmedLike" class="rcontract__warn rcontract__warn--danger">
        <i class="fa-solid fa-triangle-exclamation"></i> {{ c.confirmedWithout }}
      </p>
      <p v-else-if="pendingLike" class="rcontract__warn">
        <i class="fa-solid fa-circle-info"></i> {{ contract.required ? c.willConfirmWithout : c.optional }}
      </p>
      <p v-if="!signed" class="rcontract__muted">{{ c.draftNote }}</p>

      <div class="rcontract__actions">
        <button type="button" class="btn btn--ghost btn--sm" :aria-expanded="showText" @click="showText = !showText">
          <i :class="showText ? 'fa-solid fa-chevron-up' : 'fa-solid fa-file-lines'"></i> {{ showText ? c.hideText : c.viewText }}
        </button>
        <button type="button" class="btn btn--dark btn--sm" :disabled="downloading" @click="download">
          <i :class="downloading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-arrow-down'"></i>
          {{ downloading ? c.downloading : c.download }}
        </button>
      </div>

      <ContractViewer v-if="showText" :title="contract.title" :text="contract.text" :meta="c.version(contract.version)" tall />
    </div>
  </AdminCard>
</template>

<style scoped lang="scss">
.rcontract {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__sk {
    height: 120px;
    border-radius: 12px;
  }

  &__version {
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-muted;

    i {
      margin-right: 0.3rem;
    }
  }

  &__facts {
    @include flex(row, flex-start, flex-start, 0.7rem 1.2rem);
    flex-wrap: wrap;

    > div {
      flex: 1 1 140px;
      min-width: 0;
    }

    dt {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: $ink-muted;
    }

    dd {
      font-size: 0.88rem;
      font-weight: 600;
      color: $ink;
      overflow-wrap: anywhere;
    }

    > .rcontract__wide {
      flex-basis: 100%;
    }

    .rcontract__ua {
      font-size: 0.75rem;
      font-weight: 500;
      color: $ink-soft;
    }
  }

  &__hash {
    @include flex(row, flex-start, flex-start, 0.4rem);

    code {
      font-size: 0.72rem;
      word-break: break-all;
    }
  }

  &__copy {
    flex: 0 0 auto;
    color: $blue;
    padding: 0 0.2rem;
  }

  &__warn {
    @include flex(row, flex-start, flex-start, 0.5rem);
    padding: 0.7rem 0.8rem;
    border-radius: 10px;
    background: $info-bg;
    font-size: 0.82rem;
    color: $ink;

    i {
      margin-top: 0.15rem;
      color: $blue;
    }

    &--danger {
      background: $warning-bg;

      i {
        color: darken($warning, 12%);
      }
    }
  }

  &__muted {
    font-size: 0.8rem;
    color: $ink-muted;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }
}
</style>
