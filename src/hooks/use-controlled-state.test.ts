import { act, renderHook } from '@testing-library/react-native'
import { useControlledState } from './use-controlled-state'

describe('useControlledState', () => {
  it('modo não controlado: atualiza o estado interno e chama onChange', async () => {
    const onChange = jest.fn()
    const { result } = await renderHook(() => useControlledState<boolean>(undefined, false, onChange))

    expect(result.current[0]).toBe(false)

    await act(async () => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('modo controlado: não atualiza o estado interno, só chama onChange', async () => {
    const onChange = jest.fn()
    const { result, rerender } = await renderHook(
      ({ value }: { value: boolean }) => useControlledState<boolean>(value, false, onChange),
      { initialProps: { value: true } },
    )

    expect(result.current[0]).toBe(true)

    await act(async () => {
      result.current[1](false)
    })

    expect(onChange).toHaveBeenCalledWith(false)
    expect(result.current[0]).toBe(true)

    await rerender({ value: false })
    expect(result.current[0]).toBe(false)
  })
})
