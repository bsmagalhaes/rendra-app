import { Linking, Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { BrandProvider } from '../../brand/brand-provider'
import { RendraNavigationProvider } from '../../navigation/rendra-navigation'
import type { RendraLinkProps } from '../../navigation/rendra-navigation'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { RENDRA_CREDIT_HREF } from '../ui/rendra-credit'
import { AuthLayout } from './auth-layout'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('AuthLayout', () => {
  it('mostra título, conteúdo e o crédito no rodapé', async () => {
    const { container, findByText, findByRole } = await render(
      <BrandProvider>
        <AuthLayout title="Entrar">
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    const titulo = await findByText('Entrar')
    expect(titulo.props.accessibilityRole).toBe('header')
    expect(await findByText('Formulário')).toBeTruthy()
    expect(await findByRole('link', { name: 'Feito com Rendra' })).toBeTruthy()
    expect(nodesWithCode(container, 'CRED-001')).toHaveLength(1)
  })

  it('mostra a descrição quando informada', async () => {
    const { findByText } = await render(
      <BrandProvider>
        <AuthLayout title="Entrar" description="Acesse com seu e-mail.">
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    expect(await findByText('Acesse com seu e-mail.')).toBeTruthy()
  })

  it('o painel de marca leva o logotipo, a frase do modelo e um só degradê', async () => {
    const { container, findByText } = await render(
      <BrandProvider>
        <AuthLayout title="Entrar">
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    await findByText('Formulário')
    expect(nodesWithCode(container, 'LOGO-001')).toHaveLength(1)
    const degrades = container.queryAll((no) => String(no.props.testID ?? '').startsWith('gradient-'))
    expect(degrades).toHaveLength(1)
  })

  it('credit={false} tira o crédito; texto e link próprios substituem os do Rendra', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never)
    const sem = await render(
      <BrandProvider>
        <AuthLayout title="Entrar" credit={false}>
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    await sem.findByText('Formulário')
    expect(sem.queryByRole('link', { name: 'Feito com Rendra' })).toBeNull()
    await sem.unmount()

    const proprio = await render(
      <BrandProvider>
        <AuthLayout title="Entrar" creditText="Feito com Zuper" creditHref="https://zuper.com.br">
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    await fireEvent.press(await proprio.findByRole('link', { name: 'Feito com Zuper' }))
    expect(spy).toHaveBeenCalledWith('https://zuper.com.br')
    expect(spy).not.toHaveBeenCalledWith(RENDRA_CREDIT_HREF)
  })

  it('o rodapé (footer) aparece antes do crédito', async () => {
    const { container, findByText } = await render(
      <BrandProvider>
        <AuthLayout title="Entrar" footer={<Text>Ainda não tem conta?</Text>}>
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    await findByText('Ainda não tem conta?')
    // ordem de leitura na árvore: conteúdo, footer, crédito
    const textos = container
      .queryAll((no) => typeof no.props.children === 'string')
      .map((no) => no.props.children as string)
    const posicao = (texto: string) => textos.indexOf(texto)
    expect(posicao('Formulário')).toBeGreaterThanOrEqual(0)
    expect(posicao('Ainda não tem conta?')).toBeGreaterThan(posicao('Formulário'))
    expect(posicao('Feito com Rendra')).toBeGreaterThan(posicao('Ainda não tem conta?'))
  })

  it('back navega para o href informado', async () => {
    const navigate = jest.fn()
    const { findByRole } = await render(
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate }}>
          <AuthLayout title="Nova senha" back={{ href: '/login', label: 'Voltar ao login' }}>
            <Text>Formulário</Text>
          </AuthLayout>
        </RendraNavigationProvider>
      </BrandProvider>,
    )
    await fireEvent.press(await findByRole('link', { name: 'Voltar ao login' }))
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('com linkComponent, o back usa o link do roteador (href de verdade) em vez de navigate', async () => {
    const navigate = jest.fn()
    function LinkFalso({ href, children }: RendraLinkProps) {
      return <Text testID="link-falso">{`${href}|`}{children}</Text>
    }
    const { findByTestId } = await render(
      <BrandProvider>
        <RendraNavigationProvider value={{ navigate, linkComponent: LinkFalso }}>
          <AuthLayout title="Nova senha" back={{ href: '/login', label: 'Voltar ao login' }}>
            <Text>Formulário</Text>
          </AuthLayout>
        </RendraNavigationProvider>
      </BrandProvider>,
    )
    const link = await findByTestId('link-falso')
    expect(String(link.props.children[0])).toBe('/login|')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('sem back não mostra link de voltar', async () => {
    const { findByText, queryByRole } = await render(
      <BrandProvider>
        <AuthLayout title="Entrar">
          <Text>Formulário</Text>
        </AuthLayout>
      </BrandProvider>,
    )
    await findByText('Formulário')
    expect(queryByRole('link', { name: /Voltar/ })).toBeNull()
  })
})
