<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { Guide } from '@/types'
import SmartImage from './SmartImage.vue'
import GuideMeta from './GuideMeta.vue'

/** Tarjeta de guía tipo revista. "featured" es la portada grande del listado. */
const props = withDefaults(defineProps<{ guide: Guide; featured?: boolean }>(), { featured: false })
const { tx } = useI18n()
const title = computed(() => tx(props.guide.title))
</script>

<template>
  <article class="gcard" :class="{ 'gcard--featured': featured }">
    <div class="gcard__media">
      <SmartImage
        :src="guide.cover"
        :alt="title"
        icon="fa-solid fa-mountain-sun"
        :ratio="featured ? '16 / 10' : '4 / 3'"
        :eager="featured"
      />
      <span v-if="guide.destination" class="gcard__dest">{{ guide.destination }}</span>
    </div>
    <div class="gcard__body">
      <component :is="featured ? 'h2' : 'h3'" class="gcard__title">
        <RouterLink :to="`/guias-de-viaje/${guide.slug}`" class="gcard__link">{{
          title
        }}</RouterLink>
      </component>
      <p v-if="tx(guide.excerpt)" class="gcard__excerpt">{{ tx(guide.excerpt) }}</p>
      <GuideMeta :guide="guide" :light="featured" />
    </div>
  </article>
</template>

<style scoped lang="scss">
.gcard {
  position: relative;
  @include flex(column, stretch, flex-start, 0.9rem);

  &__media {
    position: relative;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-sm;

    :deep(.smart-img__img) {
      transition:
        opacity 0.6s $ease,
        transform 0.9s $ease;
    }
  }

  @media (hover: hover) {
    &:hover :deep(.smart-img__img) {
      transform: scale(1.05);
    }
  }

  &__dest {
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $navy;
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__body {
    @include flex(column, stretch, flex-start, 0.5rem);
  }

  &__title {
    @include display($text-xl);
    color: $ink;
  }

  &__link {
    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: none;

      &::after {
        outline: 2px solid $blue;
        outline-offset: 4px;
        border-radius: $radius-lg;
      }
    }
  }

  &__excerpt {
    color: $ink-soft;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // Portada: la foto ocupa todo y el texto va encima, como tapa de revista.
  &--featured {
    border-radius: $radius-lg;
    overflow: hidden;
    color: $on-dark;
    box-shadow: $shadow-md;

    .gcard__media {
      border-radius: 0;
      box-shadow: none;

      // En móvil la tapa es vertical para que el texto quepa sobre la foto.
      :deep(.smart-img) {
        aspect-ratio: 4 / 5 !important;

        @include from('md') {
          aspect-ratio: 16 / 8 !important;
        }
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 25%, rgba($navy, 0.95) 100%);
      }
    }

    .gcard__body {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 1.25rem;

      @include from('md') {
        padding: 2.5rem;
      }
    }

    .gcard__title {
      @include display($display-sm);
      color: $surface;
      max-width: 22ch;
    }

    .gcard__excerpt {
      color: $on-dark-soft;
      max-width: 60ch;
      -webkit-line-clamp: 2;
    }
  }
}
</style>
