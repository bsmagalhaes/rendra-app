import { useId } from 'react'
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from 'react-native-svg'
import { cssInterop } from 'nativewind'
import { useBrand } from '../../brand/use-brand'
import type { Palette } from '../../brand/palette'

cssInterop(Svg, { className: 'style' })

export interface GradientProps {
  token: 'brand' | 'soft' | 'accent'
  className?: string
}

/**
 * Função pura que devolve as cores de cada parada do gradiente, sem montar nenhum `Svg`.
 * Correção da rodada 4 de validação (bloqueadora 2): o `Stop` do react-native-svg renderiza
 * `null` (sem nó host), então nenhum teste consegue localizar `testID` num `<Stop>`; esta função
 * é o único ponto usado para conferir cor, testado em `gradient-stops.test.ts`.
 */
export function gradientStops(palette: Palette, mode: 'light' | 'dark', token: GradientProps['token']): string[] {
  const vars = mode === 'light' ? palette.light : palette.dark
  const seeds = palette.seeds
  if (token === 'brand') return [...seeds.gradient]
  if (token === 'soft') return [vars['--primary-soft']!, mode === 'light' ? '#ffffff' : vars['--card']!]
  return [seeds.primary, seeds.secondary]
}

export function Gradient({ token, className }: GradientProps) {
  const { palette, resolvedMode } = useBrand()
  // useId() do React 19 pode incluir ':' e outros separadores; um id de SVG usado em url(#id)
  // e em atributo `id` precisa ser só [a-zA-Z0-9_-], por isso a whitelist em vez de excluir só ':'.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  if (token === 'brand') {
    const [g0, g1, g2] = gradientStops(palette, resolvedMode, token)
    return (
      <Svg testID={`gradient-${id}`} className={className}>
        <Defs>
          <RadialGradient id={id} cx="80%" cy="0%" rx="120%" ry="120%">
            <Stop offset="0%" stopColor={g0} />
            <Stop offset="45%" stopColor={g1} />
            <Stop offset="100%" stopColor={g2} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    )
  }

  if (token === 'soft') {
    // Correção pós-validação (item recomendado 5): antes duplicava aqui a mesma lógica de
    // gradientStops (leitura de --primary-soft/--card, sem depender de nenhuma outra fonte).
    const [stop0, stop1] = gradientStops(palette, resolvedMode, token)
    return (
      <Svg testID={`gradient-${id}`} className={className}>
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={stop0} />
            <Stop offset="65%" stopColor={stop1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    )
  }

  // accent
  const [a0, a1] = gradientStops(palette, resolvedMode, token)
  return (
    <Svg testID={`gradient-${id}`} className={className}>
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={a0} />
          <Stop offset="100%" stopColor={a1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  )
}
