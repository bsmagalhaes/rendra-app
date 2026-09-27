import { AccessibilityInfo } from 'react-native'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useReducedMotion } from './reduced-motion'

describe('useReducedMotion', () => {
  it('devolve false quando AccessibilityInfo.isReduceMotionEnabled resolve false', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    const { result } = await renderHook(() => useReducedMotion())
    await waitFor(() => expect(result.current).toBe(false))
  })

  it('devolve true quando AccessibilityInfo.isReduceMotionEnabled resolve true', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true)
    const { result } = await renderHook(() => useReducedMotion())
    await waitFor(() => expect(result.current).toBe(true))
  })

  it('reage ao evento reduceMotionChanged', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)
    let emit: ((value: boolean) => void) | undefined
    // `addEventListener` é sobrecarregado (evento de mudança vs. evento de anúncio do iOS, com
    // handlers de assinaturas diferentes); o cast explícito para a assinatura do evento de mudança
    // evita que o tsc resolva a sobrecarga errada (announcementFinished) ao tipar o mock.
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(
      ((_event: string, handler: (value: boolean) => void) => {
        emit = handler
        return { remove: jest.fn() }
      }) as unknown as typeof AccessibilityInfo.addEventListener,
    )
    const { result } = await renderHook(() => useReducedMotion())
    await waitFor(() => expect(result.current).toBe(false))
    await act(async () => {
      emit?.(true)
    })
    expect(result.current).toBe(true)
  })

  it('ignora o valor inicial e o evento que chegam depois do desmonte', async () => {
    let resolver: (value: boolean) => void = () => {}
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolver = resolve
      }),
    )
    let emit: ((value: boolean) => void) | undefined
    const remove = jest.fn()
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(
      ((_event: string, handler: (value: boolean) => void) => {
        emit = handler
        return { remove }
      }) as unknown as typeof AccessibilityInfo.addEventListener,
    )
    const { result, unmount } = await renderHook(() => useReducedMotion())
    await unmount()
    await act(async () => {
      resolver(true)
      emit?.(true)
    })
    expect(result.current).toBe(false)
    expect(remove).toHaveBeenCalledTimes(1)
  })
})
