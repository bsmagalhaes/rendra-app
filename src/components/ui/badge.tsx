import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'

export interface BadgeProps {
  tone?: BadgeTone
  solid?: boolean
  icon?: ReactNode
  dot?: boolean
  children: ReactNode
  className?: string
  testID?: string
}

const rootToneClass: Record<BadgeTone, string> = {
  neutral: 'border-transparent bg-muted',
  primary: 'border-transparent bg-primary-soft',
  success: 'border-transparent bg-success-soft',
  warning: 'border-transparent bg-warning-soft',
  error: 'border-transparent bg-destructive-soft',
  info: 'border-transparent bg-info-soft',
  outline: 'border-border bg-card',
}

// C14 (veredito do Opus): o composto (solid) troca só fundo e texto (contrato §12.26), mas
// continua sem borda visível; cada entrada mantém `border-transparent` explícito.
const rootSolidClass: Partial<Record<BadgeTone, string>> = {
  primary: 'border-transparent bg-primary',
  success: 'border-transparent bg-success',
  warning: 'border-transparent bg-warning',
  error: 'border-transparent bg-destructive',
  info: 'border-transparent bg-info',
}

const textToneClass: Record<BadgeTone, string> = {
  neutral: 'text-foreground',
  outline: 'text-foreground',
  primary: 'text-primary-soft-foreground',
  success: 'text-success-soft-foreground',
  warning: 'text-warning-soft-foreground',
  error: 'text-destructive-soft-foreground',
  info: 'text-info-soft-foreground',
}

const textSolidClass: Partial<Record<BadgeTone, string>> = {
  primary: 'text-primary-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  error: 'text-destructive-foreground',
  info: 'text-info-foreground',
}

export const dotClass: Record<BadgeTone, string> = {
  neutral: 'bg-foreground',
  outline: 'bg-foreground',
  primary: 'bg-primary-soft-foreground',
  success: 'bg-success-soft-foreground',
  warning: 'bg-warning-soft-foreground',
  error: 'bg-destructive-soft-foreground',
  info: 'bg-info-soft-foreground',
}

export const dotSolidClass: Partial<Record<BadgeTone, string>> = {
  primary: 'bg-primary-foreground',
  success: 'bg-success-foreground',
  warning: 'bg-warning-foreground',
  error: 'bg-destructive-foreground',
  info: 'bg-info-foreground',
}

export function Badge({ tone = 'neutral', solid = false, icon, dot = false, children, className, testID }: BadgeProps) {
  const rootSolid = solid ? rootSolidClass[tone] : undefined
  const textSolid = solid ? textSolidClass[tone] : undefined
  const dotSolid = solid ? dotSolidClass[tone] : undefined

  return (
    <View
      testID={testID}
      className={cn(
        'flex-row max-w-full shrink-0 items-center gap-1 rounded-item border px-2 py-1',
        rootSolid ?? rootToneClass[tone],
        className,
      )}
    >
      {dot ? (
        <View
          testID={testID ? `${testID}-ponto` : undefined}
          className={cn('size-2 shrink-0 rounded-full', dotSolid ?? dotClass[tone])}
        />
      ) : null}
      {icon}
      <Text weight="medium" numberOfLines={1} className={cn('text-xs', textSolid ?? textToneClass[tone])}>
        {children}
      </Text>
    </View>
  )
}
