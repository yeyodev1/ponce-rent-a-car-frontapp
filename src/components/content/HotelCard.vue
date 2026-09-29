<script setup lang="ts">
import { useI18n } from '@/i18n'
import { track } from '@/composables/useAnalytics'
import type { Hotel } from '@/types'
import SmartImage from './SmartImage.vue'

const props = defineProps<{ hotel: Hotel }>()
const { t, tx } = useI18n()

function onContact(kind: string) {
  track('hotel_contact', { hotel: props.hotel.slug, kind })
}
</script>

<template>
  <article class="hotel">
    <div class="hotel__media">
      <SmartImage
        :src="hotel.image"
        :alt="t('content.hotels.imageAlt', { name: hotel.name })"
        icon="fa-solid fa-hotel"
        ratio="3 / 2"
      />
      <span v-if="hotel.zone" class="hotel__zone">
        <i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ hotel.zone }}
      </span>
    </div>
    <div class="hotel__body">
      <h2 class="hotel__name">{{ hotel.name }}</h2>
      <p v-if="tx(hotel.description)" class="hotel__desc">{{ tx(hotel.description) }}</p>
      <div v-if="tx(hotel.benefit)" class="hotel__perk">
        <i class="fa-solid fa-gift" aria-hidden="true"></i>
        <div>
          <strong>{{ t('content.hotels.benefit') }}</strong>
          <p>{{ tx(hotel.benefit) }}</p>
        </div>
      </div>
      <p v-if="tx(hotel.promotion)" class="hotel__promo">
        <span class="chip chip--accent"
          ><i class="fa-solid fa-tag" aria-hidden="true"></i> {{ tx(hotel.promotion) }}</span
        >
      </p>
      <div class="hotel__actions">
        <a
          v-if="hotel.website"
          :href="hotel.website"
          target="_blank"
          rel="noopener"
          class="btn btn--dark"
          @click="onContact('web')"
        >
          <i class="fa-solid fa-globe" aria-hidden="true"></i> {{ t('content.hotels.website') }}
        </a>
        <a
          v-if="hotel.phone"
          :href="`tel:${hotel.phone}`"
          class="btn btn--ghost"
          @click="onContact('phone')"
        >
          <i class="fa-solid fa-phone" aria-hidden="true"></i> {{ t('content.hotels.call') }}
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.hotel {
  @include card;
  border-radius: $radius-lg;
  overflow: hidden;
  @include flex(column, stretch, flex-start);
  box-shadow: $shadow-sm;
  transition:
    transform 0.4s $ease,
    box-shadow 0.4s $ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-5px);
      box-shadow: $shadow-md;
    }
  }

  &__media {
    position: relative;
  }

  &__zone {
    position: absolute;
    left: 0.9rem;
    bottom: 0.9rem;
    @include flex(row, center, flex-start, 0.4rem);
    padding: 0.35rem 0.8rem;
    border-radius: $radius-pill;
    background: rgba($navy, 0.82);
    backdrop-filter: blur(8px);
    color: $surface;
    font-size: $text-xs;
    font-weight: 700;
  }

  &__body {
    flex: 1;
    padding: 1.25rem;
    @include flex(column, stretch, flex-start, 0.75rem);
  }

  &__name {
    @include display($text-xl);
    color: $ink;
  }

  &__desc {
    color: $ink-soft;
  }

  &__perk {
    @include flex(row, flex-start, flex-start, 0.75rem);
    padding: 0.9rem 1rem;
    border-radius: $radius-sm;
    background: $blue-soft;
    color: $ink;

    > i {
      margin-top: 0.2rem;
      color: $blue;
    }

    strong {
      font-size: $text-sm;
    }

    p {
      font-size: $text-sm;
      color: $ink-soft;
    }
  }

  &__actions {
    margin-top: auto;
    padding-top: 0.25rem;
    @include flex(row, stretch, flex-start, 0.6rem);
    flex-wrap: wrap;

    .btn {
      flex: 1 1 160px;
      white-space: nowrap;
    }
  }
}
</style>
