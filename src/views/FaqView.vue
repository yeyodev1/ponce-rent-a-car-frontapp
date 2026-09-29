<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { usePageSeo } from '@/composables/content/usePageSeo'
import { FAQ_TOPICS, faqSchema, useFaqs } from '@/composables/content/useFaqs'
import { useBusiness } from '@/composables/content/useBusiness'
import PageHero from '@/components/content/PageHero.vue'
import TopicChips from '@/components/content/TopicChips.vue'
import FaqAccordion from '@/components/content/FaqAccordion.vue'
import StateBlock from '@/components/content/StateBlock.vue'
import CtaBand from '@/components/content/CtaBand.vue'

const { t } = useI18n()
const biz = useBusiness()
const { faqs, loading, error, reload } = useFaqs()
const topic = ref('')

const groups = computed(() =>
  FAQ_TOPICS.map((key) => ({
    key,
    title: t(`content.faq.topics.${key}`),
    items: faqs.value.filter((f) => f.topic === key),
  }))
    .filter((g) => g.items.length)
    .filter((g) => !topic.value || g.key === topic.value),
)

const options = computed(() => [
  { value: '', label: t('content.faq.all'), count: faqs.value.length },
  ...FAQ_TOPICS.map((key) => ({
    value: key,
    label: t(`content.faq.topics.${key}`),
    count: faqs.value.filter((f) => f.topic === key).length,
  })).filter((o) => o.count),
])

const { h1, intro } = usePageSeo({
  key: () => 'faq',
  fallback: () => 'content.faq.seo',
  schema: () => faqSchema(faqs.value),
})
</script>

<template>
  <div class="faqp">
    <PageHero
      :eyebrow="t('content.faq.eyebrow')"
      icon="fa-solid fa-circle-question"
      :title="h1"
      :intro="intro"
    />

    <div class="faqp__inner">
      <div v-if="faqs.length" class="faqp__filters">
        <TopicChips v-model="topic" :options="options" :label="t('content.faq.filterLabel')" />
      </div>

      <div v-if="loading && !faqs.length" class="faqp__group">
        <FaqAccordion :faqs="[]" loading />
      </div>
      <StateBlock
        v-else-if="error && !faqs.length"
        tone="error"
        icon="fa-solid fa-plug-circle-xmark"
        :title="t('content.states.errorTitle')"
        :text="t('content.states.errorText')"
      >
        <button type="button" class="btn btn--dark" @click="reload">
          {{ t('common.actions.retry') }}
        </button>
      </StateBlock>
      <StateBlock
        v-else-if="!faqs.length"
        icon="fa-solid fa-comments"
        :title="t('content.faq.emptyTitle')"
        :text="t('content.faq.emptyText')"
      />

      <Transition v-else name="rise" mode="out-in">
        <div :key="topic" class="faqp__groups">
          <section
            v-for="g in groups"
            :key="g.key"
            class="faqp__group"
            :aria-labelledby="`topic-${g.key}`"
          >
            <h2 :id="`topic-${g.key}`" class="faqp__h2">{{ g.title }}</h2>
            <FaqAccordion :faqs="g.items" />
          </section>
        </div>
      </Transition>

      <div v-reveal class="faqp__ask">
        <i class="fa-solid fa-headset" aria-hidden="true"></i>
        <div>
          <h2 class="faqp__ask-title">{{ t('content.faq.askTitle') }}</h2>
          <p>{{ t('content.faq.askText') }}</p>
        </div>
        <a
          :href="biz.waLink(t('content.faq.askWa'))"
          target="_blank"
          rel="noopener"
          class="btn btn--whatsapp"
          @click="biz.onWhatsapp('faq')"
        >
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          {{ t('common.actions.whatsapp') }}
        </a>
      </div>
    </div>

    <CtaBand source="faq" />
  </div>
</template>

<style scoped lang="scss">
.faqp {
  &__inner {
    @include container(880px);
    padding-top: $space-lg;
  }

  &__filters {
    position: sticky;
    top: var(--header-h);
    z-index: 5;
    padding: 0.6rem 0;
    margin-bottom: 1rem;
    background: rgba($paper, 0.92);
    backdrop-filter: blur(10px);
  }

  &__group {
    padding-top: 1.5rem;
    scroll-margin-top: calc(var(--header-h) + 5rem);
  }

  &__h2 {
    @include display($text-xl);
    color: $ink;
    margin-bottom: 1rem;
  }

  &__ask {
    margin-top: $space-lg;
    @include flex(column, flex-start, flex-start, 0.9rem);
    padding: 1.5rem;
    border-radius: $radius-lg;
    background: $surface;
    border: 1px solid $line;

    @include from('md') {
      flex-direction: row;
      align-items: center;
    }

    > i {
      font-size: 1.6rem;
      color: $blue;
    }

    > div {
      flex: 1;
    }

    p {
      color: $ink-soft;
    }
  }

  &__ask-title {
    font-size: $text-lg;
    color: $ink;
  }
}
</style>
