<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useSeo } from '@/composables/useSeo'
import { track } from '@/composables/useAnalytics'
import { ROUTE_A_TOTAL, useRouteA } from '@/composables/useRouteA'
import StepShell from '@/components/ui/StepShell.vue'
import StepWhen from '@/components/route-a/StepWhen.vue'
import StepWhere from '@/components/route-a/StepWhere.vue'
import StepWho from '@/components/route-a/StepWho.vue'
import StepChannel from '@/components/route-a/StepChannel.vue'

/**
 * Ruta A: tres preguntas, una por pantalla, y la elección de canal.
 * El paso vive en ?paso=1..4 para que el botón atrás del teléfono funcione.
 */
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { whenDone, maxStep, setEntry } = useRouteA()

const step = computed(() => Math.min(ROUTE_A_TOTAL, Math.max(1, Number(route.query.paso) || 1)))
const direction = ref<'next' | 'prev'>('next')

watch(step, (now, before) => {
  direction.value = now >= before ? 'next' : 'prev'
  // El router no sube al cambiar solo la query: cada pregunta empieza arriba
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const stepQuery = (n: number) => ({ query: { ...route.query, paso: String(n) } })

// No se puede saltar a un paso sin haber respondido los anteriores.
watch(
  [step, maxStep],
  () => {
    if (step.value > maxStep.value) router.replace(stepQuery(maxStep.value))
  },
  { immediate: true },
)

function go(n: number) {
  router.push(stepQuery(n))
}

function back() {
  if (step.value === 1) return router.push('/')
  const target = router.resolve(stepQuery(step.value - 1)).fullPath
  // Si el paso anterior es la entrada previa del historial, se vuelve de verdad
  if (window.history.state?.back === target) router.back()
  else router.replace(stepQuery(step.value - 1))
}

const screens = computed(() => {
  const eyebrow = t('routeA.eyebrow')
  return [
    { title: t('routeA.when.title'), subtitle: t('routeA.when.subtitle'), eyebrow },
    { title: t('routeA.where.title'), subtitle: t('routeA.where.subtitle'), eyebrow },
    { title: t('routeA.who.title'), subtitle: t('routeA.who.subtitle'), eyebrow },
    { title: t('common.channel.title'), subtitle: t('common.channel.subtitle'), eyebrow: t('routeA.channel.eyebrow') },
  ][step.value - 1]!
})

onMounted(() => {
  const q = route.query
  // "30 " llega así cuando el + de ?duracion=30+ no se codificó en el enlace.
  const duration = String(q.duracion || '').replace(/ $/, '+')
  setEntry(String(q.categoria || ''), String(q.promo || ''), String(q.lugar || ''), duration)
  if (!q.paso) router.replace(stepQuery(1))
  track('route_a_start', { step: step.value })
})

useSeo(() => ({
  title: t('routeA.seo.title'),
  description: t('routeA.seo.description'),
  canonicalPath: '/ayudame-a-elegir',
}))
</script>

<template>
  <div class="route-a">
    <StepShell
      :step="step"
      :total="ROUTE_A_TOTAL"
      :step-key="step"
      :direction="direction"
      :title="screens.title"
      :subtitle="screens.subtitle"
      :eyebrow="screens.eyebrow"
      @back="back"
    >
      <StepWhen v-if="step === 1" />
      <StepWhere v-else-if="step === 2" @done="go(3)" />
      <StepWho v-else-if="step === 3" @done="go(4)" />
      <StepChannel v-else @edit="go(1)" />

      <template v-if="step === 1" #footer>
        <button type="button" class="btn btn--primary btn--lg btn--block" :disabled="!whenDone" @click="go(2)">
          {{ t('common.actions.continue') }} <i class="fa-solid fa-arrow-right"></i>
        </button>
      </template>
    </StepShell>
  </div>
</template>

<style scoped lang="scss">
.route-a {
  flex: 1;
  @include flex(column, stretch, flex-start);
  padding-bottom: 2rem;
  background:
    radial-gradient(90% 40% at 100% 0%, rgba($blue, 0.07), transparent 60%),
    $paper;
}
</style>
