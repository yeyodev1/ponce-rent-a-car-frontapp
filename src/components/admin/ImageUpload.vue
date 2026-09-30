<script setup lang="ts">
import { ref } from 'vue'
import { uploadPublicImage } from '@/composables/admin/useImageUpload'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'

const props = defineProps<{ modelValue: string; label?: string; compact?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const toast = useToastStore()
const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragging = ref(false)
// Sin Cloudinary el API guarda la imagen él mismo; pegar una URL queda como atajo manual.
const pasteMode = ref(false)
const pasted = ref('')

async function upload(file?: File | null) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('El archivo debe ser una imagen')
    return
  }
  uploading.value = true
  try {
    emit('update:modelValue', await uploadPublicImage(file))
  } catch (e) {
    const err = e as ApiError
    if (err.status === 503 || err.status === 404) {
      pasteMode.value = true
      toast.info('La subida de imágenes no está disponible. Pega la URL de la imagen.')
    } else toast.error(err.message)
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  upload(e.dataTransfer?.files?.[0])
}

function applyUrl() {
  const url = pasted.value.trim()
  if (!/^https?:\/\//.test(url)) {
    toast.error('La URL debe empezar con http:// o https://')
    return
  }
  emit('update:modelValue', url)
  pasted.value = ''
  pasteMode.value = false
}
</script>

<template>
  <div class="upload" :class="{ 'upload--compact': compact }">
    <span v-if="label" class="upload__label">{{ label }}</span>
    <div
      class="upload__zone"
      :class="{ 'upload__zone--drag': dragging, 'upload__zone--filled': props.modelValue }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="props.modelValue" :src="props.modelValue" alt="" class="upload__img" />
      <div v-else class="upload__placeholder">
        <i class="fa-regular fa-image"></i>
        <span>Arrastra una imagen o elige un archivo</span>
      </div>
      <div v-if="uploading" class="upload__loading"><i class="fa-solid fa-spinner fa-spin"></i> Subiendo…</div>
    </div>
    <div class="upload__actions">
      <button class="btn btn--ghost btn--sm" type="button" :disabled="uploading" @click="input?.click()">
        <i class="fa-solid fa-arrow-up-from-bracket"></i> {{ props.modelValue ? 'Cambiar' : 'Subir' }}
      </button>
      <button class="upload__link" type="button" @click="pasteMode = !pasteMode">
        <i class="fa-solid fa-link"></i> Pegar URL
      </button>
      <button v-if="props.modelValue" class="upload__link upload__link--danger" type="button" @click="emit('update:modelValue', '')">
        Quitar
      </button>
    </div>
    <Transition name="rise">
      <div v-if="pasteMode" class="upload__paste">
        <input v-model="pasted" type="url" placeholder="https://…" @keydown.enter.prevent="applyUrl" />
        <button class="btn btn--dark btn--sm" type="button" @click="applyUrl">Usar</button>
      </div>
    </Transition>
    <input ref="input" type="file" accept="image/*" hidden @change="upload(($event.target as HTMLInputElement).files?.[0])" />
  </div>
</template>

<style scoped lang="scss">
.upload {
  @include flex(column, stretch, flex-start, 0.5rem);

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
  }

  &__zone {
    position: relative;
    height: 170px;
    border-radius: 14px;
    border: 1.5px dashed $line-strong;
    background: $surface;
    overflow: hidden;
    @include flex(row, center, center);
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &--drag {
      border-color: $blue;
      background: $blue-soft;
    }

    &--filled {
      border-style: solid;
      border-color: $line;
    }
  }

  &--compact &__zone {
    height: 110px;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__placeholder {
    @include flex(column, center, center, 0.4rem);
    color: $ink-muted;
    font-size: 0.8rem;
    text-align: center;
    padding: 1rem;

    i {
      font-size: 1.6rem;
    }
  }

  &__loading {
    position: absolute;
    inset: 0;
    background: rgba($surface, 0.85);
    @include flex(row, center, center, 0.5rem);
    font-weight: 700;
    font-size: 0.85rem;
  }

  &__actions {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__link {
    font-size: 0.8rem;
    font-weight: 700;
    color: $blue;
    @include flex(row, center, flex-start, 0.35rem);

    &--danger {
      color: $danger;
    }
  }

  &__paste {
    @include flex(row, center, flex-start, 0.5rem);

    input {
      min-height: 40px;
      padding-block: 0.5rem;
    }
  }
}
</style>
