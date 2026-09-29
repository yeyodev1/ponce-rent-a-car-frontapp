<script setup lang="ts">
import { useI18n } from '@/i18n'
import { phoneLink, site, whatsappLink } from '@/config/site'
import { track } from '@/composables/useAnalytics'

const { t } = useI18n()
</script>

<template>
  <section class="final">
    <div v-reveal class="final__card">
      <span class="final__ring" aria-hidden="true"></span>
      <span class="final__icon" aria-hidden="true"><i class="fa-solid fa-headset"></i></span>
      <h2 class="final__title">{{ t('home.final.title') }}</h2>
      <p class="final__text">{{ t('home.final.text') }}</p>
      <div class="final__actions">
        <a
          :href="whatsappLink(t('home.final.whatsappMessage'))"
          target="_blank"
          rel="noopener"
          class="btn btn--whatsapp btn--lg"
          @click="track('whatsapp_open', { from: 'home_final' })"
        >
          <i class="fa-brands fa-whatsapp"></i>{{ t('common.actions.whatsapp') }}
        </a>
        <a :href="phoneLink" class="btn btn--dark btn--lg" @click="track('call_click', { from: 'home_final' })">
          <i class="fa-solid fa-phone"></i>{{ t('home.layout.call') }}
        </a>
      </div>
      <p class="final__phone">{{ site.phoneDisplay }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.final {
  @include container(1160px);
  padding-block: $space-section;

  &__card {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    @include flex(column, center, center, 0.9rem);
    text-align: center;
    padding: 2.75rem 1.35rem;
    border-radius: $radius-lg;
    background: linear-gradient(140deg, lighten($accent, 8%), $accent 50%, $accent-deep);
    color: $navy;

    @include from('md') {
      padding: 4rem 2rem;
    }
  }

  // Anillos concéntricos de fondo, como señal de llamada
  &__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -1;
    width: 640px;
    height: 640px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: repeating-radial-gradient(circle, rgba($navy, 0.06) 0 1px, transparent 1px 56px);
  }

  &__icon {
    @include flex(row, center, center);
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: $navy;
    color: $accent;
    font-size: 1.35rem;
    box-shadow: 0 0 0 8px rgba($navy, 0.08);
  }

  &__title {
    @include display($display-md, 900);
  }

  &__text {
    max-width: 44ch;
    font-weight: 500;
    color: rgba($navy, 0.8);
  }

  &__actions {
    @include flex(column, stretch, center, 0.7rem);
    width: 100%;
    margin-top: 0.6rem;

    @include from('sm') {
      flex-direction: row;
      width: auto;
    }
  }

  &__phone {
    font-weight: 700;
    font-size: $text-sm;
    font-variant-numeric: tabular-nums;
    color: rgba($navy, 0.75);
  }
}
</style>
