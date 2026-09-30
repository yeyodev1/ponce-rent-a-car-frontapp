<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminNavList from './AdminNavList.vue'
import AdminWordmark from './AdminWordmark.vue'
import { useUserStore } from '@/stores/user'
import { brand, copy, roles } from '@/config/admin'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const router = useRouter()
const userStore = useUserStore()

const role = computed(() => roles[userStore.user?.accountType || ''] || null)

const initials = computed(() => {
  const n = userStore.user?.name || userStore.user?.email || '?'
  return n
    .split(/[\s@.]+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
})

function logout() {
  userStore.clear()
  router.replace({ name: 'Login' })
}
</script>

<template>
  <aside class="side" :class="{ 'side--collapsed': collapsed }">
    <RouterLink to="/admin" class="side__brand">
      <AdminWordmark :compact="collapsed" />
      <span v-if="!collapsed" class="side__panel">{{ brand.panel }}</span>
    </RouterLink>

    <div class="side__scroll">
      <AdminNavList :collapsed="collapsed" />
    </div>

    <div class="side__foot">
      <div class="side__user">
        <span class="side__avatar" :title="role?.label">{{ initials }}</span>
        <div v-if="!collapsed" class="side__who">
          <strong>{{ userStore.user?.name || userStore.user?.email }}</strong>
          <span v-if="role" class="side__role" :class="`side__role--${userStore.user?.accountType}`">
            <i :class="role.icon"></i> {{ role.label }}
          </span>
        </div>
        <button v-if="!collapsed" class="side__icon-btn" type="button" :title="copy.logout" @click="logout">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
      <button class="side__collapse" type="button" :aria-label="collapsed ? 'Expandir menú' : 'Contraer menú'" @click="emit('toggle')">
        <i class="fa-solid" :class="collapsed ? 'fa-angles-right' : 'fa-angles-left'"></i>
        <span v-if="!collapsed">Contraer</span>
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.side {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  width: 264px;
  flex-shrink: 0;
  background: $navy;
  background-image: radial-gradient(120% 60% at 0% 0%, rgba($blue, 0.22), transparent 60%);
  color: $on-dark;
  display: none;
  flex-direction: column;
  transition: width 0.35s $ease;
  z-index: 20;

  @include from('lg') {
    display: flex;
  }

  &--collapsed {
    width: 80px;
  }

  &__brand {
    @include flex(column, flex-start, center, 0.25rem);
    padding: 1.2rem 1.4rem 0.9rem;
    min-height: 76px;
  }

  &--collapsed &__brand {
    align-items: center;
    padding-inline: 0;
  }

  &__panel {
    font-size: 0.7rem;
    color: rgba($on-dark, 0.5);
    font-weight: 600;
  }

  &__scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem 0.75rem 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba($on-dark, 0.15) transparent;
  }

  &__foot {
    border-top: 1px solid rgba($on-dark, 0.08);
    padding: 0.6rem 0.75rem;
    @include flex(column, stretch, flex-start, 0.3rem);
  }

  &__user {
    @include flex(row, center, flex-start, 0.65rem);
    padding: 0.25rem;
  }

  &--collapsed &__user {
    justify-content: center;
  }

  &__avatar {
    @include flex(row, center, center);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $accent;
    color: $navy;
    font-weight: 900;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  &__who {
    flex: 1;
    min-width: 0;
    @include flex(column, flex-start, center);
    line-height: 1.25;

    strong {
      font-size: 0.84rem;
    }

    small {
      font-size: 0.72rem;
      color: rgba($on-dark, 0.5);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__role {
    @include flex(row, center, flex-start, 0.3rem);
    margin-top: 0.2rem;
    padding: 0.12rem 0.5rem;
    border-radius: $radius-pill;
    font-size: 0.66rem;
    font-weight: 800;
    background: rgba($on-dark, 0.1);
    color: $on-dark-soft;

    &--admin {
      background: rgba($accent, 0.18);
      color: $accent;
    }
  }

  &__icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    color: rgba($on-dark, 0.6);

    &:hover {
      background: rgba($on-dark, 0.08);
      color: $surface;
    }
  }

  &__collapse {
    @include flex(row, center, center, 0.5rem);
    padding: 0.55rem;
    border-radius: 10px;
    font-size: 0.78rem;
    font-weight: 700;
    color: rgba($on-dark, 0.5);

    &:hover {
      background: rgba($on-dark, 0.06);
      color: $on-dark;
    }
  }
}
</style>
