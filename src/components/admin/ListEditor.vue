<script setup lang="ts" generic="Item extends Record<string, any>">
import { copy } from '@/config/admin'

// Editor de arreglos: incluye/excluye, características, secciones de guía…
// El contenido de cada fila lo pinta el padre con el slot (item, index).
const props = defineProps<{
  modelValue: Item[] | undefined
  label: string
  create: () => Item
  addLabel?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: Item[]] }>()

const list = () => props.modelValue || []

function add() {
  emit('update:modelValue', [...list(), props.create()])
}

function remove(i: number) {
  emit('update:modelValue', list().filter((_, idx) => idx !== i))
}

function move(i: number, dir: -1 | 1) {
  const next = [...list()]
  const j = i + dir
  if (j < 0 || j >= next.length) return
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  emit('update:modelValue', next)
}

function update(i: number, value: Item) {
  emit('update:modelValue', list().map((it, idx) => (idx === i ? value : it)))
}
</script>

<template>
  <fieldset class="list">
    <legend class="list__label">{{ label }} <span class="list__count">{{ list().length }}</span></legend>
    <TransitionGroup name="rise" tag="ol" class="list__items">
      <li v-for="(item, i) in list()" :key="i" class="list__item">
        <span class="list__index">{{ i + 1 }}</span>
        <div class="list__content">
          <slot :item="item" :index="i" :update="(v: Item) => update(i, v)" />
        </div>
        <div class="list__tools">
          <button type="button" :disabled="i === 0" aria-label="Subir" @click="move(i, -1)">
            <i class="fa-solid fa-arrow-up"></i>
          </button>
          <button type="button" :disabled="i === list().length - 1" aria-label="Bajar" @click="move(i, 1)">
            <i class="fa-solid fa-arrow-down"></i>
          </button>
          <button type="button" class="list__del" :aria-label="copy.delete" @click="remove(i)">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </li>
    </TransitionGroup>
    <button type="button" class="list__add" @click="add">
      <i class="fa-solid fa-plus"></i> {{ addLabel || copy.add }}
    </button>
  </fieldset>
</template>

<style scoped lang="scss">
.list {
  border: 0;
  @include flex(column, stretch, flex-start, 0.55rem);

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__count {
    font-size: 0.7rem;
    background: $sand;
    border-radius: $radius-pill;
    padding: 0.05rem 0.45rem;
    margin-left: 0.25rem;
  }

  &__items {
    list-style: none;
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__item {
    @include flex(row, flex-start, flex-start, 0.6rem);
    background: $surface;
    border: 1px solid $line;
    border-radius: 12px;
    padding: 0.7rem;
  }

  &__index {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    background: $sand;
    color: $ink-muted;
    font-size: 0.7rem;
    font-weight: 800;
    @include flex(row, center, center);
    margin-top: 0.3rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
    @include flex(column, stretch, flex-start, 0.55rem);
  }

  &__tools {
    @include flex(column, center, flex-start, 0.15rem);

    button {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      color: $ink-muted;
      font-size: 0.78rem;

      &:hover:not(:disabled) {
        background: $sand;
        color: $ink;
      }

      &:disabled {
        opacity: 0.3;
      }
    }
  }

  &__del:hover {
    color: $danger !important;
    background: $danger-bg !important;
  }

  &__add {
    align-self: flex-start;
    @include flex(row, center, flex-start, 0.45rem);
    font-size: 0.85rem;
    font-weight: 700;
    color: $blue;
    padding: 0.5rem 0.8rem;
    border-radius: 10px;
    border: 1.5px dashed rgba($blue, 0.35);

    &:hover {
      background: $blue-soft;
    }
  }
}
</style>
