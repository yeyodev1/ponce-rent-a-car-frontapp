<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import LeadSummary from '@/components/admin/leads/LeadSummary.vue'
import LeadNotes from '@/components/admin/leads/LeadNotes.vue'
import LeadActions from '@/components/admin/leads/LeadActions.vue'
import { adminService } from '@/services/admin.service'
import { useLeadStatus } from '@/composables/admin/useLeadStatus'
import { useToastStore } from '@/stores/toast'
import type { ApiError, LeadStatus } from '@/types'
import type { Lead } from '@/types/admin'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const lead = ref<Lead | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)
const confirmOpen = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    lead.value = await adminService.lead(String(route.params.id))
    document.title = `Lead #${lead.value.code} — Ponce's`
  } catch (e) {
    error.value = e as ApiError
  } finally {
    loading.value = false
  }
}

onMounted(load)

const { move } = useLeadStatus((_id, patch) => {
  if (lead.value) lead.value = { ...lead.value, ...patch }
})

function onStatus(status: LeadStatus) {
  if (lead.value) move(lead.value, status)
}

async function remove() {
  confirmOpen.value = false
  if (!lead.value) return
  try {
    await adminService.remove('leads', lead.value._id)
    toast.success(`Lead #${lead.value.code} eliminado`)
    router.replace('/admin/leads')
  } catch (e) {
    toast.error((e as ApiError).message)
  }
}
</script>

<template>
  <div class="ldetail">
    <PageHeader v-if="!lead" title="Solicitud" back="/admin/leads" />
    <RouterLink v-else to="/admin/leads" class="ldetail__back"><i class="fa-solid fa-arrow-left"></i> Leads</RouterLink>

    <div v-if="loading" class="ldetail__grid">
      <div class="skeleton ldetail__sk ldetail__main"></div>
      <div class="skeleton ldetail__sk ldetail__side"></div>
    </div>

    <EmptyState
      v-else-if="error || !lead"
      error
      :title="error?.status === 404 ? 'Este lead no existe o fue eliminado' : undefined"
      :message="error?.message"
      @retry="load"
    />

    <div v-else class="ldetail__grid">
      <div class="ldetail__main">
        <LeadSummary :lead="lead" />
        <LeadNotes :lead="lead" @updated="(notes) => lead && (lead = { ...lead, notes })" />
      </div>
      <div class="ldetail__side">
        <LeadActions :lead="lead" @status="onStatus" @delete="confirmOpen = true" />
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      :title="`¿Eliminar el lead #${lead?.code}?`"
      message="Se borran también sus notas. Esta acción no se puede deshacer."
      @confirm="remove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped lang="scss">
.ldetail {
  &__back {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-muted;
    margin-bottom: 0.9rem;
    width: fit-content;

    &:hover {
      color: $blue;
    }
  }

  &__grid {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start, 1rem);
  }

  // En el celular las acciones van arriba: WhatsApp es lo primero que se toca.
  &__side {
    order: -1;

    @include from('lg') {
      order: 0;
      flex: 0 0 320px;
      position: sticky;
      top: 1.5rem;
    }
  }

  &__sk {
    min-height: 320px;
    border-radius: 14px;
  }
}
</style>
