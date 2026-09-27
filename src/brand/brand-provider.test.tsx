import { render, renderHook, act, waitFor, screen } from '@testing-library/react-native'
import { Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandProvider } from './brand-provider'
import { useBrand } from './use-brand'
import { models } from '../theme/models'

function wrapper({ children }: { children: React.ReactNode }) {
  return <BrandProvider>{children}</BrandProvider>
}

// Tarefa 2.5 (achado B7 do veredito do Opus): sonda que imprime `brands` (array do contexto)
// como JSON, para os testes novos afirmarem o conteúdo real sem depender de inspecionar props
// internas do provider.
function SondaBrands() {
  const { brands } = useBrand()
  return <Text testID="brands">{JSON.stringify(brands)}</Text>
}

describe('useBrand', () => {
  beforeEach(() => AsyncStorage.clear())

  it('lança fora do provider, com a mensagem exata do contrato', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(renderHook(() => useBrand())).rejects.toThrow('useBrand precisa estar dentro de <BrandProvider>.')
  })

  it('padrão é T1/safira/system', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.modelCode).toBe('T1')
    expect(result.current.paletteId).toBe('safira')
  })

  it('trocar modelo muda themeVars[--radius-control] de verdade, 0px -> 28px (Review Focus 3)', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.themeVars['--radius-control']).toBe('0px')
    await act(async () => result.current.setModelCode('T3'))
    await waitFor(() => expect(result.current.themeVars['--radius-control']).toBe('28px'))
  })

  it('trocar paleta muda themeVars[--primary] de verdade (acesso --kebab, bloqueadora C1)', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    const before = result.current.themeVars['--primary']
    await act(async () => result.current.setPaletteId('aurora'))
    await waitFor(() => expect(result.current.themeVars['--primary']).not.toBe(before))
  })

  it('trocar modo muda themeVars[--shadow-opacity-sm] de verdade, 0.06 -> 0.3', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.themeVars['--shadow-opacity-sm']).toBe('0.06')
    await act(async () => result.current.setMode('dark'))
    await waitFor(() => expect(result.current.themeVars['--shadow-opacity-sm']).toBe('0.3'))
    expect(result.current.resolvedMode).toBe('dark')
  })

  it('persiste: grava, desmonta, remonta e lê o valor salvo', async () => {
    const first = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(first.result.current.hydrated).toBe(true))
    await act(async () => first.result.current.setModelCode('T2'))
    await waitFor(() => expect(first.result.current.modelCode).toBe('T2'))
    await first.unmount()

    const second = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(second.result.current.hydrated).toBe(true))
    expect(second.result.current.modelCode).toBe('T2')
  })

  it('applyPalette registra uma paleta customizada sem tocar em DOM', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    await act(async () =>
      result.current.applyPalette({
        id: 'cliente', name: 'Cliente',
        primary: '#ffcc00', primaryHover: '#e6b800',
        secondary: '#ff6699', secondaryHover: '#e0507f',
        gradient: ['#ffe680', '#ffcc00', '#b38f00'],
      }),
    )
    await waitFor(() => expect(result.current.paletteId).toBe('cliente'))
    expect(result.current.palette.light['--primary']).toBe('#ffcc00')
  })

  it('testID da raiz combina modelCode e código da paleta ativa, só depois de hydrated (Tarefa B16)', async () => {
    await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(screen.getByTestId('rendra-T1-C1')).toBeTruthy())
  })

  it('hidrata no padrão T1/safira/system quando o storage tem JSON inválido (correção pós-validação)', async () => {
    await AsyncStorage.setItem('rendra:brand', '{lixo')
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.modelCode).toBe('T1')
    expect(result.current.paletteId).toBe('safira')
    expect(screen.getByTestId('rendra-T1-C1')).toBeTruthy()
  })

  it('hidrata no padrão T1/safira/system quando modelCode do storage não existe (correção pós-validação)', async () => {
    await AsyncStorage.setItem(
      'rendra:brand',
      JSON.stringify({ modelCode: 'T9', paletteId: 'safira', mode: 'system' }),
    )
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.modelCode).toBe('T1')
    expect(result.current.paletteId).toBe('safira')
    expect(screen.getByTestId('rendra-T1-C1')).toBeTruthy()
  })

  it('setPaletteId depois de applyPalette isola: volta à paleta pronta, sem customSeeds no storage (correção pós-validação)', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    await act(async () =>
      result.current.applyPalette({
        id: 'cliente', name: 'Cliente',
        primary: '#ffcc00', primaryHover: '#e6b800',
        secondary: '#ff6699', secondaryHover: '#e0507f',
        gradient: ['#ffe680', '#ffcc00', '#b38f00'],
      }),
    )
    await waitFor(() => expect(result.current.paletteId).toBe('cliente'))

    await act(async () => result.current.setPaletteId('safira'))
    await waitFor(() => expect(result.current.paletteId).toBe('safira'))
    expect(result.current.palette.light['--primary']).toBe('#0b6fe0')

    const raw = await AsyncStorage.getItem('rendra:brand')
    const stored = JSON.parse(raw!)
    expect(stored.customSeeds).toBeUndefined()
  })

  it('hidrata no padrão T1/safira/system quando paletteId do storage não existe e não há customSeeds (correção pós-validação)', async () => {
    await AsyncStorage.setItem(
      'rendra:brand',
      JSON.stringify({ modelCode: 'T2', paletteId: 'inexistente', mode: 'system' }),
    )
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.modelCode).toBe('T1')
    expect(result.current.paletteId).toBe('safira')
  })
})

describe('BrandProvider: customSeeds inválido em rendra:brand', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('descarta customSeeds vazio e volta para a paleta padrão do modelo', async () => {
    await AsyncStorage.setItem(
      'rendra:brand',
      JSON.stringify({ version: 1, modelCode: 'T1', mode: 'system', paletteId: 'x', customSeeds: {} }),
    )
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.paletteId).toBe('safira')
  })

  it('aceita customSeeds com a forma completa de PaletteSeeds', async () => {
    const validSeeds = {
      id: 'cliente',
      name: 'Cliente',
      primary: '#ffcc00',
      primaryHover: '#e6b800',
      secondary: '#ff6699',
      secondaryHover: '#e0507f',
      gradient: ['#ffe680', '#ffcc00', '#b38f00'],
    }
    await AsyncStorage.setItem(
      'rendra:brand',
      JSON.stringify({ version: 1, modelCode: 'T1', mode: 'system', paletteId: 'cliente', customSeeds: validSeeds }),
    )
    const { result } = await renderHook(() => useBrand(), { wrapper })
    await waitFor(() => expect(result.current.hydrated).toBe(true))
    expect(result.current.paletteId).toBe('cliente')
  })
})

describe('BrandProvider: prop brands opcional (Tarefa 2.5, achado B7 do veredito do Opus)', () => {
  it('sem prop brands, usa um padrao interno minimo derivado de models (nome do produto, sem logotipo, nunca a marca de demonstracao)', async () => {
    const { getByTestId } = await render(
      <BrandProvider>
        <SondaBrands />
      </BrandProvider>,
    )
    const brands = JSON.parse(getByTestId('brands').props.children) as { companyName: string }[]
    // M1 (veredito Fable, Blocos 1 e 2): a asserção anterior (só productName do T1) passaria
    // igual com brand.config.ts (marca de demonstração, "Rendra"), porque os dois usam
    // models.T1.productName. Afirma os três nomes e a ausência real de "Rendra".
    expect(brands.map((b) => b.companyName)).toEqual([
      models.T1.productName,
      models.T2.productName,
      models.T3.productName,
    ])
    expect(brands.some((b) => b.companyName === 'Rendra')).toBe(false)
  })

  it('chave presente em brands com valor undefined nao sobrescreve o padrao interno (M5, veredito Fable)', async () => {
    const { getByTestId } = await render(
      <BrandProvider brands={{ T1: undefined }}>
        <SondaBrands />
      </BrandProvider>,
    )
    const brands = JSON.parse(getByTestId('brands').props.children) as { id: string; companyName: string }[]
    expect(brands).toHaveLength(3)
    expect(brands.find((b) => b.id === models.T1.brandId)?.companyName).toBe(models.T1.productName)
  })

  it('com prop brands, mescla com o padrao interno (marca de demonstracao continua funcionando)', async () => {
    const brandsDeTeste = {
      T1: {
        id: 'teste',
        productName: 'Teste App',
        companyName: 'Teste',
        tagline: 'x',
        shape: 'square' as const,
        sidebarLogo: 'dark' as const,
      },
    }
    const { getByTestId } = await render(
      <BrandProvider brands={brandsDeTeste}>
        <SondaBrands />
      </BrandProvider>,
    )
    const brands = JSON.parse(getByTestId('brands').props.children) as { id: string; companyName: string }[]
    expect(brands).toHaveLength(3)
    expect(brands.find((b) => b.companyName === 'Teste')).toBeTruthy()
    // M1: os modelos não sobrescritos continuam vindo do padrão interno, nunca da marca de
    // demonstração ("Rendra").
    expect(brands.find((b) => b.id === models.T2.brandId)?.companyName).toBe(models.T2.productName)
  })
})
