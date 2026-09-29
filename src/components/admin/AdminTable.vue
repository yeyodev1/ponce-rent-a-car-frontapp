<script setup lang="ts" generic="Row extends Record<string, any>">
import EmptyState from './EmptyState.vue'
import type { ApiError } from '@/types'
import type { Column } from '@/types/admin'

const props = withDefaults(
  defineProps<{
    columns: Column[]
    rows: Row[]
    loading?: boolean
    error?: ApiError | null
    rowKey?: string
    clickable?: boolean
    emptyTitle?: string
    emptyIcon?: string
  }>(),
  { rowKey: '_id' },
)

const emit = defineEmits<{ rowClick: [row: Row]; retry: [] }>()

const value = (row: Row, key: string) => key.split('.').reduce<any>((acc, k) => acc?.[k], row) ?? '—'

function onClick(row: Row) {
  if (props.clickable) emit('rowClick', row)
}
</script>

<template>
  <div class="atable">
    <!-- Cargando -->
    <div v-if="loading" class="atable__skeleton">
      <div v-for="i in 6" :key="i" class="skeleton atable__skeleton-row" :style="{ opacity: 1 - i * 0.12 }"></div>
    </div>

    <EmptyState v-else-if="error" error :message="error.status === 404 ? undefined : error.message" @retry="emit('retry')" />

    <EmptyState v-else-if="!rows.length" :title="emptyTitle" :icon="emptyIcon" />

    <template v-else>
      <!-- Desktop: tabla -->
      <div class="atable__scroll">
        <table class="atable__table">
          <thead>
            <tr>
              <th v-for="c in columns" :key="c.key" :style="{ textAlign: c.align || 'left' }">{{ c.label }}</th>
              <th v-if="$slots.actions" class="atable__actions-h"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row[rowKey]"
              :class="{ 'atable__row--click': clickable }"
              @click="onClick(row)"
            >
              <td v-for="c in columns" :key="c.key" :style="{ textAlign: c.align || 'left' }">
                <slot :name="`cell-${c.key}`" :row="row">{{ value(row, c.key) }}</slot>
              </td>
              <td v-if="$slots.actions" class="atable__actions" @click.stop>
                <slot name="actions" :row="row" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Móvil: tarjetas -->
      <ul class="atable__cards">
        <li
          v-for="row in rows"
          :key="row[rowKey]"
          class="atable__card"
          :class="{ 'atable__card--click': clickable }"
          @click="onClick(row)"
        >
          <slot name="card" :row="row">
            <div class="atable__card-head">
              <slot :name="`cell-${columns[0]?.key}`" :row="row">
                <strong>{{ value(row, columns[0]?.key || '') }}</strong>
              </slot>
            </div>
            <dl class="atable__card-body">
              <div v-for="c in columns.slice(1).filter((x) => !x.mobileHidden)" :key="c.key" class="atable__pair">
                <dt>{{ c.label }}</dt>
                <dd><slot :name="`cell-${c.key}`" :row="row">{{ value(row, c.key) }}</slot></dd>
              </div>
            </dl>
          </slot>
          <div v-if="$slots.actions" class="atable__card-actions" @click.stop>
            <slot name="actions" :row="row" />
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
.atable {
  &__skeleton {
    @include flex(column, stretch, flex-start, 0.6rem);
    padding: 1rem;
  }

  &__skeleton-row {
    height: 52px;
  }

  &__scroll {
    display: none;
    overflow-x: auto;

    @include from('md') {
      display: block;
    }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;

    th {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: $ink-muted;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid $line;
      white-space: nowrap;
      background: rgba($paper, 0.6);
    }

    td {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid rgba($line, 0.7);
      vertical-align: middle;
      color: $ink-soft;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }
  }

  &__row--click {
    cursor: pointer;
    transition: background-color 0.18s ease;

    &:hover {
      background: rgba($blue-soft, 0.55);
    }
  }

  &__actions-h {
    width: 1%;
  }

  &__actions {
    white-space: nowrap;
    text-align: right;
  }

  &__cards {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.6rem);
    padding: 0.75rem;

    @include from('md') {
      display: none;
    }
  }

  &__card {
    background: $surface;
    border: 1px solid $line;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    @include flex(column, stretch, flex-start, 0.6rem);

    &--click {
      cursor: pointer;

      &:active {
        background: $paper;
      }
    }
  }

  &__card-head {
    font-size: 0.95rem;
    color: $ink;
  }

  &__card-body {
    @include flex(row, flex-start, flex-start, 0.55rem 1.1rem);
    flex-wrap: wrap;
  }

  &__pair {
    min-width: 0;

    dt {
      font-size: 0.66rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: $ink-muted;
    }

    dd {
      font-size: 0.86rem;
      color: $ink-soft;
    }
  }

  &__card-actions {
    @include flex(row, center, flex-end, 0.4rem);
    border-top: 1px dashed $line;
    padding-top: 0.6rem;
  }
}
</style>
