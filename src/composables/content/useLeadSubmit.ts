import { publicService } from '@/services/public.service'
import { getAttribution, track } from '@/composables/useAnalytics'
import { useI18n } from '@/i18n'
import type { LeadInput, LeadSource } from '@/types'

/**
 * Envío de leads desde los formularios de contenido: siempre con idioma,
 * atribución de campaña y el evento de analítica, para que ningún formulario
 * se olvide de medir de dónde vino el contacto.
 */
export function useLeadSubmit(source: LeadSource) {
  const { locale } = useI18n()

  async function send(fields: Omit<LeadInput, 'source' | 'language'>) {
    const lead = await publicService.saveLead({
      ...fields,
      source,
      language: locale.value,
      channel: fields.channel || 'form',
      attribution: getAttribution(),
    })
    track('lead_form_submit', { source })
    return lead
  }

  return { send }
}
