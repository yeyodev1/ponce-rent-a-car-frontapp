<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'

/** Selector de fotos con miniaturas; la compresión la hace el composable del formulario. */
defineProps<{ photos: string[]; max: number; processing: boolean; error: string }>()
const emit = defineEmits<{ add: [files: FileList | null]; remove: [index: number] }>()
const { t } = useI18n()
const input = ref<HTMLInputElement | null>(null)

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  emit('add', el.files)
  el.value = ''
}
</script>

<template>
  <div class="picker">
    <p class="picker__label" id="pp-label">
      {{ t('content.partner.photos') }} <span>{{ t('content.form.optional') }}</span>
    </p>
    <p class="picker__hint">{{ t('content.partner.photosHint', { n: max }) }}</p>
    <TransitionGroup name="stagger" tag="ul" class="picker__grid">
      <li
        v-for="(src, i) in photos"
        :key="`p${i}-${src.length}`"
        class="picker__thumb"
        :style="{ '--i': i }"
      >
        <img
          :src="src"
          :alt="t('content.partner.photoAlt', { n: i + 1 })"
          width="120"
          height="90"
        />
        <button
          type="button"
          class="picker__remove"
          :aria-label="t('content.partner.removePhoto', { n: i + 1 })"
          @click="emit('remove', i)"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </li>
      <li v-if="photos.length < max" key="add" class="picker__thumb picker__thumb--add">
        <button
          type="button"
          class="picker__add"
          :disabled="processing"
          aria-describedby="pp-label"
          @click="input?.click()"
        >
          <i
            :class="processing ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-camera'"
            aria-hidden="true"
          ></i>
          <span>{{
            processing ? t('content.partner.processing') : t('content.partner.addPhoto')
          }}</span>
        </button>
      </li>
    </TransitionGroup>
    <input
      ref="input"
      class="visually-hidden"
      type="file"
      accept="image/*"
      multiple
      tabindex="-1"
      aria-hidden="true"
      @change="onChange"
    />
    <p v-if="error" class="picker__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.picker {
  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;

    span {
      font-weight: 500;
      color: $ink-muted;
    }
  }

  &__hint {
    font-size: $text-xs;
    color: $ink-muted;
    margin-bottom: 0.6rem;
  }

  &__grid {
    list-style: none;
    @include flex(row, stretch, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__thumb {
    position: relative;
    width: calc(33.333% - 0.4rem);
    max-width: 120px;
    aspect-ratio: 4 / 3;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $sand;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__remove {
    position: absolute;
    top: 0;
    right: 0;
    width: $tap;
    height: $tap;
    @include flex(row, flex-start, flex-end);
    padding: 0.3rem;

    i {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      @include flex(row, center, center);
      background: rgba($navy, 0.8);
      color: $surface;
      font-size: 0.75rem;
    }
  }

  &__add {
    width: 100%;
    height: 100%;
    min-height: $tap;
    @include flex(column, center, center, 0.25rem);
    border: 1.5px dashed $line-strong;
    border-radius: $radius-sm;
    color: $blue;
    font-size: $text-xs;
    font-weight: 700;
    transition: background-color 0.25s ease;

    i {
      font-size: 1.1rem;
    }

    @media (hover: hover) {
      &:hover {
        background: $blue-soft;
      }
    }
  }

  &__error {
    margin-top: 0.5rem;
    font-size: $text-sm;
    font-weight: 600;
    color: $danger;
  }
}
</style>
