import { cloneElement, isValidElement, useId } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'
import { fieldSpanClass, type FieldSpan } from '../layout/tokens'

export type { FieldSpan } from '../layout/tokens'

export function Label({
  children,
  required,
  className,
}: {
  children: ReactNode
  required?: boolean
  className?: string
}) {
  const text = typeof children === 'string' ? children : undefined
  return (
    <Text
      weight="medium"
      accessibilityLabel={required && text ? `${text} (obrigatório)` : undefined}
      className={cn('text-sm text-foreground', className)}
    >
      {children}
      {required ? <Text className="text-destructive"> *</Text> : null}
    </Text>
  )
}

export interface FieldProps {
  label?: ReactNode
  required?: boolean
  help?: ReactNode
  error?: ReactNode
  span?: FieldSpan | 'half'
  reserveMessage?: boolean
  id?: string
  className?: string
  children: ReactElement
}

export function Field({
  label,
  required = false,
  help,
  error,
  span = 'md',
  reserveMessage = false,
  id: idProp,
  className,
  children,
}: FieldProps) {
  const generatedId = useId()
  const id = idProp ?? `campo${generatedId}`
  const invalid = Boolean(error)
  const message = error ?? help
  const resolvedSpan: FieldSpan = span === 'half' ? 'md' : span
  const labelText = typeof label === 'string' ? label : undefined

  const typedChildren = children as ReactElement<{ id?: string; invalid?: boolean; accessibilityLabel?: string }>
  const child = isValidElement(typedChildren)
    ? cloneElement(typedChildren, {
        id,
        invalid: typedChildren.props.invalid ?? invalid,
        accessibilityLabel: typedChildren.props.accessibilityLabel ?? labelText,
      })
    : children

  return (
    <View className={cn('flex min-w-0 flex-col gap-2', fieldSpanClass[resolvedSpan], className)}>
      {label ? <Label required={required}>{label}</Label> : null}
      {child}
      {reserveMessage || message ? (
        <Text
          accessibilityRole={invalid ? a11yPresets.alert.accessibilityRole : undefined}
          weight={invalid ? 'medium' : 'normal'}
          className={cn('min-h-4 text-xs', invalid ? 'text-destructive-soft-foreground' : 'text-muted-foreground')}
        >
          {message}
        </Text>
      ) : null}
    </View>
  )
}
