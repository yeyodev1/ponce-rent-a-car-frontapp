<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useBusiness } from '@/composables/content/useBusiness'
import { IMAGES } from '@/composables/content/images'
import PageHero from '@/components/content/PageHero.vue'
import PageSection from '@/components/content/PageSection.vue'
import BenefitGrid from '@/components/content/BenefitGrid.vue'
import StepsList from '@/components/content/StepsList.vue'
import BusinessForm from '@/components/content/BusinessForm.vue'

const { t } = useI18n()
const biz = useBusiness()

const benefitIcons: Record<string, string> = {
  invoice: 'fa-solid fa-file-invoice-dollar',
  fleet: 'fa-solid fa-car-rear',
  advisor: 'fa-solid fa-user-tie',
  delivery: 'fa-solid fa-truck-fast',
  replacement: 'fa-solid fa-arrows-rotate',
  rates: 'fa-solid fa-chart-line',
}
const benefits = computed(() =>
  Object.entries(benefitIcons).map(([k, icon]) => ({
    icon,
    title: t(`content.business.benefits.${k}.title`),
    text: t(`content.business.benefits.${k}.text`),
  })),
)

const steps = computed(() =>
  (['tell', 'quote', 'deliver'] as const).map((k, i) => ({
    icon: ['fa-solid fa-comments', 'fa-solid fa-file-signature', 'fa-solid fa-key'][i] ?? '',
    title: t(`content.business.steps.${k}.title`),
    text: t(`content.business.steps.${k}.text`),
  })),
)

const { h1, intro } = usePageSeo({
  key: () => 'business',
  fallback: () => 'content.business.seo',
  image: () => IMAGES.business,
  schema: () => businessSchema(),
})
</script>

<template>
  <div class="business">
    <PageHero
      :eyebrow="t('content.business.eyebrow')"
      icon="fa-solid fa-building"
      :title="h1"
      :intro="intro"
      :image="IMAGES.business"
      :image-alt="t('content.business.heroAlt')"
    >
      <template #actions>
        <a href="#empresa-form" class="btn btn--primary btn--lg">
          <i class="fa-solid fa-file-pen" aria-hidden="true"></i>
          {{ t('content.business.heroCta') }}
        </a>
        <a
          :href="`tel:${biz.phone.value}`"
          class="btn btn--ghost-light btn--lg"
          @click="biz.onCall('business')"
        >
          <i class="fa-solid fa-phone" aria-hidden="true"></i> {{ biz.phoneDisplay.value }}
        </a>
      </template>
    </PageHero>

    <PageSection
      id="business-benefits"
      :eyebrow="t('content.business.benefitsEyebrow')"
      :title="t('content.business.benefitsTitle')"
      :lead="t('content.business.benefitsLead')"
    >
      <BenefitGrid :items="benefits" />
    </PageSection>

    <PageSection
      id="business-steps"
      tone="sand"
      :eyebrow="t('content.business.stepsEyebrow')"
      :title="t('content.business.stepsTitle')"
    >
      <StepsList :steps="steps" />
    </PageSection>

    <section id="empresa-form" class="business__form" aria-labelledby="business-form-title">
      <div class="business__inner">
        <div v-reveal class="business__copy">
          <p class="business__eyebrow">{{ t('content.business.formEyebrow') }}</p>
          <h2 id="business-form-title" class="business__title">
            {{ t('content.business.formTitle') }}
          </h2>
          <p class="business__lead">{{ t('content.business.formLead') }}</p>
          <ul class="business__direct">
            <li>
              <a :href="`tel:${biz.phone.value}`" @click="biz.onCall('business')">
                <i class="fa-solid fa-phone" aria-hidden="true"></i> {{ biz.phoneDisplay.value }}
              </a>
            </li>
            <li>
              <a
                :href="biz.waLink(t('content.business.waMessage'))"
                target="_blank"
                rel="noopener"
                @click="biz.onWhatsapp('business')"
              >
                <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                {{ t('common.actions.whatsapp') }}
              </a>
            </li>
            <li v-if="biz.email.value">
              <a :href="`mailto:${biz.email.value}`">
                <i class="fa-solid fa-envelope" aria-hidden="true"></i> {{ biz.email.value }}
              </a>
            </li>
          </ul>
        </div>
        <div v-reveal="120" class="business__card">
          <BusinessForm />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.business {
  &__form {
    padding: $space-xl 0;
    background: $navy;
    color: $on-dark;
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
      flex: 1 1 40%;
      position: sticky;
      top: calc(var(--header-h) + 2rem);
    }
  }

  &__card {
    min-width: 0;

    @include from('lg') {
      flex: 1 1 60%;
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

  &__direct {
    list-style: none;
    margin-top: 1.5rem;
    @include flex(column, flex-start, flex-start, 0.25rem);

    a {
      min-height: $tap;
      @include flex(row, center, flex-start, 0.7rem);
      font-weight: 700;
      color: $surface;

      i {
        width: 1.2em;
        color: $accent;
      }
    }
  }
}
</style>
