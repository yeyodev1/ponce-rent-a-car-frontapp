<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useCategoryPage } from '@/composables/content/useCategoryPage'
import { usePageSeo } from '@/composables/content/usePageSeo'
import CategoryGallery from '@/components/content/CategoryGallery.vue'
import CategorySummary from '@/components/content/CategorySummary.vue'
import CategorySpecs from '@/components/content/CategorySpecs.vue'
import MileageInfo from '@/components/content/MileageInfo.vue'
import RequirementsList from '@/components/content/RequirementsList.vue'
import StickyBookBar from '@/components/content/StickyBookBar.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CategoryUnits from '@/components/content/CategoryUnits.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const { t, tx } = useI18n()
const { slug, category, name, images, loading, notFound, schema } = useCategoryPage()

// La barra fija solo aparece cuando el resumen (con su propio CTA) sale de pantalla.
const summaryEl = ref<HTMLElement | null>(null)

const features = computed(() => (category.value?.features || []).map((f) => tx(f)).filter(Boolean))

usePageSeo({
  key: () => '',
  fallback: () => 'content.category.seo',
  image: () => images.value[0] || '',
  schema: () => schema.value,
  noindex: () => notFound.value,
  override: () => {
    const c = category.value
    if (!c) return {}
    const seoTitle = tx(c.seo?.title)
    const seoDesc = tx(c.seo?.description)
    return {
      title: seoTitle || t('content.category.seoTitle', { name: name.value }),
      description:
        seoDesc ||
        t('content.category.seoDescription', { name: name.value, price: money(c.pricePerDay) }),
    }
  },
})
</script>

<template>
  <div class="cat" :class="{ 'cat--sticky': category }">
    <div class="cat__inner">
      <nav class="cat__crumbs" :aria-label="t('content.category.breadcrumb')">
        <RouterLink to="/vehiculos">{{ t('common.nav.vehicles') }}</RouterLink>
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        <span aria-current="page">{{ name || slug }}</span>
      </nav>

      <template v-if="category">
        <div class="cat__top">
          <div class="cat__gallery">
            <CategoryGallery :images="images" :name="name" />
          </div>
          <aside ref="summaryEl" class="cat__aside">
            <CategorySummary :category="category" :name="name" />
          </aside>
        </div>

        <section class="cat__section" aria-labelledby="cat-specs">
          <h2 id="cat-specs" v-reveal class="cat__h2">{{ t('content.category.specsTitle') }}</h2>
          <CategorySpecs :category="category" large />
          <p v-if="tx(category.description)" v-reveal class="cat__desc">
            {{ tx(category.description) }}
          </p>
          <ul v-if="features.length" class="cat__features">
            <li v-for="(f, i) in features" :key="f" v-reveal="i * 50">
              <i class="fa-solid fa-check" aria-hidden="true"></i> {{ f }}
            </li>
          </ul>
        </section>

        <section v-if="category.units?.length" class="cat__section" aria-labelledby="cat-units">
          <h2 id="cat-units" v-reveal class="cat__h2">{{ t('content.category.units.title') }}</h2>
          <CategoryUnits :units="category.units" />
        </section>

        <section class="cat__section" aria-labelledby="cat-km">
          <h2 id="cat-km" v-reveal class="cat__h2">{{ t('content.category.mileageTitle') }}</h2>
          <MileageInfo />
        </section>

        <section class="cat__section" aria-labelledby="cat-reqs">
          <h2 id="cat-reqs" v-reveal class="cat__h2">{{ t('content.requirements.title') }}</h2>
          <RequirementsList />
        </section>
      </template>

      <div v-else-if="loading" class="cat__top" aria-busy="true">
        <div class="cat__gallery skeleton cat__sk-gallery"></div>
        <div class="cat__aside">
          <div class="skeleton cat__sk-line" style="width: 40%"></div>
          <div class="skeleton cat__sk-title"></div>
          <div class="skeleton cat__sk-line" style="width: 70%"></div>
        </div>
      </div>

      <template v-else>
        <h1 class="visually-hidden">{{ t('content.category.notFoundTitle') }}</h1>
        <StateBlock
          :tone="notFound ? 'empty' : 'error'"
          icon="fa-solid fa-car-burst"
          :title="t('content.category.notFoundTitle')"
          :text="t('content.category.notFoundText')"
        >
          <RouterLink to="/vehiculos" class="btn btn--dark">{{
            t('content.category.seeAll')
          }}</RouterLink>
        </StateBlock>
      </template>
    </div>

    <CtaBand
      source="category"
      :book-query="{ categoria: slug }"
      :help-query="{ categoria: slug }"
    />
    <StickyBookBar
      v-if="category"
      :slug="category.slug"
      :name="name"
      :price="category.pricePerDay"
      :anchor="summaryEl"
    />
  </div>
</template>

<style scoped lang="scss">
.cat {
  padding-top: calc(var(--header-h) + 1.25rem);

  &--sticky {
    padding-bottom: calc(var(--tabbar-h) + 5.5rem);

    @include from('lg') {
      padding-bottom: 0;
    }
  }

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

  &__desc {
    margin-top: 1.25rem;
    max-width: 65ch;
    color: $ink-soft;
    white-space: pre-line;
  }

  &__features {
    list-style: none;
    margin-top: 1.25rem;
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
    margin-bottom: 0.9rem;
  }

  &__sk-title {
    height: 52px;
    width: 80%;
    margin-bottom: 0.9rem;
  }
}
</style>
