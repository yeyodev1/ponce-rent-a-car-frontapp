<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { Category } from '@/types'

/** Pasajeros, maletas, transmisión y A/C: lo que decide una categoría de un vistazo. */
const props = withDefaults(defineProps<{ category: Category; large?: boolean }>(), { large: false })
const { t } = useI18n()

const specs = computed(() => {
  const c = props.category
  const list = [
    { icon: 'fa-solid fa-user-group', label: t('content.specs.passengers', { n: c.passengers }) },
    { icon: 'fa-solid fa-suitcase-rolling', label: t('content.specs.luggage', { n: c.luggage }) },
    {
      icon: 'fa-solid fa-gears',
      label: c.transmission === 'manual' ? t('content.specs.manual') : t('content.specs.automatic'),
    },
  ]
  if (c.airConditioning) list.push({ icon: 'fa-solid fa-snowflake', label: t('content.specs.ac') })
  return list
})
</script>

<template>
  <ul class="specs" :class="{ 'specs--large': large }">
    <li v-for="s in specs" :key="s.icon" class="specs__item">
      <i :class="s.icon" aria-hidden="true"></i>
      <span>{{ s.label }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.specs {
  list-style: none;
  @include flex(row, center, flex-start, 0.4rem 0.9rem);
  flex-wrap: wrap;
  font-size: $text-sm;
  color: $ink-soft;

  &__item {
    @include flex(row, center, flex-start, 0.4rem);

    i {
      color: $blue;
      width: 1.1em;
      text-align: center;
    }
  }

  &--large {
    gap: 0.6rem;
  }

  &--large &__item {
    flex: 1 1 140px;
    padding: 0.85rem 1rem;
    border-radius: $radius-sm;
    background: $surface;
    border: 1px solid $line;
    font-weight: 600;
    color: $ink;
  }
}
</style>
