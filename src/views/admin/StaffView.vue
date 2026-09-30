<script setup lang="ts">
import PageHeader from '@/components/admin/PageHeader.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminDrawer from '@/components/admin/AdminDrawer.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import StatusBadge from '@/components/admin/StatusBadge.vue'
import ToggleSwitch from '@/components/admin/ToggleSwitch.vue'
import StaffForm from '@/components/admin/staff/StaffForm.vue'
import { useStaff } from '@/composables/admin/useStaff'
import { copy, roles, staffCopy as t } from '@/config/admin'
import { timeAgo } from '@/composables/admin/helpers'
import type { Column, StaffMember } from '@/types/admin'

const s = useStaff()
const { items, loading, error, drawerOpen, editingId, saving, form, toToggle } = s

const columns: Column[] = [
  { key: 'name', label: 'Persona' },
  { key: 'accountType', label: t.role },
  { key: 'lastLoginAt', label: t.lastLogin, mobileHidden: true },
  { key: 'isActive', label: t.active },
]

const editingSelf = () => items.value.some((m) => s.idOf(m) === editingId.value && s.isSelf(m))
</script>

<template>
  <div>
    <PageHeader :title="t.title" :subtitle="t.subtitle">
      <button class="btn btn--primary btn--sm" type="button" @click="s.openNew"><i class="fa-solid fa-user-plus"></i> {{ t.add }}</button>
    </PageHeader>

    <section class="staff__card">
      <AdminTable
        :columns="columns"
        :rows="items"
        row-key="email"
        :loading="loading"
        :error="error"
        clickable
        :empty-title="t.empty"
        empty-icon="fa-solid fa-user-shield"
        @row-click="(m: StaffMember) => s.openEdit(m)"
        @retry="s.load"
      >
        <template #cell-name="{ row }">
          <span class="staff__who" :class="{ 'staff__who--off': !row.isActive }">
            <strong>{{ row.name || '—' }} <em v-if="s.isSelf(row)" class="staff__you">{{ t.you }}</em></strong>
            <small>{{ row.email }}</small>
          </span>
        </template>
        <template #cell-accountType="{ row }"><StatusBadge :status="row.accountType" :map="roles" icon /></template>
        <template #cell-lastLoginAt="{ row }">
          <span class="staff__muted">{{ row.lastLoginAt ? timeAgo(row.lastLoginAt) : t.never }}</span>
        </template>
        <template #cell-isActive="{ row }">
          <span class="staff__toggle" :title="s.isSelf(row) ? t.selfLocked : undefined" @click.stop>
            <ToggleSwitch
              small
              :model-value="row.isActive"
              :label="row.isActive ? t.active : 'Inactivo'"
              :class="{ 'staff__toggle--locked': s.isSelf(row) }"
              @update:model-value="() => (s.isSelf(row) ? null : (toToggle = row))"
            />
          </span>
        </template>
        <template #actions="{ row }">
          <button class="staff__icon" type="button" :aria-label="copy.edit" @click="s.openEdit(row)"><i class="fa-solid fa-pen"></i></button>
        </template>
      </AdminTable>
    </section>

    <AdminDrawer :open="drawerOpen" :title="editingId ? t.edit : t.new" @close="drawerOpen = false">
      <StaffForm :key="editingId || 'new'" :form="form" :editing="Boolean(editingId)" :self="editingSelf()" />
      <template #footer>
        <button class="btn btn--ghost btn--sm" type="button" @click="drawerOpen = false">{{ copy.cancel }}</button>
        <button class="btn btn--primary btn--sm" type="button" :disabled="saving || !s.valid.value" @click="s.save">
          <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i> {{ saving ? copy.saving : copy.save }}
        </button>
      </template>
    </AdminDrawer>

    <ConfirmDialog
      :open="Boolean(toToggle)"
      :title="toToggle?.isActive ? t.deactivateTitle(toToggle?.name || '') : t.activateTitle(toToggle?.name || '')"
      :message="toToggle?.isActive ? t.deactivateMsg : t.activateMsg"
      :confirm-label="toToggle?.isActive ? t.deactivate : t.activate"
      :danger="Boolean(toToggle?.isActive)"
      @confirm="s.confirmToggle"
      @cancel="toToggle = null"
    />
  </div>
</template>

<style scoped lang="scss">
.staff {
  &__card {
    @include card;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

  &__who {
    @include flex(column, flex-start, center);
    line-height: 1.3;

    strong {
      color: $ink;
    }

    small {
      color: $ink-muted;
      font-size: 0.76rem;
    }

    &--off {
      opacity: 0.6;
    }
  }

  &__you {
    font-style: normal;
    font-size: 0.66rem;
    font-weight: 800;
    padding: 0.1rem 0.4rem;
    border-radius: $radius-pill;
    background: $accent-soft;
    color: $accent-deep;
    margin-left: 0.3rem;
  }

  &__muted {
    font-size: 0.82rem;
    color: $ink-muted;
  }

  &__toggle {
    display: inline-flex;

    &--locked {
      opacity: 0.45;
      pointer-events: none;
    }
  }

  &__icon {
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
</style>
