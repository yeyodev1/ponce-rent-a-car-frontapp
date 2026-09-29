<script setup lang="ts">
import { reactive } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import StatusBadge from '../StatusBadge.vue'
import I18nField from '../I18nField.vue'
import ImageUpload from '../ImageUpload.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { emptyI18n, es, shortDate } from '@/composables/admin/helpers'
import type { Promotion } from '@/types'

const empty = (): Partial<Promotion> => ({
  slug: '',
  title: emptyI18n(),
  body: emptyI18n(),
  conditions: emptyI18n(),
  badge: emptyI18n(),
  ctaLabel: emptyI18n(),
  ctaUrl: '/reservar',
  image: '',
  categorySlug: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  order: 0,
})

// Las fechas viajan como ISO; el input date solo entiende YYYY-MM-DD.
const crud = reactive(
  useCrud<Promotion, Partial<Promotion>>('promotions', {
    empty,
    toForm: (p) => ({ ...empty(), ...JSON.parse(JSON.stringify(p)), startsAt: p.startsAt?.slice(0, 10) || '', endsAt: p.endsAt?.slice(0, 10) || '' }),
    toBody: (f) => ({
      ...f,
      startsAt: f.startsAt ? `${f.startsAt}T00:00:00-05:00` : null,
      endsAt: f.endsAt ? `${f.endsAt}T23:59:59-05:00` : null,
    }),
  }),
)

function vigencia(p: Promotion) {
  if (!p.startsAt && !p.endsAt) return 'Sin fecha de fin'
  if (!p.startsAt) return `Hasta el ${shortDate(p.endsAt)}`
  if (!p.endsAt) return `Desde el ${shortDate(p.startsAt)}`
  return `${shortDate(p.startsAt)} – ${shortDate(p.endsAt)}`
}

const expired = (p: Promotion) => Boolean(p.endsAt && new Date(p.endsAt).getTime() < Date.now())
</script>

<template>
  <CrudPanel
    :crud="crud"
    noun="promoción"
    feminine plural="promociones"
    icon="fa-solid fa-percent"
    hint="Se muestran en /promociones y en el inicio mientras estén activas y vigentes."
    toggle-field="isActive"
    toggle-label="Activa"
    :sort="(a, b) => (a.order || 0) - (b.order || 0)"
    wide
  >
    <template #item="{ item }">
      <CrudItem :title="es(item.title)" :sub="vigencia(item)" :image="item.image" icon="fa-solid fa-percent">
        <StatusBadge v-if="es(item.badge)" status="badge" :label="es(item.badge)" tone="accent" />
        <StatusBadge v-if="expired(item)" status="expired" label="Vencida" tone="danger" />
      </CrudItem>
    </template>
    <template #form>
      <I18nField v-model="crud.form.title" label="Título" required />
      <FormRow>
        <div>
          <label for="pr-slug">Slug</label>
          <input id="pr-slug" v-model.trim="crud.form.slug" type="text" placeholder="semana-suv" />
        </div>
        <I18nField v-model="crud.form.badge" label="Etiqueta" hint="Ej.: -15%" />
      </FormRow>
      <I18nField v-model="crud.form.body" label="Descripción" multiline :rows="3" />
      <I18nField v-model="crud.form.conditions" label="Condiciones" multiline :rows="2" />
      <FormRow>
        <div>
          <label for="pr-from">Desde</label>
          <input id="pr-from" v-model="crud.form.startsAt" type="date" />
        </div>
        <div>
          <label for="pr-to">Hasta</label>
          <input id="pr-to" v-model="crud.form.endsAt" type="date" />
        </div>
      </FormRow>
      <FormRow>
        <I18nField v-model="crud.form.ctaLabel" label="Texto del botón" />
        <div>
          <label for="pr-url">Enlace del botón</label>
          <input id="pr-url" v-model.trim="crud.form.ctaUrl" type="text" placeholder="/reservar" />
        </div>
      </FormRow>
      <FormRow>
        <div>
          <label for="pr-cat">Categoría (slug, opcional)</label>
          <input id="pr-cat" v-model.trim="crud.form.categorySlug" type="text" placeholder="suv" />
        </div>
        <div>
          <label for="pr-order">Orden</label>
          <input id="pr-order" v-model.number="crud.form.order" type="number" />
        </div>
      </FormRow>
      <ImageUpload :model-value="crud.form.image || ''" label="Imagen" @update:model-value="(v) => (crud.form.image = v)" />
      <ToggleSwitch v-model="crud.form.isActive" label="Activa" />
    </template>
  </CrudPanel>
</template>
