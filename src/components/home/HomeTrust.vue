<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { useCatalogStore } from '@/stores/catalog'
import { money } from '@/utils/format'
import SectionHeading from './SectionHeading.vue'

/** Garantía y precio claros: lo que más frena a alguien antes de alquilar. */
const { t } = useI18n()
const catalog = useCatalogStore()

const guaranteeText = computed(() => {
  const amount = catalog.config?.booking.guaranteeAmount
  return amount ? t('home.trust.guarantee.amount', { amount: money(amount) }) : t('home.trust.guarantee.text')
})

const items = computed(() => [
  { icon: 'fa-solid fa-credit-card', title: t('home.trust.guarantee.title'), text: guaranteeText.value },
  { icon: 'fa-solid fa-receipt', title: t('home.trust.price.title'), text: t('home.trust.price.text') },
  { icon: 'fa-solid fa-lock', title: t('home.trust.secure.title'), text: t('home.trust.secure.text') },
  { icon: 'fa-solid fa-headset', title: t('home.trust.human.title'), text: t('home.trust.human.text') },
])
</script>

<template>
  <section class="trust">
    <div class="trust__inner">
      <SectionHeading :eyebrow="t('home.trust.eyebrow')" :title="t('home.trust.title')" tone="dark" />
      <ul class="trust__list">
        <li v-for="(item, i) in items" :key="i" v-reveal="i * 90" class="trust__item">
          <span class="trust__icon" aria-hidden="true"><i :class="item.icon"></i></span>
          <div>
            <h3 class="trust__title">{{ item.title }}</h3>
            <p class="trust__text">{{ item.text }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.trust {
  margin-top: $space-section;
  padding-block: $space-section;
  background:
    radial-gradient(70% 60% at 0% 0%, rgba($blue, 0.28), transparent 60%),
    radial-gradient(60% 50% at 100% 100%, rgba($accent, 0.1), transparent 60%),
    $navy;
  color: $on-dark;

  &__inner {
    @include container(1160px);
    @include flex(column, stretch, flex-start, 2.25rem);

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
      gap: 4rem;

      > :first-child {
        flex: 0 0 34%;
        position: sticky;
        top: calc(var(--header-h) + 2rem);
      }
    }
  }

  &__list {
    flex: 1;
    list-style: none;
    @include flex-cards(250px, 1rem);
  }

  &__item {
    @include flex(row, flex-start, flex-start, 1rem);
    padding: 1.35rem 1.25rem;
    border-radius: $radius-md;
    background: rgba($on-dark, 0.05);
    border: 1px solid rgba($on-dark, 0.1);
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: rgba($accent, 0.14);
    color: $accent;
    font-size: 1.1rem;
  }

  &__title {
    font-size: 1.12rem;
    color: $surface;
    margin-bottom: 0.3rem;
  }

  &__text {
    font-size: $text-sm;
    color: $on-dark-soft;
    line-height: 1.5;
  }
}
</style>
