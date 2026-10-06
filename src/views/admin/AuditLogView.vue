<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import Pagination from '@/components/admin/Pagination.vue'
import AuditFilters from '@/components/admin/audit/AuditFilters.vue'
import AuditTable from '@/components/admin/audit/AuditTable.vue'
import { useAdminList } from '@/composables/admin/useAdminList'
import { auditService } from '@/services/audit.service'
import { useToastStore } from '@/stores/toast'
import { auditCopy as c } from '@/config/admin/contract'
import type { ApiError } from '@/types'
import type { AuditActor, AuditEntry } from '@/types/contract'

/** /admin/auditoria (solo admin): quién entró, qué cambió y desde dónde. */
const toast = useToastStore()
const list = useAdminList<AuditEntry>((p) => auditService.list(p), {
  filters: ['actor', 'action', 'entity', 'from', 'to'],
  limit: 30,
})
const actors = ref<AuditActor[]>([])
const exporting = ref(false)

function clear() {
  for (const k of ['q', 'actor', 'action', 'entity', 'from', 'to']) list.filters[k] = ''
}

async function exportCsv() {
  exporting.value = true
  try {
    await auditService.exportCsv({ ...list.filters })
    toast.success(c.exported)
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  try {
    actors.value = await auditService.actors()
  } catch {
    /* el filtro por persona queda vacío; el resto funciona */
  }
})
</script>

<template>
  <div>
    <PageHeader :title="c.title" :subtitle="c.subtitle" />
    <AuditFilters v-model:filters="list.filters" :actors="actors" :exporting="exporting" @export="exportCsv" @clear="clear" />
    <section class="audit__card">
      <AuditTable :rows="list.items.value" :loading="list.loading.value" :error="list.error.value" @retry="list.load" />
      <div class="audit__pager">
        <Pagination v-model:page="list.page.value" :pages="list.pages.value" :total="list.total.value" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.audit {
  &__card {
    @include card;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__pager {
    padding: 0 1rem 1rem;
  }
}
</style>
