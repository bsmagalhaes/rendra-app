import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../lib/reduced-motion'

export interface SkeletonProps {
  className?: string
  testID?: string
}

export function Skeleton({ className, testID }: SkeletonProps) {
  const reducedMotion = useReducedMotion()
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(opacity)
      opacity.set(1)
      return
    }
    opacity.set(
      withRepeat(withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true),
    )
    return () => cancelAnimation(opacity)
  }, [reducedMotion, opacity])

  // B12 (veredito do Opus): o Animated.View só com `style` não herda o tamanho do pai por
  // className; sem width/height 100% aqui, o View filho (`size-full`) resolvia 100% de uma
  // árvore de percentuais vazia e o Skeleton ficava invisível (Jest passava, tela não mostrava
  // nada). Mesmo padrão já documentado em brand-feedback-icon.tsx:107-111.
  const animated = useAnimatedStyle(() => ({ opacity: opacity.get(), width: '100%', height: '100%' }))

  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'SKEL-001' }}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('overflow-hidden rounded-block', className)}
    >
      <Animated.View testID={testID ? `${testID}-pulso` : undefined} style={animated}>
        <View className="size-full bg-muted" />
      </Animated.View>
    </View>
  )
}
