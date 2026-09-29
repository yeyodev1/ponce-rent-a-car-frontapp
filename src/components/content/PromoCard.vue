<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { formatDate } from '@/utils/format'
import { track } from '@/composables/useAnalytics'
import type { Promotion } from '@/types'
import SmartImage from './SmartImage.vue'
import ExpandTransition from './ExpandTransition.vue'

const props = defineProps<{ promo: Promotion }>()
const { t, tx } = useI18n()
const open = ref(false)

const title = computed(() => tx(props.promo.title))
const isExternal = computed(() => /^https?:\/\//.test(props.promo.ctaUrl))
// Sin URL propia, la promo lleva a reservar con su categoría ya elegida.
const internalTo = computed(() => {
  if (props.promo.ctaUrl && !isExternal.value) return props.promo.ctaUrl
  const query: Record<string, string> = { promo: props.promo.slug }
  if (props.promo.categorySlug) query.categoria = props.promo.categorySlug
  return { path: '/reservar', query }
})
const until = computed(() => (props.promo.endsAt ? formatDate(props.promo.endsAt) : ''))

function onCta() {
  track('promotion_click', { promo: props.promo.slug })
}
</script>

<template>
  <article class="promo">
    <div class="promo__media">
      <SmartImage :src="promo.image" :alt="title" icon="fa-solid fa-tags" ratio="16 / 9" />
      <span v-if="tx(promo.badge)" class="promo__badge">{{ tx(promo.badge) }}</span>
    </div>
    <div class="promo__body">
      <p v-if="until" class="promo__until">
        <i class="fa-regular fa-calendar" aria-hidden="true"></i>
        {{ t('content.promotions.until', { date: until }) }}
      </p>
      <h2 class="promo__title">{{ title }}</h2>
      <p class="promo__text">{{ tx(promo.body) }}</p>

      <div v-if="tx(promo.conditions)" class="promo__cond">
        <button
          type="button"
          class="promo__toggle"
          :aria-expanded="open"
          :aria-controls="`cond-${promo._id}`"
          @click="open = !open"
        >
          {{ t('content.promotions.conditions') }}
          <i
            class="fa-solid fa-chevron-down"
            :class="{ 'promo__chev--open': open }"
            aria-hidden="true"
          ></i>
        </button>
        <ExpandTransition>
          <div v-show="open" :id="`cond-${promo._id}`" class="promo__cond-body">
            <p>{{ tx(promo.conditions) }}</p>
          </div>
        </ExpandTransition>
      </div>

      <a
        v-if="isExternal"
        :href="promo.ctaUrl"
        target="_blank"
        rel="noopener"
        class="btn btn--primary btn--block"
        @click="onCta"
      >
        {{ tx(promo.ctaLabel) || t('content.promotions.cta') }}
      </a>
      <RouterLink v-else :to="internalTo" class="btn btn--primary btn--block" @click="onCta">
        {{ tx(promo.ctaLabel) || t('content.promotions.cta') }}
      </RouterLink>
    </div>
  </article>
</template>

<style scoped lang="scss">
.promo {
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

  &__badge {
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    padding: 0.4rem 0.85rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $navy;
    font-size: $text-xs;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: $shadow-glow;
    animation: badge-pop 0.6s $ease-spring 0.3s both;
  }

  &__body {
    flex: 1;
    padding: 1.25rem;
    @include flex(column, stretch, flex-start, 0.7rem);
  }

  &__until {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: $text-xs;
    font-weight: 700;
    color: $red;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__title {
    @include display($text-xl);
    color: $ink;
  }

  &__text {
    color: $ink-soft;
    white-space: pre-line;
  }

  &__cond {
    margin-top: auto;
    border-top: 1px solid $line;
  }

  &__toggle {
    width: 100%;
    min-height: $tap;
    @include flex(row, center, space-between, 0.5rem);
    font-size: $text-sm;
    font-weight: 700;
    color: $ink-soft;

    i {
      transition: transform 0.35s $ease;
    }
  }

  &__chev--open {
    transform: rotate(180deg);
  }

  &__cond-body p {
    padding-bottom: 0.75rem;
    font-size: $text-sm;
    color: $ink-muted;
    white-space: pre-line;
  }
}

@keyframes badge-pop {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-6deg);
  }
}
</style>
