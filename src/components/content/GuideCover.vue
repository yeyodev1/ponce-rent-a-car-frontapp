<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatDate } from '@/utils/format'
import type { Guide } from '@/types'
import GuideMeta from './GuideMeta.vue'

/** Portada de la guía a sangre completa, con el H1 encima como tapa de revista. */
const props = defineProps<{ guide: Guide; title: string }>()
const { t } = useI18n()
const date = computed(() => (props.guide.publishedAt ? formatDate(props.guide.publishedAt) : ''))
</script>

<template>
  <header class="gcover">
    <img
      v-if="guide.cover"
      class="gcover__img"
      :src="guide.cover"
      :alt="title"
      width="1600"
      height="1000"
      loading="eager"
      fetchpriority="high"
      decoding="async"
    />
    <div class="gcover__veil" aria-hidden="true"></div>
    <div class="gcover__inner">
      <RouterLink to="/guias-de-viaje" class="gcover__back">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> {{ t('content.guides.back') }}
      </RouterLink>
      <p v-if="guide.destination" class="gcover__dest">{{ guide.destination }}</p>
      <h1 class="gcover__title">{{ title }}</h1>
      <GuideMeta :guide="guide" light />
      <p v-if="date" class="gcover__date">{{ t('content.guides.published', { date }) }}</p>
    </div>
  </header>
</template>

<style scoped lang="scss">
.gcover {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: min(88vh, 720px);
  @include flex(column, stretch, flex-end);
  padding: calc(var(--header-h) + 2rem) 0 2.5rem;
  background: radial-gradient(circle at 80% 10%, rgba($blue, 0.4), transparent 50%), $navy;
  color: $on-dark;

  @include from('md') {
    padding-bottom: 4rem;
  }

  &__img {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: cover-zoom 16s $ease both;
  }

  &__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgba($navy, 0.45) 0%,
      transparent 35%,
      rgba($navy, 0.94) 100%
    );
  }

  &__inner {
    @include container(900px);
    @include flex(column, flex-start, flex-start, 0.9rem);
    animation: cover-in 0.9s $ease both;
  }

  &__back {
    min-height: $tap;
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    font-weight: 700;
    color: $surface;
    margin-bottom: auto;
  }

  &__dest {
    @include eyebrow;
    color: $navy;
    background: $accent;
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
  }

  &__title {
    @include display($display-md);
    color: $surface;

    @include from('lg') {
      font-size: $display-lg;
    }
  }

  &__date {
    font-size: $text-xs;
    color: $on-dark-soft;
  }
}

@keyframes cover-zoom {
  from {
    transform: scale(1.1);
  }
}

@keyframes cover-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
