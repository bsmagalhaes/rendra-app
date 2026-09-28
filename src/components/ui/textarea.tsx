import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Text } from '../internal/text'
import { cn } from '../../lib/cn'
import { usePlaceholderColor } from '../../hooks/use-placeholder-color'

export interface TextareaProps {
  invalid?: boolean
  counter?: boolean
  value?: string
  onChange?: (value: string) => void
  defaultValue?: string
  maxLength?: number
  rows?: number
  disabled?: boolean
  placeholder?: string
  accessibilityLabel?: string
  className?: string
  id?: string // recebido via cloneElement pelo Field (Tarefa 19); reservado, sem uso interno
  testID?: string
}

const MIN_HEIGHT = 96
const MAX_HEIGHT = 256
const LINE_HEIGHT = 20

export function Textarea({
  invalid = false,
  counter = false,
  value: controlledValue,
  onChange,
  defaultValue = '',
  maxLength,
  rows,
  disabled = false,
  placeholder,
  accessibilityLabel,
  className,
  testID,
}: TextareaProps) {
  const placeholderColor = usePlaceholderColor()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const initialHeight = rows ? Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, rows * LINE_HEIGHT)) : MIN_HEIGHT
  const [height, setHeight] = useState(initialHeight)
  const [focused, setFocused] = useState(false)
  const value = controlledValue ?? internalValue
  const length = value.length
  const atLimit = maxLength !== undefined && length >= maxLength

  function handleChangeText(text: string) {
    setInternalValue(text)
    onChange?.(text)
  }

  return (
    <View className="flex min-w-0 flex-col gap-1" dataSet={{ rendra: 'TXT-001' }}>
      <TextInput
        testID={testID}
        multiline
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onContentSizeChange={(e) => {
          const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height))
          setHeight(next)
        }}
        style={{ height }}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        accessibilityLabel={accessibilityLabel}
        className={cn(
          'w-full rounded-control border border-input bg-field px-3 py-2 text-base text-foreground',
          focused && 'border-ring bg-card',
          invalid && 'border-destructive',
          disabled && 'opacity-60',
          className,
        )}
      />
      {counter ? (
        <Text
          weight={atLimit ? 'medium' : 'normal'}
          accessibilityValue={{ text: maxLength ? `${length}/${maxLength}` : `${length}` }}
          // Achado 7 do veredito do Bloco A: contrato §12.6 pede aria-live="polite" no
          // contador; accessibilityLiveRegion é o equivalente RN, espelhado para aria-live
          // pelo react-native-web.
          accessibilityLiveRegion="polite"
          className={cn('self-end text-xs', atLimit ? 'text-destructive' : 'text-muted-foreground')}
        >
          {maxLength ? `${length}/${maxLength}` : `${length}`}
        </Text>
      ) : null}
    </View>
  )
}
