<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { useGallery } from '@/composables/content/useGallery'
import SmartImage from './SmartImage.vue'

/** Galería deslizable: swipe con scroll-snap en móvil, flechas en escritorio. */
const props = defineProps<{ images: string[]; name: string }>()
const { t } = useI18n()

const slides = computed(() => (props.images.length ? props.images : ['']))
const track = ref<HTMLElement | null>(null)
const { index, go, next, prev } = useGallery(track, () => slides.value.length)
</script>

<template>
  <div class="gallery" role="region" :aria-label="t('content.category.gallery', { name })">
    <div ref="track" class="gallery__track" tabindex="0">
      <figure
        v-for="(src, i) in slides"
        :key="`${src}-${i}`"
        class="gallery__slide"
        :data-index="i"
        :aria-label="t('content.category.slide', { n: i + 1, total: slides.length })"
      >
        <SmartImage
          :src="src"
          :alt="t('content.category.photoAlt', { name, n: i + 1 })"
          :eager="i === 0"
          ratio="4 / 3"
          sizes="(min-width: 1024px) 640px, 100vw"
        />
      </figure>
    </div>

    <template v-if="slides.length > 1">
      <button
        type="button"
        class="gallery__arrow gallery__arrow--prev"
        :aria-label="t('content.category.prev')"
        @click="prev"
      >
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        class="gallery__arrow gallery__arrow--next"
        :aria-label="t('content.category.next')"
        @click="next"
      >
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
      <div class="gallery__dots">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          class="gallery__dot"
          :class="{ 'gallery__dot--on': i === index }"
          :aria-label="t('content.category.slide', { n: i + 1, total: slides.length })"
          :aria-current="i === index ? 'true' : undefined"
          @click="go(i)"
        ></button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.gallery {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  background: $navy;
  box-shadow: $shadow-md;

  &__track {
    position: relative;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__slide {
    flex: 0 0 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  &__arrow {
    display: none;
    position: absolute;
    top: 50%;
    width: 48px;
    height: 48px;
    margin-top: -24px;
    border-radius: 50%;
    background: rgba($surface, 0.92);
    color: $navy;
    box-shadow: $shadow-sm;
    transition:
      transform 0.25s $ease,
      opacity 0.25s ease;

    &--prev {
      left: 1rem;
    }

    &--next {
      right: 1rem;
    }

    @media (hover: hover) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0;

      &:hover {
        transform: scale(1.08);
      }
    }

    &:focus-visible {
      opacity: 1;
    }
  }

  @media (hover: hover) {
    &:hover &__arrow {
      opacity: 1;
    }
  }

  &__dots {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    @include flex(row, center, center, 0);
  }

  // Punto visual pequeño; el botón mide 48px de alto para el dedo.
  &__dot {
    width: 44px;
    height: $tap;
    @include flex(row, center, center);

    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: $radius-pill;
      background: rgba($surface, 0.55);
      transition:
        transform 0.3s $ease,
        background-color 0.3s ease;
    }

    &--on::before {
      background: $accent;
      transform: scaleX(2.4);
    }
  }
}
</style>
