<script setup lang="ts">
import SearchBar from '@/components/admin/SearchBar.vue'
import { auditActions, auditCopy as c, auditEntities } from '@/config/admin/contract'
import type { AuditActor } from '@/types/contract'

/** Filtros de la bitácora: persona, acción, entidad, rango de fechas y búsqueda libre. */
defineProps<{ actors: AuditActor[]; exporting: boolean }>()
const emit = defineEmits<{ export: []; clear: [] }>()
const filters = defineModel<Record<string, string>>('filters', { required: true })
</script>

<template>
  <div class="afilters">
    <div class="afilters__search">
      <SearchBar :model-value="filters.q || ''" :placeholder="c.search" @update:model-value="(v) => (filters.q = v)" />
    </div>
    <div class="afilters__row">
      <div class="afilters__field">
        <label for="af-actor">{{ c.actor }}</label>
        <select id="af-actor" v-model="filters.actor">
          <option value="">{{ c.allActors }}</option>
          <option v-for="a in actors" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>
      <div class="afilters__field">
        <label for="af-action">{{ c.action }}</label>
        <select id="af-action" v-model="filters.action">
          <option value="">{{ c.allActions }}</option>
          <option v-for="(label, key) in auditActions" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="afilters__field">
        <label for="af-entity">{{ c.entity }}</label>
        <select id="af-entity" v-model="filters.entity">
          <option value="">{{ c.allEntities }}</option>
          <option v-for="(label, key) in auditEntities" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="afilters__field afilters__field--date">
        <label for="af-from">{{ c.from }}</label>
        <input id="af-from" v-model="filters.from" type="date" />
      </div>
      <div class="afilters__field afilters__field--date">
        <label for="af-to">{{ c.to }}</label>
        <input id="af-to" v-model="filters.to" type="date" />
      </div>
    </div>
    <div class="afilters__actions">
      <button type="button" class="btn btn--ghost btn--sm" @click="emit('clear')">
        <i class="fa-solid fa-filter-circle-xmark"></i> {{ c.clear }}
      </button>
      <button type="button" class="btn btn--dark btn--sm" :disabled="exporting" @click="emit('export')">
        <i :class="exporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-csv'"></i>
        {{ exporting ? c.exporting : c.export }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.afilters {
  @include flex(column, stretch, flex-start, 0.75rem);
  margin-bottom: 1rem;

  &__search {
    display: flex;
    max-width: 520px;
  }

  &__row {
    @include flex(row, flex-end, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__field {
    flex: 1 1 160px;
    min-width: 0;

    &--date {
      flex: 1 1 140px;
    }

    label {
      display: block;
      font-size: 0.74rem;
      font-weight: 700;
      color: $ink-muted;
      margin-bottom: 0.3rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.5rem);
    flex-wrap: wrap;
  }
}
</style>
