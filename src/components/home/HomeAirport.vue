<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

// Aeropuerto al atardecer (Unsplash), verificada. Placeholder hasta tener fotos propias.
const photo = 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&q=70'
const srcset = [800, 1200, 1600].map((w) => `${photo}&w=${w} ${w}w`).join(', ')

const points = computed(() => [t('home.airport.p1'), t('home.airport.p2'), t('home.airport.p3')])
</script>

<template>
  <section class="airport">
    <div v-reveal class="airport__card">
      <img
        class="airport__img"
        :src="`${photo}&w=1200`"
        :srcset="srcset"
        sizes="(min-width: 1160px) 1160px, 100vw"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div class="airport__veil" aria-hidden="true"></div>
      <div class="airport__content">
        <p class="airport__eyebrow"><i class="fa-solid fa-plane-arrival"></i>{{ t('home.airport.eyebrow') }}</p>
        <h2 class="airport__title">{{ t('home.airport.title') }}</h2>
        <p class="airport__text">{{ t('home.airport.text') }}</p>
        <ul class="airport__points">
          <li v-for="(p, i) in points" :key="i"><i class="fa-solid fa-check"></i>{{ p }}</li>
        </ul>
        <RouterLink to="/alquiler-autos-aeropuerto-guayaquil" class="btn btn--primary btn--lg airport__cta">
          {{ t('home.airport.cta') }} <i class="fa-solid fa-arrow-right"></i>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.airport {
  @include container(1160px);
  padding-block: $space-section 0;

  @include until('md') {
    padding-inline: 0.75rem;
  }

  &__card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: $radius-lg;
    background: $navy;
    color: $on-dark;
    min-height: 520px;
    @include flex(column, stretch, flex-end);
    box-shadow: $shadow-lg;

    @include from('md') {
      min-height: 480px;
      justify-content: center;
    }

    @media (hover: hover) {
      &:hover .airport__img {
        transform: scale(1.04);
      }
    }
  }

  &__img {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 60% 50%;
    transition: transform 1.4s $ease;
  }

  &__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgba($navy, 0.1) 0%, rgba($navy, 0.75) 45%, $navy 100%);

    @include from('md') {
      background: linear-gradient(90deg, $navy 0%, rgba($navy, 0.85) 42%, rgba($navy, 0.1) 100%);
    }
  }

  &__content {
    @include flex(column, flex-start, flex-start, 0.8rem);
    padding: 2rem 1.35rem 1.75rem;
    max-width: 540px;

    @include from('md') {
      padding: 3rem;
    }
  }

  &__eyebrow {
    @include eyebrow;
    @include flex(row, center, flex-start, 0.5rem);
    color: $accent;
    letter-spacing: 0.14em;
  }

  &__title {
    @include display($display-md, 900);
    color: $surface;
  }

  &__text {
    color: $on-dark-soft;
  }

  &__points {
    list-style: none;
    @include flex(column, flex-start, flex-start, 0.45rem);
    margin-block: 0.2rem 0.6rem;
    font-weight: 600;
    font-size: $text-sm;

    li {
      @include flex(row, center, flex-start, 0.6rem);
    }

    i {
      @include flex(row, center, center);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba($accent, 0.18);
      color: $accent;
      font-size: 0.65rem;
    }
  }

  &__cta {
    @include until('sm') {
      width: 100%;
    }
  }
}
</style>
