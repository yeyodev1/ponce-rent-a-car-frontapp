<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useSeo } from '@/composables/useSeo'
import { useUnitPage } from '@/composables/content/useUnitPage'
import CategoryGallery from '@/components/content/CategoryGallery.vue'
import UnitSummary from '@/components/content/UnitSummary.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CtaBand from '@/components/content/CtaBand.vue'

/** /vehiculos/:categoria/:unidad — ficha pública de una unidad real de la flota. */
const { t, tx } = useI18n()
const { categorySlug, vehicle, loading, notFound, unitName, categoryName, images, schema } = useUnitPage()

const specs = computed(() => {
  const v = vehicle.value
  if (!v) return []
  const out = [
    { icon: 'fa-solid fa-gears', label: v.transmission === 'manual' ? t('content.specs.manual') : t('content.specs.automatic') },
    { icon: 'fa-solid fa-gas-pump', label: t(`content.category.units.fuel.${v.fuel}`) },
    { icon: 'fa-solid fa-user-group', label: t('content.category.units.seats', { n: v.seats }) },
    { icon: 'fa-solid fa-suitcase-rolling', label: t('content.specs.luggage', { n: v.category.luggage }) },
    { icon: 'fa-regular fa-calendar', label: t('content.unit.year', { year: v.year }) },
  ]
  if (v.color) out.push({ icon: 'fa-solid fa-palette', label: t('content.unit.color', { color: v.color }) })
  if (v.category.airConditioning) out.push({ icon: 'fa-solid fa-snowflake', label: t('content.specs.ac') })
  return out
})
const features = computed(() => (vehicle.value?.category.features || []).map((f) => tx(f)).filter(Boolean))

useSeo(() => {
  const v = vehicle.value
  if (!v) return { title: notFound.value ? t('content.unit.notFoundTitle') : unitName.value, noindex: notFound.value }
  const params = { name: unitName.value, category: categoryName.value, price: money(v.category.pricePerDay) }
  return {
    title: t('content.unit.seoTitle', params),
    description: t('content.unit.seoDescription', params),
    canonicalPath: `/vehiculos/${v.category.slug}/${v.slug}`,
    image: images.value[0] || '',
    schema: schema.value,
  }
})
</script>

<template>
  <div class="unit">
    <div class="unit__inner">
      <nav class="unit__crumbs" :aria-label="t('content.category.breadcrumb')">
        <RouterLink to="/vehiculos">{{ t('common.nav.vehicles') }}</RouterLink>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <RouterLink :to="`/vehiculos/${categorySlug}`">{{ categoryName || categorySlug }}</RouterLink>
        <template v-if="unitName">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          <span aria-current="page">{{ unitName }}</span>
        </template>
      </nav>

      <template v-if="vehicle">
        <div class="unit__top">
          <div class="unit__gallery">
            <CategoryGallery :images="images" :name="unitName" />
          </div>
          <aside class="unit__aside">
            <UnitSummary :vehicle="vehicle" :unit-name="unitName" :category-name="categoryName" />
          </aside>
        </div>

        <section class="unit__section" aria-labelledby="unit-specs">
          <h2 id="unit-specs" class="unit__h2">{{ t('content.unit.specsTitle') }}</h2>
          <ul class="unit__specs">
            <li v-for="s in specs" :key="s.label"><i :class="s.icon" aria-hidden="true"></i>{{ s.label }}</li>
          </ul>
          <template v-if="vehicle.description">
            <h3 class="unit__h3">{{ t('content.unit.aboutTitle') }}</h3>
            <p class="unit__desc">{{ vehicle.description }}</p>
          </template>
        </section>

        <section v-if="features.length" class="unit__section" aria-labelledby="unit-features">
          <h2 id="unit-features" class="unit__h2">{{ t('content.unit.featuresTitle') }}</h2>
          <ul class="unit__features">
            <li v-for="f in features" :key="f"><i class="fa-solid fa-check" aria-hidden="true"></i> {{ f }}</li>
          </ul>
        </section>
      </template>

      <div v-else-if="loading" class="unit__top" aria-busy="true">
        <div class="unit__gallery skeleton unit__sk-gallery"></div>
        <div class="unit__aside">
          <div class="skeleton unit__sk-line"></div>
          <div class="skeleton unit__sk-title"></div>
          <div class="skeleton unit__sk-line"></div>
        </div>
      </div>

      <template v-else>
        <h1 class="visually-hidden">{{ t('content.unit.notFoundTitle') }}</h1>
        <StateBlock tone="empty" icon="fa-solid fa-car-burst" :title="t('content.unit.notFoundTitle')" :text="t('content.unit.notFoundText')">
          <RouterLink to="/vehiculos" class="btn btn--dark">{{ t('content.category.seeAll') }}</RouterLink>
        </StateBlock>
      </template>
    </div>

    <CtaBand source="unit" :book-query="{ categoria: categorySlug }" :help-query="{ categoria: categorySlug }" />
  </div>
</template>

<style scoped lang="scss">
.unit {
  padding-top: calc(var(--header-h) + 1.25rem);

  &__inner {
    @include container;
  }

  &__crumbs {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
    font-size: $text-sm;
    color: $ink-muted;
    margin-bottom: 1rem;

    a {
      min-height: $tap;
      @include flex(row, center, flex-start);
      color: $blue;
      font-weight: 600;
    }

    i {
      font-size: 0.65rem;
    }
  }

  &__top {
    @include flex(column, stretch, flex-start, 1.5rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
      gap: 3rem;
    }
  }

  &__gallery {
    min-width: 0;

    @include from('lg') {
      flex: 1 1 58%;
    }
  }

  &__aside {
    @include from('lg') {
      flex: 1 1 42%;
      position: sticky;
      top: calc(var(--header-h) + 1.5rem);
    }
  }

  &__section {
    padding-top: $space-xl;
  }

  &__h2 {
    @include display($display-sm);
    color: $ink;
    margin-bottom: 1.25rem;
  }

  &__h3 {
    font-family: $font-principal;
    font-size: $text-lg;
    font-weight: 800;
    letter-spacing: 0;
    margin: 1.5rem 0 0.5rem;
  }

  &__specs {
    list-style: none;
    @include flex-cards(180px, 0.6rem);

    li {
      @include card;
      @include flex(row, center, flex-start, 0.6rem);
      padding: 0.85rem 1rem;
      font-weight: 600;
      color: $ink;
    }

    i {
      width: 18px;
      text-align: center;
      color: $blue;
    }
  }

  &__desc {
    max-width: 65ch;
    color: $ink-soft;
    white-space: pre-line;
  }

  &__features {
    list-style: none;
    @include flex-cards(240px, 0.6rem 1.25rem);

    li {
      @include flex(row, flex-start, flex-start, 0.6rem);
      color: $ink;
    }

    i {
      margin-top: 0.3em;
      color: $success;
    }
  }

  &__sk-gallery {
    aspect-ratio: 4 / 3;
    border-radius: $radius-lg;
  }

  &__sk-line {
    height: 16px;
    width: 60%;
    margin-bottom: 0.9rem;
  }

  &__sk-title {
    height: 52px;
    width: 80%;
    margin-bottom: 0.9rem;
  }
}
</style>
