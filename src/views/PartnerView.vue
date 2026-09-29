<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { IMAGES } from '@/composables/content/images'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import BenefitGrid from '@/components/content/BenefitGrid.vue'
import StepsList from '@/components/content/StepsList.vue'
import PartnerForm from '@/components/content/PartnerForm.vue'

const { t } = useI18n()

const benefitIcons: Record<string, string> = {
  income: 'fa-solid fa-sack-dollar',
  managed: 'fa-solid fa-clipboard-check',
  care: 'fa-solid fa-screwdriver-wrench',
  clear: 'fa-solid fa-file-contract',
}
const benefits = computed(() =>
  Object.entries(benefitIcons).map(([k, icon]) => ({
    icon,
    title: t(`content.partner.benefits.${k}.title`),
    text: t(`content.partner.benefits.${k}.text`),
  })),
)

const steps = computed(() =>
  (['send', 'review', 'inspect', 'earn'] as const).map((k, i) => ({
    icon: [
      'fa-solid fa-paper-plane',
      'fa-solid fa-user-check',
      'fa-solid fa-magnifying-glass',
      'fa-solid fa-chart-line',
    ][i] ?? '',
    title: t(`content.partner.steps.${k}.title`),
    text: t(`content.partner.steps.${k}.text`),
  })),
)

const { h1, intro } = usePageSeo({
  key: () => 'partner',
  fallback: () => 'content.partner.seo',
  image: () => IMAGES.partner,
  schema: () => businessSchema(),
})
</script>

<template>
  <div class="partner">
    <PageHero
      :eyebrow="t('content.partner.eyebrow')"
      icon="fa-solid fa-handshake"
      :title="h1"
      :intro="intro"
      :image="IMAGES.partner"
      :image-alt="t('content.partner.heroAlt')"
    >
      <template #actions>
        <a href="#socio-form" class="btn btn--primary btn--lg">
          {{ t('content.partner.heroCta') }}
          <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
        </a>
      </template>
    </PageHero>

    <PageSection
      id="partner-why"
      :eyebrow="t('content.partner.whyEyebrow')"
      :title="t('content.partner.whyTitle')"
      :lead="t('content.partner.whyLead')"
    >
      <BenefitGrid :items="benefits" />
    </PageSection>

    <PageSection
      id="partner-steps"
      tone="sand"
      :eyebrow="t('content.partner.stepsEyebrow')"
      :title="t('content.partner.stepsTitle')"
    >
      <StepsList :steps="steps" />
    </PageSection>

    <section id="socio-form" class="partner__form" aria-labelledby="partner-form-title">
      <div class="partner__inner">
        <div v-reveal class="partner__copy">
          <p class="partner__eyebrow">{{ t('content.partner.formEyebrow') }}</p>
          <h2 id="partner-form-title" class="partner__title">
            {{ t('content.partner.formTitle') }}
          </h2>
          <p class="partner__lead">{{ t('content.partner.formLead') }}</p>
          <p class="partner__v1">
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
            {{ t('content.partner.reviewNote') }}
          </p>
        </div>
        <div v-reveal="120" class="partner__card">
          <PartnerForm />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.partner {
  &__form {
    padding: $space-xl 0;
    background: $navy;
    scroll-margin-top: var(--header-h);
  }

  &__inner {
    @include container;
    @include flex(column, stretch, flex-start, 2rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
      gap: 4rem;
    }
  }

  &__copy {
    @include from('lg') {
      flex: 1 1 38%;
      position: sticky;
      top: calc(var(--header-h) + 2rem);
    }
  }

  &__card {
    min-width: 0;

    @include from('lg') {
      flex: 1 1 62%;
    }
  }

  &__eyebrow {
    @include eyebrow;
    color: $accent;
  }

  &__title {
    @include display($display-sm);
    color: $surface;
    margin-top: 0.6rem;
  }

  &__lead {
    margin-top: 0.75rem;
    color: $on-dark-soft;
  }

  &__v1 {
    margin-top: 1.25rem;
    @include flex(row, flex-start, flex-start, 0.6rem);
    color: $accent;
    font-weight: 600;
    font-size: $text-sm;

    i {
      margin-top: 0.2rem;
    }
  }
}
</style>
