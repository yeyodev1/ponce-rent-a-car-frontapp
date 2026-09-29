<script setup lang="ts">
import { useI18n } from '@/i18n'
import { track } from '@/composables/useAnalytics'

/** Cierre de la guía: de la inspiración a la acción con un solo botón grande. */
const props = defineProps<{ destination: string; slug: string }>()
const { t } = useI18n()

function onClick() {
  track('route_b_start', { source: 'guide', guide: props.slug })
}
</script>

<template>
  <aside v-reveal class="gclose" aria-labelledby="gclose-title">
    <span class="gclose__road" aria-hidden="true"></span>
    <p class="gclose__eyebrow">{{ t('content.guides.closeEyebrow') }}</p>
    <h2 id="gclose-title" class="gclose__title">
      {{
        destination
          ? t('content.guides.closeTitle', { place: destination })
          : t('content.guides.closeTitleGeneric')
      }}
    </h2>
    <RouterLink
      to="/reservar"
      class="btn btn--primary btn--lg btn--shine gclose__btn"
      @click="onClick"
    >
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      {{ t('content.guides.closeCta') }}
    </RouterLink>
    <RouterLink to="/ayudame-a-elegir" class="gclose__alt">
      {{ t('content.guides.closeAlt') }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    </RouterLink>
  </aside>
</template>

<style scoped lang="scss">
.gclose {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  margin-top: $space-xl;
  padding: 2.5rem 1.25rem;
  border-radius: $radius-lg;
  background: $navy;
  color: $on-dark;
  text-align: center;
  @include flex(column, center, center, 0.9rem);

  @include from('md') {
    padding: 4rem 3rem;
  }

  // Línea de carretera que avanza: guiño al viaje sin distraer.
  &__road {
    position: absolute;
    z-index: -1;
    left: 0;
    bottom: 1.4rem;
    width: calc(100% + 52px);
    height: 3px;
    background: repeating-linear-gradient(90deg, rgba($accent, 0.5) 0 28px, transparent 28px 52px);
    animation: road 1.6s linear infinite;
    opacity: 0.6;
  }

  &__eyebrow {
    @include eyebrow;
    color: $accent;
  }

  &__title {
    @include display($display-sm);
    color: $surface;
    max-width: 22ch;
  }

  &__btn {
    margin-top: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    min-width: min(100%, 320px);
    font-size: 1.1rem;
  }

  &__alt {
    min-height: $tap;
    @include flex(row, center, center, 0.5rem);
    font-weight: 700;
    color: $on-dark-soft;
  }
}

@keyframes road {
  to {
    transform: translateX(-52px);
  }
}
</style>
