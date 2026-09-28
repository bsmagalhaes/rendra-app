import { cloneElement, isValidElement, useId } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'
import { useBrand } from '../../brand/use-brand'
import { fieldSpanClass, type FieldSpan } from '../layout/tokens'

export type { FieldSpan } from '../layout/tokens'

// Item D1 do levantamento da Sincronizacao 1: discreto (padrao) usa os tokens de rotulo
// (--rendra-label-color, 11px) e maiusculas; normal usa o texto comum (14px, sem transformacao).
// `uppercase`/`normal-case` so herdam `textTransform` (nao declaram variavel CSS), por isso nao
// entram no risco do R7/decisao do redator 4 (classe condicional que declara variavel, tipo
// `shadow-*`, derruba a navegacao no nativo fora do primeiro render).
const LABEL_CLASS_BY_STYLE = {
  discreto: 'text-label text-label-foreground uppercase',
  normal: 'text-sm text-foreground normal-case',
} as const

export function Label({
  children,
  required,
  className,
}: {
  children: ReactNode
  required?: boolean
  className?: string
}) {
  const { labelStyle } = useBrand()
  const text = typeof children === 'string' ? children : undefined
  return (
    <Text
      weight="medium"
      accessibilityLabel={required && text ? `${text} (obrigatório)` : undefined}
      className={cn(LABEL_CLASS_BY_STYLE[labelStyle], className)}
      dataSet={{ rendra: 'FLD-002' }}
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
    <View
      className={cn('flex min-w-0 flex-col gap-2', fieldSpanClass[resolvedSpan], className)}
      dataSet={{ rendra: 'FLD-001' }}
    >
      {label ? <Label required={required}>{label}</Label> : null}
      {child}
      {reserveMessage || message ? (
        <Text
          accessibilityRole={invalid ? a11yPresets.alert.accessibilityRole : undefined}
          weight={invalid ? 'medium' : 'normal'}
          className={cn(
            'min-h-4',
            // Item D2 do levantamento: a ajuda usa os tokens de orientação (text-help,
            // 12px/0,12px, igual a text-xs em número, mas nomeado pelo papel semântico do
            // contrato). O erro mantém text-xs e text-destructive-soft-foreground: divergência
            // pré-existente contra o web (que usa text-destructive), registrada como risco R12
            // do levantamento e não corrigida nesta sincronização.
            invalid ? 'text-xs text-destructive-soft-foreground' : 'text-help text-help-foreground',
          )}
        >
          {message}
        </Text>
      ) : null}
    </View>
  )
}
