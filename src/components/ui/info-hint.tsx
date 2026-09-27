import { useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Info } from 'lucide-react-native'
import { Button } from './button'
import { Modal } from './modal'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'

export interface InfoHintProps {
  title: string
  children: ReactNode
  className?: string
}

export function InfoHint({ title, children, className }: InfoHintProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        accessibilityLabel={`Sobre: ${title}`}
        icon={<Info className="text-muted-foreground" />}
        onPress={() => setOpen(true)}
        className={cn('shrink-0', className)}
      />
      <Modal open={open} onOpenChange={setOpen} type="info" title={title} size="md">
        <View className="flex-col gap-3">
          {typeof children === 'string' ? <Text className="text-sm text-muted-foreground">{children}</Text> : children}
        </View>
      </Modal>
    </>
  )
}
