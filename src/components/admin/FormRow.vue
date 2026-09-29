<script setup lang="ts">
withDefaults(defineProps<{ basis?: string }>(), { basis: '200px' })
</script>

<template>
  <!-- Fila de campos que se apilan en el celular y se reparten en pantallas anchas. -->
  <div class="frow" :style="{ '--basis': basis }">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.frow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;

  > :deep(*) {
    flex: 1 1 var(--basis);
    min-width: 0;
  }
}
</style>
