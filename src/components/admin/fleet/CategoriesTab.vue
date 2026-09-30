<script setup lang="ts">
import AdminDrawer from '../AdminDrawer.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import EmptyState from '../EmptyState.vue'
import ToggleSwitch from '../ToggleSwitch.vue'
import CategoryForm from './CategoryForm.vue'
import { useCrud } from '@/composables/admin/useCrud'
import { useUserStore } from '@/stores/user'
import { copy } from '@/config/admin'
import { emptyI18n, es } from '@/composables/admin/helpers'
import { money } from '@/utils/format'
import type { Category } from '@/types'

type CategoryRow = Category & { vehicleCount?: number }

const crud = useCrud<Category, Partial<Category>>('categories', {
  empty: () => ({
    slug: '',
    name: emptyI18n(),
    tagline: emptyI18n(),
    description: emptyI18n(),
    passengers: 5,
    luggage: 2,
    transmission: 'automatic',
    airConditioning: true,
    pricePerDay: 0,
    image: '',
    gallery: [],
    exampleModels: '',
    features: [],
    order: 0,
    isActive: true,
    seo: { title: emptyI18n(), description: emptyI18n(), ogImage: '' },
  }),
})
const { items, loading, error, form, editingId, drawerOpen, saving, toDelete } = crud
const userStore = useUserStore()
</script>

<template>
  <div>
    <div class="ctab__bar">
      <p class="ctab__hint">Lo que se vende en la web es la categoría; las unidades viven dentro de cada una.</p>
      <button class="btn btn--primary btn--sm" type="button" @click="crud.openNew"><i class="fa-solid fa-plus"></i> Nueva categoría</button>
    </div>

    <div v-if="loading" class="ctab__grid">
      <div v-for="i in 4" :key="i" class="skeleton ctab__sk"></div>
    </div>
    <EmptyState v-else-if="error" error :message="error.message" @retry="crud.load" />
    <EmptyState v-else-if="!items.length" icon="fa-solid fa-car" title="Aún no hay categorías" />

    <TransitionGroup v-else name="rise" tag="div" class="ctab__grid">
      <article v-for="c in [...items].sort((a, b) => a.order - b.order)" :key="c._id" class="ctab__card" :class="{ 'ctab__card--off': !c.isActive }">
        <button class="ctab__media" type="button" @click="crud.openEdit(c)">
          <img v-if="c.image" :src="c.image" :alt="es(c.name)" loading="lazy" />
          <i v-else class="fa-solid fa-car-side"></i>
        </button>
        <div class="ctab__body">
          <div class="ctab__row">
            <h3>{{ es(c.name) || c.slug }}</h3>
            <strong>{{ money(c.pricePerDay) }}<small>/día</small></strong>
          </div>
          <p class="ctab__meta">
            <span><i class="fa-solid fa-user-group"></i> {{ c.passengers }}</span>
            <span><i class="fa-solid fa-suitcase"></i> {{ c.luggage }}</span>
            <span>{{ c.transmission === 'manual' ? 'Manual' : 'Automática' }}</span>
            <span v-if="(c as CategoryRow).vehicleCount !== undefined"><i class="fa-solid fa-car"></i> {{ (c as CategoryRow).vehicleCount }} unidades</span>
          </p>
          <div class="ctab__row">
            <ToggleSwitch :model-value="c.isActive" small label="Activa" @update:model-value="crud.toggle(c)" />
            <div class="ctab__actions">
              <button type="button" :aria-label="copy.edit" @click="crud.openEdit(c)"><i class="fa-solid fa-pen"></i></button>
              <button v-if="userStore.isAdmin" type="button" class="ctab__del" :aria-label="copy.delete" @click="toDelete = c"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </div>
      </article>
    </TransitionGroup>

    <AdminDrawer :open="drawerOpen" :title="editingId ? 'Editar categoría' : 'Nueva categoría'" wide @close="drawerOpen = false">
      <CategoryForm v-model="form" />
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="drawerOpen = false">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving" @click="crud.save">
          <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i> {{ saving ? copy.saving : copy.save }}
        </button>
      </template>
    </AdminDrawer>

    <ConfirmDialog
      :open="Boolean(toDelete)"
      :title="`¿Eliminar ${es(toDelete?.name) || 'la categoría'}?`"
      message="Si tiene unidades o reservas, el servidor puede impedirlo. Considera desactivarla."
      @confirm="crud.confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>

<style scoped lang="scss">
.ctab {
  &__bar {
    @include flex(row, center, space-between, 0.75rem);
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  &__hint {
    font-size: $text-sm;
    color: $ink-muted;
    max-width: 520px;
  }

  // Ancho fijo por breakpoint: con flex-grow la última tarjeta se estiraba a toda la fila.
  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    > * {
      flex: 0 0 100%;
      min-width: 0;

      @include from('sm') {
        flex-basis: calc(50% - 0.5rem);
      }

      @include from('lg') {
        flex-basis: calc(33.333% - 0.667rem);
      }

      @include from('xl') {
        flex-basis: calc(25% - 0.75rem);
      }
    }
  }

  &__sk {
    height: 260px;
    border-radius: 14px;
  }

  &__card {
    @include card;
    box-shadow: $shadow-sm;
    overflow: hidden;
    @include flex(column, stretch, flex-start);
    transition: opacity 0.25s ease;

    &--off {
      opacity: 0.6;
    }
  }

  &__media {
    height: 150px;
    background: linear-gradient(135deg, $sand, $paper);
    @include flex(row, center, center);
    color: $ink-muted;
    font-size: 2rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    padding: 0.9rem 1rem;
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__row {
    @include flex(row, center, space-between, 0.5rem);

    h3 {
      font-size: 1.05rem;
    }

    strong {
      font-size: 1rem;
      color: $navy;

      small {
        font-size: 0.72rem;
        color: $ink-muted;
        margin-left: 0.15rem;
      }
    }
  }

  &__meta {
    @include flex(row, center, flex-start, 0.8rem);
    flex-wrap: wrap;
    font-size: 0.78rem;
    color: $ink-soft;

    i {
      color: $ink-muted;
      margin-right: 0.2rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-end, 0.2rem);

    button {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      color: $ink-muted;

      &:hover {
        background: $sand;
        color: $ink;
      }
    }
  }

  &__del:hover {
    color: $danger !important;
    background: $danger-bg !important;
  }
}
</style>
