<script setup lang="ts">
import { reactive } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import I18nField from '../I18nField.vue'
import MoneyInput from '../MoneyInput.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { useUserStore } from '@/stores/user'
import { emptyI18n, es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Extra } from '@/types'

// Tarifas: el empleado las consulta; solo un administrador las cambia.
const userStore = useUserStore()
const crud = reactive(
  useCrud<Extra, Partial<Extra>>('extras', {
    empty: () => ({
      code: '',
      name: emptyI18n(),
      description: emptyI18n(),
      icon: 'fa-plus',
      price: 0,
      pricing: 'per_day',
      maxQuantity: 1,
      isActive: true,
      order: 0,
    }),
  }),
)

// El API guarda "fa-baby"; en pantalla se antepone el estilo.
const iconClass = (icon?: string) => (icon ? (icon.includes(' ') ? icon : `fa-solid ${icon}`) : 'fa-solid fa-plus')
</script>

<template>
  <CrudPanel
    :crud="crud"
    :readonly="!userStore.isAdmin"
    noun="extra"
    icon="fa-solid fa-puzzle-piece"
    hint="Silla infantil, conductor adicional, GPS… Se suman a la cotización por día o por renta."
    toggle-field="isActive"
    :sort="(a, b) => (a.order || 0) - (b.order || 0)"
  >
    <template #item="{ item }">
      <CrudItem
        :title="es(item.name) || item.code"
        :sub="es(item.description)"
        :icon="iconClass(item.icon)"
        :aside="`${money(item.price)} ${item.pricing === 'per_day' ? '/día' : '/renta'}`"
      />
    </template>
    <template #form>
      <FormRow>
        <I18nField v-model="crud.form.name" label="Nombre" required />
        <div>
          <label for="ext-code">Código</label>
          <input id="ext-code" v-model.trim="crud.form.code" type="text" placeholder="child-seat" />
        </div>
      </FormRow>
      <I18nField v-model="crud.form.description" label="Descripción" multiline :rows="2" />
      <FormRow>
        <MoneyInput v-model="crud.form.price" label="Precio" />
        <div>
          <label for="ext-pricing">Se cobra</label>
          <select id="ext-pricing" v-model="crud.form.pricing">
            <option value="per_day">Por día</option>
            <option value="per_rental">Una vez por renta</option>
          </select>
        </div>
      </FormRow>
      <FormRow basis="140px">
        <div>
          <label for="ext-max">Cantidad máxima</label>
          <input id="ext-max" v-model.number="crud.form.maxQuantity" type="number" min="1" />
        </div>
        <div>
          <label for="ext-order">Orden</label>
          <input id="ext-order" v-model.number="crud.form.order" type="number" />
        </div>
        <div>
          <label for="ext-icon">Icono (Font Awesome)</label>
          <div class="ext__icon">
            <i :class="iconClass(crud.form.icon)"></i>
            <input id="ext-icon" v-model.trim="crud.form.icon" type="text" placeholder="fa-baby" />
          </div>
        </div>
      </FormRow>
      <ToggleSwitch v-model="crud.form.isActive" label="Activo" />
    </template>
  </CrudPanel>
</template>

<style scoped lang="scss">
.ext__icon {
  position: relative;
  @include flex(row, center);

  i {
    position: absolute;
    left: 0.95rem;
    color: $blue;
  }

  input {
    padding-left: 2.6rem;
  }
}
</style>
