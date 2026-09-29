/**
 * Limites de texto orientativo (regra R14 do briefing/regra R15 do `check:rules`, item H2 do
 * levantamento da Sincronização 1), adaptados do design system web
 * (`https://github.com/bsmagalhaes/rendra-ui-web`, `scripts/lib/help-length.ts`).
 */

export const HELP_LIMITS = {
  full: 150,
  xl: 100,
  lg: 70,
  md: 40,
  half: 40,
  sm: 30,
  xs: 20,
} as const

export type HelpSpan = keyof typeof HELP_LIMITS

export const PAGE_DESCRIPTION_LIMIT = 150

export const INSTRUCTION_VERBS = [
  'Comece', 'Clique', 'Toque', 'Arraste', 'Preencha', 'Use', 'Escolha', 'Selecione', 'Digite', 'Informe', 'Veja', 'Confira',
]

/** Limite do texto de ajuda pelo `span` do campo; sem `span` (ou span desconhecido), `md` (40). */
export function helpLimit(span?: string): number {
  const key = (span as HelpSpan | undefined) ?? 'md'
  return HELP_LIMITS[key] ?? HELP_LIMITS.md
}
