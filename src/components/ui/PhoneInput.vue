<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import {
  DIAL_COUNTRIES,
  countryByIso,
  fromE164,
  isValidNational,
  nationalDigits,
  toE164,
} from '@/utils/phone'

/**
 * Teléfono / WhatsApp en formato internacional obligatorio. El v-model es
 * siempre E.164 ("+593991234567") o "" si todavía no es válido, así ningún
 * formulario puede mandar un número a medias. Ecuador viene preseleccionado.
 */
const props = withDefaults(
  defineProps<{ id?: string; label?: string; invalid?: boolean; enterkeyhint?: 'next' | 'send' | 'done' }>(),
  { id: 'phone', label: '', invalid: false, enterkeyhint: 'next' },
)
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ blur: [] }>()
const { t, locale } = useI18n()

const initial = fromE164(model.value)
const iso = ref(initial.country.iso)
const text = ref(initial.national)
const touched = ref(false)

const country = computed(() => countryByIso(iso.value))
const national = computed(() => nationalDigits(text.value, country.value))
const valid = computed(() => isValidNational(national.value, country.value))
const showError = computed(() => (touched.value || props.invalid) && text.value !== '' && !valid.value)

const regionName = computed(() => {
  try {
    return new Intl.DisplayNames([locale.value], { type: 'region' })
  } catch {
    return null
  }
})

watch([national, country], () => {
  model.value = valid.value ? toE164(national.value, country.value) : ''
})

// Si el padre carga un número guardado (p. ej. al volver a un paso), se refleja.
watch(model, (v) => {
  if (!v || v === toE164(national.value, country.value)) return
  const parsed = fromE164(v)
  iso.value = parsed.country.iso
  text.value = parsed.national
})

function onBlur() {
  touched.value = true
  // Al salir del campo se muestra el número ya limpio (sin 0 ni espacios raros).
  if (valid.value) text.value = national.value
  emit('blur')
}
</script>

<template>
  <div class="phone" :class="{ 'phone--err': showError || invalid }">
    <label v-if="label" :for="id">{{ label }}</label>
    <div class="phone__row">
      <div class="phone__country">
        <span class="phone__dial" aria-hidden="true">{{ country.iso }} +{{ country.dial }}</span>
        <select v-model="iso" class="phone__select" :aria-label="t('common.phone.country')">
          <option v-for="c in DIAL_COUNTRIES" :key="c.iso" :value="c.iso">
            {{ regionName?.of(c.iso) || c.iso }} (+{{ c.dial }})
          </option>
        </select>
        <i class="fa-solid fa-chevron-down phone__chev" aria-hidden="true"></i>
      </div>
      <input
        :id="id"
        v-model="text"
        class="phone__input"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        :enterkeyhint="enterkeyhint"
        :placeholder="country.example"
        :aria-invalid="showError || invalid"
        :aria-describedby="`${id}-hint`"
        @blur="onBlur"
      />
    </div>
    <p :id="`${id}-hint`" class="phone__hint" :class="{ 'phone__hint--err': showError }">
      {{ showError ? t('common.phone.invalid', { example: country.example }) : t('common.phone.hint') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.phone {
  &__row {
    @include flex(row, stretch, flex-start, 0.5rem);
  }

  &__country {
    position: relative;
    flex: 0 0 auto;
    @include flex(row, center, flex-start);
    min-height: $tap;
    padding: 0 2rem 0 0.85rem;
    border: 1.5px solid $line;
    border-radius: $radius-sm;
    background: $surface;
    transition: border-color 0.25s ease;

    &:focus-within {
      border-color: $blue;
      box-shadow: 0 0 0 4px rgba($blue, 0.14);
    }
  }

  &__dial {
    font-weight: 800;
    font-size: 0.95rem;
    color: $ink;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  // El select nativo cubre la pastilla: en el teléfono abre la rueda del sistema.
  &__select {
    position: absolute;
    inset: 0;
    opacity: 0;
    min-height: 0;
    cursor: pointer;
  }

  &__chev {
    position: absolute;
    right: 0.75rem;
    font-size: 0.7rem;
    color: $ink-muted;
    pointer-events: none;
  }

  &__input {
    flex: 1;
    min-width: 0;
    font-variant-numeric: tabular-nums;
  }

  &--err &__input,
  &--err &__country {
    border-color: $danger;
  }

  &__hint {
    margin-top: 0.35rem;
    font-size: 0.76rem;
    color: $ink-muted;

    &--err {
      color: $danger;
      font-weight: 600;
    }
  }
}
</style>
