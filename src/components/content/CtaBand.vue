<script setup lang="ts">
import { computed } from 'vue'
import type { LocationQueryRaw } from 'vue-router'
import { useI18n } from '@/i18n'
import { useBusiness } from '@/composables/content/useBusiness'
import { track } from '@/composables/useAnalytics'

/**
 * Cierre de cada página: las dos rutas del sitio (Ruta A con asesor, Ruta B
 * reserva directa) más llamada y WhatsApp para quien ya quiere hablar.
 */
const props = withDefaults(
  defineProps<{
    title?: string
    text?: string
    source: string
    helpQuery?: LocationQueryRaw
    bookQuery?: LocationQueryRaw
  }>(),
  { title: '', text: '', helpQuery: () => ({}), bookQuery: () => ({}) },
)

const { t } = useI18n()
const biz = useBusiness()
const wa = computed(() => biz.waLink(t('content.cta.waMessage')))

function onBook() {
  track('route_b_start', { source: props.source })
}
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <div class="cta__inner">
      <div v-reveal class="cta__card">
        <span class="cta__glow" aria-hidden="true"></span>
        <p class="cta__eyebrow">{{ t('content.cta.eyebrow') }}</p>
        <h2 id="cta-title" class="cta__title">{{ title || t('content.cta.title') }}</h2>
        <p class="cta__text">{{ text || t('content.cta.text') }}</p>

        <div class="cta__routes">
          <RouterLink
            :to="{ path: '/ayudame-a-elegir', query: helpQuery }"
            class="cta__route cta__route--a"
          >
            <span class="cta__route-icon" aria-hidden="true"
              ><i class="fa-brands fa-whatsapp"></i
            ></span>
            <span class="cta__route-text">
              <strong>{{ t('common.actions.helpMeChoose') }}</strong>
              <small>{{ t('content.cta.helpHint') }}</small>
            </span>
            <i class="fa-solid fa-arrow-right cta__arrow" aria-hidden="true"></i>
          </RouterLink>
          <RouterLink
            :to="{ path: '/reservar', query: bookQuery }"
            class="cta__route cta__route--b"
            @click="onBook"
          >
            <span class="cta__route-icon" aria-hidden="true"
              ><i class="fa-solid fa-car-side"></i
            ></span>
            <span class="cta__route-text">
              <strong>{{ t('common.actions.bookOnline') }}</strong>
              <small>{{ t('content.cta.bookHint') }}</small>
            </span>
            <i class="fa-solid fa-arrow-right cta__arrow" aria-hidden="true"></i>
          </RouterLink>
        </div>

        <div class="cta__talk">
          <span>{{ t('content.cta.orTalk') }}</span>
          <a :href="`tel:${biz.phone.value}`" class="cta__link" @click="biz.onCall(source)">
            <i class="fa-solid fa-phone" aria-hidden="true"></i> {{ t('common.actions.callNow') }}
          </a>
          <a
            :href="wa"
            target="_blank"
            rel="noopener"
            class="cta__link"
            @click="biz.onWhatsapp(source)"
          >
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            {{ t('common.actions.whatsapp') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  padding: $space-xl 0;

  &__inner {
    @include container;
  }

  &__card {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border-radius: $radius-lg;
    background: $navy;
    color: $on-dark;
    padding: 2.25rem 1.25rem;

    @include from('md') {
      padding: 3.5rem 3rem;
    }
  }

  &__glow {
    position: absolute;
    z-index: -1;
    width: 520px;
    height: 520px;
    right: -180px;
    top: -260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba($blue, 0.55), transparent 65%);
    animation: cta-drift 12s $ease-in-out infinite alternate;
  }

  &__eyebrow {
    @include eyebrow;
    color: $accent;
  }

  &__title {
    @include display($display-sm);
    color: $surface;
    margin-top: 0.6rem;
    max-width: 20ch;
  }

  &__text {
    margin-top: 0.75rem;
    color: $on-dark-soft;
    max-width: 52ch;
  }

  &__routes {
    margin-top: 1.75rem;
    @include flex-cards(260px, 0.75rem);
  }

  &__route {
    @include flex(row, center, flex-start, 0.9rem);
    min-height: 76px;
    padding: 0.9rem 1.1rem;
    border-radius: $radius-md;
    color: $surface;
    transition:
      transform 0.3s $ease,
      box-shadow 0.3s $ease;

    &--a {
      background: $whatsapp;
      box-shadow: 0 12px 30px rgba($whatsapp, 0.3);
    }

    &--b {
      background: $blue;
      box-shadow: $shadow-blue;
    }

    @media (hover: hover) {
      &:hover {
        transform: translateY(-3px);
      }

      &:hover .cta__arrow {
        transform: translateX(4px);
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__route-icon {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    @include flex(row, center, center);
    background: rgba(#fff, 0.16);
    font-size: 1.25rem;
  }

  &__route-text {
    flex: 1;
    @include flex(column, flex-start, center, 0.1rem);
    line-height: 1.25;

    strong {
      font-size: 1.02rem;
    }

    small {
      font-size: $text-sm;
      opacity: 0.88;
    }
  }

  &__arrow {
    transition: transform 0.3s $ease;
  }

  &__talk {
    margin-top: 1.5rem;
    @include flex(row, center, flex-start, 0.4rem 1.1rem);
    flex-wrap: wrap;
    color: $on-dark-soft;
    font-size: $text-sm;
  }

  &__link {
    min-height: $tap;
    @include flex(row, center, flex-start, 0.45rem);
    color: $surface;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba($accent, 0.6);
    text-underline-offset: 4px;
  }
}

@keyframes cta-drift {
  to {
    transform: translate(-60px, 40px) scale(1.1);
  }
}
</style>
