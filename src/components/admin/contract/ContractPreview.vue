<script setup lang="ts">
import ContractViewer from '@/components/contract/ContractViewer.vue'
import { contractCopy } from '@/config/admin/contract'
import { refObj, type AdminReservation } from '@/types/admin'

/** Vista previa del borrador con los datos de una reserva real (o de ejemplo). */
defineProps<{
  reservations: AdminReservation[]
  preview: { title: string; text: string } | null
  loading: boolean
}>()
const emit = defineEmits<{ run: [] }>()
const reservationId = defineModel<string>('reservationId', { required: true })
const lang = defineModel<'es' | 'en'>('lang', { required: true })
const c = contractCopy.templates

const label = (r: AdminReservation) => [r.code, refObj(r.customer)?.name].filter(Boolean).join(' · ')
</script>

<template>
  <div class="cpreview">
    <div class="cpreview__controls">
      <div class="cpreview__field">
        <label for="pv-res">{{ c.previewReservation }}</label>
        <select id="pv-res" v-model="reservationId">
          <option value="">{{ c.previewNone }}</option>
          <option v-for="r in reservations" :key="r._id" :value="r._id">{{ label(r) }}</option>
        </select>
      </div>
      <div class="cpreview__field cpreview__field--lang">
        <label for="pv-lang">{{ c.previewLang }}</label>
        <select id="pv-lang" v-model="lang">
          <option value="es">{{ c.es }}</option>
          <option value="en">{{ c.en }}</option>
        </select>
      </div>
    </div>
    <button type="button" class="btn btn--dark btn--sm" :disabled="loading" @click="emit('run')">
      <i :class="loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-eye'"></i> {{ c.previewRun }}
    </button>
    <ContractViewer v-if="preview" :title="preview.title" :text="preview.text" tall />
    <p v-else class="cpreview__empty">{{ c.previewEmpty }}</p>
  </div>
</template>

<style scoped lang="scss">
.cpreview {
  @include flex(column, stretch, flex-start, 0.75rem);

  > .btn {
    align-self: flex-start;
  }

  &__controls {
    @include flex(row, flex-end, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__field {
    flex: 1 1 200px;
    min-width: 0;

    &--lang {
      flex: 0 1 130px;
    }

    label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: $ink-soft;
      margin-bottom: 0.3rem;
    }
  }

  &__empty {
    font-size: 0.82rem;
    color: $ink-muted;
  }
}
</style>
