<script setup lang="ts">
import { computed } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useI18n } from '@/i18n'
import { site } from '@/config/site'
import { businessSchema } from '@/composables/useSeo'
import { usePageSeo } from '@/composables/content/usePageSeo'
import PageHero from '@/components/content/PageHero.vue'
import CategoryList from '@/components/content/CategoryList.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const catalog = useCatalogStore()
const { t, tx } = useI18n()
catalog.load()

const chips = computed(() => [
  { icon: 'fa-solid fa-plane-arrival', label: t('content.fleet.chips.airport') },
  { icon: 'fa-solid fa-road', label: t('content.fleet.chips.km') },
  { icon: 'fa-solid fa-headset', label: t('content.fleet.chips.support') },
])

const { h1, intro } = usePageSeo({
  key: () => 'fleet',
  fallback: () => 'content.fleet.seo',
  schema: () => [
    businessSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: catalog.categories.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${site.url}/vehiculos/${c.slug}`,
        name: tx(c.name),
      })),
    },
  ],
})
</script>

<template>
  <div class="fleet">
    <PageHero
      :eyebrow="t('content.fleet.eyebrow')"
      icon="fa-solid fa-car-side"
      :title="h1"
      :intro="intro"
    >
      <ul class="fleet__chips">
        <li v-for="c in chips" :key="c.icon" class="fleet__chip">
          <i :class="c.icon" aria-hidden="true"></i> {{ c.label }}
        </li>
      </ul>
    </PageHero>

    <section class="fleet__list" aria-labelledby="fleet-list-title">
      <div class="fleet__inner">
        <h2 id="fleet-list-title" class="visually-hidden">{{ t('content.fleet.listTitle') }}</h2>
        <CategoryList />
      </div>
    </section>

    <section class="fleet__help" aria-labelledby="fleet-help-title">
      <div v-reveal class="fleet__help-card">
        <span class="fleet__help-icon" aria-hidden="true"
          ><i class="fa-solid fa-wand-magic-sparkles"></i
        ></span>
        <div class="fleet__help-text">
          <h2 id="fleet-help-title">{{ t('content.fleet.helpTitle') }}</h2>
          <p>{{ t('content.fleet.helpText') }}</p>
        </div>
        <RouterLink to="/ayudame-a-elegir" class="btn btn--whatsapp btn--lg">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          {{ t('common.actions.helpMeChoose') }}
        </RouterLink>
      </div>
    </section>

    <CtaBand source="fleet" />
  </div>
</template>

<style scoped lang="scss">
.fleet {
  &__chips {
    list-style: none;
    margin-top: 1.5rem;
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__chip {
    @include flex(row, center, flex-start, 0.45rem);
    padding: 0.45rem 0.85rem;
    border-radius: $radius-pill;
    background: rgba($on-dark, 0.08);
    border: 1px solid rgba($on-dark, 0.14);
    font-size: $text-sm;
    font-weight: 600;

    i {
      color: $accent;
    }
  }

  &__list {
    padding: 2rem 0 1rem;
    margin-top: -1.5rem;
    position: relative;

    @include from('md') {
      padding-top: 3rem;
    }
  }

  &__inner,
  &__help {
    @include container;
  }

  &__help {
    padding-top: $space-lg;
  }

  &__help-card {
    @include flex(column, flex-start, flex-start, 1rem);
    padding: 1.5rem;
    border-radius: $radius-lg;
    background: linear-gradient(120deg, $accent-soft, $surface 70%);
    border: 1px solid rgba($accent-deep, 0.3);

    @include from('md') {
      flex-direction: row;
      align-items: center;
      padding: 2rem 2.25rem;
    }
  }

  &__help-icon {
    flex: none;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    @include flex(row, center, center);
    background: $navy;
    color: $accent;
    font-size: 1.35rem;
  }

  &__help-text {
    flex: 1;

    h2 {
      @include display($text-xl);
      color: $ink;
    }

    p {
      margin-top: 0.3rem;
      color: $ink-soft;
    }
  }
}
</style>
