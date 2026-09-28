import { render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { Text } from '../internal/text'
import { EmptyState } from './empty-state'
import { nodesWithCode } from '../../test-utils/rendra-code'

describe('EmptyState', () => {
  it('mostra o titulo por accessibilityRole header e a descricao', async () => {
    const { findByRole, findByText } = await render(
      <BrandProvider>
        <EmptyState title="Nada por aqui" description="Cadastre o primeiro item" />
      </BrandProvider>,
    )
    const titulo = await findByRole('header')
    expect(titulo.props.children).toBe('Nada por aqui')
    expect(titulo.props.className.split(' ')).toEqual(
      expect.arrayContaining(['text-center', 'text-base', 'text-foreground']),
    )
    expect(await findByText('Cadastre o primeiro item')).toBeTruthy()
  })

  it('compact usa py-8; padrao usa py-12', async () => {
    const { findByTestId, rerender } = await render(
      <BrandProvider>
        <EmptyState testID="es" title="Vazio" size="compact" />
      </BrandProvider>,
    )
    let raiz = await findByTestId('es')
    expect(raiz.props.className.split(' ')).toContain('py-8')
    await rerender(
      <BrandProvider>
        <EmptyState testID="es" title="Vazio" />
      </BrandProvider>,
    )
    raiz = await findByTestId('es')
    expect(raiz.props.className.split(' ')).toContain('py-12')
  })

  // C10 (veredito do Opus): o caso original só afirmava que o halo existe, não que fica oculto
  // do leitor de tela; a busca sem includeHiddenElements prova a ocultação (0 encontrados).
  it('halo com o degrade soft fica oculto de leitor de tela', async () => {
    const { getAllByTestId, queryAllByTestId } = await render(
      <BrandProvider>
        <EmptyState title="Vazio" />
      </BrandProvider>,
    )
    expect(queryAllByTestId(/^gradient-/)).toHaveLength(0)
    expect(getAllByTestId(/^gradient-/, { includeHiddenElements: true }).length).toBeGreaterThan(0)
  })

  // C10: tamanho do ícone conforme size (compact usa xl/size-12; padrão usa 2xl/size-16).
  it('o icone troca de tamanho conforme size', async () => {
    const { getByTestId, rerender } = await render(
      <BrandProvider>
        <EmptyState testID="es" title="Vazio" size="compact" />
      </BrandProvider>,
    )
    let icone = getByTestId('es-icone', { includeHiddenElements: true })
    expect(icone.props.className.split(' ')).toContain('size-12')
    await rerender(
      <BrandProvider>
        <EmptyState testID="es" title="Vazio" />
      </BrandProvider>,
    )
    icone = getByTestId('es-icone', { includeHiddenElements: true })
    expect(icone.props.className.split(' ')).toContain('size-16')
  })

  it('renderiza as actions recebidas', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <EmptyState title="Vazio" actions={<Text className="text-primary-text">Adicionar</Text>} />
      </BrandProvider>,
    )
    expect(await findByText('Adicionar')).toBeTruthy()
  })

  it('carrega dataSet.rendra = VAZ-001 na raiz (item D12 do levantamento da Sincronizacao 1)', async () => {
    const { container } = await render(
      <BrandProvider>
        <EmptyState title="Vazio" />
      </BrandProvider>,
    )
    expect(nodesWithCode(container, 'VAZ-001')).toHaveLength(1)
  })
})
