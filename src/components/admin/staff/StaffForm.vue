<script setup lang="ts">
import { ref } from 'vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { roles, staffCopy as t } from '@/config/admin'
import { generatePassword } from '@/composables/admin/useStaff'
import { useToastStore } from '@/stores/toast'
import type { StaffInput } from '@/types/admin'

/** Alta o edición de una persona del equipo. Al editar, la contraseña es opcional. */
const props = defineProps<{ form: StaffInput & { password: string }; editing: boolean; self: boolean }>()
const toast = useToastStore()
const show = ref(!props.editing)

function generate() {
  props.form.password = generatePassword()
  show.value = true
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(props.form.password)
    toast.success(t.copied)
  } catch {
    /* sin portapapeles: la contraseña está visible para copiarla a mano */
  }
}
</script>

<template>
  <div class="sform">
    <div>
      <label for="st-name">{{ t.name }} *</label>
      <input id="st-name" v-model="form.name" type="text" autocomplete="off" />
    </div>
    <div>
      <label for="st-email">{{ t.email }} *</label>
      <input id="st-email" v-model="form.email" type="email" autocomplete="off" />
    </div>
    <PhoneInput id="st-phone" v-model="form.phone" :label="t.phone" />

    <div>
      <p class="sform__label">{{ t.role }}</p>
      <div class="sform__roles" role="radiogroup" :aria-label="t.role">
        <label
          v-for="(def, key) in roles"
          :key="key"
          class="sform__role"
          :class="{ 'sform__role--on': form.accountType === key, 'sform__role--off': self && key !== form.accountType }"
        >
          <input v-model="form.accountType" type="radio" name="st-role" :value="key" :disabled="self" class="visually-hidden" />
          <strong><i :class="def.icon"></i> {{ def.label }}</strong>
          <small>{{ t.roleHelp[key] }}</small>
        </label>
      </div>
    </div>

    <div>
      <label for="st-pass">{{ editing ? t.passwordNew : t.password }}{{ editing ? '' : ' *' }}</label>
      <div class="sform__pass">
        <input id="st-pass" v-model="form.password" :type="show ? 'text' : 'password'" autocomplete="new-password" minlength="8" />
        <button type="button" class="sform__eye" :aria-label="show ? t.hide : t.show" @click="show = !show">
          <i :class="show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
        </button>
      </div>
      <div class="sform__pass-tools">
        <button type="button" class="btn btn--ghost btn--sm" @click="generate"><i class="fa-solid fa-wand-magic-sparkles"></i> {{ t.generate }}</button>
        <button v-if="form.password" type="button" class="btn btn--ghost btn--sm" @click="copyPassword"><i class="fa-regular fa-copy"></i> {{ t.copyPassword }}</button>
      </div>
      <p class="sform__hint">{{ editing ? t.passwordKeep : t.passwordHint }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sform {
  @include flex(column, stretch, flex-start, 1.1rem);

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: $ink-soft;
    margin-bottom: 0.4rem;
  }

  &__roles {
    @include flex(column, stretch, flex-start, 0.5rem);

    @include from('sm') {
      flex-direction: row;
    }
  }

  &__role {
    flex: 1 1 0;
    margin: 0;
    padding: 0.75rem 0.85rem;
    border-radius: 14px;
    border: 1.5px solid $line;
    background: $surface;
    cursor: pointer;
    @include flex(column, flex-start, flex-start, 0.25rem);
    transition: all 0.2s ease;

    strong {
      font-size: 0.88rem;
      color: $ink;
      @include flex(row, center, flex-start, 0.4rem);
    }

    small {
      font-size: 0.74rem;
      font-weight: 500;
      color: $ink-muted;
      line-height: 1.35;
    }

    &--on {
      border-color: $blue;
      background: $blue-soft;
    }

    &--off {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-within {
      outline: 2px solid $blue;
      outline-offset: 2px;
    }
  }

  &__pass {
    position: relative;
    @include flex(row, center);

    input {
      padding-right: 3rem;
      font-family: ui-monospace, monospace;
    }
  }

  &__eye {
    position: absolute;
    right: 0.3rem;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    color: $ink-muted;

    &:hover {
      color: $ink;
    }
  }

  &__pass-tools {
    @include flex(row, center, flex-start, 0.4rem);
    margin-top: 0.5rem;
  }

  &__hint {
    font-size: 0.74rem;
    color: $ink-muted;
    margin-top: 0.4rem;
  }
}
</style>
