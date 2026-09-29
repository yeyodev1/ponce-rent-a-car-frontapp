<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from '@/i18n'
import { useRouteA } from '@/composables/useRouteA'
import OptionCard from '@/components/ui/OptionCard.vue'
import type { LocationCode } from '@/types'

/** Pregunta 2: dónde recibir el auto. Sin dirección exacta: eso lo afina el asesor. */
const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
const { answers } = useRouteA()

const options: { code: LocationCode; icon: string }[] = [
  { code: 'airport', icon: 'fa-solid fa-plane-arrival' },
  { code: 'office', icon: 'fa-solid fa-location-dot' },
  { code: 'hotel', icon: 'fa-solid fa-hotel' },
  { code: 'other', icon: 'fa-solid fa-map-pin' },
]

let timer = 0
function choose(code: LocationCode) {
  answers.location = code
  // 250 ms para que se vea la selección antes de avanzar
  window.clearTimeout(timer)
  timer = window.setTimeout(() => emit('done'), 250)
}
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <div class="where" role="radiogroup" :aria-label="t('routeA.where.title')">
    <OptionCard
      v-for="(opt, i) in options"
      :key="opt.code"
      class="where__opt"
      :style="{ '--i': i }"
      :selected="answers.location === opt.code"
      :icon="opt.icon"
      :title="t(`common.locations.${opt.code}`)"
      :subtitle="t(`routeA.where.${opt.code}`)"
      @select="choose(opt.code)"
    />
  </div>
</template>

<style scoped lang="scss">
.where {
  @include flex(column, stretch, flex-start, 0.7rem);

  &__opt {
    animation: where-in 0.5s $ease backwards;
    animation-delay: calc(120ms + var(--i) * 60ms);
  }
}

@keyframes where-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}
</style>
