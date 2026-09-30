import { fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Linking, Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Login from '../../../app/login'
import { renderDemo } from '../../test-utils/render-demo'
import { nodesWithCode } from '../../test-utils/rendra-code'
import { RENDRA_CREDIT_HREF } from '../../components/ui'

beforeEach(async () => {
  await AsyncStorage.clear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

function abrir() {
  return renderDemo(
    {
      index: () => <Text>Tela inicial</Text>,
      login: Login,
      painel: () => <Text>Tela do painel</Text>,
      verificacao: () => <Text>Tela de verificação</Text>,
      'esqueci-senha': () => <Text>Tela de esqueci a senha</Text>,
      'cadastre-se': () => <Text>Tela de criar conta</Text>,
    },
    '/login',
  )
}

describe('/login', () => {
  it('mostra o título, o crédito Feito com Rendra e CRED-001', async () => {
    const context = await abrir()
    expect(await screen.findByText('Acesse sua conta')).toBeTruthy()
    expect(await screen.findByRole('link', { name: 'Feito com Rendra' })).toBeTruthy()
    expect(nodesWithCode(context.container, 'CRED-001')).toHaveLength(1)
  })

  it('o crédito abre o link do Rendra ao tocar', async () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never)
    await abrir()
    await fireEvent.press(await screen.findByRole('link', { name: 'Feito com Rendra' }))
    expect(spy).toHaveBeenCalledWith(RENDRA_CREDIT_HREF)
  })

  it('a tela tem o próprio SafeAreaView (safe-area-tela) com só o inset superior', async () => {
    await abrir()
    const area = await screen.findByTestId('safe-area-tela')
    expect(area.props.edges.top).toBe('additive')
    expect(area.props.edges.bottom).toBe('off')
  })

  it('a senha usa secureTextEntry e o campo de e-mail não', async () => {
    await abrir()
    const email = await screen.findByLabelText('E-mail')
    const senha = await screen.findByLabelText('Senha')
    expect(senha.props.secureTextEntry).toBe(true)
    expect(email.props.secureTextEntry).toBeFalsy()
  })

  it('enviar vazio mostra as duas mensagens de erro e não sai da tela', async () => {
    await abrir()
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail é obrigatório.')).toBeTruthy()
    expect(await screen.findByText('Senha é obrigatória.')).toBeTruthy()
    expect(screen.queryByText('Tela do painel')).toBeNull()
  })

  it('e-mail inválido mostra o erro do e-mail', async () => {
    await abrir()
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'sem-arroba')
    await fireEvent.changeText(await screen.findByLabelText('Senha'), 'segredo123')
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail inválido.')).toBeTruthy()
    expect(screen.queryByText('Tela do painel')).toBeNull()
  })

  // P3.2 (correção D16, mudança de comportamento registrada): o "Entrar" da F2 ia direto ao
  // painel; na demonstração passa pela verificação em duas etapas.
  it('dados válidos levam à verificação em duas etapas', async () => {
    const tela = await abrir()
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'ana@exemplo.com')
    await fireEvent.changeText(await screen.findByLabelText('Senha'), 'segredo123')
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Tela de verificação')).toBeTruthy()
    expect(tela.getPathname()).toBe('/verificacao')
    expect(screen.queryByText('Tela do painel')).toBeNull()
  })

  it('avisa que é uma demonstração', async () => {
    await abrir()
    expect(await screen.findByText(/Modo demonstração/)).toBeTruthy()
  })

  it('recusa senha com menos de 6 caracteres e continua no login', async () => {
    const tela = await abrir()
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'ana@exemplo.com.br')
    await fireEvent.changeText(await screen.findByLabelText('Senha'), '123')
    await fireEvent.press(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('A senha deve ter pelo menos 6 caracteres.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/login')
  })

  it('o link Esqueci a senha abre a tela de recuperação', async () => {
    await abrir()
    await fireEvent.press(await screen.findByRole('link', { name: 'Esqueci a senha' }))
    expect(await screen.findByText('Tela de esqueci a senha')).toBeTruthy()
  })

  it('o link Criar conta abre o cadastro', async () => {
    await abrir()
    await fireEvent.press(await screen.findByRole('link', { name: 'Criar conta' }))
    expect(await screen.findByText('Tela de criar conta')).toBeTruthy()
  })

  it('Lembrar de mim alterna a caixa de seleção', async () => {
    await abrir()
    const caixa = await screen.findByRole('checkbox', { name: /Lembrar de mim/ })
    expect(caixa.props.accessibilityState?.checked).toBeFalsy()
    await fireEvent.press(caixa)
    expect((await screen.findByRole('checkbox', { name: /Lembrar de mim/ })).props.accessibilityState?.checked).toBe(true)
  })
})
