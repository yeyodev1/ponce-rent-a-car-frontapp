<script setup lang="ts">
import { ref } from 'vue'
import ContractViewer from '@/components/contract/ContractViewer.vue'
import { contractCopy } from '@/config/admin/contract'
import { dateTime } from '@/composables/admin/helpers'
import type { ContractTemplate } from '@/types/contract'

/** Historial de versiones, solo lectura: lo que se publicó queda tal cual. */
defineProps<{ templates: ContractTemplate[] }>()
const c = contractCopy.templates
const openId = ref('')
const lang = ref<'es' | 'en'>('es')

function toggle(id: string) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <div class="cversions">
    <p class="cversions__hint">{{ c.historyHint }}</p>
    <ul class="cversions__list">
      <li v-for="t in templates" :key="t._id" class="cversions__item">
        <div class="cversions__row">
          <span class="cversions__num">v{{ t.version }}</span>
          <div class="cversions__meta">
            <strong>{{ t.title.es }}</strong>
            <span>{{ dateTime(t.createdAt) }}<template v-if="t.createdBy?.name"> · {{ c.by }} {{ t.createdBy.name }}</template></span>
          </div>
          <span v-if="t.isActive" class="chip chip--success">{{ c.active }}</span>
          <button type="button" class="btn btn--ghost btn--sm" :aria-expanded="openId === t._id" @click="toggle(t._id)">
            {{ openId === t._id ? c.close : c.view }}
          </button>
        </div>
        <div v-if="openId === t._id" class="cversions__body">
          <div class="cversions__langs">
            <button type="button" :class="{ on: lang === 'es' }" @click="lang = 'es'">{{ c.es }}</button>
            <button type="button" :class="{ on: lang === 'en' }" @click="lang = 'en'">{{ c.en }}</button>
          </div>
          <ContractViewer :title="t.title[lang]" :text="t.body[lang]" :meta="`v${t.version}`" />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.cversions {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__hint {
    font-size: 0.78rem;
    color: $ink-muted;
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.5rem);
  }

  &__item {
    border: 1px solid $line;
    border-radius: 12px;
    padding: 0.65rem 0.8rem;
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__row {
    @include flex(row, center, flex-start, 0.6rem);
    flex-wrap: wrap;
  }

  &__num {
    font-family: $font-display;
    font-weight: 800;
    color: $blue-deep;
    min-width: 2.2rem;
  }

  &__meta {
    flex: 1 1 160px;
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.1rem);

    strong {
      font-size: 0.85rem;
      color: $ink;
    }

    span {
      font-size: 0.74rem;
      color: $ink-muted;
    }
  }

  &__langs {
    @include flex(row, center, flex-start, 0.4rem);

    button {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.7rem;
      border-radius: $radius-pill;
      color: $ink-soft;
      background: $sand;

      &.on {
        background: $navy;
        color: $surface;
      }
    }
  }
}
</style>
