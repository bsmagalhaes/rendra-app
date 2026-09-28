import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Gradient } from '../gradient/gradient'
import { BrandFeedbackIcon } from './brand-feedback-icon'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'
import type { FeedbackType } from '../../brand/types'

export interface EmptyStateProps {
  title: string
  description?: ReactNode
  type?: FeedbackType
  actions?: ReactNode
  size?: 'default' | 'compact'
  className?: string
  testID?: string
}

export function EmptyState({
  title,
  description,
  type = 'info',
  actions,
  size = 'default',
  className,
  testID,
}: EmptyStateProps) {
  const compact = size === 'compact'
  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'VAZ-001' }}
      className={cn('items-center justify-center gap-4', compact ? 'px-4 py-8' : 'px-4 py-12', className)}
    >
      <View className="relative items-center justify-center">
        <View
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute size-16 rounded-full overflow-hidden"
        >
          <Gradient token="soft" className="size-full" />
        </View>
        <BrandFeedbackIcon
          type={type}
          size={compact ? 'xl' : '2xl'}
          testID={testID ? `${testID}-icone` : undefined}
          className="relative"
        />
      </View>
      <Text
        weight="semibold"
        accessibilityRole={a11yPresets.header.accessibilityRole}
        className="text-center text-base text-foreground"
      >
        {title}
      </Text>
      {description ? (
        <Text className="text-center text-sm text-muted-foreground">{description}</Text>
      ) : null}
      {actions ? <View className="flex-row flex-wrap justify-center gap-3">{actions}</View> : null}
    </View>
  )
}
