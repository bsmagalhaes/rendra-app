import { useId, useRef } from 'react'
import { View } from 'react-native'
import { Plus, Trash2 } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Input } from './input'

/*
 * Lista de verificação editável: cada item é uma caixa de seleção mais o nome do item. Criar,
 * renomear, marcar e remover passam sempre por `onChange` com a lista nova. O item marcado vira
 * texto riscado no lugar do campo (o `Input` do app não tem `inputClassName`), então só o item
 * desmarcado é editável. O foco automático no item novo do web fica fora: o `Input` do app não
 * expõe prop de foco.
 */

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

export interface ChecklistProps {
  value: ChecklistItem[]
  onChange: (value: ChecklistItem[]) => void
  addLabel?: string
  disabled?: boolean
  id?: string // recebido via cloneElement pelo Field; reservado, sem uso interno
  testID?: string
  accessibilityLabel?: string
}

/** Uma lista de verificação por finalidade: itens de um checklist usam este componente. */
export function Checklist({
  value,
  onChange,
  addLabel = 'Adicionar item',
  disabled = false,
  testID,
  accessibilityLabel,
}: ChecklistProps) {
  // Id de verdade, sem `crypto.randomUUID()`: esse método não existe no Hermes nem em contexto não seguro.
  const baseId = useId()
  const nextIndex = useRef(0)

  const updateLabel = (itemId: string, label: string) =>
    onChange(value.map((item) => (item.id === itemId ? { ...item, label } : item)))

  const toggle = (itemId: string) =>
    onChange(value.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)))

  const remove = (itemId: string) => onChange(value.filter((item) => item.id !== itemId))

  const add = () => {
    nextIndex.current += 1
    onChange([...value, { id: `${baseId}item${nextIndex.current}`, label: '', checked: false }])
  }

  return (
    <View testID={testID} accessibilityLabel={accessibilityLabel} role="group" dataSet={{ rendra: 'CKLT-001' }} className="flex-col gap-2">
      {value.map((item, index) => (
        <View key={item.id} className="min-h-touch flex-row items-center gap-2">
          <Checkbox
            checked={item.checked}
            onCheckedChange={() => toggle(item.id)}
            disabled={disabled}
            accessibilityLabel={item.label ? `Marcar ${item.label}` : `Marcar item ${index + 1}`}
          />
          {item.checked ? (
            <Text className="min-w-0 flex-1 text-base text-muted-foreground line-through">{item.label}</Text>
          ) : (
            <Input
              value={item.label}
              onChange={(v) => updateLabel(item.id, v)}
              placeholder="Descreva o item"
              disabled={disabled}
              accessibilityLabel={`Nome do item ${index + 1}`}
              className="flex-1"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            icon={<Trash2 />}
            accessibilityLabel={`Remover item ${index + 1}`}
            disabled={disabled}
            onPress={() => remove(item.id)}
          />
        </View>
      ))}
      <Button variant="outline" size="sm" icon={<Plus />} disabled={disabled} onPress={add}>
        {addLabel}
      </Button>
    </View>
  )
}
