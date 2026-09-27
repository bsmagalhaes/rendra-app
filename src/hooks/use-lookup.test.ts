import { renderHook } from '@testing-library/react-native'
import { useLookup } from './use-lookup'

describe('useLookup', () => {
  it('devolve uma função que sempre resolve null', async () => {
    const { result } = await renderHook(() => useLookup())
    const value = await result.current('cep', '01310-100')
    expect(value).toBeNull()
  })

  it('devolve a mesma referência de função entre renders', async () => {
    const { result, rerender } = await renderHook(() => useLookup())
    const first = result.current
    await rerender({})
    expect(result.current).toBe(first)
  })
})
