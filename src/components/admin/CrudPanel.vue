<script setup lang="ts" generic="T extends { _id: string }">
import { computed } from 'vue'
import AdminDrawer from './AdminDrawer.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import EmptyState from './EmptyState.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import { copy } from '@/config/admin'
import { useUserStore } from '@/stores/user'
import type { ApiError } from '@/types'

/**
 * Lista + drawer de edición para las colecciones chicas del panel. Recibe el
 * objeto de useCrud y el padre solo pinta la fila (#item) y el formulario (#form).
 */
interface Crud {
  items: T[]
  loading: boolean
  error: ApiError | null
  editingId: string | null
  drawerOpen: boolean
  saving: boolean
  toDelete: T | null
  load: () => void
  openNew: () => void
  openEdit: (item: T) => void
  save: () => void
  confirmDelete: () => void
  toggle: (item: T, field?: any) => void
}

const props = withDefaults(
  defineProps<{
    crud: Crud
    noun: string
    /** Plural y género del sustantivo, para que el copy concuerde ("Nueva promoción"). */
    plural?: string
    feminine?: boolean
    hint?: string
    toggleField?: string
    toggleLabel?: string
    sort?: (a: T, b: T) => number
    filter?: (item: T) => boolean
    wide?: boolean
    icon?: string
    /** Solo lectura (p. ej. tarifas para un empleado): sin crear, activar ni guardar. */
    readonly?: boolean
  }>(),
  { toggleLabel: 'Activo' },
)

const t = computed(() => ({
  new: props.feminine ? 'Nueva' : 'Nuevo',
  none: `Aún no hay ${props.plural || `${props.noun}s`}`,
  del: `¿Eliminar ${props.feminine ? 'esta' : 'este'} ${props.noun}?`,
}))

// Eliminar es solo de administradores: para el resto el botón no existe.
const userStore = useUserStore()

const rows = computed(() => {
  const list = props.filter ? props.crud.items.filter(props.filter) : [...props.crud.items]
  return props.sort ? list.sort(props.sort) : list
})
</script>

<template>
  <div class="crud">
    <div class="crud__bar">
      <p v-if="hint" class="crud__hint">{{ hint }}</p>
      <p v-if="readonly" class="crud__hint"><i class="fa-solid fa-lock"></i> {{ copy.readOnly }}</p>
      <button v-if="!readonly" class="btn btn--primary btn--sm" type="button" @click="crud.openNew()">
        <i class="fa-solid fa-plus"></i> {{ copy.add }} {{ noun }}
      </button>
    </div>

    <div v-if="crud.loading" class="crud__list">
      <div v-for="i in 4" :key="i" class="skeleton crud__sk"></div>
    </div>
    <EmptyState v-else-if="crud.error" error :message="crud.error.message" @retry="crud.load()" />
    <EmptyState v-else-if="!rows.length" :icon="icon" :title="t.none" />

    <TransitionGroup v-else name="rise" tag="ul" class="crud__list">
      <li
        v-for="item in rows"
        :key="item._id"
        class="crud__row"
        :class="{ 'crud__row--off': toggleField && !(item as any)[toggleField] }"
      >
        <button class="crud__main" type="button" @click="crud.openEdit(item)">
          <slot name="item" :item="item" />
        </button>
        <div class="crud__tools">
          <ToggleSwitch
            v-if="toggleField && !readonly"
            small
            :label="toggleLabel"
            :model-value="Boolean((item as any)[toggleField])"
            @update:model-value="crud.toggle(item, toggleField)"
          />
          <button class="crud__icon" type="button" :aria-label="readonly ? 'Ver' : copy.edit" @click="crud.openEdit(item)">
            <i :class="readonly ? 'fa-regular fa-eye' : 'fa-solid fa-pen'"></i>
          </button>
          <button v-if="userStore.isAdmin && !readonly" class="crud__icon crud__icon--del" type="button" :aria-label="copy.delete" @click="crud.toDelete = item">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </li>
    </TransitionGroup>

    <AdminDrawer :open="crud.drawerOpen" :title="`${crud.editingId ? copy.edit : t.new} ${noun}`" :wide="wide" @close="crud.drawerOpen = false">
      <fieldset class="crud__fieldset" :disabled="readonly">
        <slot name="form" />
      </fieldset>
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="crud.drawerOpen = false">{{ copy.cancel }}</button>
        <button v-if="!readonly" class="btn btn--primary btn--sm" type="button" :disabled="crud.saving" @click="crud.save()">
          <i v-if="crud.saving" class="fa-solid fa-spinner fa-spin"></i> {{ crud.saving ? copy.saving : copy.save }}
        </button>
      </template>
    </AdminDrawer>

    <ConfirmDialog :open="Boolean(crud.toDelete)" :title="t.del" @confirm="crud.confirmDelete()" @cancel="crud.toDelete = null" />
  </div>
</template>

<style scoped lang="scss">
.crud {
  &__bar {
    @include flex(row, center, space-between, 0.75rem);
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
    max-width: 560px;
  }

  &__fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
    @include flex(column, stretch, flex-start, 1.1rem);
  }

  &__list {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__sk {
    height: 68px;
    border-radius: 14px;
  }

  &__row {
    @include card;
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
    padding: 0.4rem 0.6rem 0.4rem 0.4rem;
    transition: opacity 0.25s ease, box-shadow 0.2s ease;

    &:hover {
      box-shadow: $shadow-sm;
    }

    &--off {
      opacity: 0.62;
    }
  }

  &__main {
    flex: 1 1 260px;
    min-width: 0;
    text-align: left;
    padding: 0.5rem 0.6rem;
    border-radius: 10px;
    @include flex(row, center, flex-start, 0.8rem);
  }

  &__tools {
    @include flex(row, center, flex-end, 0.3rem);
    margin-left: auto;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    color: $ink-muted;

    &:hover {
      background: $sand;
      color: $ink;
    }

    &--del:hover {
      color: $danger;
      background: $danger-bg;
    }
  }
}
</style>
