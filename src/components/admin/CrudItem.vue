<script setup lang="ts">
// Contenido estándar de una fila de CrudPanel: miniatura o icono, título, subtítulo y extras.
defineProps<{ title: string; sub?: string; image?: string; icon?: string; aside?: string }>()
</script>

<template>
  <span class="item">
    <span v-if="image || icon" class="item__media">
      <img v-if="image" :src="image" alt="" loading="lazy" />
      <i v-else :class="icon"></i>
    </span>
    <span class="item__text">
      <strong class="item__title">{{ title || 'Sin título' }}</strong>
      <small v-if="sub" class="item__sub">{{ sub }}</small>
      <span v-if="$slots.default" class="item__extra"><slot /></span>
    </span>
    <strong v-if="aside" class="item__aside">{{ aside }}</strong>
  </span>
</template>

<style scoped lang="scss">
.item {
  flex: 1;
  min-width: 0;
  @include flex(row, center, flex-start, 0.8rem);

  &__media {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    background: $blue-soft;
    color: $blue-deep;
    @include flex(row, center, center);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__text {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center, 0.1rem);
    line-height: 1.3;
  }

  &__title {
    font-size: 0.92rem;
    color: $ink;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sub {
    font-size: 0.78rem;
    color: $ink-muted;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__extra {
    @include flex(row, center, flex-start, 0.3rem);
    flex-wrap: wrap;
    margin-top: 0.2rem;
  }

  &__aside {
    font-size: 0.95rem;
    color: $navy;
    white-space: nowrap;
  }
}
</style>
