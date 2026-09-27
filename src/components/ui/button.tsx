import { forwardRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, type PressableProps, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { Loader2 } from 'lucide-react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'
import { useReducedMotion } from '../../lib/reduced-motion'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style' | 'className'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  iconOnly?: boolean
  loading?: boolean
  fullWidth?: boolean
  disabled?: boolean
  accessibilityLabel?: string
  className?: string
  children?: ReactNode
}

const restClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'border border-input bg-card',
  ghost: '',
  destructive: 'bg-destructive',
  link: 'min-h-touch min-w-touch',
}
const restTextClass: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
  link: 'text-primary-text',
}
const pressedClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary-hover',
  secondary: 'bg-secondary-hover',
  outline: 'bg-primary-soft',
  ghost: 'bg-primary-soft',
  destructive: 'bg-destructive-hover',
  link: '',
}
const pressedTextClass: Record<ButtonVariant, string> = {
  primary: 'text-primary-hover-foreground',
  secondary: 'text-secondary-hover-foreground',
  outline: 'text-primary-soft-foreground',
  ghost: 'text-primary-soft-foreground',
  destructive: 'text-destructive-foreground',
  link: 'text-primary-hover',
}
// Levantamento de prevenção (Tarefa 21, Parte 2, mesmo padrão que causou o crash de navegação no
// nativo do ButtonGroup/Tabs, ver button-group.tsx:59-79): `shadow-sm` declara `--tw-shadow-color`
// no CSS nativo (única classe usada neste componente que declara variável); `variant` é uma prop
// comum que pode mudar num `Button` já montado (mesma instância, mesma `key`) sem que o consumidor
// precise trocar de componente, então tinha aqui o mesmo risco: `outline`/`ghost`/`link` sem
// nenhuma classe de sombra, `primary`/`secondary`/`destructive` com `shadow-sm`. Trocar de
// `outline` para `primary` num `Button` já montado faria `shadow-sm` aparecer fora do primeiro
// render, o gatilho do upgrade de variável. `shadow-none` mantém a mesma ausência visual de
// sombra, mas declara a variável desde o primeiro render em toda variante.
const shadowClass: Record<ButtonVariant, string> = {
  primary: 'shadow-sm',
  secondary: 'shadow-sm',
  outline: 'shadow-none',
  ghost: 'shadow-none',
  destructive: 'shadow-sm',
  link: 'shadow-none',
}
const sizeClass: Record<ButtonSize, string> = { sm: 'h-control-sm px-3', md: 'h-control-md px-4', lg: 'h-control-lg px-6' }
const textSizeClass: Record<ButtonSize, string> = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' }
const iconSizeClass: Record<ButtonSize, string> = { sm: 'size-icon-sm', md: 'size-icon-sm', lg: 'size-icon-md' }
const iconOnlyWidthClass: Record<ButtonSize, string> = { sm: 'w-control-sm', md: 'w-control-md', lg: 'w-control-lg' }

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    iconOnly = false,
    loading = false,
    fullWidth = false,
    disabled = false,
    accessibilityLabel,
    className,
    children,
    onPressIn,
    onPressOut,
    ...rest
  },
  ref,
) {
  if (__DEV__ && iconOnly && !accessibilityLabel) {
    console.warn('Button: accessibilityLabel é obrigatório quando iconOnly está ativo.')
  }

  const [pressed, setPressed] = useState(false)
  const reducedMotion = useReducedMotion()
  const scale = useSharedValue(1)
  const spin = useSharedValue(0)
  const isDisabled = disabled || loading
  const isLinkVariant = variant === 'link'

  useEffect(() => {
    if (!loading || reducedMotion) {
      spin.value = 0
      return
    }
    spin.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.linear }), -1, false)
  }, [loading, reducedMotion, spin])

  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }))

  const rootClassName = cn(
    'flex-row shrink-0 items-center justify-center gap-2 rounded-control',
    restClass[variant],
    pressed && !isDisabled && pressedClass[variant],
    shadowClass[variant],
    sizeClass[size],
    !isLinkVariant && iconOnly && 'px-0',
    !isLinkVariant && iconOnly && iconOnlyWidthClass[size],
    isLinkVariant && 'h-auto px-0',
    fullWidth && 'w-full',
    isDisabled && 'opacity-50',
    className,
  )

  const textClassName = cn(
    textSizeClass[size],
    pressed && !isDisabled ? pressedTextClass[variant] : restTextClass[variant],
  )

  const content = loading ? (
    <Animated.View style={spinStyle}>
      <Loader2 className={cn(iconSizeClass[size], pressed && !isDisabled ? pressedTextClass[variant] : restTextClass[variant])} />
    </Animated.View>
  ) : (
    icon
  )

  return (
    <Pressable
      ref={ref}
      accessibilityRole={a11yPresets.button.accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(event) => {
        setPressed(true)
        if (!reducedMotion) scale.value = withTiming(0.98, { duration: 100 })
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        setPressed(false)
        if (!reducedMotion) scale.value = withTiming(1, { duration: 100 })
        onPressOut?.(event)
      }}
      className={rootClassName}
      {...rest}
    >
      <Animated.View style={scaleStyle} className="flex-row items-center gap-2">
        {content}
        {!iconOnly && children != null && (
          <Text weight="medium" className={textClassName}>
            {children}
          </Text>
        )}
        {!iconOnly && !loading && iconRight}
      </Animated.View>
    </Pressable>
  )
})
