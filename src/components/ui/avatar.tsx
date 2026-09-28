import { useState } from 'react'
import { Image, View } from 'react-native'
import { Text } from '../internal/text'
import { a11yPresets } from '../../lib/a11y'
import { cn } from '../../lib/cn'

export interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  testID?: string
}

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-12',
}

const textSizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-base',
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase()
}

export function Avatar({ name, src, size = 'md', className, testID }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'AVT-001' }}
      accessibilityLabel={showImage ? undefined : name}
      className={cn(
        'relative items-center justify-center overflow-hidden rounded-avatar bg-primary-soft',
        sizeClass[size],
        className,
      )}
    >
      {showImage ? (
        <Image
          source={{ uri: src }}
          resizeMode="cover"
          accessibilityLabel={name}
          className="size-full"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text weight="medium" className={cn(textSizeClass[size], 'text-primary-soft-foreground')}>
          {initials(name)}
        </Text>
      )}
    </View>
  )
}

export interface AvatarGroupProps {
  people: { name: string; src?: string }[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  testID?: string
}

export function AvatarGroup({ people, max = 4, size = 'md', className, testID }: AvatarGroupProps) {
  const shown = people.slice(0, max)
  const overflow = people.length - shown.length

  return (
    <View
      testID={testID}
      dataSet={{ rendra: 'AVT-002' }}
      accessible
      role={a11yPresets.group.role}
      accessibilityLabel={people.map((person) => person.name).join(', ')}
      className={cn('flex-row items-center', className)}
    >
      {shown.map((person, index) => (
        <Avatar
          key={person.name + index}
          testID={testID ? `${testID}-item-${index}` : undefined}
          name={person.name}
          src={person.src}
          size={size}
          className={cn('border-2 border-card', index > 0 && '-ml-2')}
        />
      ))}
      {overflow > 0 ? (
        <View
          className={cn(
            'items-center justify-center overflow-hidden rounded-avatar border-2 border-card bg-muted -ml-2',
            sizeClass[size],
          )}
        >
          <Text weight="medium" className={cn(textSizeClass[size], 'text-muted-foreground')}>
            {`+${overflow}`}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
