<script setup lang="ts">
import { ref, watch } from 'vue'
import { documentKinds, verificationStatuses } from '@/config/admin'
import type { AdminReservation } from '@/types/admin'

const props = defineProps<{ r: AdminReservation; saving?: boolean }>()
const emit = defineEmits<{
  save: [body: { verification: string; verificationNote: string }]
  open: [kind: string]
}>()

const choice = ref(props.r.verification)
const note = ref(props.r.verificationNote || '')

watch(
  () => props.r.verification,
  (v) => (choice.value = v),
)

const options = ['verified', 'needs_info', 'rejected'] as const
</script>

<template>
  <section class="verif">
    <h2 class="verif__title"><i class="fa-solid fa-user-shield"></i> Documentos y verificación</h2>

    <ul class="verif__docs">
      <li v-for="(label, kind) in documentKinds" :key="kind">
        <span class="verif__doc-icon" :class="{ 'verif__doc-icon--ok': r.documents?.[kind as 'license' | 'identity'] }">
          <i :class="r.documents?.[kind as 'license' | 'identity'] ? 'fa-solid fa-file-circle-check' : 'fa-regular fa-file'"></i>
        </span>
        <span class="verif__doc-label">{{ label }}</span>
        <button
          v-if="r.documents?.[kind as 'license' | 'identity']"
          class="btn btn--ghost btn--sm"
          type="button"
          @click="emit('open', kind)"
        >
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver
        </button>
        <span v-else class="verif__missing">Pendiente</span>
      </li>
    </ul>

    <div class="verif__options" role="radiogroup" aria-label="Resultado de la verificación">
      <button
        v-for="o in options"
        :key="o"
        type="button"
        role="radio"
        class="verif__opt"
        :class="[`verif__opt--${o}`, { 'verif__opt--on': choice === o }]"
        :aria-checked="choice === o"
        @click="choice = o"
      >
        <i :class="verificationStatuses[o]?.icon"></i>
        {{ verificationStatuses[o]?.label }}
      </button>
    </div>

    <div>
      <label for="verif-note">Nota para el cliente o el equipo</label>
      <textarea id="verif-note" v-model="note" rows="2" placeholder="Ej.: La licencia está vencida, pedir una vigente."></textarea>
    </div>

    <button
      class="btn btn--dark btn--sm verif__save"
      type="button"
      :disabled="saving || (choice === r.verification && note === (r.verificationNote || ''))"
      @click="emit('save', { verification: choice, verificationNote: note })"
    >
      <i class="fa-solid fa-check"></i> Guardar verificación
    </button>
  </section>
</template>

<style scoped lang="scss">
.verif {
  @include card;
  box-shadow: $shadow-sm;
  padding: 1.2rem;
  @include flex(column, stretch, flex-start, 0.9rem);

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

  &__docs {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.45rem);

    li {
      @include flex(row, center, flex-start, 0.7rem);
      padding: 0.55rem 0.7rem;
      background: $paper;
      border-radius: 12px;
    }
  }

  &__doc-icon {
    @include flex(row, center, center);
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: $sand;
    color: $ink-muted;

    &--ok {
      background: $success-bg;
      color: $success;
    }
  }

  &__doc-label {
    flex: 1;
    font-size: 0.86rem;
    font-weight: 700;
  }

  &__missing {
    font-size: 0.76rem;
    font-weight: 700;
    color: $warning;
  }

  &__options {
    @include flex(row, stretch, flex-start, 0.4rem);
    flex-wrap: wrap;
  }

  &__opt {
    flex: 1 1 120px;
    @include flex(row, center, center, 0.45rem);
    padding: 0.6rem 0.7rem;
    border-radius: 12px;
    border: 1.5px solid $line;
    background: $surface;
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-soft;
    transition: all 0.2s ease;

    &--verified.verif__opt--on {
      border-color: $success;
      background: $success-bg;
      color: $success;
    }

    &--needs_info.verif__opt--on {
      border-color: $warning;
      background: $warning-bg;
      color: darken($warning, 8%);
    }

    &--rejected.verif__opt--on {
      border-color: $danger;
      background: $danger-bg;
      color: $danger;
    }
  }

  &__save {
    align-self: flex-end;
  }
}
</style>
