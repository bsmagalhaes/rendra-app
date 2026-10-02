import { fireEvent, render, renderHook, screen } from '@testing-library/react-native'
import { processColor } from 'react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { useBrand } from '../../brand/use-brand'
import { themeColorString } from '../../theme/vars'
import { systemColorsLight } from '../../theme/tokens'
import { mix } from '../../brand/palette'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { Chart, seriesColor } from './chart'

const monthly = [
  { mes: 'Out', receita: 42100, meta: 40000 },
  { mes: 'Nov', receita: 45800, meta: 42000 },
  { mes: 'Dez', receita: 51200, meta: 44000 },
  { mes: 'Jan', receita: 39700, meta: 46000 },
  { mes: 'Fev', receita: 47300, meta: 46000 },
  { mes: 'Mar', receita: 52800, meta: 48000 },
  { mes: 'Abr', receita: 50100, meta: 48000 },
  { mes: 'Mai', receita: 55600, meta: 50000 },
  { mes: 'Jun', receita: 58900, meta: 52000 },
  { mes: 'Jul', receita: 57400, meta: 52000 },
  { mes: 'Ago', receita: 61300, meta: 54000 },
  { mes: 'Set', receita: 64200, meta: 56000 },
]

const receita = [{ key: 'receita', label: 'Receita' }]
const receitaEMeta = [
  { key: 'receita', label: 'Receita' },
  { key: 'meta', label: 'Meta' },
]

async function renderizar(ui: React.ReactElement) {
  return render(<BrandProvider>{ui}</BrandProvider>)
}

/** Sem `ResponsiveContainer`: a largura vem do `onLayout` do plot (nao dispara sozinho sob Jest). */
async function medir(largura = 320, altura = 256) {
  const plot = await screen.findByTestId('chart-plot')
  await fireEvent(plot, 'layout', { nativeEvent: { layout: { width: largura, height: altura, x: 0, y: 0 } } })
}

type Arvore = { queryAll: (p: (n: { type: unknown }) => boolean) => unknown[] }
const hosts = (container: Arvore, tipo: string) => container.queryAll((n) => n.type === tipo)
/** O `Text` do SVG nao e host `Text` do RN: o RNTL nao o acha por texto, so pelo conteudo do TSpan. */
const textosSvg = (container: Arvore) =>
  (container.queryAll((n) => n.type === 'RNSVGTSpan') as { props: { content?: string } }[]).map((n) => n.props.content)

describe('seriesColor', () => {
  it('devolve a cor do tema em rgb() e gira entre --rendra-chart-1..5', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper: BrandProvider })
    const vars = result.current.themeVars
    expect(seriesColor(vars, 0)).toBe(themeColorString(vars, '--rendra-chart-1'))
    expect(seriesColor(vars, 0)).toMatch(/^rgb\(\d+ \d+ \d+\)$/)
    expect(seriesColor(vars, 4)).toBe(themeColorString(vars, '--rendra-chart-5'))
    expect(seriesColor(vars, 5)).toBe(seriesColor(vars, 0))
  })
})

describe('Chart cartesiano', () => {
  it('barra: uma barra por categoria, com a cor do tema e o codigo CHT-002', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper: BrandProvider })
    const { container } = await renderizar(
      <Chart type="bar" data={monthly} xKey="mes" series={receita} aria-label="Receita mensal" />,
    )
    expect(nodesWithCode(container, 'CHT-002')).toHaveLength(1)
    await medir()
    expect(screen.getAllByTestId(/^chart-bar-receita-/)).toHaveLength(monthly.length)
    expect(hosts(container, 'RNSVGRect').length).toBeGreaterThanOrEqual(monthly.length)
    const primeira = screen.getByTestId('chart-bar-receita-0')
    expect(primeira.props.fill).toEqual({ type: 0, payload: processColor(seriesColor(result.current.themeVars, 0)) })
  })

  it('o grafico so desenha depois de medir a largura', async () => {
    await renderizar(<Chart type="bar" data={monthly} xKey="mes" series={receita} aria-label="x" />)
    expect(screen.queryAllByTestId(/^chart-bar-/)).toHaveLength(0)
    await medir(0)
    expect(screen.queryAllByTestId(/^chart-bar-/)).toHaveLength(0)
  })

  it('linha: um caminho por serie, codigo CHT-001', async () => {
    const { container } = await renderizar(
      <Chart type="line" data={monthly} xKey="mes" series={receitaEMeta} aria-label="x" />,
    )
    expect(nodesWithCode(container, 'CHT-001')).toHaveLength(1)
    await medir()
    expect(screen.getByTestId('chart-line-receita')).toBeTruthy()
    expect(screen.getByTestId('chart-line-meta')).toBeTruthy()
  })

  it('area: preenchimento e contorno da serie, codigo CHT-003', async () => {
    const { container } = await renderizar(
      <Chart type="area" data={monthly} xKey="mes" series={receita} aria-label="x" />,
    )
    expect(nodesWithCode(container, 'CHT-003')).toHaveLength(1)
    await medir()
    expect(screen.getByTestId('chart-area-receita')).toBeTruthy()
    expect(screen.getByTestId('chart-line-receita')).toBeTruthy()
  })

  it('combo: serie de barras e serie de linha no mesmo grafico, CHT-005', async () => {
    const { container } = await renderizar(
      <Chart
        type="combo"
        data={monthly}
        xKey="mes"
        series={[
          { key: 'receita', label: 'Receita', kind: 'bar' },
          { key: 'meta', label: 'Meta', kind: 'line' },
        ]}
        aria-label="x"
      />,
    )
    expect(nodesWithCode(container, 'CHT-005')).toHaveLength(1)
    await medir()
    expect(screen.getAllByTestId(/^chart-bar-receita-/)).toHaveLength(monthly.length)
    expect(screen.queryAllByTestId(/^chart-bar-meta-/)).toHaveLength(0)
    expect(screen.getByTestId('chart-line-meta')).toBeTruthy()
  })

  it('combo sem kind: a primeira serie vira barra e as demais viram linha', async () => {
    await renderizar(<Chart type="combo" data={monthly} xKey="mes" series={receitaEMeta} aria-label="x" />)
    await medir()
    expect(screen.getAllByTestId(/^chart-bar-receita-/)).toHaveLength(monthly.length)
    expect(screen.getByTestId('chart-line-meta')).toBeTruthy()
  })

  it('barras empilhadas: a segunda serie comeca onde a primeira termina', async () => {
    await renderizar(
      <Chart
        type="bar"
        stacked
        data={[{ mes: 'A', a: 10, b: 30 }]}
        xKey="mes"
        series={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
        ]}
        aria-label="x"
      />,
    )
    await medir()
    const a = screen.getByTestId('chart-bar-a-0')
    const b = screen.getByTestId('chart-bar-b-0')
    expect(Number(b.props.y)).toBeLessThan(Number(a.props.y))
    expect(Number(b.props.y) + Number(b.props.height)).toBeCloseTo(Number(a.props.y), 3)
  })

  it('pizza: uma fatia por categoria, com a legenda da categoria, CHT-004', async () => {
    const segmentos = [
      { segmento: 'Varejo', valor: 40 },
      { segmento: 'Servicos', valor: 35 },
      { segmento: 'Industria', valor: 25 },
    ]
    const { container } = await renderizar(
      <Chart
        type="pie"
        data={segmentos}
        xKey="segmento"
        series={[{ key: 'valor', label: 'Clientes' }]}
        aria-label="Clientes por segmento"
      />,
    )
    expect(nodesWithCode(container, 'CHT-004')).toHaveLength(1)
    await medir()
    expect(screen.getAllByTestId(/^chart-slice-/)).toHaveLength(3)
    expect(screen.getByText('Varejo: 40')).toBeTruthy()
  })

  it('a raiz e uma figura com o aria-label recebido', async () => {
    await renderizar(<Chart type="bar" data={monthly} xKey="mes" series={receita} aria-label="Receita mensal" />)
    const figura = screen.getByLabelText('Receita mensal')
    expect(figura.props.role).toBe('figure')
  })

  it('legenda com mais de uma serie mostra o nome de cada uma', async () => {
    await renderizar(<Chart type="line" data={monthly} xKey="mes" series={receitaEMeta} aria-label="x" />)
    await medir()
    expect(screen.getByText('Receita')).toBeTruthy()
    expect(screen.getByText('Meta')).toBeTruthy()
  })

  it('valueFormatter formata os valores do eixo', async () => {
    const { container } = await renderizar(
      <Chart
        type="bar"
        data={monthly}
        xKey="mes"
        series={receita}
        valueFormatter={(n) => `R$ ${n / 1000} mil`}
        aria-label="x"
      />,
    )
    await medir()
    expect(textosSvg(container)).toEqual(expect.arrayContaining(['R$ 0 mil', 'R$ 40 mil', 'R$ 80 mil']))
  })
})

describe('Chart: modo lista', () => {
  it('mostra o botao Ver como lista quando passa do limite e alterna para o modo texto', async () => {
    await renderizar(<Chart type="bar" data={monthly} xKey="mes" series={receita} listThreshold={8} aria-label="x" />)
    await medir()
    expect(screen.queryByText('Ver gráfico')).toBeNull()
    await fireEvent.press(screen.getByText('Ver como lista'))
    expect(screen.getByText('Ver gráfico')).toBeTruthy()
    for (const linha of monthly) expect(screen.getAllByText(linha.mes).length).toBeGreaterThan(0)
    expect(screen.queryAllByTestId(/^chart-bar-/)).toHaveLength(0)
    await fireEvent.press(screen.getByText('Ver gráfico'))
    expect(screen.getByText('Ver como lista')).toBeTruthy()
  })

  it('nao mostra o botao quando as categorias cabem no limite', async () => {
    await renderizar(<Chart type="bar" data={monthly.slice(0, 4)} xKey="mes" series={receita} aria-label="x" />)
    expect(screen.queryByText('Ver como lista')).toBeNull()
  })

  it('a lista traz categoria e valor formatado de cada serie', async () => {
    await renderizar(<Chart type="bar" data={monthly} xKey="mes" series={receitaEMeta} aria-label="x" />)
    await fireEvent.press(screen.getByText('Ver como lista'))
    expect(screen.getAllByText(/42\.100/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/40\.000/).length).toBeGreaterThan(0)
  })
})

describe('Chart: selecao por toque (substitui o tooltip)', () => {
  it('tocar numa categoria mostra o nome e os valores abaixo do grafico', async () => {
    await renderizar(<Chart type="bar" data={monthly} xKey="mes" series={receitaEMeta} aria-label="x" />)
    await medir(320)
    expect(screen.queryByTestId('chart-selecao')).toBeNull()
    await fireEvent.press(screen.getByTestId('chart-plot'), { nativeEvent: { locationX: 10 } })
    expect(screen.getByTestId('chart-selecao').props.accessibilityLiveRegion).toBe('polite')
    expect(screen.getByText(/Out/)).toBeTruthy()
    expect(screen.getByText(/42\.100/)).toBeTruthy()
    await fireEvent.press(screen.getByTestId('chart-plot'), { nativeEvent: { locationX: 315 } })
    expect(screen.getByText(/Set/)).toBeTruthy()
    expect(screen.getByText(/64\.200/)).toBeTruthy()
  })
})

describe('Chart gauge', () => {
  it('mostra valor, meta e zona, com role meter e valores de acessibilidade', async () => {
    const { container } = await renderizar(
      <Chart type="gauge" value={61300} max={80000} target={70000} label="Receita do mês" aria-label="Receita do mês" valueFormatter={(n) => `R$ ${n.toLocaleString('pt-BR')}`} />,
    )
    expect(nodesWithCode(container, 'CHT-006')).toHaveLength(1)
    const medidor = screen.getByRole('meter')
    expect(medidor.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 88, text: '88% da meta, Atenção' })
    expect(medidor.props.accessibilityLabel).toBe('Receita do mês')
    expect(screen.getByText('R$ 61.300')).toBeTruthy()
    expect(screen.getByText('Meta: R$ 70.000')).toBeTruthy()
    expect(screen.getByText('Atenção')).toBeTruthy()
  })

  it('a zona muda com o percentual: abaixo de 60% e abaixo da meta, acima de 90% e no verde', async () => {
    const { unmount } = await renderizar(<Chart type="gauge" value={30} max={100} target={100} aria-label="x" />)
    expect(screen.getByRole('meter').props.accessibilityValue.text).toBe('30% da meta, Abaixo da meta')
    expect(screen.getByText('Abaixo da meta')).toBeTruthy()
    await unmount()
    await renderizar(<Chart type="gauge" value={95} max={100} target={100} aria-label="x" />)
    expect(screen.getByRole('meter').props.accessibilityValue.text).toBe('95% da meta, No verde')
    expect(screen.getByText('No verde')).toBeTruthy()
  })

  it('sem meta, o percentual e o valor sobre o maximo; zonas proprias e minimo proprio', async () => {
    await renderizar(
      <Chart
        type="gauge"
        value={150}
        min={100}
        max={200}
        zones={[{ to: 1, tone: 'primary' }]}
        label="Nivel"
        aria-label="x"
      />,
    )
    const valor = screen.getByRole('meter').props.accessibilityValue
    expect(valor.now).toBe(50)
    expect(valor.text).toBe('50% da meta, Em andamento')
    expect(screen.getByText('Realizado: 150')).toBeTruthy()
  })

  it('o ponteiro e o arco usam as cores do medidor do tema, nunca literal', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper: BrandProvider })
    const { container } = await renderizar(<Chart type="gauge" value={10} max={100} aria-label="x" />)
    await medir(240, 140)
    const ponteiro = screen.getByTestId('chart-gauge-ponteiro')
    expect(ponteiro.props.stroke).toEqual({ type: 0, payload: processColor(themeColorString(result.current.themeVars, '--rendra-foreground')) })
    expect(hosts(container, 'RNSVGPath').length).toBeGreaterThanOrEqual(2)
  })
})

describe('Chart funil', () => {
  const estagios = [
    { label: 'Visitas', value: 4200 },
    { label: 'Contatos', value: 1180 },
    { label: 'Propostas', value: 320 },
    { label: 'Fechados', value: 96 },
  ]

  it('mostra as taxas entre as etapas, a maior queda e a conversao total', async () => {
    const { container } = await renderizar(<Chart type="funnel" stages={estagios} aria-label="Funil" />)
    expect(nodesWithCode(container, 'CHT-007')).toHaveLength(1)
    expect(screen.getAllByText(/para a próxima etapa/)).toHaveLength(3)
    expect(screen.getByText('28,1% para a próxima etapa')).toBeTruthy()
    expect(screen.getByText('27,1% para a próxima etapa · Maior queda')).toBeTruthy()
    expect(screen.getByText('2,3% de conversão total do funil')).toBeTruthy()
    expect(screen.getByText('Visitas')).toBeTruthy()
    expect(screen.getByText('4.200')).toBeTruthy()
  })

  it('so marca a maior queda quando ha mais de duas etapas', async () => {
    await renderizar(
      <Chart type="funnel" stages={[{ label: 'A', value: 100 }, { label: 'B', value: 50 }]} aria-label="x" />,
    )
    expect(screen.getByText('50,0% para a próxima etapa')).toBeTruthy()
    expect(screen.queryByText(/Maior queda/)).toBeNull()
  })

  it('desenha um trapezio por etapa depois de medir a largura, e a largura encolhe etapa a etapa', async () => {
    await renderizar(<Chart type="funnel" stages={estagios} aria-label="x" />)
    expect(screen.queryAllByTestId(/^chart-funnel-/)).toHaveLength(0)
    await medir(300, 200)
    // o Polygon vira o host RNSVGPath com `d`: "M x0 y0 x1 y1 x2 y2 x3 y3z"
    const primeiro = screen.getByTestId('chart-funnel-0').props.d as string
    const ultimo = screen.getByTestId('chart-funnel-3').props.d as string
    const larguraTopo = (d: string) => {
      const [x0, , x1] = d.replace(/[Mz]/g, '').trim().split(/\s+/).map(Number)
      return x1! - x0!
    }
    expect(larguraTopo(primeiro)).toBeCloseTo(300)
    expect(larguraTopo(ultimo)).toBeLessThan(larguraTopo(primeiro))
  })

  it('a cor de cada etapa mistura primaria e sucesso do tema com o fundo lateral, da primeira a ultima', async () => {
    const { result } = await renderHook(() => useBrand(), { wrapper: BrandProvider })
    await renderizar(<Chart type="funnel" stages={estagios} aria-label="x" />)
    await medir(300, 200)
    const vars = result.current.resolvedMode === 'light' ? result.current.palette.light : result.current.palette.dark
    const primaria = vars['--rendra-primary']!
    const lateral = vars['--rendra-sidebar']!
    const esperada = mix(mix(primaria, systemColorsLight.success, 0), lateral, 0.42)
    expect(result.current.resolvedMode).toBe('light')
    expect(screen.getByTestId('chart-funnel-0').props.fill).toEqual({ type: 0, payload: processColor(esperada) })
    expect(screen.getByTestId('chart-funnel-3').props.fill).not.toEqual(screen.getByTestId('chart-funnel-0').props.fill)
  })

  it('funil sem etapa ou com valor inicial zero nao quebra', async () => {
    await renderizar(<Chart type="funnel" stages={[{ label: 'A', value: 0 }, { label: 'B', value: 0 }]} aria-label="x" />)
    expect(screen.getByText('0,0% de conversão total do funil')).toBeTruthy()
  })
})
