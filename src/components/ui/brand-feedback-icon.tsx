import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated'
import { cssInterop } from 'nativewind'
import Svg, { Circle, Path } from 'react-native-svg'
import { useBrand } from '../../brand/use-brand'
import type { FeedbackType } from '../../brand/types'
import { useReducedMotion } from '../../lib/reduced-motion'
import { cn } from '../../lib/cn'

// Mesmo padrão de gradient.tsx:6: o Svg só resolve `currentColor` a partir do próprio `style.color`,
// então className com cor só tem efeito no Svg se o cssInterop mapear className -> style neste componente.
cssInterop(Svg, { className: 'style' })

export type FeedbackIconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface BrandFeedbackIconProps {
  type: FeedbackType
  size?: FeedbackIconSize
  label?: string
  animated?: boolean
  className?: string
  testID?: string
}

export const feedbackLabels: Record<FeedbackType, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Atenção',
  info: 'Informação',
}

export const colorClass: Record<FeedbackType, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
}
const badgeBgClass: Record<FeedbackType, string> = {
  success: 'bg-success',
  error: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-info',
}
const badgeForegroundClass: Record<FeedbackType, string> = {
  success: 'text-success-foreground',
  error: 'text-destructive-foreground',
  warning: 'text-warning-foreground',
  info: 'text-info-foreground',
}
const sizeClass: Record<FeedbackIconSize, string> = {
  sm: 'size-icon-sm',
  md: 'size-icon-md',
  lg: 'size-icon-lg',
  xl: 'size-12',
  '2xl': 'size-16',
}
const glyphPath: Record<FeedbackType, string> = {
  success: 'M3 6.2 5.1 8.2 9 4',
  error: 'M4 4l4 4M8 4 4 8',
  warning: 'M6 3.2v3.3M6 8.8v0',
  info: 'M6 3.2v0M6 5.5v3.3',
}

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1)
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1)
const EASE_SPRING = Easing.bezier(0.34, 1.56, 0.64, 1)

const AnimatedPath = Animated.createAnimatedComponent(Path)

export function BrandFeedbackIcon({ type, size = 'md', label, animated = false, className, testID }: BrandFeedbackIconProps) {
  const { brand } = useBrand()
  const reducedMotion = useReducedMotion()
  const playAnimation = animated && !reducedMotion

  const symbolOpacity = useSharedValue(playAnimation ? 0 : 1)
  const symbolScale = useSharedValue(playAnimation ? 0.4 : 1)
  const badgeOpacity = useSharedValue(playAnimation ? 0 : 1)
  const badgeScale = useSharedValue(playAnimation ? 0.4 : 1)
  const strokeDashoffset = useSharedValue(playAnimation ? 1 : 0)
  const shakeX = useSharedValue(0)

  // pop: 0.4 -> 1.12 (60% do tempo) -> 1 (40% restante), spec:304
  const pop = () => withSequence(withTiming(1.12, { duration: 252, easing: EASE_SPRING }), withTiming(1, { duration: 168, easing: EASE_SPRING }))

  useEffect(() => {
    if (!playAnimation) return
    symbolOpacity.value = withTiming(1, { duration: 420, easing: EASE_SPRING })
    symbolScale.value = pop()
    badgeOpacity.value = withDelay(120, withTiming(1, { duration: 420, easing: EASE_SPRING }))
    badgeScale.value = withDelay(120, pop())
    strokeDashoffset.value = withDelay(200, withTiming(0, { duration: 420, easing: EASE_OUT }))
    if (type === 'error') {
      shakeX.value = withDelay(
        620,
        withSequence(
          withTiming(-8, { duration: 84, easing: EASE_IN_OUT }),
          withTiming(8, { duration: 84, easing: EASE_IN_OUT }),
          withTiming(-8, { duration: 84, easing: EASE_IN_OUT }),
          withTiming(8, { duration: 84, easing: EASE_IN_OUT }),
          withTiming(0, { duration: 84, easing: EASE_IN_OUT }),
        ),
      )
    }
  }, [playAnimation, type, symbolOpacity, symbolScale, badgeOpacity, badgeScale, strokeDashoffset, shakeX])

  // Animated.View leva só style (opacity/transform, mais width/height 100% para manter a árvore de
  // percentuais definida sem className); as classes de cor, tamanho e posição ficam em View/Svg internos.
  const symbolStyle = useAnimatedStyle(() => ({
    opacity: symbolOpacity.value,
    transform: [{ scale: symbolScale.value }],
    width: '100%',
    height: '100%',
  }))
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }))
  const wrapperStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }))
  const glyphAnimatedProps = useAnimatedProps(() => ({ strokeDashoffset: strokeDashoffset.value }))

  return (
    <Animated.View style={wrapperStyle}>
      <View
        testID={testID}
        dataSet={{ rendra: 'BFI-001' }}
        accessible={Boolean(label)}
        accessibilityRole={label ? 'image' : undefined}
        accessibilityLabel={label}
        accessibilityElementsHidden={!label}
        importantForAccessibility={label ? 'auto' : 'no-hide-descendants'}
        className={cn('relative shrink-0', sizeClass[size], className)}
      >
        <View className="size-full">
          <Animated.View style={symbolStyle}>
            {brand.symbol ? (
              <brand.symbol className={cn('size-full', colorClass[type])} />
            ) : (
              <Svg
                viewBox="0 0 24 24"
                className={cn('size-full', colorClass[type])}
                testID={testID ? `${testID}-symbol` : undefined}
              >
                <Circle cx={12} cy={12} r={10} fill="currentColor" opacity={0.16} />
                <Circle cx={12} cy={12} r={6} fill="currentColor" />
              </Svg>
            )}
          </Animated.View>
        </View>
        <View className={cn('absolute right-0 bottom-0 size-1/2 items-center justify-center rounded-full', badgeBgClass[type])}>
          <Animated.View style={badgeStyle}>
            <Svg
              viewBox="0 0 12 12"
              className={cn('size-2/3', badgeForegroundClass[type])}
              testID={testID ? `${testID}-glyph` : undefined}
            >
              <AnimatedPath
                d={glyphPath[type]}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={1}
                animatedProps={glyphAnimatedProps}
              />
            </Svg>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  )
}
