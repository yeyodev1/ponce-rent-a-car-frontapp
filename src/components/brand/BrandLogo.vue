<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { useI18n } from '@/i18n'

/**
 * Logo provisional hecho en SVG (el definitivo del cliente llega después).
 * textLength fija el ancho del wordmark aunque la fuente tarde en cargar, así
 * el header no "salta" cuando entra Archivo.
 */
const props = withDefaults(defineProps<{ variant?: 'light' | 'dark'; slogan?: boolean }>(), {
  variant: 'light',
  slogan: false,
})

const { tx } = useI18n()
const height = computed(() => (props.slogan ? 80 : 62))
const ink = computed(() => (props.variant === 'light' ? '#ffffff' : '#06173a'))
</script>

<template>
  <svg
    class="logo"
    :class="`logo--${variant}`"
    :viewBox="`0 0 240 ${height}`"
    role="img"
    :aria-label="site.name"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Marcas de velocidad: guiño al detalle rojo del logo original -->
    <g class="logo__speed" fill="#e5213b">
      <path d="M3 0h13l-3 5H0z" />
      <path d="M20 0h13l-3 5H17z" />
      <path d="M37 0h13l-3 5H34z" />
    </g>
    <text
      x="0"
      y="43"
      class="logo__word"
      :fill="ink"
      textLength="240"
      lengthAdjust="spacingAndGlyphs"
    >PONCE’S</text>
    <g class="logo__sub">
      <rect x="0" y="50.5" width="44" height="2" rx="1" fill="#ffc400" />
      <text x="120" y="56" text-anchor="middle" fill="#ffc400" textLength="136" lengthAdjust="spacing">RENT A CAR</text>
      <rect x="196" y="50.5" width="44" height="2" rx="1" fill="#ffc400" />
    </g>
    <text v-if="slogan" x="120" y="76" text-anchor="middle" class="logo__slogan" :fill="ink">
      {{ tx(site.slogan) }}
    </text>
  </svg>
</template>

<style scoped lang="scss">
.logo {
  display: block;
  height: 100%;
  width: auto;
  overflow: visible;

  &__word {
    font-family: $font-display;
    font-size: 44px;
    font-weight: 900;
    font-stretch: 125%;
    letter-spacing: -0.01em;
  }

  &__sub text {
    font-family: $font-display;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.32em;
  }

  &__slogan {
    font-family: $font-principal;
    font-size: 11px;
    font-style: italic;
    font-weight: 600;
    opacity: 0.8;
  }
}
</style>
