<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

/** Portada del club: navy profundo, dorado y un anillo que gira muy lento. */
const props = defineProps<{ title: string; intro: string }>()
const { t } = useI18n()
// El saludo del brief va sobre el nombre, salvo que el H1 editable ya lo traiga.
const kicker = computed(() =>
  /^(bienvenid|welcome)/i.test(props.title.trim())
    ? t('content.renaissance.kicker')
    : t('content.renaissance.welcome'),
)
</script>

<template>
  <header class="rhero">
    <div class="rhero__halo" aria-hidden="true">
      <span class="rhero__ring"></span>
      <span class="rhero__ring rhero__ring--inner"></span>
    </div>
    <div class="rhero__inner">
      <span class="rhero__crest" aria-hidden="true"><i class="fa-solid fa-crown"></i></span>
      <p class="rhero__kicker">{{ kicker }}</p>
      <h1 class="rhero__title">{{ title }}</h1>
      <span class="rhero__rule" aria-hidden="true"></span>
      <p class="rhero__motto">{{ t('content.renaissance.motto') }}</p>
      <p class="rhero__intro">{{ intro }}</p>
      <div class="rhero__actions">
        <a href="#club-form" class="rhero__cta">
          {{ t('content.renaissance.heroCta') }}
          <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
        </a>
        <p class="rhero__optional">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          {{ t('content.renaissance.optional') }}
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
$gold: #e9c46a;
$gold-light: #f7e2a6;

.rhero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: min(100vh, 860px);
  @include flex(column, stretch, center);
  padding: calc(var(--header-h) + 3rem) 0 4rem;
  background:
    radial-gradient(ellipse at 50% 0%, rgba($blue, 0.28), transparent 60%),
    radial-gradient(ellipse at 50% 110%, rgba($gold, 0.16), transparent 55%), #030c22;
  color: $on-dark;
  text-align: center;

  &__halo {
    position: absolute;
    z-index: -1;
    left: 50%;
    top: 46%;
    width: min(140vw, 900px);
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
  }

  &__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0 70%,
      rgba($gold, 0.55) 85%,
      transparent 100%
    );
    mask: radial-gradient(circle, transparent 69.6%, #000 70%, #000 70.4%, transparent 71%);
    animation: ring-spin 28s linear infinite;

    &--inner {
      inset: 14%;
      opacity: 0.6;
      animation-duration: 40s;
      animation-direction: reverse;
    }
  }

  &__inner {
    @include container(900px);
    @include flex(column, center, flex-start, 1rem);
  }

  &__crest {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    @include flex(row, center, center);
    border: 1px solid rgba($gold, 0.5);
    color: $gold;
    font-size: 1.4rem;
    box-shadow: 0 0 40px rgba($gold, 0.25);
    animation: rise 0.9s $ease both;
  }

  &__kicker {
    @include eyebrow;
    color: $gold;
    letter-spacing: 0.4em;
    animation: rise 0.9s $ease 0.1s both;
  }

  &__title {
    font-family: $font-display;
    font-size: clamp(2.1rem, 1rem + 5.4vw, 5rem);
    font-weight: 900;
    font-stretch: 125%;
    line-height: 0.98;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #ffffff 30%, $gold-light 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: rise 1s $ease 0.2s both;
  }

  &__rule {
    width: 96px;
    height: 2px;
    background: linear-gradient(90deg, transparent, $gold, transparent);
    animation: grow 1.2s $ease 0.5s both;
  }

  &__motto {
    font-family: $font-display;
    font-size: $text-xl;
    font-weight: 600;
    font-stretch: 118%;
    color: $gold;
    animation: rise 1s $ease 0.4s both;
  }

  &__intro {
    max-width: 58ch;
    color: $on-dark-soft;
    font-size: $text-lg;
    animation: rise 1s $ease 0.5s both;
  }

  &__actions {
    margin-top: 1rem;
    @include flex(column, center, flex-start, 0.9rem);
    animation: rise 1s $ease 0.6s both;
  }

  &__cta {
    min-height: $tap-lg;
    @include flex(row, center, center, 0.6rem);
    padding: 0.9rem 2rem;
    border-radius: $radius-pill;
    background: linear-gradient(120deg, $gold-light, $gold 50%, #c9973a);
    color: #1a1204;
    font-weight: 800;
    letter-spacing: 0.04em;
    box-shadow: 0 14px 40px rgba($gold, 0.3);
    transition: transform 0.3s $ease;

    @media (hover: hover) {
      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  &__optional {
    max-width: 34ch;
    font-size: $text-sm;
    color: $on-dark-soft;

    i {
      margin-right: 0.3rem;
    }
  }
}

@keyframes ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}
</style>
