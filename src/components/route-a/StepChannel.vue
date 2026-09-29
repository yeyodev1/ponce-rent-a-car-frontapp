<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useRouteA } from '@/composables/useRouteA'
import AnswersSummary from './AnswersSummary.vue'
import ChannelOption from './ChannelOption.vue'
import CallbackForm from './CallbackForm.vue'

/**
 * Paso 4: cómo seguir. Un solo embudo para todos los idiomas; solo cambia el
 * orden: en español WhatsApp va primero, en inglés la llamada directa.
 */
const emit = defineEmits<{ edit: [] }>()
const { t, isEnglish } = useI18n()
const router = useRouter()
const { lead, openWhatsapp, callNow, reset } = useRouteA()
const showCallback = ref(false)

type Key = 'whatsapp' | 'call' | 'callback'
const meta: Record<Key, { icon: string; title: string; hint: string }> = {
  whatsapp: { icon: 'fa-brands fa-whatsapp', title: 'common.channel.whatsapp', hint: 'common.channel.whatsappHint' },
  call: { icon: 'fa-solid fa-phone', title: 'common.channel.call', hint: 'common.channel.callHint' },
  callback: { icon: 'fa-solid fa-phone-volume', title: 'common.channel.callback', hint: 'common.channel.callbackHint' },
}

const order = computed<Key[]>(() => (isEnglish.value ? ['call', 'callback', 'whatsapp'] : ['whatsapp', 'call', 'callback']))

function choose(key: Key) {
  if (key === 'whatsapp') openWhatsapp()
  else if (key === 'call') callNow()
  else showCallback.value = !showCallback.value
}

function goHome() {
  reset()
  router.push('/')
}
</script>

<template>
  <div class="channel">
    <AnswersSummary @edit="emit('edit')" />

    <Transition name="rise" mode="out-in">
      <div v-if="lead.callbackDone" key="done" class="channel__done" role="status">
        <span class="channel__check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
        <h2 class="channel__done-title">{{ t('routeA.channel.doneTitle') }}</h2>
        <p class="channel__done-text">{{ t('common.channel.callbackDone') }}</p>
        <button type="button" class="btn btn--ghost btn--block" @click="openWhatsapp">
          <i class="fa-brands fa-whatsapp"></i>{{ t('routeA.channel.whatsappAgain') }}
        </button>
        <button type="button" class="btn btn--dark btn--block" @click="goHome">
          {{ t('routeA.channel.doneBack') }}
        </button>
      </div>

      <div v-else key="options" class="channel__options">
        <template v-for="(key, i) in order" :key="key">
          <ChannelOption
            class="channel__opt"
            :style="{ '--i': i }"
            :tone="key"
            :icon="meta[key].icon"
            :title="t(meta[key].title)"
            :hint="t(meta[key].hint)"
            :primary="i === 0"
            :expanded="key === 'callback' ? showCallback : null"
            @choose="choose(key)"
          />
          <Transition name="rise">
            <CallbackForm v-if="key === 'callback' && showCallback" @cancel="showCallback = false" />
          </Transition>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.channel {
  @include flex(column, stretch, flex-start, 1.5rem);

  &__options {
    @include flex(column, stretch, flex-start, 0.7rem);
  }

  &__opt {
    animation: channel-in 0.5s $ease backwards;
    animation-delay: calc(150ms + var(--i) * 70ms);
  }

  &__done {
    @include flex(column, center, flex-start, 0.75rem);
    text-align: center;
    padding: 1.75rem 1.25rem 1.25rem;
    border-radius: $radius-lg;
    background: $surface;
    border: 1px solid $line;
    box-shadow: $shadow-md;
  }

  &__check {
    @include flex(row, center, center);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: $success;
    color: $surface;
    font-size: 1.6rem;
    box-shadow: 0 0 0 10px $success-bg;
    animation: channel-pop 0.6s $ease-spring backwards 0.15s;
  }

  &__done-title {
    margin-top: 0.5rem;
    font-size: $text-xl;
    color: $ink;
  }

  &__done-text {
    color: $ink-soft;
    margin-bottom: 0.5rem;
  }
}

@keyframes channel-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@keyframes channel-pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}
</style>
