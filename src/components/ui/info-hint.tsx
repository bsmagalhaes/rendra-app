import { useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Info } from 'lucide-react-native'
import { Button } from './button'
import { Modal } from './modal'
import { Text } from '../internal/text'

export interface InfoHintProps {
  title: string
  children: ReactNode
  className?: string
}

export function InfoHint({ title, children, className }: InfoHintProps) {
  const [open, setOpen] = useState(false)

  return (
    // Item D11 do levantamento (traduzido para RN): no web, um <span className="contents"> só
    // carrega o atributo data-rendra sem afetar o layout; no nativo, dataSet precisa de um nó
    // real. `shrink-0` reaproveita a classe que antes ficava só no Button (não afeta o layout,
    // já que o Button ocupa o espaço do próprio InfoHint dentro de composições como CardTitle).
    <View className="shrink-0" dataSet={{ rendra: 'INFO-001' }}>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        accessibilityLabel={`Sobre: ${title}`}
        icon={<Info className="text-muted-foreground" />}
        onPress={() => setOpen(true)}
        className={className}
      />
      <Modal open={open} onOpenChange={setOpen} type="info" title={title} size="md">
        <View className="flex-col gap-3">
          {typeof children === 'string' ? <Text className="text-sm text-muted-foreground">{children}</Text> : children}
        </View>
      </Modal>
    </View>
  )
}
