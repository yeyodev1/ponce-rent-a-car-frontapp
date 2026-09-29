<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Imagen con respaldo: si no hay URL o la carga falla se pinta un degradado
 * de marca con un icono, nunca un hueco roto. El ratio reserva el espacio
 * antes de cargar para que la página no salte (CLS).
 */
const props = withDefaults(
  defineProps<{
    src?: string
    alt: string
    ratio?: string
    icon?: string
    eager?: boolean
    width?: number
    height?: number
    sizes?: string
  }>(),
  {
    src: '',
    ratio: '16 / 10',
    icon: 'fa-solid fa-car-side',
    eager: false,
    width: 1200,
    height: 750,
    sizes: '',
  },
)

const failed = ref(false)
const loaded = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
    loaded.value = false
  },
)
</script>

<template>
  <div class="smart-img" :class="{ 'smart-img--loaded': loaded }" :style="{ aspectRatio: ratio }">
    <img
      v-if="src && !failed"
      class="smart-img__img"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes || undefined"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      @load="loaded = true"
      @error="failed = true"
    />
    <div v-else class="smart-img__fallback" role="img" :aria-label="alt">
      <i :class="icon" aria-hidden="true"></i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.smart-img {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, $navy-2, $navy);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.03);
    transition:
      opacity 0.6s $ease,
      transform 0.9s $ease;
  }

  &--loaded &__img {
    opacity: 1;
    transform: none;
  }

  &__fallback {
    position: absolute;
    inset: 0;
    @include flex(row, center, center);
    background:
      radial-gradient(circle at 70% 20%, rgba($blue, 0.35), transparent 55%),
      linear-gradient(135deg, $navy-2 0%, $navy 70%);
    color: rgba($on-dark, 0.35);
    font-size: clamp(2rem, 8vw, 3.2rem);
  }
}
</style>
