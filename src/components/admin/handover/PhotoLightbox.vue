<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { handoverCopy as t } from '@/config/admin/ops'
import type { InspectionPhoto } from '@/types/ops'

/** Foto ampliada con anterior/siguiente. `index` null = cerrado. */
const props = defineProps<{ photos: InspectionPhoto[]; index: number | null }>()
const emit = defineEmits<{ 'update:index': [value: number | null] }>()

const open = computed(() => props.index !== null && Boolean(props.photos[props.index]))
const current = computed(() => (props.index !== null ? props.photos[props.index] : null))
useBodyScroll(open)

const go = (delta: number) => {
  if (props.index === null) return
  emit('update:index', (props.index + delta + props.photos.length) % props.photos.length)
}
const close = () => emit('update:index', null)

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open && current"
        class="lbox"
        role="dialog"
        aria-modal="true"
        :aria-label="current.label || t.gallery"
        @click.self="close"
      >
        <button type="button" class="lbox__close" :aria-label="t.close" @click="close">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <img :src="current.url" :alt="current.label" class="lbox__img" />
        <p class="lbox__caption">
          {{ current.label }}
          <span v-if="photos.length > 1">· {{ (index || 0) + 1 }}/{{ photos.length }}</span>
        </p>
        <template v-if="photos.length > 1">
          <button
            type="button"
            class="lbox__nav lbox__nav--prev"
            aria-label="Anterior"
            @click="go(-1)"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            class="lbox__nav lbox__nav--next"
            aria-label="Siguiente"
            @click="go(1)"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lbox {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(#030b1f, 0.92);
  @include flex(column, center, center, 0.8rem);
  padding: 3.5rem 0.75rem 1.5rem;

  &__img {
    max-width: 100%;
    max-height: calc(100dvh - 8rem);
    object-fit: contain;
    border-radius: 8px;
  }

  &__caption {
    color: $on-dark;
    font-size: 0.9rem;
    font-weight: 700;
  }

  &__close,
  &__nav {
    position: absolute;
    width: $tap;
    height: $tap;
    border-radius: 50%;
    background: rgba($surface, 0.14);
    color: $surface;
    font-size: 1.1rem;
  }

  &__close {
    top: 0.75rem;
    right: 0.75rem;
  }

  &__nav {
    top: 50%;
    margin-top: -24px;

    &--prev {
      left: 0.5rem;
    }

    &--next {
      right: 0.5rem;
    }
  }
}
</style>
