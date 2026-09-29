<script setup lang="ts">
import { reactive, ref } from 'vue'
import CrudPanel from '../CrudPanel.vue'
import CrudItem from '../CrudItem.vue'
import StatusBadge from '../StatusBadge.vue'
import I18nField from '../I18nField.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import FormRow from '../FormRow.vue'
import FilterPills from '../FilterPills.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { faqTopics } from '@/config/admin'
import { emptyI18n, es } from '@/composables/admin/helpers'
import type { Faq } from '@/types'

const crud = reactive(
  useCrud<Faq, Partial<Faq>>('faqs', {
    empty: () => ({ topic: 'guarantee', question: emptyI18n(), answer: emptyI18n(), order: 0, isActive: true }),
  }),
)

// El filtro de tema es local: la lista completa de FAQs es corta.
const topic = ref('')
</script>

<template>
  <div>
    <FilterPills v-model="topic" :options="faqTopics" all-label="Todos los temas" class="faq__pills" />
    <CrudPanel
      :crud="crud"
      :filter="(f) => !topic || f.topic === topic"
      noun="pregunta"
      feminine
      icon="fa-solid fa-circle-question"
      toggle-field="isActive"
      toggle-label="Visible"
      :sort="(a, b) => a.topic.localeCompare(b.topic) || a.order - b.order"
    >
      <template #item="{ item }">
        <CrudItem :title="es(item.question)" :sub="es(item.answer)" icon="fa-solid fa-circle-question">
          <StatusBadge :status="item.topic" :label="faqTopics[item.topic] || item.topic" tone="blue" />
        </CrudItem>
      </template>
      <template #form>
        <FormRow>
          <div>
            <label for="f-topic">Tema</label>
            <select id="f-topic" v-model="crud.form.topic">
              <option v-for="(label, key) in faqTopics" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label for="f-order">Orden</label>
            <input id="f-order" v-model.number="crud.form.order" type="number" />
          </div>
        </FormRow>
        <I18nField v-model="crud.form.question" label="Pregunta" required />
        <I18nField v-model="crud.form.answer" label="Respuesta" multiline :rows="5" />
        <ToggleSwitch v-model="crud.form.isActive" label="Visible en la web" />
      </template>
    </CrudPanel>
  </div>
</template>

<style scoped lang="scss">
.faq__pills {
  margin-bottom: 1rem;
}
</style>
