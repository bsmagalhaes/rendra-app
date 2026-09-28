/**
 * Nomes próprios do tema Rendra (item H2/H3 do levantamento da Sincronização 1), usados pela
 * regra R14 (`check:rules`) para achar variável do tema referenciada sem o prefixo `--rendra-`.
 * Copiado em intenção do `scripts/lib/var-prefix.ts` do design system web
 * (`https://github.com/bsmagalhaes/rendra-design-system`), sem a lista `TAILWIND_NAMESPACE` (no
 * web ela isenta `radius-*`/`shadow-*`, que no app são nomes próprios, não do Tailwind), e com os
 * nomes específicos do app: `shape-*` (raio por papel), `shadow-opacity-*`, `label-*`/`help-*`
 * (rótulo e orientação do campo, item A2), e os nomes antigos `radius-*` (achado C17 do veredito
 * do Opus: precisam continuar na lista para R14 acusar qualquer sobra da renomeação do Bloco 3).
 */

export const RENDRA_VAR_EXACT = new Set([
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'muted', 'muted-foreground', 'border', 'input', 'field', 'ring', 'overlay',
  'primary', 'primary-hover', 'primary-foreground', 'primary-hover-foreground',
  'primary-soft', 'primary-soft-foreground', 'primary-text',
  'secondary', 'secondary-hover', 'secondary-foreground', 'secondary-hover-foreground',
  'accent', 'accent-foreground',
  'destructive', 'destructive-hover', 'destructive-foreground', 'destructive-soft', 'destructive-soft-foreground',
  'success', 'success-foreground', 'success-soft', 'success-soft-foreground',
  'warning', 'warning-foreground', 'warning-soft', 'warning-soft-foreground',
  'info', 'info-foreground', 'info-soft', 'info-soft-foreground',
  'sidebar', 'sidebar-foreground', 'sidebar-muted-foreground', 'sidebar-active-foreground', 'sidebar-indicator',
  'sidebar-border', 'sidebar-accent', 'sidebar-active', 'sidebar-image',
  'gradient-brand-foreground', 'gradient-brand', 'gradient-accent', 'gradient-soft',
  'background-image', 'shadow-color',
  // Nomes antigos (pré-renomeação do Bloco 3), mantidos só para R14 acusar sobra.
  'radius-control', 'radius-item', 'radius-surface', 'radius-block', 'radius-avatar',
])

export const RENDRA_VAR_PREFIXES = ['chart-', 'shape-', 'shadow-opacity-', 'label-', 'help-']

/** Verdadeiro quando `name` (sem os dois hífens de abertura, ex. "primary" de "--primary") é um
 *  nome próprio do tema Rendra, prefixado ou não. */
export function isRendraOwnVar(name: string): boolean {
  if (RENDRA_VAR_EXACT.has(name)) return true
  return RENDRA_VAR_PREFIXES.some((prefix) => name.startsWith(prefix))
}
