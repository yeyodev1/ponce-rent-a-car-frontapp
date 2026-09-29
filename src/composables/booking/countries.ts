/**
 * Países para "país de residencia". Los más frecuentes entre los clientes van
 * arriba; el resto, ordenado alfabéticamente en el idioma de la página.
 * Los nombres salen de Intl.DisplayNames: nada que traducir a mano.
 */

export const FREQUENT_COUNTRIES = ['EC', 'US', 'CO', 'PE', 'ES', 'CA', 'MX', 'AR', 'CL', 'VE']

const ALL = (
  'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO ' +
  'CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ' +
  'ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH ' +
  'MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PR PS PT PW PY QA RO RS RU RW ' +
  'SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC ' +
  'VE VN VU WS YE ZA ZM ZW'
).split(' ')

export interface CountryOption {
  code: string
  name: string
}

export function countryOptions(locale: 'es' | 'en') {
  const lang = locale === 'en' ? 'en' : 'es'
  let names: Intl.DisplayNames | null = null
  try {
    names = new Intl.DisplayNames([lang], { type: 'region' })
  } catch {
    names = null
  }
  const nameOf = (code: string) => names?.of(code) || code
  const frequent: CountryOption[] = FREQUENT_COUNTRIES.map((code) => ({ code, name: nameOf(code) }))
  const rest: CountryOption[] = ALL.filter((c) => !FREQUENT_COUNTRIES.includes(c))
    .map((code) => ({ code, name: nameOf(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, lang))
  return { frequent, rest }
}

/** Prefijo telefónico sugerido al cambiar de país (solo los frecuentes). */
export const DIAL_CODES: Record<string, string> = {
  EC: '+593',
  US: '+1',
  CA: '+1',
  CO: '+57',
  PE: '+51',
  ES: '+34',
  MX: '+52',
  AR: '+54',
  CL: '+56',
  VE: '+58',
}
