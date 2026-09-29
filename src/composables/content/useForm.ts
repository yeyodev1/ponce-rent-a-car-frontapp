import { nextTick, reactive, ref } from 'vue'
import { t } from '@/i18n'
import { isE164 } from '@/utils/phone'

type Validator<T> = (value: T[keyof T], form: T) => string

export const rules = {
  required: (v: unknown) => (String(v ?? '').trim() ? '' : t('common.errors.required')),
  email: (v: unknown) => {
    const s = String(v ?? '').trim()
    return !s || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? '' : t('common.errors.email')
  },
  /** El PhoneInput compartido entrega E.164 o "" mientras el número no sea válido. */
  e164: (v: unknown) => (isE164(String(v ?? '')) ? '' : t('common.errors.phone')),
  phone: (v: unknown) => {
    const digits = String(v ?? '').replace(/\D/g, '')
    return !digits || (digits.length >= 7 && digits.length <= 15) ? '' : t('common.errors.phone')
  },
}

/** Encadena validadores: devuelve el primer error. */
export function all(...fns: ((v: unknown) => string)[]) {
  return (v: unknown) => fns.map((f) => f(v)).find(Boolean) || ''
}

/**
 * Estado de un formulario con validación en línea: valida al salir del campo y
 * vuelve a validar mientras se corrige, sin gritar antes de tiempo.
 */
export function useForm<T extends Record<string, unknown>>(
  initial: T,
  validators: Partial<Record<keyof T, Validator<T>>>,
  formId: string,
) {
  const form = reactive({ ...initial }) as T
  const errors = reactive<Record<string, string>>({})
  const submitting = ref(false)
  const apiError = ref('')
  const done = ref(false)

  function validateField(key: keyof T) {
    const fn = validators[key]
    const k = key as string
    errors[k] = fn ? fn(form[key], form) : ''
    return !errors[k]
  }

  /** Revalida solo si el campo ya mostraba error: feedback al corregir. */
  function revalidate(key: keyof T) {
    if (errors[key as string]) validateField(key)
  }

  function validate() {
    return (Object.keys(validators) as (keyof T)[]).map(validateField).every(Boolean)
  }

  async function focusFirstError() {
    await nextTick()
    const el = document.querySelector<HTMLElement>(`#${formId} [aria-invalid="true"]`)
    el?.focus()
  }

  async function submit(action: () => Promise<void>) {
    apiError.value = ''
    if (!validate()) return focusFirstError()
    submitting.value = true
    try {
      await action()
      done.value = true
    } catch (e) {
      apiError.value = (e as { message?: string }).message || t('common.errors.generic')
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, initial)
    for (const k of Object.keys(errors)) errors[k] = ''
    done.value = false
    apiError.value = ''
  }

  return {
    form,
    errors: errors as Readonly<Partial<Record<keyof T, string>>>,
    submitting,
    apiError,
    done,
    validateField,
    revalidate,
    submit,
    reset,
  }
}
