<script setup lang="ts">
import { onMounted, onUnmounted, toRef } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'

const props = defineProps<{
  open: boolean
  title: string
  subtitle?: string
  wide?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

useBodyScroll(toRef(props, 'open'))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer" @click.self="emit('close')">
        <aside class="drawer__panel" :class="{ 'drawer__panel--wide': wide }" role="dialog" aria-modal="true" :aria-label="title">
          <span class="drawer__grip" aria-hidden="true"></span>
          <header class="drawer__head">
            <div class="drawer__titles">
              <h2 class="drawer__title">{{ title }}</h2>
              <p v-if="subtitle" class="drawer__subtitle">{{ subtitle }}</p>
            </div>
            <button class="drawer__close" type="button" aria-label="Cerrar" @click="emit('close')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </header>
          <div class="drawer__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="drawer__foot">
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.drawer {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: $overlay;
  backdrop-filter: blur(2px);
  @include flex(column, stretch, flex-end);

  @include from('md') {
    flex-direction: row;
    justify-content: flex-end;
  }

  &__panel {
    background: $paper;
    width: 100%;
    max-height: 92dvh;
    border-radius: 22px 22px 0 0;
    @include flex(column, stretch, flex-start);
    box-shadow: $shadow-lg;
    position: relative;

    @include from('md') {
      width: min(560px, 100vw);
      max-height: none;
      height: 100%;
      border-radius: 0;
    }

    &--wide {
      @include from('md') {
        width: min(760px, 100vw);
      }
    }
  }

  &__grip {
    position: absolute;
    top: 8px;
    left: 50%;
    width: 42px;
    height: 4px;
    margin-left: -21px;
    border-radius: 4px;
    background: $line-strong;

    @include from('md') {
      display: none;
    }
  }

  &__head {
    @include flex(row, flex-start, space-between, 1rem);
    padding: 1.4rem 1.25rem 1rem;
    background: $surface;
    border-bottom: 1px solid $line;
    border-radius: 22px 22px 0 0;

    @include from('md') {
      border-radius: 0;
      padding: 1.4rem 1.6rem 1.1rem;
    }
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 800;
  }

  &__subtitle {
    font-size: $text-sm;
    color: $ink-muted;
    margin-top: 0.2rem;
  }

  &__close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
    color: $ink-soft;
    background: $sand;

    &:hover {
      background: $line;
      color: $ink;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1.25rem;
    @include flex(column, stretch, flex-start, 1.1rem);

    @include from('md') {
      padding: 1.5rem 1.6rem;
    }
  }

  &__foot {
    @include flex(row, center, flex-end, 0.6rem);
    flex-wrap: wrap;
    padding: 0.9rem 1.25rem calc(0.9rem + env(safe-area-inset-bottom));
    background: $surface;
    border-top: 1px solid $line;

    @include from('md') {
      padding-inline: 1.6rem;
    }
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;

  .drawer__panel {
    transition: transform 0.38s $ease;
  }
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;

  .drawer__panel {
    transform: translateY(100%);

    @include from('md') {
      transform: translateX(100%);
    }
  }
}
</style>
