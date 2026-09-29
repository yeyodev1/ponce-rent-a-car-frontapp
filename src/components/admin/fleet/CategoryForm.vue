<script setup lang="ts">
import I18nField from '../I18nField.vue'
import MoneyInput from '../MoneyInput.vue'
import ImageUpload from '../ImageUpload.vue'
import GalleryField from '../GalleryField.vue'
import ListEditor from '../ListEditor.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { emptyI18n } from '@/composables/admin/helpers'
import type { Category, I18nText } from '@/types'

const form = defineModel<Partial<Category>>({ required: true })

function ensureSeo() {
  if (!form.value.seo) form.value.seo = { title: emptyI18n(), description: emptyI18n(), ogImage: '' }
  return form.value.seo
}
</script>

<template>
  <div class="cform">
    <FormRow>
      <I18nField v-model="form.name" label="Nombre" required />
      <div>
        <label for="cat-slug">Slug (URL)</label>
        <input id="cat-slug" v-model.trim="form.slug" type="text" placeholder="suv" />
      </div>
    </FormRow>
    <I18nField v-model="form.tagline" label="Frase corta" hint="Ej.: Más espacio y comodidad" />
    <I18nField v-model="form.description" label="Descripción" multiline />

    <FormRow>
      <MoneyInput v-model="form.pricePerDay" label="Precio por día" suffix="/ día" />
      <div>
        <label for="cat-models">Modelos de ejemplo</label>
        <input id="cat-models" v-model="form.exampleModels" type="text" placeholder="Chevrolet Tracker o similar" />
      </div>
    </FormRow>

    <FormRow basis="120px">
      <div>
        <label for="cat-pax">Pasajeros</label>
        <input id="cat-pax" v-model.number="form.passengers" type="number" min="1" />
      </div>
      <div>
        <label for="cat-lug">Maletas</label>
        <input id="cat-lug" v-model.number="form.luggage" type="number" min="0" />
      </div>
      <div>
        <label for="cat-tr">Transmisión</label>
        <select id="cat-tr" v-model="form.transmission">
          <option value="automatic">Automática</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div>
        <label for="cat-order">Orden</label>
        <input id="cat-order" v-model.number="form.order" type="number" />
      </div>
    </FormRow>

    <div class="cform__toggles">
      <ToggleSwitch v-model="form.airConditioning" label="Aire acondicionado" />
      <ToggleSwitch v-model="form.isActive" label="Visible en la web" />
    </div>

    <ImageUpload :model-value="form.image || ''" label="Imagen principal" @update:model-value="(v) => (form.image = v)" />
    <GalleryField v-model="form.gallery" label="Galería" />

    <ListEditor v-model="form.features" label="Características" add-label="Agregar característica" :create="emptyI18n">
      <template #default="{ item, update }">
        <I18nField :model-value="item as I18nText" label="Característica" @update:model-value="update" />
      </template>
    </ListEditor>

    <details class="cform__seo">
      <summary><i class="fa-solid fa-magnifying-glass-chart"></i> SEO de la página</summary>
      <I18nField :model-value="form.seo?.title" label="Título SEO" @update:model-value="(v) => (ensureSeo().title = v)" />
      <I18nField :model-value="form.seo?.description" label="Descripción SEO" multiline :rows="2" @update:model-value="(v) => (ensureSeo().description = v)" />
      <ImageUpload :model-value="form.seo?.ogImage || ''" label="Imagen para compartir" compact @update:model-value="(v) => (ensureSeo().ogImage = v)" />
    </details>
  </div>
</template>

<style scoped lang="scss">
.cform {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__toggles {
    @include flex(row, center, flex-start, 1.4rem);
    flex-wrap: wrap;
  }

  &__seo {
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

    &[open] summary {
      margin-bottom: 0.9rem;
    }
  }
}
</style>
