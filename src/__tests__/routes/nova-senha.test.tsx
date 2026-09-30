import { act, fireEvent } from '@testing-library/react-native'
import { screen } from 'expo-router/testing-library'
import { Text } from 'react-native'
import NovaSenha from '../../../app/nova-senha'
import { toast } from '../../components/ui'
import { renderDemo } from '../../test-utils/render-demo'

const rotas = { 'nova-senha': NovaSenha, login: () => <Text>Tela de login</Text> }

afterEach(async () => {
  await act(async () => {
    toast.dismiss()
  })
})

describe('nova senha', () => {
  it('mostra a força conforme a senha digitada', async () => {
    await renderDemo(rotas, '/nova-senha')
    const campo = await screen.findByLabelText('Nova senha')
    await fireEvent.changeText(campo, 'abc')
    expect(await screen.findByText('Força da senha: fraca')).toBeTruthy()
    expect((await screen.findByRole('progressbar', { name: 'Força da senha' })).props.accessibilityValue.now).toBe(0)
    await fireEvent.changeText(campo, 'Abcdef12!')
    expect(await screen.findByText('Força da senha: forte')).toBeTruthy()
    expect((await screen.findByRole('progressbar', { name: 'Força da senha' })).props.accessibilityValue.now).toBe(100)
  })

  it('recusa confirmação diferente', async () => {
    const tela = await renderDemo(rotas, '/nova-senha')
    await fireEvent.changeText(await screen.findByLabelText('Nova senha'), 'Abcdef12!')
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Outra123!')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }))
    expect(await screen.findByText('As senhas não conferem.')).toBeTruthy()
    expect(tela.getPathname()).toBe('/nova-senha')
  })

  it('recusa senha curta', async () => {
    await renderDemo(rotas, '/nova-senha')
    await fireEvent.changeText(await screen.findByLabelText('Nova senha'), 'Ab1!')
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Ab1!')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }))
    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres.')).toBeTruthy()
  })

  it('com senhas iguais avisa e volta ao login', async () => {
    const tela = await renderDemo(rotas, '/nova-senha')
    await fireEvent.changeText(await screen.findByLabelText('Nova senha'), 'Abcdef12!')
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Abcdef12!')
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar nova senha' }))
    expect(await screen.findByText('Senha alterada com sucesso')).toBeTruthy()
    expect(await screen.findByText('Tela de login')).toBeTruthy()
    expect(tela.getPathname()).toBe('/login')
  })
})
