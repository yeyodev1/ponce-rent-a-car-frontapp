import { ref } from 'vue'
import { t } from '@/i18n'
import type { DurationBucket } from '@/types'
import { all, rules, useForm } from './useForm'
import { useLeadSubmit } from './useLeadSubmit'

export const DURATIONS: DurationBucket[] = ['1', '2-3', '4-7', '8-15', '16-30', '30+']

/** Formulario corporativo → lead "corporate" (el backend le pone la etiqueta). */
export function useBusinessForm() {
  const { send } = useLeadSubmit('corporate')
  const code = ref('')

  const f = useForm(
    {
      company: '',
      name: '',
      phone: '',
      email: '',
      vehicles: '',
      duration: '' as DurationBucket | '',
      comments: '',
    },
    {
      company: rules.required,
      name: rules.required,
      phone: rules.e164,
      email: all(rules.required, rules.email),
      vehicles: (v) => {
        const n = Number(v)
        return Number.isInteger(n) && n >= 1 && n <= 500 ? '' : t('content.form.vehiclesError')
      },
      duration: rules.required,
    },
    'business-form',
  )

  function onSubmit() {
    return f.submit(async () => {
      const lead = await send({
        company: f.form.company.trim(),
        name: f.form.name.trim(),
        phone: f.form.phone,
        email: f.form.email.trim(),
        vehicles: Number(f.form.vehicles),
        duration: (f.form.duration || undefined) as DurationBucket | undefined,
        comments: f.form.comments.trim(),
      })
      code.value = lead.code
    })
  }

  return { ...f, code, onSubmit }
}
