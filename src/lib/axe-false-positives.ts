/**
 * Formato mínimo (estrutural) de uma violação e de um nó do `axe-core` que este arquivo precisa
 * ler; evita importar `@axe-core/playwright`/`axe-core` (dependências de `e2e/`) num arquivo de
 * `src/lib`. `AxeResults['violations'][number]` (usado em `e2e/a11y.spec.ts`) satisfaz este tipo
 * estruturalmente.
 */
export interface AxeCheckResultLike {
  data?: { fgColor?: string } | null
}

export interface AxeNodeResultLike {
  html: string
  any: AxeCheckResultLike[]
}

export interface AxeViolationLike {
  id: string
  impact?: string | null
  nodes: AxeNodeResultLike[]
}

/** Cor do cinza fixo do preflight do Tailwind (`input`/`textarea::placeholder`), o falso positivo. */
const PREFLIGHT_PLACEHOLDER_GRAY = '#9ca3af'

/**
 * axe-core (regra `color-contrast`) mede a cor do `::placeholder` com uma heurística que não
 * resolve corretamente `color: var(--placeholderTextColor)` (o mecanismo usado por
 * `placeholderTextColor` do `TextInput`) combinado com a especificidade entre essa regra e
 * `input::placeholder`/`textarea::placeholder` do preflight do Tailwind: o axe sempre reporta a
 * cor do preflight (`#9ca3af`), mesmo quando o valor REAL renderizado (comprovado por
 * `getComputedStyle(el, '::placeholder').color` num Chromium real, fora do axe) já usa
 * `--muted-foreground`, garantido 4,5:1 de contraste por `reach(...)` (`src/brand/palette.ts`).
 *
 * Melhoria 4 do veredito do fechamento (Fable): o filtro original só conferia a FORMA do nó
 * (`input`/`textarea` com `placeholder`), largo demais — um `color-contrast` genuíno num
 * placeholder com outra cor ruim também seria descartado sem querer. Agora também exige que a
 * cor de primeiro plano relatada pelo axe (`data.fgColor`) seja exatamente o cinza do preflight;
 * qualquer outra cor continua bloqueando o teste normalmente.
 */
export function isPlaceholderContrastFalsePositive(violation: AxeViolationLike): boolean {
  if (violation.id !== 'color-contrast') return false
  return violation.nodes.every((node) => {
    const isPlaceholderNode = /^<(input|textarea)\b/.test(node.html) && /\bplaceholder=/.test(node.html)
    if (!isPlaceholderNode) return false
    const fgColor = node.any.find((check) => typeof check.data?.fgColor === 'string')?.data?.fgColor
    return fgColor?.toLowerCase() === PREFLIGHT_PLACEHOLDER_GRAY
  })
}

export function blockingViolations<V extends AxeViolationLike>(violations: V[]): V[] {
  return violations.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && !isPlaceholderContrastFalsePositive(v))
}
