import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { BrandProvider } from '../../brand'
import { StatCard, statCardLabel } from './stat-card'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('statCardLabel', () => {
  it('com change positivo, compoe rotulo de alta (pt-BR, virgula decimal)', () => {
    expect(statCardLabel({ label: 'Receita', value: 'R$ 1.250,00', change: 12.5, good: true }))
      .toBe('Receita, R$ 1.250,00, alta de 12,5%')
  })
  it('sem change, ignora a variacao', () => {
    expect(statCardLabel({ label: 'Clientes', value: 42, good: true })).toBe('Clientes, 42')
  })
  it('com value que nao e string nem number, omite o value do rotulo', () => {
    expect(statCardLabel({ label: 'Status', value: <Text>Ok</Text>, good: true })).toBe('Status')
  })
  it('com changeLabel, usa o texto informado no lugar de alta/queda', () => {
    expect(statCardLabel({ label: 'NPS', value: 72, change: 4, changeLabel: 'melhora', good: true }))
      .toBe('NPS, 72, melhora de 4%')
  })
})

describe('StatCard', () => {
  it('sem change, mostra o grupo com label e value, sem pilula de variacao', async () => {
    const { findByRole, queryByText } = await render(
      <BrandProvider><StatCard label="Clientes" value={42} /></BrandProvider>,
    )
    expect(await findByRole('group', { name: 'Clientes, 42' })).toBeTruthy()
    // C4 (veredito do Opus): queryByText('%') nunca casa (não existe nenhum texto igual a "%"
    // sozinho); a asserção certa é a ausência de qualquer texto terminado em "%".
    expect(queryByText(/%$/)).toBeNull()
  })

  it('change positivo mostra a pilula +12,5% (toLocaleString pt-BR)', async () => {
    const { findByText, findByRole } = await render(
      <BrandProvider><StatCard label="Receita" value="R$ 1.250,00" change={12.5} /></BrandProvider>,
    )
    expect(await findByText('+12,5%')).toBeTruthy()
    expect(await findByRole('group', { name: 'Receita, R$ 1.250,00, alta de 12,5%' })).toBeTruthy()
  })

  it('inverse com queda e bom: pilula usa a cor de bom, nao a de ruim', async () => {
    const { findByText } = await render(
      <BrandProvider><StatCard label="Cancelamentos" value={3} change={-8} inverse /></BrandProvider>,
    )
    const pilula = await findByText('-8%')
    expect(pilula.props.className).not.toContain('text-destructive-soft-foreground')
    expect(pilula.props.className).toContain('text-success-soft-foreground')
  })

  it('loading esconde o valor e mostra 2 esqueletos (valor e variacao)', async () => {
    const { queryByText, findAllByTestId } = await render(
      <BrandProvider><StatCard label="Clientes" value={42} loading testID="sc" /></BrandProvider>,
    )
    expect(queryByText('42')).toBeNull()
    // B5 (veredito do Opus): skeleton.tsx põe testID na raiz e `${testID}-pulso` no filho
    // animado; a expressão precisa casar só os dois nós esperados, não os `-pulso`.
    expect(await findAllByTestId(/^sc-skeleton-(valor|variacao)$/, { includeHiddenElements: true })).toHaveLength(2)
  })

  it('loading anuncia so "carregando", nao o value/change que os esqueletos escondem (M2, Fable)', async () => {
    const { findByRole } = await render(
      <BrandProvider>
        <StatCard label="Clientes" value={42} change={12.5} loading />
      </BrandProvider>,
    )
    expect(await findByRole('group', { name: 'Clientes, carregando' })).toBeTruthy()
  })

  it('highlight mostra um gradient de fundo; sem highlight, nenhum', async () => {
    const { queryAllByTestId, rerender } = await render(
      <BrandProvider><StatCard label="Clientes" value={42} highlight testID="sc" /></BrandProvider>,
    )
    expect(queryAllByTestId(/^gradient-/, { includeHiddenElements: true }).length).toBeGreaterThan(0)
    await rerender(<BrandProvider><StatCard label="Clientes" value={42} testID="sc" /></BrandProvider>)
    expect(queryAllByTestId(/^gradient-/, { includeHiddenElements: true })).toHaveLength(0)
  })

  it('footer e renderizado', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <StatCard label="Clientes" value={42} footer={<Text className="text-xs text-muted-foreground">Atualizado agora</Text>} />
      </BrandProvider>,
    )
    expect(await findByText('Atualizado agora')).toBeTruthy()
  })

  it('carrega dataSet.rendra = STAT-001 no Card interno (item D4 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <StatCard label="Clientes" value={42} />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'STAT-001')).toHaveLength(1)
  })
})
