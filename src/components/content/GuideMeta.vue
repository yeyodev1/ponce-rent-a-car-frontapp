<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { Guide } from '@/types'

/** Distancia, tiempo de manejo y lectura: lo que decide si la escapada vale la pena. */
const props = withDefaults(defineProps<{ guide: Guide; light?: boolean }>(), { light: false })
const { t } = useI18n()

const items = computed(() => {
  const g = props.guide
  const list: { icon: string; label: string }[] = []
  if (g.distanceKm)
    list.push({ icon: 'fa-solid fa-route', label: t('content.guides.km', { n: g.distanceKm }) })
  if (g.driveTime) list.push({ icon: 'fa-solid fa-car', label: g.driveTime })
  if (g.readingMinutes)
    list.push({
      icon: 'fa-regular fa-clock',
      label: t('content.guides.read', { n: g.readingMinutes }),
    })
  return list
})
</script>

<template>
  <ul v-if="items.length" class="gmeta" :class="{ 'gmeta--light': light }">
    <li v-for="i in items" :key="i.icon">
      <i :class="i.icon" aria-hidden="true"></i> {{ i.label }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
.gmeta {
  list-style: none;
  @include flex(row, center, flex-start, 0.35rem 1rem);
  flex-wrap: wrap;
  font-size: $text-sm;
  font-weight: 600;
  color: $ink-soft;

  li {
    @include flex(row, center, flex-start, 0.4rem);
  }

  i {
    color: $blue;
  }

  &--light {
    color: rgba($on-dark, 0.9);

    i {
      color: $accent;
    }
  }
}
</style>
