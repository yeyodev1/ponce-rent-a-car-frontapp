<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import SectionHeading from './SectionHeading.vue'

const { t } = useI18n()

const steps = computed(() => [
  { icon: 'fa-solid fa-signs-post', title: t('home.steps.s1.title'), text: t('home.steps.s1.text') },
  { icon: 'fa-solid fa-calendar-day', title: t('home.steps.s2.title'), text: t('home.steps.s2.text') },
  { icon: 'fa-solid fa-key', title: t('home.steps.s3.title'), text: t('home.steps.s3.text') },
])
</script>

<template>
  <section class="steps">
    <SectionHeading :eyebrow="t('home.steps.eyebrow')" :title="t('home.steps.title')" center />
    <ol class="steps__list">
      <li v-for="(step, i) in steps" :key="i" v-reveal="i * 120" class="steps__item">
        <span class="steps__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="steps__icon" aria-hidden="true"><i :class="step.icon"></i></span>
        <h3 class="steps__title">{{ step.title }}</h3>
        <p class="steps__text">{{ step.text }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.steps {
  @include container(1160px);
  padding-block: $space-section 0;

  &__list {
    list-style: none;
    margin-top: 2.25rem;
    @include flex-cards(240px, 1rem);

    @include from('md') {
      gap: 1.5rem;
    }
  }

  &__item {
    position: relative;
    overflow: hidden;
    @include flex(column, flex-start, flex-start, 0.55rem);
    padding: 1.5rem 1.35rem 1.6rem;
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  // Número gigante de fondo: da ritmo sin agregar ruido
  &__num {
    position: absolute;
    top: -0.2rem;
    right: 0.9rem;
    font-family: $font-display;
    font-size: 5.2rem;
    font-weight: 900;
    font-stretch: 125%;
    line-height: 1;
    color: $sand;
    pointer-events: none;
  }

  &__icon {
    position: relative;
    @include flex(row, center, center);
    width: 50px;
    height: 50px;
    border-radius: 15px;
    background: $navy;
    color: $accent;
    font-size: 1.2rem;
    margin-bottom: 0.4rem;
  }

  &__title {
    position: relative;
    font-size: 1.25rem;
    color: $ink;
  }

  &__text {
    position: relative;
    color: $ink-soft;
    font-size: $text-sm;
  }
}
</style>
