<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { money } from '@/utils/format'
import { useBusiness } from '@/composables/content/useBusiness'

/** Requisitos para retirar el vehículo; la garantía sale de la configuración del panel. */
const { t } = useI18n()
const biz = useBusiness()

const items = computed(() => [
  {
    icon: 'fa-solid fa-id-card',
    title: t('content.requirements.license'),
    text: t('content.requirements.licenseText'),
  },
  {
    icon: 'fa-solid fa-passport',
    title: t('content.requirements.id'),
    text: t('content.requirements.idText'),
  },
  {
    icon: 'fa-solid fa-credit-card',
    title: t('content.requirements.card'),
    text: biz.guaranteeAmount.value
      ? t('content.requirements.cardAmount', { amount: money(biz.guaranteeAmount.value) })
      : t('content.requirements.cardText'),
  },
])
</script>

<template>
  <ul class="reqs">
    <li v-for="(r, i) in items" :key="r.icon" v-reveal="i * 70" class="reqs__item">
      <span class="reqs__icon" aria-hidden="true"><i :class="r.icon"></i></span>
      <div>
        <h3 class="reqs__title">{{ r.title }}</h3>
        <p class="reqs__text">{{ r.text }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.reqs {
  list-style: none;
  @include flex-cards(240px, 0.75rem);

  &__item {
    @include card;
    @include flex(row, flex-start, flex-start, 0.9rem);
    padding: 1.1rem;
  }

  &__icon {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    @include flex(row, center, center);
    background: $accent-soft;
    color: darken($accent-deep, 12%);
    font-size: 1.1rem;
  }

  &__title {
    font-family: $font-principal;
    font-size: $text-base;
    font-weight: 800;
    color: $ink;
  }

  &__text {
    margin-top: 0.2rem;
    font-size: $text-sm;
    color: $ink-soft;
  }
}
</style>
