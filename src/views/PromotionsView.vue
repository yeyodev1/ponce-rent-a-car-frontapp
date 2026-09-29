<script setup lang="ts">
import { useI18n } from '@/i18n'
import { publicService } from '@/services/public.service'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useRemote } from '@/composables/content/useRemote'
import { useBusiness } from '@/composables/content/useBusiness'
import type { Promotion } from '@/types'
import PageHero from '@/components/content/PageHero.vue'
import PromoCard from '@/components/content/PromoCard.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CategorySkeleton from '@/components/content/CategorySkeleton.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const { t } = useI18n()
const biz = useBusiness()
const {
  data: promos,
  loading,
  error,
  reload,
} = useRemote<Promotion[]>('promotions', () => publicService.promotions(), [])

const { h1, intro } = usePageSeo({
  key: () => 'promotions',
  fallback: () => 'content.promotions.seo',
  schema: () => businessSchema(),
})
</script>

<template>
  <div class="promos">
    <PageHero
      :eyebrow="t('content.promotions.eyebrow')"
      icon="fa-solid fa-tags"
      :title="h1"
      :intro="intro"
    />

    <section class="promos__list" :aria-label="t('content.promotions.listLabel')">
      <div class="promos__inner">
        <div v-if="loading && !promos.length" class="promos__grid">
          <CategorySkeleton v-for="n in 3" :key="n" />
        </div>
        <StateBlock
          v-else-if="error && !promos.length"
          tone="error"
          icon="fa-solid fa-plug-circle-xmark"
          :title="t('content.states.errorTitle')"
          :text="t('content.states.errorText')"
        >
          <button type="button" class="btn btn--dark" @click="reload">
            {{ t('common.actions.retry') }}
          </button>
        </StateBlock>
        <StateBlock
          v-else-if="!promos.length"
          icon="fa-solid fa-gift"
          :title="t('content.promotions.emptyTitle')"
          :text="t('content.promotions.emptyText')"
        >
          <RouterLink to="/ponces-renaissance" class="btn btn--dark">
            <i class="fa-solid fa-crown" aria-hidden="true"></i>
            {{ t('content.promotions.emptyClub') }}
          </RouterLink>
          <a
            :href="biz.waLink(t('content.promotions.waMessage'))"
            target="_blank"
            rel="noopener"
            class="btn btn--whatsapp"
            @click="biz.onWhatsapp('promotions_empty')"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            {{ t('content.promotions.emptyAsk') }}
          </a>
        </StateBlock>
        <div v-else class="promos__grid">
          <PromoCard v-for="(p, i) in promos" :key="p._id" v-reveal="(i % 3) * 90" :promo="p" />
        </div>
      </div>
    </section>

    <CtaBand source="promotions" />
  </div>
</template>

<style scoped lang="scss">
.promos {
  &__list {
    padding: $space-lg 0 0;
  }

  &__inner {
    @include container;
  }

  &__grid {
    @include flex-cards(290px, 1.25rem);

    @include from('lg') {
      > * {
        max-width: calc(33.333% - 0.84rem);
      }
    }
  }
}
</style>
