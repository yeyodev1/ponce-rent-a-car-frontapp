<script setup lang="ts">
import { computed, ref } from 'vue'
import LeadCard from './LeadCard.vue'
import { leadStatuses, leadStatusOrder, toneColors } from '@/config/admin'
import type { LeadStatus } from '@/types'
import type { Lead } from '@/types/admin'

const props = defineProps<{ leads: Lead[]; loading?: boolean }>()
const emit = defineEmits<{ move: [lead: Lead, status: LeadStatus] }>()

const columns = computed(() =>
  leadStatusOrder.map((s) => ({
    status: s as LeadStatus,
    def: leadStatuses[s]!,
    color: toneColors[leadStatuses[s]!.tone].fg,
    items: props.leads.filter((l) => l.status === s),
  })),
)

// Arrastrar y soltar en escritorio (HTML5 nativo); en el celular se usa el selector de la tarjeta.
const dragging = ref<Lead | null>(null)
const over = ref<string | null>(null)

function onDrop(status: LeadStatus) {
  if (dragging.value) emit('move', dragging.value, status)
  dragging.value = null
  over.value = null
}
</script>

<template>
  <div class="board">
    <section
      v-for="col in columns"
      :key="col.status"
      class="board__col"
      :class="{ 'board__col--over': over === col.status }"
      @dragover.prevent="over = col.status"
      @dragleave.self="over = null"
      @drop.prevent="onDrop(col.status)"
    >
      <header class="board__head" :style="{ '--c': col.color }">
        <span class="board__dot"></span>
        <h3>{{ col.def.label }}</h3>
        <span class="board__count">{{ loading ? '…' : col.items.length }}</span>
      </header>
      <div class="board__list">
        <template v-if="loading">
          <div v-for="i in 2" :key="i" class="skeleton board__sk"></div>
        </template>
        <TransitionGroup v-else name="rise">
          <LeadCard
            v-for="lead in col.items"
            :key="lead._id"
            :lead="lead"
            draggable="true"
            @dragstart="dragging = lead"
            @dragend="dragging = null; over = null"
            @move="(s) => emit('move', lead, s)"
          />
        </TransitionGroup>
        <p v-if="!loading && !col.items.length" class="board__empty">Sin leads</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.board {
  @include flex(row, flex-start, flex-start, 0.85rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1rem;
  margin-inline: -1rem;
  padding: 0.2rem 1rem 1rem;
  overscroll-behavior-x: contain;

  @include from('md') {
    margin-inline: 0;
    padding-inline: 0;
    scroll-snap-type: x proximity;
  }

  &__col {
    flex: 0 0 min(84vw, 300px);
    scroll-snap-align: start;
    background: rgba($sand, 0.7);
    border: 1.5px solid transparent;
    border-radius: 18px;
    padding: 0.7rem;
    min-height: 240px;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    @include from('md') {
      flex-basis: 272px;
    }

    &--over {
      border-color: $blue;
      background: $blue-soft;
    }
  }

  &__head {
    @include flex(row, center, flex-start, 0.5rem);
    padding: 0.25rem 0.35rem 0.75rem;

    h3 {
      flex: 1;
      font-family: $font-principal;
      font-size: 0.86rem;
      font-weight: 800;
      letter-spacing: 0;
    }
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent);
  }

  &__count {
    font-size: 0.74rem;
    font-weight: 800;
    color: $ink-soft;
    background: $surface;
    padding: 0.1rem 0.5rem;
    border-radius: $radius-pill;
  }

  &__list {
    @include flex(column, stretch, flex-start, 0.6rem);
  }

  &__sk {
    height: 120px;
    border-radius: 14px;
  }

  &__empty {
    font-size: 0.8rem;
    color: $ink-muted;
    text-align: center;
    padding: 1.4rem 0;
    border: 1.5px dashed $line-strong;
    border-radius: 14px;
  }
}
</style>
