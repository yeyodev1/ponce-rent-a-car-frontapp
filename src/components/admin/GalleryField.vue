<script setup lang="ts">
import { computed, ref } from 'vue'
import { galleryCopy as c } from '@/config/admin'
import { isUploadableImage, uploadPublicImage } from '@/composables/admin/useImageUpload'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'

/**
 * Editor de fotos: subir varias a la vez, reordenar con flechas y quitar.
 * La primera es la portada (la que usa la ficha pública de la categoría).
 */
const props = defineProps<{ modelValue: string[] | undefined; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const toast = useToastStore()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const progress = ref<{ n: number; total: number } | null>(null)

const list = computed(() => props.modelValue || [])

function move(i: number, delta: -1 | 1) {
  const next = [...list.value]
  const j = i + delta
  if (j < 0 || j >= next.length) return
  const [moved] = next.splice(i, 1)
  next.splice(j, 0, moved!)
  emit('update:modelValue', next)
}

function remove(i: number) {
  emit('update:modelValue', list.value.filter((_, idx) => idx !== i))
}

// Una por una: con datos móviles, varias subidas en paralelo se estorban y alguna vence.
async function addFiles(files: FileList | File[] | null | undefined) {
  const picked = Array.from(files || [])
  if (!picked.length || progress.value) return
  const images = picked.filter((f) => {
    if (isUploadableImage(f)) return true
    toast.error(c.notImage(f.name))
    return false
  })
  let current = [...list.value]
  let added = 0
  for (const [i, file] of images.entries()) {
    progress.value = { n: i + 1, total: images.length }
    try {
      current = [...current, await uploadPublicImage(file)]
      added++
      emit('update:modelValue', current)
    } catch (e) {
      toast.error(c.failed(file.name, (e as ApiError).message || 'no se pudo subir'))
    }
  }
  progress.value = null
  if (input.value) input.value.value = ''
  if (added) toast.success(c.done(added))
}

function onDrop(e: DragEvent) {
  dragging.value = false
  addFiles(e.dataTransfer?.files)
}
</script>

<template>
  <div class="gallery">
    <span class="gallery__label">{{ label }} ({{ list.length }})</span>

    <ol v-if="list.length" class="gallery__list">
      <li v-for="(url, i) in list" :key="url + i" class="gallery__item">
        <img :src="url" alt="" loading="lazy" />
        <span v-if="i === 0" class="gallery__cover">{{ c.cover }}</span>
        <div class="gallery__tools">
          <button type="button" :aria-label="c.left" :title="c.left" :disabled="i === 0" @click="move(i, -1)">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <button type="button" :aria-label="c.right" :title="c.right" :disabled="i === list.length - 1"
            @click="move(i, 1)">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button type="button" class="gallery__del" :aria-label="c.remove" :title="c.remove" @click="remove(i)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </li>
    </ol>

    <div class="gallery__drop" :class="{ 'gallery__drop--on': dragging }" @dragover.prevent="dragging = true"
      @dragleave="dragging = false" @drop.prevent="onDrop">
      <p v-if="progress" class="gallery__progress" role="status">
        <i class="fa-solid fa-spinner fa-spin"></i>{{ c.progress(progress.n, progress.total) }}
      </p>
      <template v-else>
        <i class="fa-regular fa-images gallery__icon" aria-hidden="true"></i>
        <span>{{ c.drop }}</span>
        <button type="button" class="btn btn--ghost btn--sm" @click="input?.click()">
          <i class="fa-solid fa-arrow-up-from-bracket"></i>{{ list.length ? c.addMore : c.add }}
        </button>
      </template>
    </div>
    <p class="gallery__hint">{{ c.hint }}</p>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/*" multiple hidden
      @change="addFiles(($event.target as HTMLInputElement).files)" />
  </div>
</template>

<style scoped lang="scss">
.gallery {
  @include flex(column, stretch, flex-start, 0.5rem);

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__list {
    list-style: none;
    @include flex(row, flex-start, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__item {
    position: relative;
    width: 132px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid $line;
    background: $surface;

    img {
      display: block;
      width: 100%;
      height: 92px;
      object-fit: cover;
    }
  }

  &__cover {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 0.15rem 0.5rem;
    border-radius: $radius-pill;
    background: $accent;
    color: $on-accent;
    font-size: 0.68rem;
    font-weight: 800;
  }

  &__tools {
    @include flex(row, center, space-between);
    padding: 0.2rem;

    button {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      color: $ink-soft;
      @include flex(row, center, center);

      &:hover:not(:disabled) {
        background: $sand;
      }

      &:disabled {
        opacity: 0.3;
      }
    }
  }

  &__del {
    color: $danger !important;
  }

  &__drop {
    min-height: 110px;
    padding: 1rem;
    border-radius: 14px;
    border: 1.5px dashed $line-strong;
    background: $surface;
    @include flex(column, center, center, 0.5rem);
    color: $ink-muted;
    font-size: 0.8rem;
    text-align: center;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &--on {
      border-color: $blue;
      background: $blue-soft;
    }
  }

  &__icon {
    font-size: 1.5rem;
  }

  &__progress {
    @include flex(row, center, center, 0.5rem);
    font-weight: 700;
    color: $ink;
  }

  &__hint {
    font-size: 0.75rem;
    color: $ink-muted;
  }
}
</style>
