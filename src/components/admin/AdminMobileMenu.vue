<script setup lang="ts">
import { toRef } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavList from './AdminNavList.vue'
import AdminWordmark from './AdminWordmark.vue'
import { useBodyScroll } from '@/composables/useBodyScroll'
import { useUserStore } from '@/stores/user'
import { copy, roles } from '@/config/admin'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

useBodyScroll(toRef(props, 'open'))

const router = useRouter()
const userStore = useUserStore()

function logout() {
  emit('close')
  userStore.clear()
  router.replace({ name: 'Login' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet" @click.self="emit('close')">
        <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Menú">
          <header class="sheet__head">
            <AdminWordmark />
            <button class="sheet__close" type="button" aria-label="Cerrar" @click="emit('close')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </header>
          <div class="sheet__body">
            <AdminNavList @navigate="emit('close')" />
          </div>
          <footer class="sheet__foot">
            <span class="sheet__email">
              <strong v-if="roles[userStore.user?.accountType || '']" class="sheet__role">{{ roles[userStore.user?.accountType || '']?.label }}</strong>
              {{ userStore.user?.email }}
            </span>
            <button class="btn btn--ghost-light btn--sm" type="button" @click="logout">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> {{ copy.logout }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.sheet {
  position: fixed;
  inset: 0;
  z-index: 140;
  background: $overlay;
  @include flex(column, stretch, flex-end);

  &__panel {
    background: $navy;
    color: $on-dark;
    border-radius: 24px 24px 0 0;
    max-height: 86dvh;
    @include flex(column, stretch, flex-start);
  }

  &__head {
    @include flex(row, center, space-between);
    padding: 1.2rem 1.25rem 0.8rem;
  }

  &__close {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba($on-dark, 0.08);
    color: $on-dark;
  }

  &__body {
    overflow-y: auto;
    padding: 0.5rem 1.25rem 1rem 1.6rem;
  }

  &__foot {
    @include flex(row, center, space-between, 0.75rem);
    padding: 0.9rem 1.25rem calc(1rem + env(safe-area-inset-bottom));
    border-top: 1px solid rgba($on-dark, 0.08);
  }

  &__role {
    display: block;
    color: $accent;
    font-size: 0.7rem;
  }

  &__email {
    font-size: 0.78rem;
    color: rgba($on-dark, 0.55);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;

  .sheet__panel {
    transition: transform 0.38s $ease;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .sheet__panel {
    transform: translateY(100%);
  }
}
</style>
