import { View } from 'react-native'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
  testID?: string
}

export function Separator({ orientation = 'horizontal', label, className, testID }: SeparatorProps) {
  if (label) {
    return (
      <View
        testID={testID}
        dataSet={{ rendra: 'SEP-001' }}
        accessible
        role={a11yPresets.separator.role}
        accessibilityLabel={label}
        className={cn('flex-row items-center gap-3', className)}
      >
        <View className="h-px flex-1 bg-border" />
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
    )
  }
  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'SEP-001' }}
      accessible
      role={a11yPresets.separator.role}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
    />
  )
}
