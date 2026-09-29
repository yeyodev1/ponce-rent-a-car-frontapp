<script setup lang="ts">
import { useI18n } from '@/i18n'

/** Tarifa especial por larga duración: se cotiza con un asesor (Ruta A con 30+ días). */
const { t } = useI18n()
</script>

<template>
  <div v-reveal class="lto">
    <div class="lto__badge" aria-hidden="true">
      <strong>30+</strong>
      <span>{{ t('common.units.days') }}</span>
    </div>
    <div class="lto__body">
      <h2 class="lto__title">{{ t('content.landing.longTerm.offerTitle') }}</h2>
      <p class="lto__text">{{ t('content.landing.longTerm.offerText') }}</p>
      <ul class="lto__list">
        <li>
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          {{ t('content.landing.longTerm.offer1') }}
        </li>
        <li>
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          {{ t('content.landing.longTerm.offer2') }}
        </li>
        <li>
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          {{ t('content.landing.longTerm.offer3') }}
        </li>
      </ul>
      <RouterLink
        :to="{ path: '/ayudame-a-elegir', query: { duracion: '30+' } }"
        class="btn btn--primary btn--lg"
      >
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        {{ t('content.landing.longTerm.offerCta') }}
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lto {
  position: relative;
  overflow: hidden;
  @include flex(column, flex-start, flex-start, 1.5rem);
  padding: 2rem 1.35rem;
  border-radius: $radius-lg;
  background: radial-gradient(circle at 100% 0%, rgba($accent, 0.25), transparent 50%), $navy;
  color: $on-dark;

  @include from('md') {
    flex-direction: row;
    align-items: center;
    gap: 3rem;
    padding: 3rem;
  }

  &__badge {
    flex: none;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    @include flex(column, center, center);
    border: 2px solid $accent;
    color: $accent;
    animation: lto-pulse 3.2s $ease-in-out infinite;

    strong {
      font-family: $font-display;
      font-size: 2.6rem;
      font-weight: 900;
      line-height: 1;
    }

    span {
      font-size: $text-sm;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
  }

  &__title {
    @include display($display-sm);
    color: $surface;
  }

  &__text {
    margin-top: 0.6rem;
    color: $on-dark-soft;
  }

  &__list {
    list-style: none;
    margin: 1rem 0 1.5rem;
    @include flex(column, flex-start, flex-start, 0.4rem);

    i {
      color: $accent;
      margin-right: 0.4rem;
    }
  }
}

@keyframes lto-pulse {
  50% {
    transform: scale(1.04);
  }
}
</style>
