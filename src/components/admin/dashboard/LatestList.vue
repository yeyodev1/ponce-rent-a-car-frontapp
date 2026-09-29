<script setup lang="ts">
import StatusBadge from '../StatusBadge.vue'
import type { StatusDef } from '@/config/admin'

// Lista compacta de "últimos X" del dashboard, cada fila lleva al detalle.
defineProps<{
  rows: { id: string; to: string; code: string; title: string; meta: string; status: string }[]
  map: Record<string, StatusDef>
  empty: string
}>()
</script>

<template>
  <ul v-if="rows.length" class="latest">
    <li v-for="r in rows" :key="r.id">
      <RouterLink :to="r.to" class="latest__row">
        <span class="latest__code">{{ r.code }}</span>
        <span class="latest__main">
          <strong>{{ r.title }}</strong>
          <small>{{ r.meta }}</small>
        </span>
        <StatusBadge :status="r.status" :map="map" />
      </RouterLink>
    </li>
  </ul>
  <p v-else class="latest__empty">{{ empty }}</p>
</template>

<style scoped lang="scss">
.latest {
  list-style: none;

  li + li {
    border-top: 1px solid rgba($line, 0.7);
  }

  &__row {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.75rem 1.15rem;
    transition: background-color 0.18s ease;

    &:hover {
      background: rgba($blue-soft, 0.5);
    }
  }

  &__code {
    font-size: 0.72rem;
    font-weight: 800;
    color: $blue-deep;
    background: $blue-soft;
    padding: 0.2rem 0.45rem;
    border-radius: 7px;
    flex-shrink: 0;
    min-width: 58px;
    text-align: center;
  }

  &__main {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center);
    line-height: 1.3;

    strong {
      font-size: 0.88rem;
      color: $ink;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      font-size: 0.76rem;
      color: $ink-muted;
    }
  }

  &__empty {
    padding: 1.5rem 1.15rem;
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
