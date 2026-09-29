<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import RenaissanceHero from '@/components/content/RenaissanceHero.vue'
import RenaissanceLevels from '@/components/content/RenaissanceLevels.vue'
import RenaissanceForm from '@/components/content/RenaissanceForm.vue'
import BenefitGrid from '@/components/content/BenefitGrid.vue'
import SectionHead from '@/components/content/SectionHead.vue'

const { t } = useI18n()

const pillarIcons: Record<string, string> = {
  paper: 'fa-solid fa-file-circle-xmark',
  lines: 'fa-solid fa-person-walking-arrow-right',
  evolve: 'fa-solid fa-arrow-trend-up',
  optional: 'fa-solid fa-hand',
}
const pillars = computed(() =>
  Object.entries(pillarIcons).map(([k, icon]) => ({
    icon,
    title: t(`content.renaissance.pillars.${k}.title`),
    text: t(`content.renaissance.pillars.${k}.text`),
  })),
)

const { h1, intro } = usePageSeo({
  key: () => 'renaissance',
  fallback: () => 'content.renaissance.seo',
  schema: () => businessSchema(),
})
</script>

<template>
  <div class="club">
    <RenaissanceHero :title="h1" :intro="intro" />

    <section class="club__block" aria-labelledby="club-pillars-title">
      <div class="club__inner">
        <SectionHead
          id="club-pillars-title"
          light
          center
          :eyebrow="t('content.renaissance.pillarsEyebrow')"
          :title="t('content.renaissance.pillarsTitle')"
        />
        <BenefitGrid :items="pillars" dark />
      </div>
    </section>

    <section class="club__block club__block--levels" aria-labelledby="club-levels-title">
      <div class="club__inner">
        <SectionHead
          id="club-levels-title"
          light
          center
          :eyebrow="t('content.renaissance.levelsEyebrow')"
          :title="t('content.renaissance.levelsTitle')"
          :lead="t('content.renaissance.levelsLead')"
        />
        <RenaissanceLevels />
      </div>
    </section>

    <section id="club-form" class="club__block club__block--form" aria-labelledby="club-form-title">
      <div class="club__inner club__inner--narrow">
        <SectionHead
          id="club-form-title"
          light
          center
          :eyebrow="t('content.renaissance.formEyebrow')"
          :title="t('content.renaissance.formTitle')"
          :lead="t('content.renaissance.formLead')"
        />
        <div v-reveal>
          <RenaissanceForm />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.club {
  background: #030c22;
  color: $on-dark;

  &__block {
    padding: $space-xl 0;
    border-top: 1px solid rgba(#e9c46a, 0.1);

    &--levels {
      background: radial-gradient(ellipse at 50% 0%, rgba($blue, 0.14), transparent 60%);
    }

    &--form {
      scroll-margin-top: var(--header-h);
      background: radial-gradient(ellipse at 50% 100%, rgba(#e9c46a, 0.1), transparent 60%);
    }
  }

  &__inner {
    @include container;

    &--narrow {
      max-width: 620px;
    }
  }
}
</style>
