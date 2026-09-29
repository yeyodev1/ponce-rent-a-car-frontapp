<script setup lang="ts">
import { useI18n } from '@/i18n'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { useGuidePage } from '@/composables/content/useGuidePage'
import GuideCover from '@/components/content/GuideCover.vue'
import GuideClosing from '@/components/content/GuideClosing.vue'
import StateBlock from '@/components/content/StateBlock.vue'

const { t, tx } = useI18n()
const { guide, title, sections, loading, notFound, reload, schema } = useGuidePage()

usePageSeo({
  key: () => '',
  fallback: () => 'content.guides.seo',
  image: () => guide.value?.cover || '',
  schema: () => schema.value,
  noindex: () => notFound.value,
  override: () => {
    const g = guide.value
    if (!g) return {}
    return {
      title: tx(g.seo?.title) || title.value,
      description: tx(g.seo?.description) || tx(g.excerpt),
    }
  },
})
</script>

<template>
  <div class="guide">
    <template v-if="guide">
      <GuideCover :guide="guide" :title="title" />

      <article class="guide__article">
        <p v-if="tx(guide.excerpt)" v-reveal class="guide__lead">{{ tx(guide.excerpt) }}</p>

        <nav
          v-if="sections.length > 2"
          v-reveal
          class="guide__toc"
          :aria-label="t('content.guides.toc')"
        >
          <p class="guide__toc-title">{{ t('content.guides.toc') }}</p>
          <ol>
            <li v-for="s in sections" :key="s.id">
              <a :href="`#${s.id}`">{{ s.heading }}</a>
            </li>
          </ol>
        </nav>

        <section v-for="s in sections" :id="s.id" :key="s.id" class="guide__section">
          <h2 v-if="s.heading" v-reveal class="guide__h2">{{ s.heading }}</h2>
          <p v-for="(p, i) in s.paragraphs" :key="i" v-reveal class="guide__p">{{ p }}</p>
        </section>

        <GuideClosing :destination="guide.destination" :slug="guide.slug" />
      </article>
    </template>

    <div v-else-if="loading" class="guide__loading" aria-busy="true">
      <div class="skeleton guide__sk-cover"></div>
      <div class="guide__article">
        <div v-for="n in 5" :key="n" class="skeleton guide__sk-line"></div>
      </div>
    </div>

    <div v-else class="guide__article guide__missing">
      <h1 class="visually-hidden">{{ t('content.guides.notFoundTitle') }}</h1>
      <StateBlock
        :tone="notFound ? 'empty' : 'error'"
        icon="fa-solid fa-map"
        :title="t('content.guides.notFoundTitle')"
        :text="notFound ? t('content.guides.notFoundText') : t('content.states.errorText')"
      >
        <button v-if="!notFound" type="button" class="btn btn--dark" @click="reload">
          {{ t('common.actions.retry') }}
        </button>
        <RouterLink to="/guias-de-viaje" class="btn btn--ghost">{{
          t('content.guides.back')
        }}</RouterLink>
      </StateBlock>
    </div>
  </div>
</template>

<style scoped lang="scss">
.guide {
  padding-bottom: $space-xl;

  &__article {
    @include container(760px);
    padding-top: $space-lg;
  }

  &__lead {
    font-size: $text-xl;
    line-height: 1.5;
    color: $ink;
    font-weight: 500;

    &::first-letter {
      float: left;
      font-family: $font-display;
      font-size: 3.6em;
      line-height: 0.85;
      font-weight: 900;
      color: $blue;
      margin: 0.08em 0.12em 0 0;
    }
  }

  &__toc {
    margin-top: 2rem;
    padding: 1.25rem 1.4rem;
    border-radius: $radius-md;
    background: $sand;

    ol {
      margin-top: 0.5rem;
      padding-left: 1.2rem;
    }

    a {
      display: inline-flex;
      min-height: 40px;
      align-items: center;
      color: $blue;
      font-weight: 600;
    }
  }

  &__toc-title {
    @include eyebrow;
  }

  &__section {
    padding-top: 2.25rem;
    scroll-margin-top: calc(var(--header-h) + 1rem);
  }

  &__h2 {
    @include display($display-sm);
    color: $ink;
    margin-bottom: 1rem;
  }

  &__p {
    color: $ink-soft;
    font-size: $text-lg;
    line-height: 1.75;

    & + & {
      margin-top: 1rem;
    }
  }

  &__missing {
    padding-top: calc(var(--header-h) + 2rem);
  }

  &__sk-cover {
    height: min(70vh, 560px);
    border-radius: 0;
  }

  &__sk-line {
    height: 18px;
    margin-bottom: 1rem;
  }
}
</style>
