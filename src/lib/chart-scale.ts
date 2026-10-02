/**
 * Escala, ticks e formas puras do `Chart` (F3). Sem dependencia: nem `d3-scale` (que arrastaria
 * cinco pacotes `d3-*`) nem `d3-shape`, que so entra no componente. As formulas do gauge e do
 * funil sao as do design system web (`https://github.com/bsmagalhaes/rendra-ui-web`,
 * `src/components/ui/chart.tsx`), copiadas para ca em JS puro.
 */

/** Degraus "bonitos" da escala de ticks, em multiplos de potencia de dez. */
const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

const limpar = (n: number) => Number(n.toFixed(10))

/**
 * `count` ticks igualmente espacados a partir de `min`, com o degrau arredondado para um valor
 * bonito; o ultimo tick pode passar de `max` (o dominio cresce ate o proximo degrau). Com
 * `integer` (padrao) o degrau nunca fica abaixo de 1, o equivalente do `allowDecimals={false}`
 * do eixo do web.
 */
export function niceTicks(min: number, max: number, count: number, integer = true): number[] {
  if (count < 2) return [min, max]
  if (max === min) return [min]
  const raw = (max - min) / (count - 1)
  const base = 10 ** Math.floor(Math.log10(raw))
  const fracao = raw / base
  const nice = NICE_STEPS.find((passo) => passo >= fracao - 1e-9) ?? 10
  let step = nice * base
  if (integer) step = Math.max(1, Math.ceil(step))
  const inicio = Math.floor(min / step) * step
  return Array.from({ length: count }, (_, i) => limpar(inicio + i * step))
}

/** Mapeia o dominio para o intervalo; com dominio nulo devolve o ponto medio do intervalo. */
export function linearScale(domain: [number, number], range: [number, number]): (valor: number) => number {
  const [d0, d1] = domain
  const [r0, r1] = range
  if (d1 === d0) return () => (r0 + r1) / 2
  return (valor) => r0 + ((valor - d0) / (d1 - d0)) * (r1 - r0)
}

export type GaugeTone = 'error' | 'warning' | 'success' | 'primary' | 'neutral'

export interface GaugeZone {
  /** Limite superior da zona, de 0 a 1. */
  to: number
  tone: GaugeTone
}

const GAUGE_CENTER = 120
const GAUGE_RADIUS = 100

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** Ponto do meio circulo (centro 120,120, raio 100) para a fracao `frac` (0 = esquerda, 1 = direita). */
export function gaugePoint(frac: number, radius = GAUGE_RADIUS): { x: number; y: number } {
  const angulo = Math.PI * (1 - clamp01(frac))
  return {
    x: GAUGE_CENTER + radius * Math.cos(angulo),
    y: GAUGE_CENTER - radius * Math.sin(angulo),
  }
}

/** Caminho SVG do arco do gauge entre duas fracoes (nunca passa de meia volta, sem `large-arc`). */
export function gaugeArcPath(from: number, to: number, radius = GAUGE_RADIUS): string {
  const a = gaugePoint(from, radius)
  const b = gaugePoint(to, radius)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

/** Primeira zona cujo limite alcanca a fracao; acima de todas, a ultima. */
export function zoneFor(frac: number, zones: GaugeZone[]): GaugeZone {
  return zones.find((zona) => frac <= zona.to) ?? zones[zones.length - 1]!
}

/** Largura relativa (0..1) da etapa `i` de `n` do funil: `1 - (i / n) * 0.54`. */
export function funnelWidth(i: number, n: number): number {
  return 1 - (i / n) * 0.54
}

/** Empilha as series de cada linha: `{ a: [0, 10], b: [10, 15] }`. Valor ausente ou nao numerico vale zero. */
export function stackSeries(
  rows: readonly Record<string, unknown>[],
  keys: string[],
): Record<string, [number, number]>[] {
  return rows.map((row) => {
    let acumulado = 0
    const empilhada: Record<string, [number, number]> = {}
    for (const key of keys) {
      const valor = typeof row[key] === 'number' ? (row[key] as number) : 0
      empilhada[key] = [acumulado, acumulado + valor]
      acumulado += valor
    }
    return empilhada
  })
}

/** Indice da categoria sob o toque em `x`, numa area de `width` dividida em `n` faixas iguais. */
export function categoryAt(x: number, width: number, n: number): number {
  if (width <= 0 || n <= 0) return 0
  return Math.min(n - 1, Math.max(0, Math.floor((x / width) * n)))
}

/** Angulo inicial e final (radianos) de cada fatia da pizza; total zero gera fatias vazias. */
export function pieAngles(values: number[]): { start: number; end: number }[] {
  const total = values.reduce((soma, v) => soma + v, 0)
  let acumulado = 0
  return values.map((v) => {
    const start = acumulado
    acumulado += total > 0 ? (v / total) * Math.PI * 2 : 0
    return { start, end: acumulado }
  })
}
