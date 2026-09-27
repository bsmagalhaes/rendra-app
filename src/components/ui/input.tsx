import { useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { createMask } from 'imask'
import { ChevronDown, Eye, EyeOff, X } from 'lucide-react-native'
import { Text } from '../internal/text'
import { Select } from './select'
import { cn } from '../../lib/cn'
import { a11yPresets } from '../../lib/a11y'
import { useControlledState } from '../../hooks/use-controlled-state'
import { usePlaceholderColor } from '../../hooks/use-placeholder-color'
import { controlFrameClasses, controlAdornmentButton, type ControlSize } from '../../lib/control'
import {
  masks,
  type MaskName,
  phoneCountries,
  DEFAULT_DDI,
  internationalPhoneMask,
  toCents,
  type PhoneCountry,
} from '../../lib/masks'
import { useLookup, type LookupResult } from '../../hooks/use-lookup'

export interface InputProps {
  size?: ControlSize
  mask?: MaskName
  icon?: ReactNode
  suffix?: ReactNode
  clearable?: boolean
  invalid?: boolean
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onValueChange?: (unmasked: string, masked: string) => void
  secureTextEntry?: boolean
  ddi?: string
  onDdiChange?: (ddi: string) => void
  ddiOptions?: PhoneCountry[]
  hideDdi?: boolean
  onCentsChange?: (cents: number | null) => void
  onLookup?: (result: LookupResult) => void
  disabled?: boolean
  placeholder?: string
  accessibilityLabel?: string
  className?: string
  id?: string // recebido via cloneElement pelo Field (Tarefa 19); reservado, sem uso interno
  testID?: string
}

export function Input({
  size = 'md',
  mask,
  icon,
  suffix,
  clearable = false,
  invalid = false,
  value: controlledValue,
  defaultValue = '',
  onChange,
  onValueChange,
  secureTextEntry: secureProp = false,
  ddi: ddiProp,
  onDdiChange,
  ddiOptions = phoneCountries,
  hideDdi = false,
  onCentsChange,
  onLookup,
  disabled = false,
  placeholder,
  accessibilityLabel,
  className,
  testID,
}: InputProps) {
  const placeholderColor = usePlaceholderColor()
  const isPhone = mask === 'phone'
  const [ddi, setDdi] = useControlledState<string>(ddiProp, DEFAULT_DDI, onDdiChange)
  const intl = isPhone && ddi !== '55'
  const maskOptions = intl ? internationalPhoneMask.options : mask ? masks[mask].options : undefined
  const masked = useMemo(() => (maskOptions ? createMask(maskOptions) : null), [maskOptions])
  const [internalValue, setInternalValue] = useState(() => {
    const initial = controlledValue ?? defaultValue
    if (masked) {
      masked.resolve(initial)
      return masked.value
    }
    return initial
  })
  const [focused, setFocused] = useState(false)
  const [secure, setSecure] = useState(secureProp)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const lookup = useLookup()

  // Ajuste de estado derivado durante a renderização (sem useEffect, para não disparar
  // react-hooks/set-state-in-effect): achado 6 do veredito do Bloco A, quando a máscara
  // muda (troca de DDI do telefone, nacional <-> internacional) no modo não controlado,
  // reaplica os dígitos já digitados sob a máscara nova, no mesmo ciclo de render, antes
  // do commit (padrão "adjusting state when a prop changes" do React).
  const syncKey = `${mask ?? ''}|${intl}`
  const [lastSyncKey, setLastSyncKey] = useState(syncKey)
  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey)
    if (masked && controlledValue === undefined) {
      masked.resolve(internalValue.replace(/\D/g, ''))
      setInternalValue(masked.value)
    }
  }

  // Achado 5 do veredito do Bloco A: no modo controlado, o texto exibido deriva só de
  // `controlledValue`, nunca do objeto `masked` mutável usado pelo digitar (`handleChangeText`
  // resolve nele a cada tecla, independente de o pai aceitar a mudança); assim, se o pai
  // rejeitar a mudança (não atualizar `value`), o campo não fica mostrando o texto digitado.
  const displayMasked = useMemo(() => {
    if (!maskOptions || controlledValue === undefined) return null
    const m = createMask(maskOptions)
    m.resolve(controlledValue)
    return m
  }, [maskOptions, controlledValue])

  const value = controlledValue !== undefined ? (displayMasked ? displayMasked.value : controlledValue) : internalValue

  function handleChangeText(text: string) {
    if (masked) {
      masked.resolve(text)
      onChange?.(masked.value)
      onValueChange?.(masked.unmaskedValue, masked.value)
      if (mask === 'currency') onCentsChange?.(toCents(masked.value))
      setInternalValue(masked.value)
      if ((mask === 'cep' || mask === 'cnpj' || mask === 'cpfCnpj') && onLookup) {
        setSearching(true)
        lookup(mask, masked.unmaskedValue).then((result) => {
          setSearching(false)
          if (result) onLookup(result)
        })
      }
    } else {
      onChange?.(text)
      onValueChange?.(text, text)
      setInternalValue(text)
    }
  }

  function handleClear() {
    if (masked) masked.resolve('')
    setInternalValue('')
    onChange?.('')
    onValueChange?.('', '')
    if (mask === 'currency') onCentsChange?.(null)
    inputRef.current?.focus()
  }

  const country = ddiOptions.find((c) => c.ddi === ddi)
  const def = mask ? masks[mask] : undefined

  return (
    <View className={cn(controlFrameClasses({ size, invalid, focused, disabled }), className)}>
      {icon ? <View className="flex shrink-0 text-muted-foreground">{icon}</View> : null}
      {isPhone && !hideDdi ? (
        <Select
          options={ddiOptions.map((c) => ({ value: c.ddi, label: `+${c.ddi} ${c.name}` }))}
          value={ddi}
          onChange={(v) => v && setDdi(v)}
          label="Código do país (DDI)"
          testID={testID ? `${testID}-ddi` : undefined}
          trigger={({ onPress }) => (
            <Pressable
              accessibilityRole={a11yPresets.button.accessibilityRole}
              accessibilityLabel={`Código do país (DDI): ${country?.name ?? ''} +${ddi}`}
              onPress={onPress}
              className="min-h-touch min-w-touch flex-row items-center gap-1 pr-1"
            >
              <Text className="text-base text-foreground">{`+${ddi}`}</Text>
              <ChevronDown className="size-icon-sm text-muted-foreground" />
            </Pressable>
          )}
        />
      ) : null}
      <TextInput
        ref={inputRef}
        testID={testID}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        secureTextEntry={secure}
        inputMode={def?.inputMode}
        placeholder={placeholder ?? def?.placeholder}
        placeholderTextColor={placeholderColor}
        accessibilityLabel={accessibilityLabel}
        className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground"
      />
      {searching ? <Text role={a11yPresets.status.role} className="text-xs text-muted-foreground">Buscando...</Text> : null}
      {suffix ? <Text className="shrink-0 text-sm text-muted-foreground">{suffix}</Text> : null}
      {clearable && value && !disabled ? (
        <Pressable
          accessibilityRole={a11yPresets.button.accessibilityRole}
          accessibilityLabel="Limpar campo"
          onPress={handleClear}
          className={controlAdornmentButton}
        >
          <X className="size-icon-sm" />
        </Pressable>
      ) : null}
      {secureProp ? (
        <Pressable
          accessibilityRole={a11yPresets.button.accessibilityRole}
          accessibilityLabel={secure ? 'Mostrar senha' : 'Ocultar senha'}
          accessibilityState={{ selected: !secure }}
          onPress={() => setSecure((s) => !s)}
          className={controlAdornmentButton}
        >
          {secure ? <Eye className="size-icon-sm" /> : <EyeOff className="size-icon-sm" />}
        </Pressable>
      ) : null}
    </View>
  )
}
