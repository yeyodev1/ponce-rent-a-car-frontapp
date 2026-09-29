<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { linkByKey } from '@/layout/navLinks'
import SectionHeading from './SectionHeading.vue'

const { t } = useI18n()

const items = computed(() =>
  ['business', 'promotions', 'hotels', 'guides', 'renaissance'].map((key) => ({
    ...linkByKey(key),
    title: t(`common.nav.${key}`),
    text: t(`home.sections.${key}`),
  })),
)
</script>

<template>
  <section class="more">
    <SectionHeading :eyebrow="t('home.sections.eyebrow')" :title="t('home.sections.title')" />
    <ul class="more__list">
      <li v-for="(item, i) in items" :key="item.key" v-reveal="i * 70" class="more__item" :class="`more__item--${item.key}`">
        <RouterLink :to="item.to" class="more__card">
          <span class="more__icon" aria-hidden="true"><i :class="item.icon"></i></span>
          <span class="more__title">{{ item.title }}</span>
          <span class="more__text">{{ item.text }}</span>
          <i class="fa-solid fa-arrow-right more__arrow" aria-hidden="true"></i>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.more {
  @include container(1160px);
  padding-block: $space-section 0;

  &__list {
    list-style: none;
    margin-top: 2rem;
    @include flex-cards(150px, 0.75rem);

    @include from('md') {
      gap: 1rem;
    }

    // En escritorio las cinco caben en una fila
    @include from('lg') {
      > * {
        flex-basis: 0;
      }
    }
  }

  &__card {
    position: relative;
    height: 100%;
    min-height: 150px;
    @include flex(column, flex-start, flex-start, 0.35rem);
    padding: 1.1rem 1rem 1.2rem;
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-md;
    transition:
      transform 0.35s $ease,
      border-color 0.25s ease;
    @include focus-ring($blue);

    &:active {
      transform: scale(0.97);
    }

    @media (hover: hover) {
      &:hover {
        transform: translateY(-4px);
        border-color: $navy;
      }

      &:hover .more__arrow {
        opacity: 1;
        transform: none;
      }

      &:hover .more__icon {
        transform: rotate(-6deg) scale(1.06);
      }
    }
  }

  // Renaissance es el club: se distingue en navy
  &__item--renaissance &__card {
    background: linear-gradient(145deg, $navy-2, $navy);
    border-color: $navy;
    color: $on-dark;

    .more__icon {
      background: $accent;
      color: $navy;
    }

    .more__title {
      color: $surface;
    }

    .more__text {
      color: $on-dark-soft;
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: $blue-soft;
    color: $blue;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    transition: transform 0.4s $ease-spring;
  }

  &__title {
    font-family: $font-display;
    font-size: 1.05rem;
    font-weight: 800;
    font-stretch: 108%;
    line-height: 1.15;
    color: $ink;
  }

  &__text {
    font-size: 0.8rem;
    line-height: 1.4;
    color: $ink-soft;
  }

  &__arrow {
    position: absolute;
    top: 1.2rem;
    right: 1rem;
    font-size: 0.85rem;
    color: $ink-muted;
    opacity: 0.6;
    transition:
      transform 0.3s $ease,
      opacity 0.3s ease;

    @media (hover: hover) {
      opacity: 0;
      transform: translateX(-6px);
    }
  }

  &__item--renaissance &__arrow {
    color: $accent;
  }
}
</style>
