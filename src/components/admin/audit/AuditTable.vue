<script setup lang="ts">
import EmptyState from '@/components/admin/EmptyState.vue'
import { auditCopy as c, auditRoles } from '@/config/admin/contract'
import { dateTime } from '@/composables/admin/helpers'
import type { ApiError } from '@/types'
import type { AuditEntry } from '@/types/contract'

/** Tabla en escritorio, tarjetas en el teléfono. Lo fallido (p. ej. un login con mala clave) resalta. */
defineProps<{ rows: AuditEntry[]; loading: boolean; error: ApiError | null }>()
const emit = defineEmits<{ retry: [] }>()

const who = (r: AuditEntry) => r.actor?.name || r.actor?.email || c.system
const role = (r: AuditEntry) => (r.actor?.role ? auditRoles[r.actor.role] || r.actor.role : '')
const failed = (r: AuditEntry) => !r.success
</script>

<template>
  <div class="atrail">
    <div v-if="loading" class="atrail__sk">
      <div v-for="i in 6" :key="i" class="skeleton atrail__sk-row"></div>
    </div>
    <EmptyState v-else-if="error" error :message="error.message" @retry="emit('retry')" />
    <EmptyState v-else-if="!rows.length" :title="c.empty" icon="fa-solid fa-clock-rotate-left" />

    <template v-else>
      <div class="atrail__scroll">
        <table class="atrail__table">
          <thead>
            <tr>
              <th>{{ c.columns.at }}</th>
              <th>{{ c.columns.actor }}</th>
              <th>{{ c.columns.summary }}</th>
              <th>{{ c.columns.ip }}</th>
              <th>{{ c.columns.result }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r._id" :class="{ 'atrail__row--fail': failed(r) }">
              <td class="atrail__at">{{ dateTime(r.at) }}</td>
              <td><strong>{{ who(r) }}</strong><small v-if="role(r)">{{ role(r) }}</small></td>
              <td class="atrail__summary">{{ r.summary }}<small>{{ r.action }}</small></td>
              <td class="atrail__ip" :title="r.userAgent">{{ r.ip || '—' }}</td>
              <td>
                <span class="chip" :class="failed(r) ? 'chip--danger' : 'chip--success'">{{ failed(r) ? c.failed : c.ok }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="atrail__cards">
        <li v-for="r in rows" :key="r._id" class="atrail__card" :class="{ 'atrail__card--fail': failed(r) }">
          <div class="atrail__card-head">
            <strong>{{ who(r) }}</strong>
            <span class="chip" :class="failed(r) ? 'chip--danger' : 'chip--success'">{{ failed(r) ? c.failed : c.ok }}</span>
          </div>
          <p class="atrail__card-summary">{{ r.summary }}</p>
          <p class="atrail__card-meta">
            <span><i class="fa-regular fa-clock"></i> {{ dateTime(r.at) }}</span>
            <span><i class="fa-solid fa-network-wired"></i> {{ r.ip || '—' }}</span>
          </p>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
.atrail {
  &__sk {
    @include flex(column, stretch, flex-start, 0.6rem);
    padding: 1rem;
  }

  &__sk-row {
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
    font-size: 0.86rem;

    th {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: $ink-muted;
      padding: 0.8rem 1rem;
      border-bottom: 1px solid $line;
      text-align: left;
      white-space: nowrap;
      background: rgba($paper, 0.6);
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba($line, 0.7);
      vertical-align: top;
      color: $ink-soft;
    }

    small {
      display: block;
      font-size: 0.72rem;
      color: $ink-muted;
    }
  }

  &__row--fail td {
    background: rgba($danger, 0.06);
  }

  &__row--fail td:first-child {
    box-shadow: inset 3px 0 0 $danger;
  }

  &__at,
  &__ip {
    white-space: nowrap;
  }

  &__summary {
    color: $ink;
    min-width: 260px;
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
    padding: 0.85rem 1rem;
    @include flex(column, stretch, flex-start, 0.4rem);

    &--fail {
      background: rgba($danger, 0.06);
      border-color: rgba($danger, 0.35);
      box-shadow: inset 3px 0 0 $danger;
    }
  }

  &__card-head {
    @include flex(row, center, space-between, 0.6rem);
    font-size: 0.92rem;
    color: $ink;
  }

  &__card-summary {
    font-size: 0.86rem;
    color: $ink;
  }

  &__card-meta {
    @include flex(row, center, flex-start, 0.4rem 1rem);
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: $ink-muted;

    i {
      margin-right: 0.25rem;
    }
  }
}
</style>
