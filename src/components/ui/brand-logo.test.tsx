import { render } from '@testing-library/react-native'
import { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BrandContext, BrandProvider, useBrand } from '../../brand'
import type { BrandContextValue } from '../../brand'
import { brandConfigs } from '../../brand/brand.config'
import { BrandLogo, tileBgClass, tileColorClass } from './brand-logo'

function TrocaParaAurora() {
  const { setModelCode, hydrated } = useBrand()
  useEffect(() => {
    if (hydrated) setModelCode('T3')
  }, [hydrated, setModelCode])
  return null
}

describe('BrandLogo', () => {
  // Global Constraints do plano (linha 41): teste que envolve persistência limpa o AsyncStorage
  // antes de cada caso. O caso T3 desta suíte troca o modelo (setModelCode persiste no storage
  // mockado); sem limpar, os casos seguintes hidratam com T3 em vez de T1/Safira (achado próprio
  // desta execução).
  beforeEach(async () => {
    await AsyncStorage.clear()
  })

  it('mostra a palavra dividida (Rendra Safira)', async () => {
    const { findByText } = await render(<BrandProvider><BrandLogo /></BrandProvider>)
    expect(await findByText('Rendra')).toBeTruthy()
    expect(await findByText('Safira')).toBeTruthy()
  })

  it('em T3, a segunda palavra muda para Aurora', async () => {
    const { findByText } = await render(
      <BrandProvider><TrocaParaAurora /><BrandLogo /></BrandProvider>,
    )
    // C7 (veredito do Opus): `findByText` já espera; `waitFor` em volta era redundante e
    // deixava um import sem uso reprovando o lint.
    expect(await findByText('Aurora')).toBeTruthy()
  })

  it('symbolOnly esconde o texto e expoe accessibilityLabel no selo', async () => {
    const { queryByText, findByRole } = await render(
      <BrandProvider><BrandLogo symbolOnly /></BrandProvider>,
    )
    expect(queryByText('Rendra')).toBeNull()
    expect(await findByRole('img', { name: 'Rendra Safira' })).toBeTruthy()
  })

  it('sem symbolOnly, o selo nao tem papel de imagem (decorativo)', async () => {
    const { queryByRole } = await render(<BrandProvider><BrandLogo /></BrandProvider>)
    expect(queryByRole('img')).toBeNull()
  })

  it('on="sidebar" aplica bg-sidebar-indicator no selo e text-sidebar no simbolo (mapas separados)', async () => {
    // B2 (Fable, validacao da entrega): react-native-svg so resolve `currentColor` a partir do
    // proprio Svg (RenderableView.getCurrentColor, so sobe por elementos SVG); antes desta
    // correcao, a classe de cor estava só no View do selo (tileClass unico), e o Svg nunca a
    // recebia, entao o simbolo ficava preto no nativo. Os dois mapas agora sao exportados e
    // aplicados a nos diferentes: tileBgClass no View do selo, tileColorClass no Svg/simbolo
    // (mesmo precedente de `colorClass` em brand-feedback-icon.tsx, onde className nao e
    // observavel no Svg depois do cssInterop).
    expect(tileBgClass.sidebar).toBe('bg-sidebar-indicator')
    expect(tileColorClass.sidebar).toBe('text-sidebar')
    expect(tileBgClass.sidebar).not.toContain('text-')
    const { findByTestId } = await render(
      <BrandProvider><BrandLogo on="sidebar" testID="logo" /></BrandProvider>,
    )
    // B7 (veredito do Opus): o selo decorativo (sem symbolOnly) é aria-hidden; o RNTL exclui
    // nós ocultos por padrão.
    expect((await findByTestId('logo-selo', { includeHiddenElements: true })).props.className.split(' ')).toEqual(
      expect.arrayContaining(['bg-sidebar-indicator']),
    )
    expect(await findByTestId('logo-simbolo', { includeHiddenElements: true })).toBeTruthy()
  })

  it('size sm usa size-6; size md (padrao) usa size-8', async () => {
    const { findByTestId, rerender } = await render(
      <BrandProvider><BrandLogo size="sm" testID="logo" /></BrandProvider>,
    )
    expect((await findByTestId('logo-selo', { includeHiddenElements: true })).props.className).toContain('size-6')
    await rerender(<BrandProvider><BrandLogo testID="logo" /></BrandProvider>)
    expect((await findByTestId('logo-selo', { includeHiddenElements: true })).props.className).toContain('size-8')
  })

  it('sem brand.symbol, mostra o simbolo generico interno', async () => {
    const { findByTestId } = await render(<BrandProvider><BrandLogo testID="logo" /></BrandProvider>)
    expect(await findByTestId('logo-simbolo', { includeHiddenElements: true })).toBeTruthy()
  })

  // M2 (veredito do Fable, validacao da entrega): o caso do B2 (linha 60-72 acima) so afirma os
  // mapas exportados (`tileColorClass.sidebar`), que passam mesmo que `tileColorClass[on]` seja
  // removido do `className` do `brand.symbol` em brand-logo.tsx:73 (ramo nao coberto pelo
  // precedente de brand-feedback-icon.test.tsx, que so vale para o ramo Svg, onde o cssInterop
  // consome o className). Aqui um componente espiao (jest.fn) no lugar de `brand.symbol` recebe
  // `className` como prop comum (sem cssInterop aplicado a componentes de marca custom), entao o
  // efeito real e observavel: usa BrandContext.Provider direto (sem passar por BrandProvider,
  // cujos brandConfigs reais nao tem `symbol`) com uma BrandConfig de teste.
  it('com brand.symbol definido, o simbolo recebe tileColorClass[on] e size-full via className (M2, veredito Fable)', async () => {
    const simboloEspiao = jest.fn((_props: { className?: string }) => null)
    const value = {
      brand: { ...brandConfigs.T1, symbol: simboloEspiao },
    } as unknown as BrandContextValue
    await render(
      // symbolOnly: evita renderizar a palavra da marca (Text interno usa `model.fontFamily`,
      // que este contexto de teste minimo, so com `brand`, nao fornece; o simbolo em si nao
      // depende de `model`).
      <BrandContext.Provider value={value}>
        <BrandLogo on="sidebar" symbolOnly />
      </BrandContext.Provider>,
    )
    expect(simboloEspiao).toHaveBeenCalled()
    const props = simboloEspiao.mock.calls[0]?.[0] as { className?: string }
    expect(props.className?.split(' ')).toEqual(
      expect.arrayContaining(['size-full', tileColorClass.sidebar]),
    )
  })
})
