<script setup lang="ts">
defineProps<{ title?: string; icon?: string; flush?: boolean }>()
</script>

<template>
  <section class="acard" :class="{ 'acard--flush': flush }">
    <header v-if="title || $slots.actions" class="acard__head">
      <h2 v-if="title" class="acard__title">
        <i v-if="icon" :class="icon"></i>
        {{ title }}
      </h2>
      <div v-if="$slots.actions" class="acard__actions"><slot name="actions" /></div>
    </header>
    <div class="acard__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.acard {
  @include card;
  box-shadow: $shadow-sm;
  min-width: 0;
  overflow: hidden;

  &__head {
    @include flex(row, center, space-between, 0.75rem);
    flex-wrap: wrap;
    padding: 1rem 1.15rem 0;
  }

  &__title {
    @include flex(row, center, flex-start, 0.55rem);
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    color: $ink;

    i {
      color: $blue;
      font-size: 0.9rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.4rem);
  }

  &__body {
    padding: 1rem 1.15rem 1.15rem;
  }

  &--flush &__body {
    padding: 0.6rem 0 0;
  }
}
</style>
