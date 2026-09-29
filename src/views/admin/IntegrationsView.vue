<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import { useSettings } from '@/composables/admin/useSettings'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { site } from '@/config/site'
import { copy } from '@/config/admin'
import type { ApiError, PublicConfig } from '@/types'
import type { ExportEntity } from '@/types/admin'

const toast = useToastStore()
const { form, loading, saving, save } = useSettings()
const config = ref<PublicConfig | null>(null)

onMounted(async () => {
  try {
    config.value = await adminService.publicConfig()
  } catch {
    /* el checklist muestra "sin confirmar" */
  }
})

// Estado informativo: las credenciales viven en el servidor (.env), no se editan aquí.
const checks = computed(() => [
  {
    icon: 'fa-brands fa-whatsapp',
    name: 'WhatsApp Cloud API',
    desc: 'Flujo automático de preguntas y aviso al asesor.',
    ok: config.value?.whatsappCloudEnabled,
    how: 'Variables WHATSAPP_* en el servidor.',
  },
  {
    icon: 'fa-solid fa-credit-card',
    name: 'Payphone',
    desc: 'Cobro de separación o pago total en línea.',
    ok: config.value?.payphoneEnabled,
    how: 'PAYPHONE_TOKEN y PAYPHONE_STORE_ID en el servidor.',
  },
  {
    icon: 'fa-brands fa-meta',
    name: 'Meta Pixel',
    desc: 'Medición de anuncios de Facebook e Instagram.',
    ok: Boolean(site.analytics.metaPixel),
    how: 'VITE_META_PIXEL_ID en la web; META_CAPI_TOKEN en el servidor para Conversions API.',
  },
  {
    icon: 'fa-brands fa-google',
    name: 'Google Analytics 4',
    desc: 'Tráfico y conversiones del sitio.',
    ok: Boolean(site.analytics.ga4),
    how: 'VITE_GA4_ID en la web.',
  },
  {
    icon: 'fa-solid fa-diagram-project',
    name: 'Webhook a CRM externo',
    desc: 'Envía leads, reservas y pagos a Kommo, HubSpot o Zoho.',
    ok: Boolean(form.value.integrations.webhookUrl),
    how: 'Configúralo abajo.',
  },
])

const exports: { entity: ExportEntity; label: string; icon: string }[] = [
  { entity: 'leads', label: 'Leads', icon: 'fa-solid fa-inbox' },
  { entity: 'customers', label: 'Clientes', icon: 'fa-solid fa-users' },
  { entity: 'reservations', label: 'Reservas', icon: 'fa-solid fa-calendar-check' },
  { entity: 'payments', label: 'Pagos', icon: 'fa-solid fa-credit-card' },
]
const exporting = ref<string | null>(null)

async function download(entity: ExportEntity) {
  exporting.value = entity
  try {
    await adminService.exportCsv(entity)
  } catch (e) {
    toast.error((e as ApiError).message || 'No se pudo generar el archivo')
  } finally {
    exporting.value = null
  }
}
</script>

<template>
  <div class="integ">
    <PageHeader title="Integraciones" subtitle="Qué servicios externos están conectados y cómo sacar tus datos." />

    <AdminCard title="Estado de conexiones" icon="fa-solid fa-plug">
      <ul class="integ__checks">
        <li v-for="c in checks" :key="c.name" class="integ__check">
          <span class="integ__icon"><i :class="c.icon"></i></span>
          <div class="integ__text">
            <strong>{{ c.name }}</strong>
            <small>{{ c.desc }}</small>
            <small v-if="!c.ok" class="integ__how">{{ c.how }}</small>
          </div>
          <span class="integ__state" :class="c.ok ? 'integ__state--ok' : c.ok === undefined ? 'integ__state--unknown' : 'integ__state--off'">
            <i :class="c.ok ? 'fa-solid fa-circle-check' : c.ok === undefined ? 'fa-solid fa-circle-question' : 'fa-regular fa-circle'"></i>
            {{ c.ok ? 'Conectado' : c.ok === undefined ? 'Sin confirmar' : 'Pendiente' }}
          </span>
        </li>
      </ul>
    </AdminCard>

    <AdminCard title="Webhook para CRM externo" icon="fa-solid fa-diagram-project">
      <form class="integ__hook" @submit.prevent="save">
        <p class="integ__muted">
          Recibe un POST JSON en cada <code>lead.created</code>, <code>lead.updated</code>, <code>reservation.created</code>,
          <code>reservation.confirmed</code> y <code>payment.approved</code>, firmado con <code>X-Ponce-Signature</code>.
        </p>
        <div class="integ__row">
          <input v-model.trim="form.integrations.webhookUrl" type="url" placeholder="https://hooks.tu-crm.com/…" :disabled="loading" aria-label="URL del webhook" />
          <button class="btn btn--dark btn--sm" type="submit" :disabled="saving || loading">{{ saving ? copy.saving : copy.save }}</button>
        </div>
      </form>
    </AdminCard>

    <AdminCard title="Exportar datos (CSV)" icon="fa-solid fa-file-csv">
      <p class="integ__muted">Se abre en Excel o Google Sheets. Incluye todos los registros.</p>
      <div class="integ__exports">
        <button v-for="e in exports" :key="e.entity" class="integ__export" type="button" :disabled="exporting === e.entity" @click="download(e.entity)">
          <i :class="exporting === e.entity ? 'fa-solid fa-spinner fa-spin' : e.icon"></i>
          <span>{{ e.label }}</span>
          <i class="fa-solid fa-download integ__dl"></i>
        </button>
      </div>
    </AdminCard>
  </div>
</template>

<style scoped lang="scss">
.integ {
  @include flex(column, stretch, flex-start, 1rem);
  max-width: 860px;

  &__checks {
    list-style: none;
  }

  &__check {
    @include flex(row, center, flex-start, 0.85rem);
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba($line, 0.7);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 12px;
    background: $paper;
    color: $navy;
    font-size: 1.1rem;
  }

  &__text {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center);
    line-height: 1.3;

    small {
      font-size: 0.78rem;
      color: $ink-muted;
    }
  }

  &__how {
    font-style: italic;
  }

  &__state {
    @include flex(row, center, flex-start, 0.35rem);
    font-size: 0.76rem;
    font-weight: 800;
    white-space: nowrap;

    &--ok {
      color: $success;
    }

    &--off {
      color: $ink-muted;
    }

    &--unknown {
      color: $warning;
    }
  }

  &__muted {
    font-size: $text-sm;
    color: $ink-muted;
    margin-bottom: 0.8rem;

    code {
      font-size: 0.78rem;
      background: $paper;
      padding: 0.05rem 0.3rem;
      border-radius: 5px;
    }
  }

  &__row {
    @include flex(row, center, flex-start, 0.5rem);

    input {
      flex: 1;
      min-width: 0;
    }
  }

  &__exports {
    @include flex-cards(180px, 0.6rem);
  }

  &__export {
    @include flex(row, center, flex-start, 0.7rem);
    padding: 0.9rem 1rem;
    border-radius: 14px;
    border: 1px solid $line;
    background: $surface;
    font-weight: 700;
    font-size: 0.9rem;
    transition: border-color 0.2s ease, transform 0.2s ease;

    span {
      flex: 1;
      text-align: left;
    }

    &:hover:not(:disabled) {
      border-color: $blue;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  &__dl {
    color: $blue;
  }
}
</style>
