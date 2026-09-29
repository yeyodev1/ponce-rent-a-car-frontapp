<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from '@/i18n'
import { useBusiness } from '@/composables/content/useBusiness'
import CategoryCard from './CategoryCard.vue'
import CategorySkeleton from './CategorySkeleton.vue'
import StateBlock from './StateBlock.vue'

/** Tarjetas de categorías del catálogo con sus estados de carga, error y vacío. */
const props = withDefaults(defineProps<{ only?: string[]; limit?: number }>(), {
  only: () => [],
  limit: 0,
})

const catalog = useCatalogStore()
const biz = useBusiness()
const { t } = useI18n()

const list = computed(() => {
  let items = [...catalog.categories].sort((a, b) => a.order - b.order)
  if (props.only.length) items = items.filter((c) => props.only.includes(c.slug))
  return props.limit ? items.slice(0, props.limit) : items
})
</script>

<template>
  <div class="clist">
    <div v-if="catalog.loading && !list.length" class="clist__grid">
      <CategorySkeleton v-for="n in 3" :key="n" />
    </div>
    <StateBlock
      v-else-if="catalog.error && !list.length"
      tone="error"
      icon="fa-solid fa-plug-circle-xmark"
      :title="t('content.states.errorTitle')"
      :text="t('content.states.errorText')"
    >
      <button type="button" class="btn btn--dark" @click="catalog.load(true)">
        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i> {{ t('common.actions.retry') }}
      </button>
      <a
        :href="biz.waLink()"
        target="_blank"
        rel="noopener"
        class="btn btn--whatsapp"
        @click="biz.onWhatsapp('fleet_error')"
      >
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> {{ t('common.actions.whatsapp') }}
      </a>
    </StateBlock>
    <StateBlock
      v-else-if="!list.length"
      icon="fa-solid fa-car-side"
      :title="t('content.fleet.emptyTitle')"
      :text="t('content.fleet.emptyText')"
    >
      <RouterLink to="/ayudame-a-elegir" class="btn btn--whatsapp">{{
        t('common.actions.helpMeChoose')
      }}</RouterLink>
    </StateBlock>
    <div v-else class="clist__grid">
      <CategoryCard
        v-for="(c, i) in list"
        :key="c._id"
        v-reveal="(i % 3) * 90"
        :category="c"
        :eager="i < 2"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.clist__grid {
  @include flex-cards(300px, 1.25rem);

  @include from('lg') {
    gap: 1.75rem;

    > * {
      flex-basis: 340px;
      max-width: calc(50% - 0.875rem);
    }
  }
}
</style>
