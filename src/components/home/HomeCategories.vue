<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { useCatalogStore } from '@/stores/catalog'
import SectionHeading from './SectionHeading.vue'
import CategoryCard from './CategoryCard.vue'

/** Carrusel con scroll-snap en móvil; fila en escritorio. Datos del catálogo compartido. */
const { t } = useI18n()
const catalog = useCatalogStore()

const loading = computed(() => !catalog.loaded && !catalog.error)
</script>

<template>
  <section class="cats">
    <div class="cats__head">
      <SectionHeading
        :eyebrow="t('home.categories.eyebrow')"
        :title="t('home.categories.title')"
        :subtitle="t('home.categories.subtitle')"
      />
      <RouterLink v-reveal to="/vehiculos" class="btn btn--ghost cats__all">
        {{ t('common.actions.seeAll') }} <i class="fa-solid fa-arrow-right"></i>
      </RouterLink>
    </div>

    <div v-if="loading" class="cats__track" aria-busy="true">
      <div v-for="n in 4" :key="n" class="cats__item cats__skeleton">
        <div class="skeleton cats__sk-media"></div>
        <div class="skeleton cats__sk-line"></div>
        <div class="skeleton cats__sk-line cats__sk-line--short"></div>
      </div>
    </div>

    <div v-else-if="catalog.error" v-reveal class="cats__state">
      <i class="fa-solid fa-wifi"></i>
      <p>{{ t('home.categories.error') }}</p>
      <button type="button" class="btn btn--ghost btn--sm" @click="catalog.load(true)">
        <i class="fa-solid fa-rotate-right"></i>{{ t('common.actions.retry') }}
      </button>
    </div>

    <div v-else-if="!catalog.categories.length" v-reveal class="cats__state">
      <i class="fa-solid fa-car-side"></i>
      <p>{{ t('home.categories.empty') }}</p>
    </div>

    <ul v-else class="cats__track" :aria-label="t('home.categories.title')">
      <li v-for="(cat, i) in catalog.categories" :key="cat._id" v-reveal="i * 80" class="cats__item">
        <CategoryCard :category="cat" />
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.cats {
  padding-block: $space-section 0;

  &__head {
    @include container(1280px);
    @include flex(column, flex-start, space-between, 1rem);
    margin-bottom: 1.75rem;

    @include from('md') {
      flex-direction: row;
      align-items: flex-end;
    }
  }

  &__all {
    flex: 0 0 auto;
  }

  // Carrusel: se sale del contenedor para que la tarjeta siguiente asome
  &__track {
    list-style: none;
    @include flex(row, stretch, flex-start, 1rem);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1.25rem;
    padding: 0.5rem 1.25rem 1.5rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    @include from('md') {
      padding-inline: 2rem;
      scroll-padding-inline: 2rem;
    }

    @include from('lg') {
      max-width: 1280px;
      margin-inline: auto;
      flex-wrap: wrap;
      overflow: visible;
    }
  }

  &__item {
    flex: 0 0 78%;
    max-width: 320px;
    scroll-snap-align: start;

    @include from('md') {
      flex-basis: 40%;
    }

    // Tres por fila: con 6 categorías quedan dos filas parejas (y 4 o 5 no dejan una tarjeta estirada).
    @include from('lg') {
      flex: 0 0 calc((100% - 2rem) / 3);
      max-width: none;
    }
  }

  &__skeleton {
    @include flex(column, stretch, flex-start, 0.7rem);
    padding-bottom: 1rem;
  }

  &__sk-media {
    aspect-ratio: 16 / 12;
    border-radius: $radius-lg;
  }

  &__sk-line {
    height: 16px;
    width: 70%;

    &--short {
      width: 40%;
    }
  }

  &__state {
    @include container(1280px);
    @include flex(column, center, center, 0.75rem);
    padding-block: 2.5rem;
    text-align: center;
    color: $ink-soft;

    i {
      font-size: 1.6rem;
      color: $ink-muted;
    }
  }
}
</style>
