<script setup lang="ts">
import SectionHead from './SectionHead.vue'

/** Bloque de página con su H2: mantiene el ritmo vertical igual en todo el sitio. */
withDefaults(
  defineProps<{
    id: string
    title?: string
    eyebrow?: string
    lead?: string
    tone?: 'plain' | 'sand' | 'dark'
    center?: boolean
  }>(),
  { title: '', eyebrow: '', lead: '', tone: 'plain', center: false },
)
</script>

<template>
  <section
    class="psec"
    :class="`psec--${tone}`"
    :aria-labelledby="title ? `${id}-title` : undefined"
  >
    <div class="psec__inner">
      <SectionHead
        v-if="title"
        :id="`${id}-title`"
        :eyebrow="eyebrow"
        :title="title"
        :lead="lead"
        :light="tone === 'dark'"
        :center="center"
      />
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.psec {
  padding: $space-xl 0;

  &--sand {
    background: $sand;
  }

  &--dark {
    background: $navy;
    color: $on-dark;
  }

  &__inner {
    @include container;
  }
}
</style>
