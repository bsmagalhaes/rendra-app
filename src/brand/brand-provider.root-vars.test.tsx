/**
 * @jest-environment jsdom
 *
 * Bloqueador 1 do veredito do fechamento do lote 2 (Fable): `brand-provider.tsx:174-178` replica
 * `themeVars` em `document.documentElement` (via `useEffect`), para que qualquer
 * `Modal`/`BottomSheet` (que faz portal para `document.body` no
 * export web) continue enxergando as variáveis CSS de tema, mas isso não tinha teste de Jest.
 * "Sem teste possível" não se sustenta: `jest-environment-jsdom` está instalado, só precisa do
 * docblock acima (só afeta este arquivo, não os outros testes do brand, que continuam no
 * ambiente padrão do jest-expo).
 */
import { renderHook, act, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider } from './brand-provider'
import { useBrand } from './use-brand'

function wrapper({ children }: { children: ReactNode }) {
  return <BrandProvider>{children}</BrandProvider>
}

describe('BrandProvider replica themeVars em :root (achado 1 do veredito do fechamento)', () => {
  beforeEach(() => AsyncStorage.clear())

  it('document.documentElement recebe --rendra-foreground igual ao trio do modo claro, e troca para o trio do modo escuro depois de setMode("dark")', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))

    const lightForeground = result.current.themeVars['--rendra-foreground']
    expect(lightForeground).toBeTruthy()
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue('--rendra-foreground')).toBe(lightForeground),
    )

    await act(async () => result.current.setMode('dark'))
    await waitFor(() => expect(result.current.resolvedMode).toBe('dark'))
    const darkForeground = result.current.themeVars['--rendra-foreground']
    expect(darkForeground).not.toBe(lightForeground)
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue('--rendra-foreground')).toBe(darkForeground),
    )
  })
})
