<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useI18n } from '@/i18n'
import { useRouteA } from '@/composables/useRouteA'
import OptionCard from '@/components/ui/OptionCard.vue'
import type { PassengersBucket } from '@/types'

/**
 * Pregunta 3: cuántas personas. Al elegir se guarda el lead; solo con el lead
 * guardado se pasa a elegir canal. Si la red falla: reintento y, como último
 * recurso, WhatsApp con el mensaje armado en el navegador.
 */
const emit = defineEmits<{ done: [] }>()
const { t } = useI18n()
const { answers, saving, saveError, complete, fallbackWhatsapp } = useRouteA()

const options: { code: PassengersBucket; icon: string; hint: string }[] = [
  { code: '1-2', icon: 'fa-solid fa-user', hint: 'hint12' },
  { code: '3-5', icon: 'fa-solid fa-user-group', hint: 'hint35' },
  { code: '6+', icon: 'fa-solid fa-people-group', hint: 'hint6' },
]

let timer = 0
async function save() {
  if (await complete()) emit('done')
}

function choose(code: PassengersBucket) {
  if (saving.value) return
  answers.passengers = code
  window.clearTimeout(timer)
  timer = window.setTimeout(save, 250)
}
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <div class="who" :aria-busy="saving">
    <div class="who__options" role="radiogroup" :aria-label="t('routeA.who.title')">
      <OptionCard
        v-for="(opt, i) in options"
        :key="opt.code"
        class="who__opt"
        :style="{ '--i': i }"
        :selected="answers.passengers === opt.code"
        :disabled="saving"
        :icon="opt.icon"
        :title="`${t(`common.passengers.${opt.code}`)} ${t('common.units.people')}`"
        :subtitle="t(`routeA.who.${opt.hint}`)"
        @select="choose(opt.code)"
      />
    </div>

    <Transition name="rise" mode="out-in">
      <p v-if="saving" key="saving" class="who__status" role="status">
        <span class="who__spinner" aria-hidden="true"></span>{{ t('routeA.who.saving') }}
      </p>
      <div v-else-if="saveError" key="error" class="who__error" role="alert">
        <p><i class="fa-solid fa-triangle-exclamation"></i>{{ t('routeA.who.error') }}</p>
        <button type="button" class="btn btn--dark btn--block" @click="save">
          <i class="fa-solid fa-rotate-right"></i>{{ t('common.actions.retry') }}
        </button>
        <button type="button" class="btn btn--ghost btn--block" @click="fallbackWhatsapp">
          <i class="fa-brands fa-whatsapp"></i>{{ t('routeA.who.fallback') }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.who {
  @include flex(column, stretch, flex-start, 1.25rem);

  &__options {
    @include flex(column, stretch, flex-start, 0.7rem);
  }

  &__opt {
    animation: who-in 0.5s $ease backwards;
    animation-delay: calc(120ms + var(--i) * 60ms);
  }

  &__status {
    @include flex(row, center, center, 0.7rem);
    min-height: $tap;
    font-weight: 700;
    color: $ink-soft;
  }

  &__spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2.5px solid $line;
    border-top-color: $blue;
    animation: who-spin 0.8s linear infinite;
  }

  &__error {
    @include flex(column, stretch, flex-start, 0.6rem);
    padding: 1rem;
    border-radius: $radius-md;
    background: $danger-bg;

    p {
      @include flex(row, flex-start, flex-start, 0.55rem);
      font-weight: 600;
      font-size: $text-sm;
      color: darken($danger, 8%);
    }

    i {
      margin-top: 0.2rem;
    }
  }
}

@keyframes who-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@keyframes who-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
