<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import type { Faq } from '@/types'
import FaqItem from './FaqItem.vue'

/**
 * Lista de preguntas. Se abre una a la vez: en móvil dos respuestas abiertas
 * empujan la página y el usuario pierde el hilo.
 */
const props = withDefaults(
  defineProps<{ faqs: Faq[]; loading?: boolean; dark?: boolean; firstOpen?: boolean }>(),
  {
    loading: false,
    dark: false,
    firstOpen: false,
  },
)

const { tx } = useI18n()
const openId = ref<string | null>(props.firstOpen && props.faqs[0] ? props.faqs[0]._id : null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div class="faq-list">
    <template v-if="loading && !faqs.length">
      <div v-for="n in 4" :key="n" class="faq-list__skeleton skeleton"></div>
    </template>
    <FaqItem
      v-for="(f, i) in faqs"
      :id="`faq-${f._id}`"
      :key="f._id"
      v-reveal="Math.min(i, 6) * 50"
      :question="tx(f.question)"
      :answer="tx(f.answer)"
      :open="openId === f._id"
      :dark="dark"
      @toggle="toggle(f._id)"
    />
  </div>
</template>

<style scoped lang="scss">
.faq-list {
  @include flex(column, stretch, flex-start, 0.65rem);

  &__skeleton {
    height: 60px;
    border-radius: $radius-md;
  }
}
</style>
