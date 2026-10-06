<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { contractCopy } from '@/config/admin/contract'
import type { ContractVariable } from '@/types/contract'
import ContractVariables from './ContractVariables.vue'

/** Editor bilingüe: pestañas ES/EN, título, cuerpo y variables que se insertan en el cursor. */
defineProps<{ variables: ContractVariable[] }>()
const lang = defineModel<'es' | 'en'>('lang', { required: true })
const title = defineModel<{ es: string; en: string }>('title', { required: true })
const body = defineModel<{ es: string; en: string }>('body', { required: true })
const c = contractCopy.templates
const area = ref<HTMLTextAreaElement | null>(null)

async function insert(key: string) {
  const el = area.value
  const token = `{{${key}}}`
  const text = body.value[lang.value]
  const start = el ? el.selectionStart : text.length
  const end = el ? el.selectionEnd : text.length
  body.value = { ...body.value, [lang.value]: text.slice(0, start) + token + text.slice(end) }
  await nextTick()
  if (el) {
    el.focus()
    el.setSelectionRange(start + token.length, start + token.length)
  }
}

function setTitle(value: string) {
  title.value = { ...title.value, [lang.value]: value }
}

function setBody(value: string) {
  body.value = { ...body.value, [lang.value]: value }
}
</script>

<template>
  <div class="ceditor">
    <div class="ceditor__tabs" role="tablist">
      <button
        v-for="l in (['es', 'en'] as const)"
        :key="l"
        type="button"
        role="tab"
        class="ceditor__tab"
        :class="{ 'ceditor__tab--on': lang === l }"
        :aria-selected="lang === l"
        @click="lang = l"
      >
        {{ l === 'es' ? c.es : c.en }}
      </button>
    </div>

    <div>
      <label for="ct-title">{{ c.titleLabel }}</label>
      <input id="ct-title" :value="title[lang]" type="text" maxlength="200" @input="setTitle(($event.target as HTMLInputElement).value)" />
    </div>

    <div>
      <label for="ct-body">{{ c.bodyLabel }}</label>
      <textarea
        id="ct-body"
        ref="area"
        class="ceditor__area"
        :value="body[lang]"
        rows="22"
        spellcheck="true"
        :lang="lang"
        @input="setBody(($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <p class="ceditor__hint">{{ c.bodyHint }}</p>
    </div>

    <details class="ceditor__vars" open>
      <summary><i class="fa-solid fa-code"></i> {{ c.variables }}</summary>
      <ContractVariables :variables="variables" @insert="insert" />
    </details>
  </div>
</template>

<style scoped lang="scss">
.ceditor {
  @include flex(column, stretch, flex-start, 0.9rem);

  label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: $ink-soft;
    margin-bottom: 0.35rem;
  }

  &__tabs {
    @include flex(row, center, flex-start, 0.3rem);
    padding: 4px;
    border-radius: $radius-pill;
    background: $sand;
    width: fit-content;
  }

  &__tab {
    min-height: 36px;
    padding: 0.3rem 1rem;
    border-radius: $radius-pill;
    font-size: 0.82rem;
    font-weight: 700;
    color: $ink-soft;

    &--on {
      background: $surface;
      color: $ink;
      box-shadow: $shadow-sm;
    }
  }

  &__area {
    min-height: 360px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.82rem;
    line-height: 1.6;
    resize: vertical;
  }

  &__hint {
    margin-top: 0.35rem;
    font-size: 0.75rem;
    color: $ink-muted;
  }

  &__vars {
    border: 1px solid $line;
    border-radius: 12px;
    padding: 0.7rem 0.9rem;
    background: $paper;

    summary {
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 800;
      color: $ink;
      margin-bottom: 0.6rem;

      i {
        color: $blue;
        margin-right: 0.3rem;
      }
    }
  }
}
</style>
