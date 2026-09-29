<script setup lang="ts">
import { useI18n, type Locale } from '@/i18n'

/** ES | EN siempre visible. Cambia en vivo, sin recargar ni cambiar la URL. */
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })

const { t, locale, setLocale } = useI18n()
const options: Locale[] = ['es', 'en']
</script>

<template>
  <div class="lang" :class="`lang--${tone}`" role="group" :aria-label="t('common.lang.label')">
    <span class="lang__thumb" :class="{ 'lang__thumb--en': locale === 'en' }" aria-hidden="true"></span>
    <button
      v-for="code in options"
      :key="code"
      type="button"
      class="lang__btn"
      :class="{ 'lang__btn--on': locale === code }"
      :aria-pressed="locale === code"
      :aria-label="t(`common.lang.${code}`)"
      :lang="code"
      @click="setLocale(code)"
    >
      {{ code.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.lang {
  position: relative;
  @include flex(row, stretch, flex-start);
  flex: 0 0 auto;
  padding: 3px;
  border-radius: $radius-pill;
  border: 1px solid rgba($on-dark, 0.22);
  background: rgba($on-dark, 0.06);

  &--dark {
    border-color: $line;
    background: $surface;
  }

  &__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc(50% - 3px);
    height: calc(100% - 6px);
    border-radius: $radius-pill;
    background: $accent;
    transition: transform 0.4s $ease-spring;

    &--en {
      transform: translateX(100%);
    }
  }

  &__btn {
    position: relative;
    z-index: 1;
    min-width: 40px;
    min-height: 34px;
    padding: 0 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: $on-dark-soft;
    transition: color 0.25s ease;

    // Área táctil de 48px sin agrandar la píldora
    &::before {
      content: '';
      position: absolute;
      inset: -7px -2px;
    }

    &--on {
      color: $navy;
    }

    @include focus-ring($accent);
  }

  &--dark &__btn {
    color: $ink-soft;

    &--on {
      color: $navy;
    }
  }
}
</style>
