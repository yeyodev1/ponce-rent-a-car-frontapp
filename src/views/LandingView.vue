<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/i18n'
import { useCatalogStore } from '@/stores/catalog'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useLanding } from '@/composables/content/useLanding'
import { faqSchema, useFaqs } from '@/composables/content/useFaqs'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import RouteButtons from '@/components/content/RouteButtons.vue'
import BenefitGrid from '@/components/content/BenefitGrid.vue'
import CategoryCard from '@/components/content/CategoryCard.vue'
import CategoryList from '@/components/content/CategoryList.vue'
import LongTermOffer from '@/components/content/LongTermOffer.vue'
import FaqAccordion from '@/components/content/FaqAccordion.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const route = useRoute()
const { t } = useI18n()
const catalog = useCatalogStore()
catalog.load()

const { kind, config, prefix, tl, benefits } = useLanding()
const { faqs, loading: faqLoading } = useFaqs(() => config.value.faqTopics)
const topFaqs = computed(() => faqs.value.slice(0, 6))

// La categoría estrella del caso (SUV, camioneta); si no existe, se listan las primeras.
const featured = computed(
  () => config.value.featured.map((s) => catalog.bySlug(s)).find(Boolean) || null,
)

const { h1, intro } = usePageSeo({
  key: () => String(route.meta.seoKey || ''),
  fallback: () => `${prefix.value}.seo`,
  image: () => config.value.image,
  schema: () => {
    const list: Record<string, unknown>[] = [
      { ...businessSchema(), description: tl('seo.description') },
    ]
    const faq = faqSchema(topFaqs.value)
    if (faq) list.push(faq)
    return list
  },
})
</script>

<template>
  <div class="landing">
    <PageHero
      :eyebrow="tl('eyebrow')"
      :icon="config.icon"
      :title="h1"
      :intro="intro"
      :image="config.image"
      :image-alt="tl('heroAlt')"
    >
      <template #actions>
        <RouteButtons
          :source="`landing_${kind}`"
          :help-query="config.helpQuery"
          :book-query="config.bookQuery"
        />
      </template>
    </PageHero>

    <PageSection
      id="landing-benefits"
      :eyebrow="tl('benefitsEyebrow')"
      :title="tl('benefitsTitle')"
    >
      <BenefitGrid :items="benefits" />
    </PageSection>

    <PageSection v-if="kind === 'long-term'" id="landing-offer">
      <LongTermOffer />
    </PageSection>

    <PageSection
      id="landing-fleet"
      tone="sand"
      :eyebrow="t('content.landing.fleetEyebrow')"
      :title="tl('fleetTitle')"
    >
      <CategoryCard v-if="featured" v-reveal :category="featured" featured eager />
      <CategoryList v-else :limit="kind === 'guayaquil' ? 4 : 2" />
      <RouterLink to="/vehiculos" class="landing__all">
        {{ t('content.landing.allCategories') }}
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </PageSection>

    <PageSection
      v-if="faqLoading || topFaqs.length"
      id="landing-faq"
      :eyebrow="t('content.faq.eyebrow')"
      :title="t('content.landing.faqTitle')"
    >
      <div class="landing__faq">
        <FaqAccordion :faqs="topFaqs" :loading="faqLoading" />
      </div>
    </PageSection>

    <CtaBand
      :source="`landing_${kind}`"
      :title="tl('ctaTitle')"
      :help-query="config.helpQuery"
      :book-query="config.bookQuery"
    />
  </div>
</template>

<style scoped lang="scss">
.landing {
  &__all {
    margin-top: 1.25rem;
    min-height: $tap;
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 700;
    color: $blue;
  }

  &__faq {
    max-width: 820px;
  }
}
</style>
