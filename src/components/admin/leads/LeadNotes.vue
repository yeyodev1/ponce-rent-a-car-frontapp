<script setup lang="ts">
import { computed, ref } from 'vue'
import { adminService } from '@/services/admin.service'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { dateTime, timeAgo } from '@/composables/admin/helpers'
import type { ApiError } from '@/types'
import type { Lead, LeadNote } from '@/types/admin'

const props = defineProps<{ lead: Lead }>()
const emit = defineEmits<{ updated: [notes: LeadNote[]] }>()

const toast = useToastStore()
const userStore = useUserStore()
const text = ref('')
const sending = ref(false)

// Lo más reciente arriba: es lo primero que el asesor necesita ver.
const notes = computed(() => [...(props.lead.notes || [])].sort((a, b) => +new Date(b.at) - +new Date(a.at)))

async function add() {
  const value = text.value.trim()
  if (!value) return
  sending.value = true
  const optimistic: LeadNote = { text: value, author: userStore.user?.name || 'Tú', at: new Date().toISOString() }
  const before = props.lead.notes || []
  emit('updated', [...before, optimistic])
  text.value = ''
  try {
    const saved = await adminService.addLeadNote(props.lead._id, value)
    if (saved?.notes) emit('updated', saved.notes)
  } catch (e) {
    emit('updated', before)
    text.value = value
    toast.error((e as ApiError).message)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="notes">
    <h2 class="notes__title"><i class="fa-regular fa-note-sticky"></i> Notas y seguimiento</h2>
    <form class="notes__form" @submit.prevent="add">
      <textarea
        v-model="text"
        rows="2"
        placeholder="Ej.: Le envié cotización de SUV por 5 días. Responde mañana."
        @keydown.meta.enter="add"
        @keydown.ctrl.enter="add"
      ></textarea>
      <button class="btn btn--dark btn--sm" type="submit" :disabled="sending || !text.trim()">
        <i class="fa-solid fa-paper-plane"></i> Agregar nota
      </button>
    </form>

    <ol v-if="notes.length" class="notes__timeline">
      <TransitionGroup name="rise">
        <li v-for="n in notes" :key="n._id || n.at" class="notes__item">
          <span class="notes__dot"></span>
          <div class="notes__bubble">
            <p class="notes__text">{{ n.text }}</p>
            <p class="notes__meta" :title="dateTime(n.at)">{{ n.author || 'Sistema' }} · {{ timeAgo(n.at) }}</p>
          </div>
        </li>
      </TransitionGroup>
    </ol>
    <p v-else class="notes__empty">Todavía no hay notas. Registra cada contacto para no perder el hilo.</p>
  </section>
</template>

<style scoped lang="scss">
.notes {
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

  &__form {
    @include flex(column, stretch, flex-start, 0.5rem);

    textarea {
      min-height: 76px;
    }

    .btn {
      align-self: flex-end;
    }
  }

  &__timeline {
    list-style: none;
    position: relative;
    @include flex(column, stretch, flex-start, 0.8rem);
    padding-left: 1.1rem;

    &::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: $line;
    }
  }

  &__item {
    position: relative;
  }

  &__dot {
    position: absolute;
    left: -1.1rem;
    top: 0.85rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $accent;
    border: 2px solid $surface;
    box-shadow: 0 0 0 1px $accent-deep;
  }

  &__bubble {
    background: $paper;
    border-radius: 12px;
    padding: 0.65rem 0.85rem;
  }

  &__text {
    font-size: 0.9rem;
    white-space: pre-line;
  }

  &__meta {
    font-size: 0.72rem;
    color: $ink-muted;
    margin-top: 0.2rem;
  }

  &__empty {
    font-size: $text-sm;
    color: $ink-muted;
  }
}
</style>
