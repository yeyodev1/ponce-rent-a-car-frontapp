<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import { licenseCopy as c } from '@/config/admin'
import { countryName, licenseState } from '@/composables/admin/useLicense'

/**
 * Licencia de un cliente. Con `returnAt` (detalle de reserva) además avisa si
 * vence antes de la devolución: es lo que el personal revisa al verificar.
 */
const props = defineProps<{
  number?: string
  expiresAt?: string
  country?: string
  returnAt?: string
}>()

const state = computed(() => licenseState(props.expiresAt, props.returnAt))
const badge = computed(() => {
  if (state.value === 'expired') return { label: c.expired, tone: 'danger' as const }
  if (state.value === 'beforeReturn') return { label: c.expiresBeforeReturn, tone: 'warning' as const }
  if (state.value === 'valid') return { label: c.valid, tone: 'success' as const }
  return null
})
</script>

<template>
  <div class="lic">
    <p v-if="!number && !expiresAt" class="lic__missing"><i class="fa-regular fa-id-card"></i>{{ c.missing }}</p>
    <dl v-else class="lic__facts">
      <div>
        <dt>{{ c.number }}</dt>
        <dd class="lic__number">{{ number || '—' }}</dd>
      </div>
      <div>
        <dt>{{ c.expiresAt }}</dt>
        <dd>
          {{ expiresAt || '—' }}
          <StatusBadge v-if="badge" status="license" :label="badge.label" :tone="badge.tone" />
        </dd>
      </div>
      <div>
        <dt>{{ c.country }}</dt>
        <dd>{{ countryName(country) || '—' }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped lang="scss">
.lic {
  &__missing {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: 0.84rem;
    font-weight: 700;
    color: $warning;
  }

  &__facts {
    @include flex(column, stretch, flex-start);

    div {
      @include flex(row, center, space-between, 1rem);
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba($line, 0.7);
    }

    dt {
      font-size: 0.78rem;
      font-weight: 700;
      color: $ink-muted;
    }

    dd {
      @include flex(row, center, flex-end, 0.4rem);
      flex-wrap: wrap;
      font-size: 0.9rem;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }
  }

  &__number {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.04em;
  }
}
</style>
