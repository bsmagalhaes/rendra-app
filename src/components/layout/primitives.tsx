import { Children, isValidElement, type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { cn } from '../../lib/cn'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import type { Align, Justify, Space } from './tokens'
import { alignClass, gapClass, justifyClass } from './tokens'

export type ContainerSize = 'narrow' | 'default' | 'full'

export interface ContainerProps extends ViewProps {
  size?: ContainerSize
  padded?: boolean
  children?: ReactNode
}

const containerSizeClass: Record<ContainerSize, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-none',
  full: 'max-w-none',
}

export function Container({ size = 'default', padded = false, className, children, ...rest }: ContainerProps) {
  return (
    <View
      className={cn('w-full min-w-0 px-4', padded && 'py-4', containerSizeClass[size], className)}
      {...rest}
    >
      {children}
    </View>
  )
}

export interface StackProps extends ViewProps {
  gap?: Space
  align?: Align
  children?: ReactNode
}

export function Stack({ gap = '4', align = 'stretch', className, children, ...rest }: StackProps) {
  return (
    <View className={cn('flex-col min-w-0', gapClass[gap], alignClass[align], className)} {...rest}>
      {children}
    </View>
  )
}

export type GridCols = 1 | 2 | 3 | 4 | 6
export type GridGap = '0' | '2' | '4' | '6' | '8' | '12' | '16' | '24'

interface GridHalfGap {
  margin: string
  padding: string
}

// Metade de cada degrau de gap, na mesma escala de espaço (0,1,2,3,4,6,8,12 em unidades de 4px):
// gap '4' (16px) -> metade 8px -> escala '2' -> '-mx-2'/'px-2' (valor citado no briefing).
const gridHalfGapClass: Record<GridGap, GridHalfGap> = {
  '0': { margin: '-mx-0', padding: 'px-0' },
  '2': { margin: '-mx-1', padding: 'px-1' },
  '4': { margin: '-mx-2', padding: 'px-2' },
  '6': { margin: '-mx-3', padding: 'px-3' },
  '8': { margin: '-mx-4', padding: 'px-4' },
  '12': { margin: '-mx-6', padding: 'px-6' },
  '16': { margin: '-mx-8', padding: 'px-8' },
  '24': { margin: '-mx-12', padding: 'px-12' },
}

// Espaço vertical entre linhas do Grid quando ele quebra: valor cheio do degrau (não a metade,
// a técnica de margem negativa acima resolve só o espaço horizontal).
const gridGapYClass: Record<GridGap, string> = {
  '0': 'gap-y-0',
  '2': 'gap-y-2',
  '4': 'gap-y-4',
  '6': 'gap-y-6',
  '8': 'gap-y-8',
  '12': 'gap-y-12',
  '16': 'gap-y-16',
  '24': 'gap-y-24',
}

export interface GridProps extends ViewProps {
  cols?: GridCols
  gap?: GridGap
  children?: ReactNode
}

export function Grid({ cols = 1, gap = '4', className, children, ...rest }: GridProps) {
  const halfGap = gridHalfGapClass[gap]
  const items = Children.toArray(children).filter(isValidElement)
  const widthPercent = `${100 / cols}%` as `${number}%`

  return (
    <View className={cn('flex-row flex-wrap', halfGap.margin, gridGapYClass[gap], className)} {...rest}>
      {items.map((child, index) => (
        <View key={index} className={halfGap.padding} style={{ width: widthPercent }}>
          {child}
        </View>
      ))}
    </View>
  )
}

export interface InlineProps extends ViewProps {
  gap?: Space
  align?: Align
  justify?: Justify
  wrap?: boolean
  children?: ReactNode
}

export function Inline({
  gap = '2',
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  children,
  ...rest
}: InlineProps) {
  return (
    <View
      className={cn('flex-row min-w-0', wrap && 'flex-wrap', alignClass[align], gapClass[gap], justifyClass[justify], className)}
      {...rest}
    >
      {children}
    </View>
  )
}

export interface SectionProps extends ViewProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  gap?: Space
  children?: ReactNode
}

export function Section({ title, description, actions, gap = '4', className, children, ...rest }: SectionProps) {
  const showHeader = Boolean(title || actions)

  return (
    <View className={cn('flex-col min-w-0', gapClass[gap], className)} {...rest}>
      {showHeader && (
        <View className="flex-col gap-3">
          {(title || description) && (
            <View className="flex-col gap-1">
              {title && (
                <Text weight="semibold" accessibilityRole={a11yPresets.header.accessibilityRole} className="text-xl text-foreground">
                  {title}
                </Text>
              )}
              {description && <Text className="text-sm text-muted-foreground">{description}</Text>}
            </View>
          )}
          {actions && <View className="flex-row flex-wrap gap-2">{actions}</View>}
        </View>
      )}
      {children}
    </View>
  )
}
