import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import type { RendraNavigationValue } from '../../navigation/rendra-navigation'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { ErrorPage } from './error-page'
import type { ErrorPageProps } from './error-page'

function montar(props: ErrorPageProps, navigation: Partial<RendraNavigationValue> = {}) {
  const navigate = jest.fn()
  const goBack = jest.fn()
  const value: RendraNavigationValue = {
    navigate,
    goBack,
    canGoBack: () => true,
    currentPath: '/rota-inexistente',
    ...navigation,
  }
  const resultado = render(
    <BrandProvider>
      <RendraNavigationProvider value={value}>
        <ErrorPage {...props} />
      </RendraNavigationProvider>
    </BrandProvider>,
  )
  return { navigate, goBack, resultado }
}

describe('ErrorPage', () => {
  it('404 mostra o código, o título e a descrição em pt-BR, e grava ERRO-001 uma vez', async () => {
    const { resultado } = montar({ code: 404 })
    const { container, findByText } = await resultado
    expect(await findByText('Erro 404')).toBeTruthy()
    expect(await findByText('Página não encontrada')).toBeTruthy()
    expect(await findByText('O endereço que você abriu não existe ou foi movido.')).toBeTruthy()
    expect(nodesWithCode(container, 'ERRO-001')).toHaveLength(1)
  })

  it('500 mostra o texto de falha do servidor', async () => {
    const { resultado } = montar({ code: 500 })
    const { findByText } = await resultado
    expect(await findByText('Erro 500')).toBeTruthy()
    expect(await findByText('Algo deu errado do nosso lado')).toBeTruthy()
    expect(await findByText('Tivemos um problema para concluir a ação. Tente de novo em instantes.')).toBeTruthy()
  })

  it('title e description próprios substituem os textos do código', async () => {
    const { resultado } = montar({ code: 404, title: 'Cliente não encontrado', description: 'Confira o link.' })
    const { findByText, queryByText } = await resultado
    expect(await findByText('Cliente não encontrado')).toBeTruthy()
    expect(await findByText('Confira o link.')).toBeTruthy()
    expect(queryByText('Página não encontrada')).toBeNull()
  })

  it('Voltar volta uma tela quando há histórico e não navega para a raiz', async () => {
    const { resultado, goBack, navigate } = montar({ code: 404 })
    const { findByRole } = await resultado
    await fireEvent.press(await findByRole('button', { name: 'Voltar' }))
    expect(goBack).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('Voltar sem histórico (404 aberto direto) leva à raiz em vez de chamar goBack', async () => {
    const { resultado, goBack, navigate } = montar({ code: 404 }, { canGoBack: () => false })
    const { findByRole } = await resultado
    await fireEvent.press(await findByRole('button', { name: 'Voltar' }))
    expect(navigate).toHaveBeenCalledWith('/')
    expect(goBack).not.toHaveBeenCalled()
  })

  it('Ir para o início navega para a raiz', async () => {
    const { resultado, navigate } = montar({ code: 500 })
    const { findByRole } = await resultado
    await fireEvent.press(await findByRole('button', { name: 'Ir para o início' }))
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('compõe ícone (BFI-001) e barra de ações (ACB-001) próprios, sem EmptyState (VAZ-001)', async () => {
    const { resultado } = montar({ code: 404 })
    const { container, findByText } = await resultado
    await findByText('Erro 404')
    expect(nodesWithCode(container, 'BFI-001')).toHaveLength(1)
    expect(nodesWithCode(container, 'ACB-001')).toHaveLength(1)
    expect(nodesWithCode(container, 'VAZ-001')).toHaveLength(0)
  })

  it('fullScreen ocupa a tela toda (flex-1 e centralizada); sem ele, só o conteúdo', async () => {
    const cheia = montar({ code: 404, fullScreen: true })
    const { container: c1, findByText: f1 } = await cheia.resultado
    await f1('Erro 404')
    expect(String(nodesWithCode(c1, 'ERRO-001')[0]!.props.className).split(' ')).toEqual(
      expect.arrayContaining(['flex-1', 'justify-center']),
    )
    const solta = montar({ code: 404 })
    const { container: c2, findByText: f2 } = await solta.resultado
    await f2('Erro 404')
    expect(String(nodesWithCode(c2, 'ERRO-001')[0]!.props.className).split(' ')).not.toContain('flex-1')
  })
})
