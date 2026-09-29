<script setup lang="ts">
import { reactive } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import I18nField from '../I18nField.vue'
import ImageUpload from '../ImageUpload.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { emptyI18n, es } from '@/composables/admin/helpers'
import type { Hotel } from '@/types'

const crud = reactive(
  useCrud<Hotel, Partial<Hotel>>('hotels', {
    empty: () => ({
      slug: '',
      name: '',
      zone: '',
      description: emptyI18n(),
      benefit: emptyI18n(),
      promotion: emptyI18n(),
      image: '',
      website: '',
      phone: '',
      isActive: true,
      order: 0,
    }),
  }),
)
</script>

<template>
  <CrudPanel
    :crud="crud"
    noun="hotel"
    plural="hoteles"
    icon="fa-solid fa-hotel"
    hint="Hoteles aliados con beneficio para sus huéspedes (entrega en el lobby, descuentos…)."
    toggle-field="isActive"
    :sort="(a, b) => a.order - b.order"
    wide
  >
    <template #item="{ item }">
      <CrudItem :title="item.name" :sub="[item.zone, es(item.benefit)].filter(Boolean).join(' · ')" :image="item.image" icon="fa-solid fa-hotel" />
    </template>
    <template #form>
      <FormRow>
        <div>
          <label for="h-name">Nombre *</label>
          <input id="h-name" v-model="crud.form.name" type="text" placeholder="Hotel Oro Verde" />
        </div>
        <div>
          <label for="h-slug">Slug</label>
          <input id="h-slug" v-model.trim="crud.form.slug" type="text" placeholder="oro-verde" />
        </div>
      </FormRow>
      <FormRow>
        <div>
          <label for="h-zone">Zona</label>
          <input id="h-zone" v-model="crud.form.zone" type="text" placeholder="Centro, Samborondón…" />
        </div>
        <div>
          <label for="h-order">Orden</label>
          <input id="h-order" v-model.number="crud.form.order" type="number" />
        </div>
      </FormRow>
      <I18nField v-model="crud.form.description" label="Descripción" multiline :rows="3" />
      <I18nField v-model="crud.form.benefit" label="Beneficio para huéspedes" />
      <I18nField v-model="crud.form.promotion" label="Promoción vigente" />
      <FormRow>
        <div>
          <label for="h-web">Sitio web</label>
          <input id="h-web" v-model.trim="crud.form.website" type="url" placeholder="https://…" />
        </div>
        <div>
          <label for="h-phone">Teléfono</label>
          <input id="h-phone" v-model.trim="crud.form.phone" type="tel" />
        </div>
      </FormRow>
      <ImageUpload :model-value="crud.form.image || ''" label="Imagen" @update:model-value="(v) => (crud.form.image = v)" />
      <ToggleSwitch v-model="crud.form.isActive" label="Visible en la web" />
    </template>
  </CrudPanel>
</template>
