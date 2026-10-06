<script setup lang="ts">
import { computed, ref } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import GuaranteeForm from '../handover/GuaranteeForm.vue'
import { useGuarantee } from '@/composables/admin/useGuarantee'
import { useUserStore } from '@/stores/user'
import { guaranteeCopy as t, guaranteeMethods, guaranteeStatuses } from '@/config/admin/ops'
import { money } from '@/utils/format'
import { dateTime } from '@/composables/admin/helpers'
import type { AdminReservation } from '@/types/admin'

/** Garantía física (Datafast, efectivo o transferencia). Nunca pasa por el pago en línea. */
const props = defineProps<{ r: AdminReservation }>()
const emit = defineEmits<{ changed: [] }>()

const userStore = useUserStore()
const {
  guarantee: g,
  mode,
  form,
  saving,
  error,
  openMode,
  submit,
  release,
} = useGuarantee(
  () => props.r,
  () => emit('changed'),
)
const confirmRelease = ref(false)
const closed = computed(() => ['cancelled', 'expired'].includes(props.r.status))
const charged = computed(() => ['charged', 'partially_charged'].includes(g.value.status))

function doRelease() {
  confirmRelease.value = false
  release()
}
</script>

<template>
  <section id="reservation-guarantee" class="rgua">
    <header class="rgua__head">
      <h2 class="rgua__title"><i class="fa-solid fa-shield-halved"></i> {{ t.title }}</h2>
      <StatusBadge :status="g.status" :map="guaranteeStatuses" icon />
    </header>

    <div class="rgua__facts">
      <div>
        <span>{{ t.amount }}</span
        ><strong>{{ money(g.amount, true) }}</strong>
      </div>
      <div v-if="g.method">
        <span>{{ t.method }}</span
        ><strong
          ><i :class="guaranteeMethods[g.method].icon"></i>
          {{ guaranteeMethods[g.method].label }}</strong
        >
      </div>
      <div v-if="charged">
        <span>{{ t.charged }}</span
        ><strong class="rgua__charged">{{ money(g.chargedAmount, true) }}</strong>
      </div>
    </div>

    <ul class="rgua__meta">
      <li v-if="g.reference">
        <i class="fa-solid fa-receipt"></i> {{ t.reference }}: <strong>{{ g.reference }}</strong>
      </li>
      <li v-if="g.heldAt">
        <i class="fa-regular fa-calendar"></i> {{ t.heldAt }} {{ dateTime(g.heldAt) }}
      </li>
      <li v-if="g.settledAt">
        <i class="fa-regular fa-calendar-check"></i> {{ t.settledAt }} {{ dateTime(g.settledAt) }}
      </li>
      <li v-if="g.chargeReason"><i class="fa-regular fa-comment"></i> {{ g.chargeReason }}</li>
      <li v-if="g.notes"><i class="fa-regular fa-note-sticky"></i> {{ g.notes }}</li>
      <li v-if="g.updatedBy?.name"><i class="fa-regular fa-user"></i> {{ g.updatedBy.name }}</li>
    </ul>

    <GuaranteeForm
      v-if="mode"
      v-model="form"
      :mode="mode"
      :held="g.amount"
      :saving="saving"
      :error="error"
      @submit="submit"
      @cancel="mode = null"
    />

    <div v-else class="rgua__actions">
      <button
        v-if="g.status === 'pending' && !closed"
        type="button"
        class="btn btn--dark btn--sm"
        @click="openMode('hold')"
      >
        <i class="fa-solid fa-lock"></i> {{ t.hold }}
      </button>
      <template v-if="g.status === 'held'">
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          :disabled="saving"
          @click="confirmRelease = true"
        >
          <i class="fa-solid fa-lock-open"></i> {{ t.release }}
        </button>
        <button
          v-if="userStore.isAdmin"
          type="button"
          class="btn btn--danger btn--sm"
          @click="openMode('charge')"
        >
          <i class="fa-solid fa-hand-holding-dollar"></i> {{ t.charge }}
        </button>
      </template>
    </div>
    <p v-if="g.status === 'held' && !userStore.isAdmin && !mode" class="rgua__hint">
      {{ t.onlyAdmin }}
    </p>

    <p class="rgua__reminder"><i class="fa-solid fa-circle-info"></i> {{ t.reminder }}</p>

    <ConfirmDialog
      :open="confirmRelease"
      :title="t.releaseTitle"
      :message="t.releaseMsg"
      :confirm-label="t.release"
      :danger="false"
      @confirm="doRelease"
      @cancel="confirmRelease = false"
    />
  </section>
</template>

<style scoped lang="scss">
.rgua {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.8rem);

  &__head {
    @include flex(row, center, space-between, 0.6rem);
    flex-wrap: wrap;
  }

  &__title {
    font-family: $font-principal;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0;
    @include flex(row, center, flex-start, 0.5rem);

    i {
      color: $blue;
    }
  }

  &__facts {
    @include flex(row, stretch, flex-start, 0.5rem);
    flex-wrap: wrap;

    div {
      flex: 1 1 100px;
      min-width: 0;
      background: $paper;
      border-radius: 12px;
      padding: 0.6rem 0.7rem;
      @include flex(column, flex-start, flex-start);
    }

    span {
      font-size: 0.7rem;
      font-weight: 700;
      color: $ink-muted;
    }

    strong {
      font-size: 0.95rem;
      white-space: nowrap;
    }
  }

  &__charged {
    color: $danger;
  }

  &__meta {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.25rem);
    font-size: 0.8rem;
    color: $ink-soft;

    &:empty {
      display: none;
    }

    i {
      width: 1rem;
      color: $ink-muted;
      margin-right: 0.25rem;
    }
  }

  &__actions {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;

    &:empty {
      display: none;
    }
  }

  &__hint {
    font-size: 0.78rem;
    color: $ink-muted;
  }

  &__reminder {
    font-size: 0.78rem;
    color: $info;
    background: $info-bg;
    border-radius: 10px;
    padding: 0.55rem 0.7rem;
    @include flex(row, flex-start, flex-start, 0.45rem);

    i {
      margin-top: 0.15rem;
    }
  }
}
</style>
