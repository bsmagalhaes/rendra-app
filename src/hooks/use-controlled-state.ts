import { useCallback, useState } from 'react'

export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolledValue(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [value, setValue]
}
