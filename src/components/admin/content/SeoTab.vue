<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminDrawer from '../AdminDrawer.vue'
import CrudItem from '../CrudItem.vue'
import EmptyState from '../EmptyState.vue'
import StatusBadge from '../StatusBadge.vue'
import I18nField from '../I18nField.vue'
import ImageUpload from '../ImageUpload.vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { copy, seoKeys } from '@/config/admin'
import { emptyI18n, es } from '@/composables/admin/helpers'
import type { ApiError, SeoPage } from '@/types'

const toast = useToastStore()
const pages = ref<SeoPage[]>([])
const loading = ref(true)
const error = ref<ApiError | null>(null)
const form = ref<SeoPage | null>(null)
const saving = ref(false)

const empty = (key: string): SeoPage => ({
  key,
  title: emptyI18n(),
  description: emptyI18n(),
  h1: emptyI18n(),
  intro: emptyI18n(),
  canonical: '',
  ogImage: '',
})

async function load() {
  loading.value = true
  error.value = null
  try {
    pages.value = (await adminService.list<SeoPage>('seo', { limit: 100 })).items
  } catch (e) {
    error.value = e as ApiError
  } finally {
    loading.value = false
  }
}
onMounted(load)

// Todas las páginas conocidas aparecen aunque todavía no tengan registro en la base.
const rows = computed(() => {
  const keys = [...new Set([...Object.keys(seoKeys), ...pages.value.map((p) => p.key)])]
  return keys.map((key) => ({ key, page: pages.value.find((p) => p.key === key) }))
})

function edit(key: string, page?: SeoPage) {
  form.value = { ...empty(key), ...JSON.parse(JSON.stringify(page || {})) }
}

async function save() {
  if (!form.value) return
  saving.value = true
  try {
    const saved = await adminService.saveSeo(form.value.key, form.value)
    const next = saved?.key ? saved : form.value
    pages.value = [...pages.value.filter((p) => p.key !== next.key), next]
    toast.success(copy.saved)
    form.value = null
  } catch (e) {
    toast.error((e as ApiError).message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <p class="seo__hint">Título y descripción que ve Google en cada página. Máximo ~60 y ~155 caracteres.</p>
    <div v-if="loading" class="seo__list">
      <div v-for="i in 5" :key="i" class="skeleton seo__sk"></div>
    </div>
    <EmptyState v-else-if="error" error :message="error.message" @retry="load" />
    <ul v-else class="seo__list">
      <li v-for="r in rows" :key="r.key">
        <button class="seo__row" type="button" @click="edit(r.key, r.page)">
          <CrudItem :title="seoKeys[r.key] || r.key" :sub="es(r.page?.title) || 'Sin título personalizado'" icon="fa-solid fa-magnifying-glass">
            <StatusBadge :status="r.page ? 'ok' : 'none'" :label="r.page ? 'Personalizado' : 'Por defecto'" :tone="r.page ? 'success' : 'neutral'" />
          </CrudItem>
          <i class="fa-solid fa-chevron-right seo__go"></i>
        </button>
      </li>
    </ul>

    <AdminDrawer :open="Boolean(form)" :title="`SEO: ${form ? seoKeys[form.key] || form.key : ''}`" @close="form = null">
      <template v-if="form">
        <I18nField v-model="form.title" label="Título (meta title)" :hint="`${form.title.es.length} caracteres en ES`" />
        <I18nField v-model="form.description" label="Descripción (meta description)" multiline :rows="3" :hint="`${form.description.es.length} caracteres en ES`" />
        <I18nField v-model="form.h1" label="Título visible (H1)" />
        <I18nField v-model="form.intro" label="Texto de introducción" multiline :rows="3" />
        <div>
          <label for="seo-can">URL canónica</label>
          <input id="seo-can" v-model.trim="form.canonical" type="url" placeholder="https://poncesrentacar.com.ec/…" />
        </div>
        <ImageUpload v-model="form.ogImage" label="Imagen al compartir (Open Graph)" compact />
      </template>
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="form = null">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="save">{{ saving ? copy.saving : copy.save }}</button>
      </template>
    </AdminDrawer>
  </div>
</template>

<style scoped lang="scss">
.seo {
  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
    margin-bottom: 1rem;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);
  }

  &__sk {
    height: 64px;
    border-radius: 14px;
  }

  &__row {
    @include card;
    width: 100%;
    text-align: left;
    padding: 0.6rem 0.9rem 0.6rem 0.6rem;
    @include flex(row, center, space-between, 0.6rem);
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: $shadow-sm;
    }
  }

  &__go {
    color: $ink-muted;
    font-size: 0.8rem;
  }
}
</style>
