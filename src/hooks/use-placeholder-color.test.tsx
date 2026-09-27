import { renderHook, waitFor, act } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { BrandProvider } from '../brand/brand-provider'
import { useBrand } from '../brand'
import { themeColorString } from '../theme/vars'
import { usePlaceholderColor } from './use-placeholder-color'

function wrapper({ children }: { children: ReactNode }) {
  return <BrandProvider>{children}</BrandProvider>
}

describe('usePlaceholderColor (melhoria 2 do veredito do fechamento: sem duplicação)', () => {
  it('resolve o mesmo valor que themeColorString(themeVars, "--muted-foreground") do tema ativo', async () => {
    const { result } = await renderHook(
      () => ({ cor: usePlaceholderColor(), brand: useBrand() }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.brand.hydrated).toBe(true))
    expect(result.current.cor).toBe(
      themeColorString(result.current.brand.themeVars, '--muted-foreground'),
    )
    expect(result.current.cor).toMatch(/^rgb\(/)
  })

  it('muda de verdade quando o modo troca (não é um valor fixo)', async () => {
    const { result } = await renderHook(
      () => ({ cor: usePlaceholderColor(), brand: useBrand() }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.brand.hydrated).toBe(true))
    const before = result.current.cor
    await act(async () => result.current.brand.setMode('dark'))
    await waitFor(() => expect(result.current.cor).not.toBe(before))
  })
})
