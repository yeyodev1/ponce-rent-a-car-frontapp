<script setup lang="ts">
import { useI18n } from '@/i18n'
import { useBusiness } from '@/composables/content/useBusiness'

/** Venta cruzada hotel ↔ vehículo: dos preguntas, dos salidas claras. */
const { t } = useI18n()
const biz = useBusiness()
</script>

<template>
  <div class="xsell">
    <div v-reveal class="xsell__card xsell__card--stay">
      <span class="xsell__icon" aria-hidden="true"><i class="fa-solid fa-bed"></i></span>
      <h2 class="xsell__title">{{ t('content.hotels.noStayTitle') }}</h2>
      <p class="xsell__text">{{ t('content.hotels.noStayText') }}</p>
      <a
        :href="biz.waLink(t('content.hotels.noStayWa'))"
        target="_blank"
        rel="noopener"
        class="btn btn--ghost-light"
        @click="biz.onWhatsapp('hotels_stay')"
      >
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> {{ t('content.hotels.noStayCta') }}
      </a>
    </div>
    <div v-reveal="100" class="xsell__card xsell__card--car">
      <span class="xsell__icon" aria-hidden="true"><i class="fa-solid fa-car-side"></i></span>
      <h2 class="xsell__title">{{ t('content.hotels.needCarTitle') }}</h2>
      <p class="xsell__text">{{ t('content.hotels.needCarText') }}</p>
      <RouterLink
        :to="{ path: '/ayudame-a-elegir', query: { lugar: 'hotel' } }"
        class="btn btn--primary"
      >
        {{ t('common.actions.helpMeChoose') }}
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xsell {
  @include flex-cards(280px, 1rem);

  &__card {
    position: relative;
    overflow: hidden;
    border-radius: $radius-lg;
    padding: 1.75rem 1.4rem;
    @include flex(column, flex-start, flex-start, 0.6rem);
    color: $on-dark;

    @include from('md') {
      padding: 2.25rem;
    }

    &--stay {
      background: linear-gradient(140deg, $navy-2, $navy);
    }

    &--car {
      background: linear-gradient(140deg, $blue, $blue-deep);
    }
  }

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    @include flex(row, center, center);
    background: rgba(#fff, 0.12);
    color: $accent;
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
  }

  &__title {
    @include display($text-xl);
    color: $surface;
  }

  &__text {
    color: rgba($on-dark, 0.85);
    margin-bottom: 0.6rem;
  }
}
</style>
