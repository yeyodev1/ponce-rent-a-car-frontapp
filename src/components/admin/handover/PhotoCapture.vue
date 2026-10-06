<script setup lang="ts">
import { ref } from 'vue'
import { handoverCopy as t, photoLabels } from '@/config/admin/ops'
import type { InspectionPhoto } from '@/types/ops'

/** Fotos del acta: cámara trasera del celular o galería, varias a la vez, con etiqueta. */
const props = defineProps<{ photos: InspectionPhoto[]; uploading: number }>()
const emit = defineEmits<{ add: [files: File[]]; open: [index: number] }>()

const camera = ref<HTMLInputElement | null>(null)
const gallery = ref<HTMLInputElement | null>(null)

function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) emit('add', Array.from(input.files))
  input.value = ''
}

function remove(i: number) {
  props.photos.splice(i, 1)
}
</script>

<template>
  <div class="pcap">
    <div class="pcap__actions">
      <button type="button" class="btn btn--dark pcap__btn" @click="camera?.click()">
        <i class="fa-solid fa-camera"></i> {{ t.takePhoto }}
      </button>
      <button type="button" class="btn btn--ghost pcap__btn" @click="gallery?.click()">
        <i class="fa-regular fa-images"></i> {{ t.pickPhotos }}
      </button>
      <input
        ref="camera"
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        class="visually-hidden"
        @change="onFiles"
      />
      <input
        ref="gallery"
        type="file"
        accept="image/*"
        multiple
        class="visually-hidden"
        @change="onFiles"
      />
    </div>

    <p v-if="uploading" class="pcap__busy">
      <i class="fa-solid fa-spinner fa-spin"></i> {{ t.uploading }} ({{ uploading }})
    </p>
    <p v-else-if="!photos.length" class="pcap__hint">{{ t.noPhotos }}</p>

    <ul v-if="photos.length" class="pcap__list">
      <li v-for="(p, i) in photos" :key="p.url" class="pcap__item">
        <button
          type="button"
          class="pcap__thumb"
          :aria-label="p.label || 'Ver foto'"
          @click="emit('open', i)"
        >
          <img :src="p.url" :alt="p.label" loading="lazy" />
        </button>
        <select v-model="p.label" class="pcap__label" :aria-label="t.photoLabel">
          <option value="">Sin etiqueta</option>
          <option v-for="l in photoLabels" :key="l" :value="l">{{ l }}</option>
          <option v-if="p.label && !photoLabels.includes(p.label)" :value="p.label">
            {{ p.label }}
          </option>
        </select>
        <button type="button" class="pcap__remove" :aria-label="t.removePhoto" @click="remove(i)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.pcap {
  @include flex(column, stretch, flex-start, 0.8rem);

  &__actions {
    @include flex(row, stretch, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__btn {
    flex: 1 1 140px;
    min-height: $tap-lg;
  }

  &__busy,
  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
  }

  &__busy {
    color: $blue;
    font-weight: 700;
  }

  &__list {
    list-style: none;
    @include flex-cards(130px, 0.6rem);
  }

  &__item {
    position: relative;
    @include flex(column, stretch, flex-start, 0.3rem);
    max-width: 50%;

    @include from('sm') {
      max-width: 33%;
    }
  }

  &__thumb {
    aspect-ratio: 4 / 3;
    border-radius: 10px;
    overflow: hidden;
    background: $sand;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__label {
    min-height: 38px;
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  &__remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba($navy, 0.75);
    color: $surface;
  }
}
</style>
