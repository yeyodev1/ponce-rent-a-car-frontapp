<script setup lang="ts">
import ImageUpload from './ImageUpload.vue'

const props = defineProps<{ modelValue: string[] | undefined; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const list = () => props.modelValue || []

function add(url: string) {
  if (url) emit('update:modelValue', [...list(), url])
}

function remove(i: number) {
  emit('update:modelValue', list().filter((_, idx) => idx !== i))
}
</script>

<template>
  <div class="gallery">
    <span class="gallery__label">{{ label }} ({{ list().length }})</span>
    <ul v-if="list().length" class="gallery__grid">
      <li v-for="(url, i) in list()" :key="url + i" class="gallery__item">
        <img :src="url" alt="" />
        <button type="button" class="gallery__del" aria-label="Quitar imagen" @click="remove(i)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </li>
    </ul>
    <!-- El uploader siempre queda vacío: cada imagen subida se agrega a la lista. -->
    <ImageUpload model-value="" compact @update:model-value="add" />
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

  &__grid {
    list-style: none;
    @include flex(row, flex-start, flex-start, 0.5rem);
    flex-wrap: wrap;
  }

  &__item {
    position: relative;
    width: 92px;
    height: 70px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid $line;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__del {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba($navy, 0.75);
    color: $surface;
    font-size: 0.7rem;
  }
}
</style>
