import { useRef } from 'react'
import { TextInput, View } from 'react-native'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'

export interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  id?: string // recebido via cloneElement pelo Field (Tarefa 19); reservado, sem uso interno
  accessibilityLabel?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid = false,
  disabled = false,
  accessibilityLabel = 'Código de verificação',
}: OtpInputProps) {
  const refs = useRef<(TextInput | null)[]>([])

  function set(next: string) {
    const digits = next.replace(/\D/g, '').slice(0, length)
    onChange(digits)
    if (digits.length === length) onComplete?.(digits)
  }

  function handleChangeText(index: number, text: string) {
    if (text.length > 1) {
      set(text)
      const lastIndex = Math.min(length, text.replace(/\D/g, '').length) - 1
      refs.current[Math.max(lastIndex, 0)]?.focus()
      return
    }
    const digits = value.split('')
    digits[index] = text.replace(/\D/g, '')
    set(digits.join(''))
    if (text && index < length - 1) refs.current[index + 1]?.focus()
  }

  function handleKeyPress(index: number, key: string) {
    // Contrato §12.12: Backspace numa caixa vazia só devolve o foco à caixa anterior, sem
    // apagar o dígito dela (bloqueador 2 do veredito do Bloco B, Fable; o desvio 16.1 que
    // apagava o dígito anterior foi rejeitado: "testabilidade não autoriza mudar
    // comportamento de produto").
    if (key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  return (
    <View
      role={a11yPresets.group.role}
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1"
      dataSet={{ rendra: 'OTP-001' }}
    >
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(value[i])
        return (
          <TextInput
            key={i}
            ref={(node) => {
              refs.current[i] = node
            }}
            value={value[i] ?? ''}
            onChangeText={(text) => handleChangeText(i, text)}
            onKeyPress={(e) => handleKeyPress(i, e.nativeEvent.key)}
            editable={!disabled}
            keyboardType="number-pad"
            selectTextOnFocus
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={i === 0 ? length : 1}
            accessibilityLabel={`Dígito ${i + 1} de ${length}`}
            className={cn(
              'h-control-lg flex-1 rounded-control border border-input bg-field text-center text-xl text-foreground',
              filled && 'border-primary',
              invalid && 'border-destructive',
              disabled && 'opacity-60',
            )}
          />
        )
      })}
    </View>
  )
}
