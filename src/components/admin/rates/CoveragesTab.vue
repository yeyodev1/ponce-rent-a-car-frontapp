<script setup lang="ts">
import { reactive } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import StatusBadge from '../StatusBadge.vue'
import I18nField from '../I18nField.vue'
import ListEditor from '../ListEditor.vue'
import MoneyInput from '../MoneyInput.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { emptyI18n, es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Coverage, I18nText } from '@/types'

const crud = reactive(
  useCrud<Coverage, Partial<Coverage>>('coverages', {
    empty: () => ({
      code: '',
      name: emptyI18n(),
      description: emptyI18n(),
      includes: [],
      excludes: [],
      pricePerDay: 0,
      isDefault: false,
      isActive: true,
      order: 0,
    }),
  }),
)
</script>

<template>
  <CrudPanel
    :crud="crud"
    noun="cobertura"
    feminine
    icon="fa-solid fa-shield-halved"
    hint="Protecciones que el cliente elige al reservar. La marcada por defecto se incluye sin costo extra."
    toggle-field="isActive"
    :sort="(a, b) => a.order - b.order"
    wide
  >
    <template #item="{ item }">
      <CrudItem :title="es(item.name) || item.code" :sub="es(item.description)" icon="fa-solid fa-shield-halved" :aside="item.pricePerDay ? `+${money(item.pricePerDay)}/día` : 'Incluida'">
        <StatusBadge v-if="item.isDefault" status="default" label="Por defecto" tone="blue" />
      </CrudItem>
    </template>
    <template #form>
      <FormRow>
        <I18nField v-model="crud.form.name" label="Nombre" required />
        <div>
          <label for="cov-code">Código</label>
          <input id="cov-code" v-model.trim="crud.form.code" type="text" placeholder="preferential" />
        </div>
      </FormRow>
      <I18nField v-model="crud.form.description" label="Descripción" multiline :rows="3" />
      <FormRow>
        <MoneyInput v-model="crud.form.pricePerDay" label="Precio por día" hint="0 = incluida en la tarifa" />
        <div>
          <label for="cov-order">Orden</label>
          <input id="cov-order" v-model.number="crud.form.order" type="number" />
        </div>
      </FormRow>
      <div class="cov__toggles">
        <ToggleSwitch v-model="crud.form.isDefault" label="Cobertura por defecto" />
        <ToggleSwitch v-model="crud.form.isActive" label="Activa" />
      </div>
      <ListEditor v-model="crud.form.includes" label="Incluye" add-label="Agregar punto" :create="emptyI18n">
        <template #default="{ item, update }">
          <I18nField :model-value="item as I18nText" label="Incluye" @update:model-value="update" />
        </template>
      </ListEditor>
      <ListEditor v-model="crud.form.excludes" label="No incluye" add-label="Agregar punto" :create="emptyI18n">
        <template #default="{ item, update }">
          <I18nField :model-value="item as I18nText" label="No incluye" @update:model-value="update" />
        </template>
      </ListEditor>
    </template>
  </CrudPanel>
</template>

<style scoped lang="scss">
.cov__toggles {
  @include flex(row, center, flex-start, 1.4rem);
  flex-wrap: wrap;
}
</style>
