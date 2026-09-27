import { renderHook, act, waitFor, screen } from '@testing-library/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View as MockView } from 'react-native'
import { BrandProvider } from './brand-provider'
import { useBrand } from './use-brand'
import { ThemedStatusBar } from './themed-status-bar'

// RNTL 14 não tem mais UNSAFE_*, então localizamos o StatusBar mockando expo-status-bar aqui:
// o mock vira uma View com testID e repassa `style` como prop, legível por getByTestId/props.
// `MockView` (prefixo "mock") é a exceção que o babel-plugin-jest-hoist aceita para referenciar
// um import fora do escopo da factory, sem precisar de require() dentro dela.
jest.mock('expo-status-bar', () => ({
  StatusBar: ({ style }: { style: string }) => <MockView testID="themed-status-bar" style={style as never} />,
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider>
      <ThemedStatusBar />
      {children}
    </BrandProvider>
  )
}

describe('ThemedStatusBar', () => {
  beforeEach(() => AsyncStorage.clear())

  it('style é light quando resolvedMode é dark', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    await act(async () => result.current.setMode('dark'))
    await waitFor(() => expect(result.current.resolvedMode).toBe('dark'))
    expect(screen.getByTestId('themed-status-bar').props.style).toBe('light')
  })

  it('style é dark quando resolvedMode é light', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    await act(async () => result.current.setMode('light'))
    await waitFor(() => expect(result.current.resolvedMode).toBe('light'))
    expect(screen.getByTestId('themed-status-bar').props.style).toBe('dark')
  })
})
