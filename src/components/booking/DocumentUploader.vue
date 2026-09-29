<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '@/i18n'
import { booking } from '@/composables/booking/useBookingState'
import { docs, uploadDoc, type DocKind } from '@/composables/booking/useDocumentUpload'
import AnimatedCheck from './AnimatedCheck.vue'

/** Un documento: tomar foto con la cámara trasera o elegir un archivo. */
const props = defineProps<{ kind: DocKind; title: string; icon: string }>()
const { t } = useI18n()

const camera = ref<HTMLInputElement | null>(null)
const picker = ref<HTMLInputElement | null>(null)
const slot = computed(() => docs[props.kind])
// Recargar la página pierde la miniatura, no el hecho de que ya se subió.
const done = computed(() => slot.value.phase === 'done' || (slot.value.phase === 'idle' && booking.documents[props.kind]))
const busy = computed(() => slot.value.phase === 'compressing' || slot.value.phase === 'uploading')

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) uploadDoc(props.kind, file)
}
</script>

<template>
  <div class="doc" :class="{ 'doc--done': done, 'doc--busy': busy, 'doc--err': slot.phase === 'error' }">
    <div class="doc__head">
      <span class="doc__thumb">
        <img v-if="slot.preview" :src="slot.preview" :alt="title" />
        <i v-else-if="slot.isPdf" class="fa-solid fa-file-pdf"></i>
        <i v-else :class="icon"></i>
        <span v-if="busy" class="doc__spinner" aria-hidden="true"></span>
      </span>
      <div class="doc__text">
        <h3 class="doc__title">{{ title }}</h3>
        <p v-if="busy" class="doc__status">
          {{ slot.phase === 'compressing' ? t('booking.documents.compressing') : t('booking.documents.uploading') }}
        </p>
        <p v-else-if="done" class="doc__status doc__status--ok">{{ t('booking.documents.done') }}</p>
        <p v-else-if="slot.phase === 'error'" class="doc__status doc__status--err" role="alert">{{ slot.error }}</p>
        <p v-else class="doc__status">{{ t('booking.documents.hint') }}</p>
      </div>
      <AnimatedCheck v-if="done" :size="34" />
    </div>

    <div v-if="busy" class="doc__progress" aria-hidden="true"><span></span></div>

    <div v-if="!busy" class="doc__actions">
      <template v-if="slot.phase === 'error' && slot.file">
        <button type="button" class="btn btn--dark btn--block" @click="uploadDoc(kind)">
          <i class="fa-solid fa-rotate-right"></i>{{ t('booking.documents.retry') }}
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn doc__btn" :class="done ? 'btn--ghost' : 'btn--blue'" @click="camera?.click()">
          <i class="fa-solid fa-camera"></i>{{ done ? t('booking.documents.replace') : t('booking.documents.take') }}
        </button>
        <button type="button" class="btn btn--ghost doc__btn" @click="picker?.click()">
          <i class="fa-solid fa-arrow-up-from-bracket"></i>{{ t('booking.documents.upload') }}
        </button>
      </template>
    </div>

    <input ref="camera" class="visually-hidden" type="file" accept="image/*" capture="environment" tabindex="-1" @change="onFile" />
    <input ref="picker" class="visually-hidden" type="file" accept="image/*,application/pdf" tabindex="-1" @change="onFile" />
  </div>
</template>

<style scoped lang="scss">
.doc {
  @include flex(column, stretch, flex-start, 1rem);
  padding: 1.1rem;
  background: $surface;
  border: 1.5px solid $line;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &--done {
    border-color: rgba($success, 0.45);
  }

  &--err {
    border-color: rgba($danger, 0.45);
  }

  &__head {
    @include flex(row, center, flex-start, 0.9rem);
  }

  &__thumb {
    position: relative;
    flex: 0 0 auto;
    width: 64px;
    height: 64px;
    border-radius: $radius-sm;
    background: $blue-soft;
    color: $blue;
    font-size: 1.5rem;
    overflow: hidden;
    @include flex(row, center, center);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: doc-in 0.4s $ease both;
    }
  }

  &__spinner {
    position: absolute;
    inset: 0;
    background: rgba($navy, 0.35);

    &::after {
      content: '';
      position: absolute;
      inset: 18px;
      border-radius: 50%;
      border: 3px solid rgba(#fff, 0.35);
      border-top-color: #fff;
      animation: doc-spin 0.8s linear infinite;
    }
  }

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: $text-base;
    font-stretch: 105%;
  }

  &__status {
    font-size: $text-xs;
    color: $ink-muted;
    margin-top: 0.2rem;

    &--ok {
      color: $success;
      font-weight: 700;
    }

    &--err {
      color: $danger;
      font-weight: 600;
    }
  }

  &__progress {
    height: 4px;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;

    span {
      display: block;
      width: 40%;
      height: 100%;
      border-radius: inherit;
      background: $blue;
      animation: doc-bar 1.1s $ease-in-out infinite;
    }
  }

  &__actions {
    @include flex(row, stretch, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__btn {
    flex: 1 1 140px;
  }
}

@keyframes doc-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes doc-bar {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

@keyframes doc-in {
  from {
    opacity: 0;
    transform: scale(1.15);
  }
}
</style>
