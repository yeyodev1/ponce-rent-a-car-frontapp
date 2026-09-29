<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import { publicService } from '@/services/public.service'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useRemote } from '@/composables/content/useRemote'
import type { Guide } from '@/types'
import PageHero from '@/components/content/PageHero.vue'
import GuideCard from '@/components/content/GuideCard.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const { t, tx } = useI18n()
const {
  data: guides,
  loading,
  error,
  reload,
} = useRemote<Guide[]>('guides', () => publicService.guides(), [])
const featured = computed(() => guides.value[0] || null)
const rest = computed(() => guides.value.slice(1))

const { h1, intro } = usePageSeo({
  key: () => 'guides',
  fallback: () => 'content.guides.seo',
  schema: () => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t('content.guides.seo.title'),
    url: `${site.url}/guias-de-viaje`,
    blogPost: guides.value.map((g) => ({
      '@type': 'BlogPosting',
      headline: tx(g.title),
      url: `${site.url}/guias-de-viaje/${g.slug}`,
      image: g.cover || undefined,
      datePublished: g.publishedAt || undefined,
    })),
  }),
})
</script>

<template>
  <div class="guides">
    <PageHero
      :eyebrow="t('content.guides.eyebrow')"
      icon="fa-solid fa-compass"
      :title="h1"
      :intro="intro"
    />

    <section class="guides__body" :aria-label="t('content.guides.listLabel')">
      <div class="guides__inner">
        <div v-if="loading && !guides.length" class="guides__loading">
          <div class="skeleton guides__sk-featured"></div>
          <div class="guides__grid">
            <div v-for="n in 3" :key="n" class="skeleton guides__sk-card"></div>
          </div>
        </div>
        <StateBlock
          v-else-if="error && !guides.length"
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
          v-else-if="!featured"
          icon="fa-solid fa-map-location-dot"
          :title="t('content.guides.emptyTitle')"
          :text="t('content.guides.emptyText')"
        >
          <RouterLink to="/vehiculos" class="btn btn--dark">{{
            t('common.actions.searchVehicle')
          }}</RouterLink>
        </StateBlock>
        <template v-else>
          <GuideCard v-reveal :guide="featured" featured />
          <div v-if="rest.length" class="guides__grid">
            <GuideCard v-for="(g, i) in rest" :key="g._id" v-reveal="(i % 3) * 90" :guide="g" />
          </div>
        </template>
      </div>
    </section>

    <CtaBand source="guides" :title="t('content.guides.ctaTitle')" />
  </div>
</template>

<style scoped lang="scss">
.guides {
  &__body {
    padding-top: $space-lg;
  }

  &__inner {
    @include container;
  }

  &__grid {
    margin-top: 2.5rem;
    @include flex-cards(280px, 2rem 1.5rem);

    @include from('lg') {
      > * {
        max-width: calc(33.333% - 1rem);
      }
    }
  }

  &__sk-featured {
    aspect-ratio: 16 / 8;
    border-radius: $radius-lg;
  }

  &__sk-card {
    aspect-ratio: 4 / 3;
    border-radius: $radius-lg;
  }
}
</style>
