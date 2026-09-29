<script setup lang="ts">
import { computed } from 'vue'
import { toneColors, type StatusDef, type Tone } from '@/config/admin'

const props = defineProps<{
  status: string | boolean
  map?: Record<string, StatusDef>
  tone?: Tone
  label?: string
  icon?: boolean
}>()

const def = computed<StatusDef>(() => {
  const key = String(props.status)
  return props.map?.[key] || { label: props.label || key, tone: props.tone || 'neutral' }
})

const style = computed(() => {
  const c = toneColors[props.tone || def.value.tone]
  return { '--fg': c.fg, '--bg': c.bg }
})
</script>

<template>
  <span class="badge" :style="style">
    <i v-if="icon && def.icon" :class="def.icon"></i>
    <span v-else class="badge__dot"></span>
    {{ label || def.label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.65rem;
  border-radius: $radius-pill;
  background: var(--bg);
  color: var(--fg);
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;

  i {
    font-size: 0.72rem;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
}
</style>
