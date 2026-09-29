<script setup lang="ts">
import { reactive } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import I18nField from '../I18nField.vue'
import ImageUpload from '../ImageUpload.vue'
import ListEditor from '../ListEditor.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { emptyI18n, es } from '@/composables/admin/helpers'
import type { Guide, GuideSection } from '@/types'

const empty = (): Partial<Guide> => ({
  slug: '',
  title: emptyI18n(),
  excerpt: emptyI18n(),
  cover: '',
  destination: '',
  distanceKm: 0,
  driveTime: '',
  readingMinutes: 5,
  sections: [],
  seo: { title: emptyI18n(), description: emptyI18n(), ogImage: '' },
  isPublished: false,
  publishedAt: null,
})

// La lista puede venir sin secciones: al abrir se pide la guía completa.
const crud = reactive(
  useCrud<Guide, Partial<Guide>>('guides', {
    empty,
    fetchOne: true,
    toBody: (f) => ({ ...f, publishedAt: f.isPublished ? f.publishedAt || new Date().toISOString() : f.publishedAt }),
  }),
)

const newSection = (): GuideSection => ({ heading: emptyI18n(), body: emptyI18n() })

function seo() {
  if (!crud.form.seo) crud.form.seo = { title: emptyI18n(), description: emptyI18n(), ogImage: '' }
  return crud.form.seo
}
</script>

<template>
  <CrudPanel
    :crud="crud"
    noun="guía"
    feminine
    icon="fa-solid fa-map-location-dot"
    hint="Artículos de viaje desde Guayaquil. Traen tráfico de SEO y terminan en una reserva."
    toggle-field="isPublished"
    toggle-label="Publicada"
    wide
  >
    <template #item="{ item }">
      <CrudItem :title="es(item.title)" :sub="[item.destination, item.distanceKm ? `${item.distanceKm} km` : '', item.driveTime].filter(Boolean).join(' · ')" :image="item.cover" icon="fa-solid fa-map" />
    </template>
    <template #form>
      <I18nField v-model="crud.form.title" label="Título" required />
      <FormRow>
        <div>
          <label for="g-slug">Slug</label>
          <input id="g-slug" v-model.trim="crud.form.slug" type="text" placeholder="guayaquil-a-montanita" />
        </div>
        <div>
          <label for="g-dest">Destino</label>
          <input id="g-dest" v-model="crud.form.destination" type="text" placeholder="Montañita" />
        </div>
      </FormRow>
      <I18nField v-model="crud.form.excerpt" label="Resumen" multiline :rows="2" />
      <FormRow basis="130px">
        <div>
          <label for="g-km">Distancia (km)</label>
          <input id="g-km" v-model.number="crud.form.distanceKm" type="number" min="0" />
        </div>
        <div>
          <label for="g-time">Tiempo de manejo</label>
          <input id="g-time" v-model="crud.form.driveTime" type="text" placeholder="2 h 30 min" />
        </div>
        <div>
          <label for="g-read">Minutos de lectura</label>
          <input id="g-read" v-model.number="crud.form.readingMinutes" type="number" min="1" />
        </div>
      </FormRow>
      <ImageUpload :model-value="crud.form.cover || ''" label="Portada" @update:model-value="(v) => (crud.form.cover = v)" />
      <ListEditor v-model="crud.form.sections" label="Secciones" add-label="Agregar sección" :create="newSection">
        <template #default="{ item, update }">
          <I18nField :model-value="item.heading" label="Subtítulo" @update:model-value="(heading) => update({ ...item, heading })" />
          <I18nField :model-value="item.body" label="Texto" multiline :rows="5" @update:model-value="(body) => update({ ...item, body })" />
        </template>
      </ListEditor>
      <details class="guide__seo">
        <summary><i class="fa-solid fa-magnifying-glass-chart"></i> SEO</summary>
        <I18nField :model-value="crud.form.seo?.title" label="Título SEO" @update:model-value="(v) => (seo().title = v)" />
        <I18nField :model-value="crud.form.seo?.description" label="Descripción SEO" multiline :rows="2" @update:model-value="(v) => (seo().description = v)" />
      </details>
      <ToggleSwitch v-model="crud.form.isPublished" label="Publicada" />
    </template>
  </CrudPanel>
</template>

<style scoped lang="scss">
.guide__seo {
  @include card;
  padding: 0.9rem 1rem;
  @include flex(column, stretch, flex-start, 0.9rem);

  summary {
    cursor: pointer;
    font-weight: 800;
    font-size: 0.88rem;

    i {
      color: $blue;
      margin-right: 0.4rem;
    }
  }
}
</style>
