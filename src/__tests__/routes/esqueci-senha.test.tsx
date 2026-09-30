import { fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import EsqueciSenha from '../../../app/esqueci-senha'
import { renderDemo } from '../../test-utils/render-demo'

function Sonda() {
  const { origem } = useLocalSearchParams<{ origem?: string }>()
  return <Text>{`origem:${origem}`}</Text>
}

const rotas = { 'esqueci-senha': EsqueciSenha, verificacao: Sonda, login: () => <Text>Tela de login</Text> }

describe('esqueci a senha', () => {
  it('recusa e-mail inválido', async () => {
    const tela = await renderDemo(rotas, '/esqueci-senha')
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'sem-arroba')
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }))
    expect(await screen.findByText('E-mail inválido.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/esqueci-senha')
  })

  it('e-mail vazio pede o e-mail', async () => {
    await renderDemo(rotas, '/esqueci-senha')
    await fireEvent.press(await screen.findByRole('button', { name: 'Enviar código' }))
    expect(await screen.findByText('E-mail é obrigatório.')).toBeTruthy()
  })

  it('com e-mail válido segue para a verificação com origem=senha', async () => {
    const tela = await renderDemo(rotas, '/esqueci-senha')
    await fireEvent.changeText(await screen.findByLabelText('E-mail'), 'ana@exemplo.com.br')
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar código' }))
    expect(await screen.findByText('origem:senha')).toBeTruthy()
    expect(tela.getPathname()).toBe('/verificacao')
  })

  it('o link Voltar ao login funciona', async () => {
    await renderDemo(rotas, '/esqueci-senha')
    await fireEvent.press(await screen.findByRole('link', { name: 'Voltar ao login' }))
    expect(await screen.findByText('Tela de login')).toBeTruthy()
  })
})
