<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { useHeroIntro } from '@/composables/useHeroIntro'
import RouteCard from './RouteCard.vue'

/**
 * Primer pantallazo: promesa + las dos rutas. En un teléfono de 360×740 las
 * dos tarjetas quedan a la vista y al alcance del pulgar, sin hacer scroll.
 */
const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
useHeroIntro(root)

// Cerro Santa Ana, Las Peñas y el faro desde el Malecón 2000: Guayaquil a la
// primera mirada. Servida desde /public en WebP; en móvil va un recorte
// vertical centrado en el cerro. Crédito (CC BY-SA 4.0) en el footer.
const base = '/images/hero/guayaquil-cerro-santa-ana'
const landscape = [1280, 1920, 2560].map((w) => `${base}-${w}.webp ${w}w`).join(', ')
const portrait = [720, 1080].map((w) => `${base}-portrait-${w}.webp ${w}w`).join(', ')

const words = computed(() => t('home.hero.title').split(' '))
const chips = computed(() => [
  { icon: 'fa-solid fa-plane-arrival', label: t('home.hero.trust.airport') },
  { icon: 'fa-solid fa-circle-check', label: t('home.hero.trust.condition') },
  { icon: 'fa-solid fa-shield-halved', label: t('home.hero.trust.secure') },
])
</script>

<template>
  <section ref="root" class="hero">
    <div class="hero__bg" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" type="image/webp" :srcset="portrait" sizes="100vw" />
        <source type="image/webp" :srcset="landscape" sizes="100vw" />
        <img :src="`${base}-1920.webp`" alt="" width="1920" height="1280" fetchpriority="high" decoding="async" />
      </picture>
    </div>
    <div class="hero__veil" aria-hidden="true"></div>

    <div class="hero__inner">
      <div class="hero__copy">
        <p class="hero__eyebrow">
          <span class="hero__dot"></span>
          {{ t('home.hero.eyebrow') }}
        </p>
        <h1 class="hero__title" :aria-label="t('home.hero.title')">
          <template v-for="(word, i) in words" :key="`${word}-${i}`">
            <span class="hero__mask" aria-hidden="true"><span class="hero__word">{{ word }}</span></span>{{ ' ' }}
          </template>
        </h1>
        <p class="hero__subtitle">{{ t('home.hero.subtitle') }}</p>
        <ul class="hero__chips">
          <li v-for="chip in chips" :key="chip.icon" class="hero__chip">
            <i :class="chip.icon"></i>{{ chip.label }}
          </li>
        </ul>
      </div>

      <nav class="hero__routes" :aria-label="t('home.routes.label')">
        <RouteCard
          to="/ayudame-a-elegir"
          tone="accent"
          icon="fa-solid fa-comments"
          :tag="t('home.routes.a.tag')"
          :title="t('home.routes.a.title')"
          :text="t('home.routes.a.text')"
        />
        <RouteCard
          to="/reservar"
          tone="blue"
          icon="fa-solid fa-car-side"
          :tag="t('home.routes.b.tag')"
          :title="t('home.routes.b.title')"
          :text="t('home.routes.b.text')"
        />
      </nav>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: calc(100vh - var(--tabbar-h));
  min-height: calc(100svh - var(--tabbar-h));
  @include flex(column, stretch, flex-end);
  background: $navy;
  color: $on-dark;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: -2;
    will-change: transform;

    picture {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      width: 100%;
      height: 115%;
      margin-top: -7%;
      object-fit: cover;
      // Móvil: el faro y el cerro quedan entre el título y las tarjetas.
      object-position: 50% 42%;

      @include from('lg') {
        // Desktop: el texto va a la izquierda; se sube el encuadre para que el
        // faro y las casas de colores respiren a la derecha del título.
        object-position: 50% 38%;
      }
    }
  }

  // Degradado navy: legibilidad arriba (título) y abajo (tarjetas)
  &__veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(120% 70% at 85% 10%, rgba($accent, 0.14), transparent 55%),
      linear-gradient(180deg, rgba($navy, 0.8) 0%, rgba($navy, 0.3) 40%, rgba($navy, 0.62) 64%, $navy 100%);

    @include from('lg') {
      background:
        radial-gradient(90% 80% at 90% 20%, rgba($accent, 0.12), transparent 55%),
        linear-gradient(90deg, rgba($navy, 0.92) 0%, rgba($navy, 0.6) 55%, rgba($navy, 0.35) 100%),
        linear-gradient(180deg, transparent 60%, $navy 100%);
    }
  }

  &__inner {
    @include container(1280px);
    @include flex(column, stretch, space-between, 1.4rem);
    flex: 1;
    padding-top: calc(var(--header-h) + 1.25rem);
    padding-bottom: 1.25rem;

    @include from('lg') {
      flex-direction: row;
      align-items: flex-end;
      gap: 3rem;
      padding-bottom: 4.5rem;
    }
  }

  &__copy {
    flex: 1;
    @include flex(column, flex-start, center, 0.85rem);

    @include from('lg') {
      justify-content: flex-end;
      max-width: 700px;
    }
  }

  &__eyebrow {
    @include eyebrow;
    @include flex(row, center, flex-start, 0.55rem);
    color: $accent;
  }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $accent;
    box-shadow: 0 0 0 4px rgba($accent, 0.2);
  }

  &__title {
    @include display(clamp(2.15rem, 1.3rem + 4.4vw, 4.9rem), 900);
    color: $surface;
  }

  // Cada palabra sube desde detrás de su máscara
  &__mask {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
    padding: 0.1em 0.04em 0.14em;
    margin: -0.1em -0.04em -0.14em;
  }

  &__word {
    display: inline-block;
  }

  &__subtitle {
    font-size: $text-lg;
    font-weight: 500;
    line-height: 1.45;
    color: $on-dark-soft;
    max-width: 36ch;
  }

  // Una sola línea deslizable en móvil: la confianza no debe empujar las rutas
  &__chips {
    list-style: none;
    @include flex(row, center, flex-start, 0.45rem);
    align-self: stretch;
    margin: 0.2rem -1.25rem 0;
    padding-inline: 1.25rem;
    overflow-x: auto;
    scrollbar-width: none;
    mask-image: linear-gradient(90deg, #000 85%, transparent);

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      flex-wrap: wrap;
      margin-inline: 0;
      padding-inline: 0;
      overflow: visible;
      mask-image: none;
    }
  }

  &__chip {
    flex: 0 0 auto;
    white-space: nowrap;
    @include flex(row, center, flex-start, 0.4rem);
    padding: 0.38rem 0.7rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 700;
    color: $on-dark;
    background: rgba($on-dark, 0.08);
    border: 1px solid rgba($on-dark, 0.14);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    i {
      color: $accent;
    }
  }

  &__routes {
    @include flex(column, stretch, flex-start, 0.75rem);

    @include from('md') {
      flex-direction: row;
    }

    @include from('lg') {
      flex-direction: column;
      flex: 0 0 480px;
    }
  }

  // Pantallas bajitas: se sacrifica lo accesorio para que las rutas se vean
  @media (max-height: 680px) and (max-width: 767px) {
    &__eyebrow,
    &__chips {
      display: none;
    }
  }
}
</style>
