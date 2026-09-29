<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { publicService } from '@/services/public.service'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useRemote } from '@/composables/content/useRemote'
import { IMAGES } from '@/composables/content/images'
import type { Hotel } from '@/types'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import HotelCard from '@/components/content/HotelCard.vue'
import CrossSell from '@/components/content/CrossSell.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CategorySkeleton from '@/components/content/CategorySkeleton.vue'

const { t } = useI18n()
const { data, loading, error, reload } = useRemote<Hotel[]>(
  'hotels',
  () => publicService.hotels(),
  [],
)
const hotels = computed(() => [...data.value].sort((a, b) => a.order - b.order))

const { h1, intro } = usePageSeo({
  key: () => 'hotels',
  fallback: () => 'content.hotels.seo',
  image: () => IMAGES.hotels,
  schema: () => businessSchema(),
})
</script>

<template>
  <div class="hotels">
    <PageHero
      :eyebrow="t('content.hotels.eyebrow')"
      icon="fa-solid fa-hotel"
      :title="h1"
      :intro="intro"
      :image="IMAGES.hotels"
      :image-alt="t('content.hotels.heroAlt')"
    >
      <template #actions>
        <a href="#hoteles" class="btn btn--primary btn--lg">{{ t('content.hotels.heroCta') }}</a>
        <RouterLink
          :to="{ path: '/ayudame-a-elegir', query: { lugar: 'hotel' } }"
          class="btn btn--ghost-light btn--lg"
        >
          <i class="fa-solid fa-car-side" aria-hidden="true"></i> {{ t('content.hotels.heroCar') }}
        </RouterLink>
      </template>
    </PageHero>

    <section id="hoteles" class="hotels__list" :aria-label="t('content.hotels.listLabel')">
      <div class="hotels__inner">
        <div v-if="loading && !hotels.length" class="hotels__grid">
          <CategorySkeleton v-for="n in 3" :key="n" />
        </div>
        <StateBlock
          v-else-if="error && !hotels.length"
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
          v-else-if="!hotels.length"
          icon="fa-solid fa-hotel"
          :title="t('content.hotels.emptyTitle')"
          :text="t('content.hotels.emptyText')"
        />
        <div v-else class="hotels__grid">
          <HotelCard v-for="(h, i) in hotels" :key="h._id" v-reveal="(i % 3) * 90" :hotel="h" />
        </div>
      </div>
    </section>

    <PageSection id="hotels-xsell">
      <CrossSell />
    </PageSection>
  </div>
</template>

<style scoped lang="scss">
.hotels {
  &__list {
    padding-top: $space-lg;
    scroll-margin-top: var(--header-h);
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
