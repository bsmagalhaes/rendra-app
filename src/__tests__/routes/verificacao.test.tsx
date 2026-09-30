import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import Verificacao from '../../../app/verificacao'
import { toast } from '../../components/ui'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = {
  verificacao: Verificacao,
  painel: () => <Text>Tela do painel</Text>,
  'nova-senha': () => <Text>Tela de nova senha</Text>,
  login: () => <Text>Tela de login</Text>,
}

// Correção D3: o grupo "Código de verificação" não tem onChangeText; o texto entra pela primeira
// caixa ("Dígito 1 de 6", maxLength 6), que distribui os dígitos e dispara onComplete.
async function digitar(codigo: string) {
  await fireEvent.changeText(await screen.findByLabelText('Dígito 1 de 6'), codigo)
}

describe('verificação em duas etapas', () => {
  afterEach(async () => {
    await act(async () => {
      toast.dismiss()
    })
    jest.useRealTimers()
  })

  it('o código 000000 é recusado com mensagem e continua na tela', async () => {
    const tela = await renderDemo(rotas, '/verificacao')
    await digitar('000000')
    expect(await screen.findByText('Código inválido. Tente novamente.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/verificacao')
  })

  it('código válido leva ao painel com o aviso de boas-vindas', async () => {
    const tela = await renderDemo(rotas, '/verificacao')
    await digitar('123456')
    expect(await screen.findByText('Tela do painel')).toBeTruthy()
    expect(await screen.findByText('Bem-vindo de volta')).toBeTruthy()
    expect(tela.getPathname()).toBe('/painel')
  })

  it('vindo de Esqueci a senha, leva à nova senha', async () => {
    const tela = await renderDemo(rotas, '/verificacao?origem=senha')
    await digitar('123456')
    expect(await screen.findByText('Tela de nova senha')).toBeTruthy()
    expect(tela.getPathname()).toBe('/nova-senha')
    expect(screen.queryByText('Bem-vindo de volta')).toBeNull()
  })

  it('o reenvio só libera depois de 30 segundos', async () => {
    await renderDemo(rotas, '/verificacao')
    expect(await screen.findByText('Reenviar em 30 s')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Reenviar código' })).toBeNull()
    // R3: a contagem é texto, nunca o rótulo de um botão (estourava a pílula do cancelar).
    expect(screen.queryByRole('button', { name: /Reenviar em/ })).toBeNull()
    await act(async () => {
      jest.advanceTimersByTime(30000)
    })
    expect(await screen.findByRole('button', { name: 'Reenviar código' })).toBeTruthy()
    expect(screen.queryByText(/Reenviar em/)).toBeNull()
  })

  it('reenviar o código avisa e reinicia a contagem', async () => {
    await renderDemo(rotas, '/verificacao')
    await act(async () => {
      jest.advanceTimersByTime(30000)
    })
    await fireEvent.press(await screen.findByRole('button', { name: 'Reenviar código' }))
    expect(await screen.findByText('Código reenviado (simulado)')).toBeTruthy()
    expect(await screen.findByText('Reenviar em 30 s')).toBeTruthy()
  })

  it('o link Voltar ao login leva ao login', async () => {
    await renderDemo(rotas, '/verificacao')
    await fireEvent.press(await screen.findByRole('link', { name: 'Voltar ao login' }))
    expect(await screen.findByText('Tela de login')).toBeTruthy()
  })
})
