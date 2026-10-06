<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import EmptyState from '@/components/admin/EmptyState.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import ContractEditor from '@/components/admin/contract/ContractEditor.vue'
import ContractPreview from '@/components/admin/contract/ContractPreview.vue'
import ContractVersions from '@/components/admin/contract/ContractVersions.vue'
import { useContractTemplates } from '@/composables/admin/useContractTemplates'
import { contractCopy } from '@/config/admin/contract'

/** /admin/contratos (solo admin): editar la plantilla, previsualizarla y ver versiones. */
const c = contractCopy.templates
const tpl = useContractTemplates()
const { templates, variables, reservations, loading, error, saving, lang, draft, active, dirty } = tpl
const { previewReservation, previewLang, preview, previewing } = tpl
const confirming = ref(false)

async function confirmSave() {
  confirming.value = false
  await tpl.save()
}

tpl.load()
</script>

<template>
  <div class="ctpl">
    <PageHeader :title="c.title" :subtitle="c.subtitle">
      <span v-if="active" class="chip chip--success">{{ c.active }}: v{{ active.version }}</span>
    </PageHeader>

    <div v-if="loading" class="ctpl__cols">
      <div class="skeleton ctpl__sk ctpl__main"></div>
      <div class="skeleton ctpl__sk ctpl__side"></div>
    </div>
    <EmptyState v-else-if="error" error :message="error.message || c.loadError" @retry="tpl.load" />

    <div v-else class="ctpl__cols">
      <div class="ctpl__main">
        <AdminCard :title="c.editor" icon="fa-solid fa-pen-to-square">
          <ContractEditor v-model:lang="lang" v-model:title="draft.title" v-model:body="draft.body" :variables="variables" />
          <div class="ctpl__bar">
            <button type="button" class="btn btn--primary" :disabled="saving || !dirty" @click="confirming = true">
              <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
              {{ saving ? c.saving : c.save }}
            </button>
          </div>
        </AdminCard>
      </div>
      <div class="ctpl__side">
        <AdminCard :title="c.preview" icon="fa-solid fa-eye">
          <ContractPreview
            v-model:reservation-id="previewReservation"
            v-model:lang="previewLang"
            :reservations="reservations"
            :preview="preview"
            :loading="previewing"
            @run="tpl.runPreview"
          />
        </AdminCard>
        <AdminCard :title="c.history" icon="fa-solid fa-clock-rotate-left">
          <ContractVersions :templates="templates" />
        </AdminCard>
      </div>
    </div>

    <ConfirmDialog
      :open="confirming"
      :title="c.confirmTitle"
      :message="c.confirmMessage"
      :confirm-label="c.save"
      :danger="false"
      @confirm="confirmSave"
      @cancel="confirming = false"
    />
  </div>
</template>

<style scoped lang="scss">
.ctpl {
  &__cols {
    @include flex(column, stretch, flex-start, 1rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__main,
  &__side {
    min-width: 0;
    @include flex(column, stretch, flex-start, 1rem);
  }

  &__main {
    flex: 1 1 58%;
  }

  &__side {
    flex: 1 1 42%;

    @include from('lg') {
      position: sticky;
      top: 1rem;
    }
  }

  &__sk {
    min-height: 420px;
    border-radius: 14px;
  }

  &__bar {
    @include flex(row, center, flex-end, 0.6rem);
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $line;
  }
}
</style>
