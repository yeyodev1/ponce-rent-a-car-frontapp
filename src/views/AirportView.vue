<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useBusiness } from '@/composables/content/useBusiness'
import { faqSchema, useFaqs } from '@/composables/content/useFaqs'
import { IMAGES, AIRPORT_MAPS_URL } from '@/composables/content/images'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import RouteButtons from '@/components/content/RouteButtons.vue'
import StepsList from '@/components/content/StepsList.vue'
import InfoCard from '@/components/content/InfoCard.vue'
import RequirementsList from '@/components/content/RequirementsList.vue'
import FaqAccordion from '@/components/content/FaqAccordion.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const { t } = useI18n()
const biz = useBusiness()
const { faqs, loading: faqLoading } = useFaqs(() => ['airport'])

const steps = computed(() =>
  (['book', 'flight', 'meet', 'drive'] as const).map((k, i) => ({
    icon: [
      'fa-solid fa-mobile-screen',
      'fa-solid fa-plane-arrival',
      'fa-solid fa-handshake',
      'fa-solid fa-key',
    ][i] ?? '',
    title: t(`content.airport.steps.${k}.title`),
    text: t(`content.airport.steps.${k}.text`),
  })),
)

const { h1, intro } = usePageSeo({
  key: () => 'airport',
  fallback: () => 'content.airport.seo',
  image: () => IMAGES.airport,
  schema: () => {
    const list: Record<string, unknown>[] = [
      { ...businessSchema(), areaServed: 'Aeropuerto José Joaquín de Olmedo (GYE), Guayaquil' },
    ]
    const faq = faqSchema(faqs.value)
    if (faq) list.push(faq)
    return list
  },
})

const query = { lugar: 'airport' }
</script>

<template>
  <div class="airport">
    <PageHero
      :eyebrow="t('content.airport.eyebrow')"
      icon="fa-solid fa-plane"
      :title="h1"
      :intro="intro"
      :image="IMAGES.airport"
      :image-alt="t('content.airport.heroAlt')"
    >
      <template #actions>
        <RouteButtons source="airport" :help-query="query" :book-query="query" />
      </template>
    </PageHero>

    <PageSection
      id="airport-steps"
      :eyebrow="t('content.airport.stepsEyebrow')"
      :title="t('content.airport.stepsTitle')"
      :lead="t('content.airport.stepsLead')"
    >
      <StepsList :steps="steps" />
    </PageSection>

    <PageSection
      id="airport-where"
      tone="sand"
      :eyebrow="t('content.airport.whereEyebrow')"
      :title="t('content.airport.whereTitle')"
    >
      <div class="airport__cards">
        <InfoCard
          v-reveal
          icon="fa-solid fa-location-dot"
          :title="t('content.airport.placeTitle')"
          :text="t('content.airport.placeText')"
        >
          <template #actions>
            <a :href="AIRPORT_MAPS_URL" target="_blank" rel="noopener" class="btn btn--dark">
              <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
              {{ t('content.airport.openMaps') }}
            </a>
          </template>
        </InfoCard>
        <InfoCard
          v-reveal="80"
          icon="fa-solid fa-clock"
          :title="t('content.airport.hoursTitle')"
          :text="biz.hours.value || t('content.airport.hoursFallback')"
        >
          <p class="airport__note">{{ t('content.airport.hoursNote') }}</p>
        </InfoCard>
        <InfoCard
          v-reveal="160"
          icon="fa-solid fa-rotate-left"
          :title="t('content.airport.returnTitle')"
          :text="t('content.airport.returnText')"
        />
      </div>
    </PageSection>

    <PageSection
      id="airport-reqs"
      :eyebrow="t('content.requirements.eyebrow')"
      :title="t('content.requirements.title')"
    >
      <RequirementsList />
    </PageSection>

    <PageSection
      v-if="faqLoading || faqs.length"
      id="airport-faq"
      tone="sand"
      :eyebrow="t('content.faq.eyebrow')"
      :title="t('content.airport.faqTitle')"
    >
      <div class="airport__faq">
        <FaqAccordion :faqs="faqs" :loading="faqLoading" first-open />
        <RouterLink to="/preguntas-frecuentes" class="airport__more">
          {{ t('content.faq.seeAll') }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </PageSection>

    <CtaBand
      source="airport"
      :title="t('content.airport.ctaTitle')"
      :help-query="query"
      :book-query="query"
    />
  </div>
</template>

<style scoped lang="scss">
.airport {
  &__cards {
    @include flex-cards(260px, 1rem);
  }

  &__note {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__faq {
    max-width: 820px;
  }

  &__more {
    margin-top: 1rem;
    min-height: $tap;
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 700;
    color: $blue;
  }
}
</style>
