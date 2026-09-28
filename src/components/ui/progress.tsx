import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Gradient } from '../gradient/gradient'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../lib/reduced-motion'

export type ProgressTone = 'primary' | 'brand' | 'success' | 'warning' | 'error'

export interface ProgressProps {
  value?: number | null
  size?: 'sm' | 'md'
  tone?: ProgressTone
  showValue?: boolean
  accessibilityLabel?: string
  className?: string
}

// B2 (veredito do Opus): `width` de useAnimatedStyle exige DimensionValue; `string` genérico
// não compila sob strict. O tipo de retorno usa o literal contextual `${number}%` (mesmo padrão
// de brand-feedback-icon.tsx:107-111).
export function progressWidth(value: number | null | undefined): `${number}%` {
  'worklet'
  if (value == null) return '0%'
  return `${Math.min(100, Math.max(0, value))}%`
}

const toneClass: Record<Exclude<ProgressTone, 'brand'>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
}

export function Progress({
  value,
  size = 'md',
  tone = 'primary',
  showValue = false,
  accessibilityLabel,
  className,
}: ProgressProps) {
  const determinate = value != null
  const clamped = determinate ? Math.min(100, Math.max(0, value as number)) : 0
  const reducedMotion = useReducedMotion()
  const indeterminateLeft = useSharedValue(0)
  // C3 (veredito do Opus): a largura determinada anima (contrato §12.19, transition 300ms). O
  // primeiro render já nasce no valor clampado (useSharedValue(clamped)); mudanças seguintes
  // animam via withTiming.
  const width = useSharedValue(clamped)

  useEffect(() => {
    if (determinate) return
    if (reducedMotion) {
      cancelAnimation(indeterminateLeft)
      indeterminateLeft.set(0)
      return
    }
    indeterminateLeft.set(withRepeat(withTiming(66, { duration: 1000 }), -1, true))
    return () => cancelAnimation(indeterminateLeft)
  }, [determinate, reducedMotion, indeterminateLeft])

  useEffect(() => {
    if (!determinate) return
    width.set(withTiming(clamped, { duration: reducedMotion ? 0 : 300 }))
  }, [determinate, clamped, reducedMotion, width])

  const animated = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: determinate ? 0 : `${indeterminateLeft.get()}%`,
    top: 0,
    height: '100%',
    width: determinate ? progressWidth(width.get()) : ('33.333%' as const),
  }))

  const now = determinate ? Math.round(clamped) : undefined

  return (
    <View className="flex-row min-w-0 items-center gap-3">
      <View
        accessible
        dataSet={{ rendra: 'PROG-001' }}
        accessibilityRole={a11yPresets.progressbar.accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: 0, max: 100, now }}
        aria-valuenow={now}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-muted',
          size === 'sm' ? 'h-1' : 'h-2',
          className,
        )}
      >
        <Animated.View style={animated}>
          {tone === 'brand' ? (
            <Gradient token="accent" className="size-full" />
          ) : (
            <View className={cn('size-full rounded-full', toneClass[tone])} />
          )}
        </Animated.View>
      </View>
      {showValue && determinate ? (
        <Text weight="medium" className="w-12 text-right text-xs text-muted-foreground">
          {`${now}%`}
        </Text>
      ) : null}
    </View>
  )
}
